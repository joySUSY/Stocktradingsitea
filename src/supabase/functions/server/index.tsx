import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { FULL_STOCK_LIST } from "./stock-list.ts";
import { GENERATED_STOCK_LIST } from "./generate-stocks.ts";
import * as DataYesAPI from "./datayes-api.ts";

const app = new Hono();

// 缓存配置
const cache = new Map();
const CACHE_DURATION = 60000; // 60秒

// 合并手工维护的精品股票和自动生成的完整列表，并去重
const combinedList = [...FULL_STOCK_LIST, ...GENERATED_STOCK_LIST];
const STOCK_DATABASE = combinedList.filter((stock, index, self) => 
  index === self.findIndex(s => s.symbol === stock.symbol)
);

const duplicateCount = combinedList.length - STOCK_DATABASE.length;
if (duplicateCount > 0) {
  console.log(`⚠️ 去除了 ${duplicateCount} 只重复股票`);
}

console.log(`📊 股票数据库已加载: ${STOCK_DATABASE.length} 只股票 (精选${FULL_STOCK_LIST.length}只 + 自动生成${GENERATED_STOCK_LIST.length}只)`);

// 腾讯财经API - 批量获取实时行情
async function getTencentQuote(symbols: string[]): Promise<Map<string, any>> {
  const results = new Map();
  
  if (symbols.length === 0) {
    return results;
  }
  
  try {
    // 腾讯财经API支持批量查询，最多80只
    const batchSize = 80;
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      const url = `https://qt.gtimg.cn/q=${batch.join(',')}`;
      
      console.log(`📡 调用腾讯财经API: 第${Math.floor(i/batchSize)+1}批, ${batch.length}只股票`);
      
      const response = await fetch(url);
      const text = await response.text();
      
      console.log(`📥 响应长度: ${text.length} 字节`);
      
      // 解析数据
      const lines = text.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        // v_sh600519="1~贵州茅台~600519~1680.00~1678.99~1679.00~..."
        const match = line.match(/v_([^=]+)="([^"]+)"/);
        if (match) {
          const symbol = match[1];
          const data = match[2].split('~');
          
          if (data.length > 30) {
            const currentPrice = parseFloat(data[3]) || 0;
            const prevClose = parseFloat(data[4]) || 0;
            const change = currentPrice - prevClose;
            const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;
            const volume = parseInt(data[6]) || 0; // 成交量(手)
            const pe = parseFloat(data[39]) || 0; // 市盈率
            const high = parseFloat(data[41]) || 0; // 最高
            const low = parseFloat(data[42]) || 0; // 最低
            const turnover = parseFloat(data[37]) || 0; // 成交额(万)
            
            results.set(symbol, {
              price: currentPrice,
              change: change,
              changePercent: changePercent,
              volume: volume,
              pe: pe,
              high: high,
              low: low,
              turnover: turnover,
            });
          }
        }
      }
      
      // 避免请求过快
      if (i + batchSize < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`✅ 成功获取 ${results.size} 只股票的行情`);
  } catch (error) {
    console.error('❌ 腾讯财经API错误:', error.message);
  }
  
  return results;
}

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-3d93149f/health", (c) => {
  const hasDataYesToken = !!Deno.env.get('DATAYES_API_TOKEN');
  return c.json({ 
    status: "ok",
    service: "Stock API Server (Supabase Edge Function)",
    dataSource: hasDataYesToken ? "通联数据 (DataYes) + 本地数据库" : "本地数据库 + 腾讯财经",
    dataYesEnabled: hasDataYesToken,
    stockCount: STOCK_DATABASE.length,
    timestamp: new Date().toISOString()
  });
});

// 股票搜索接口
app.get("/make-server-3d93149f/api/stock/search", async (c) => {
  try {
    const query = c.req.query('q') || '';
    
    console.log('📥 收到搜索请求:', query);
    
    if (!query) {
      console.log('⚠️ 查询为空');
      return c.json({ results: [] });
    }

    // 检查缓存
    const cacheKey = `search_${query}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('✅ 使用缓存数据:', query, '结果数:', cached.data.length);
      return c.json({ results: cached.data });
    }

    console.log('🔍 开始搜索股票:', query);

    let results = [];
    
    // 使用本地数据库搜索（快速且可靠）
    console.log('🔍 使用本地数据库搜索');
    
    const queryLower = query.toLowerCase();
    const matched = STOCK_DATABASE.filter(stock => 
      stock.name.includes(query) ||
      stock.code.includes(query) ||
      stock.symbol.toLowerCase().includes(queryLower) ||
      (stock.industry && stock.industry.includes(query))
    ).slice(0, 30);

    console.log(`🎯 本地匹配到 ${matched.length} 只股票`);

    if (matched.length > 0) {
      // 获取实时行情
      const symbols = matched.map(s => s.symbol);
      const quotes = await getTencentQuote(symbols);
      
      console.log('📊 获取到', quotes.size, '只股票的行情');

      // 构建结果
      results = matched.map(stock => {
        const quote = quotes.get(stock.symbol);
        // 格式化成交量显示
        const formatVolume = (vol: number) => {
          if (vol === 0) return '-';
          if (vol > 10000) return `${(vol / 10000).toFixed(1)}万手`;
          return `${vol}手`;
        };
        
        return {
          symbol: `${stock.code}.${stock.market}`,
          name: stock.name,
          price: quote?.price || 0,
          change: quote?.change || 0,
          changePercent: quote?.changePercent || 0,
          volume: formatVolume(quote?.volume || 0),
          pe: quote?.pe || 0,
          prediction: Math.floor(Math.random() * 40) + 50, // 临时：50-90的随机值
        };
      });
    }

    // 缓存结果
    cache.set(cacheKey, {
      data: results,
      timestamp: Date.now()
    });

    console.log('✅ 返回结果:', results.length, '只股票');
    return c.json({ results });

  } catch (error) {
    console.error('❌ 搜索错误:', error);
    console.error('错误详情:', error.message);
    return c.json({ 
      error: error.message,
      results: [] 
    }, 500);
  }
});

Deno.serve(app.fetch);
