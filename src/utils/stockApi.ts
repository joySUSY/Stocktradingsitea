/**
 * 股票API集成工具
 * 
 * 说明：由于浏览器的CORS限制，直接调用第三方API可能会失败。
 * 建议的解决方案：
 * 1. 搭建后端代理服务（推荐）
 * 2. 使用支持CORS的API服务
 * 3. 使用Chrome扩展或本地代理绕过CORS
 * 
 * 支持的数据源：
 * - 新浪财经API (免费，但有CORS限制)
 * - 东方财富API (免费)
 * - Tushare (需要token，功能强大)
 * - AKShare (Python库，需要后端)
 */

export interface StockSearchResult {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: string;
  change: number;
  changePercent: number;
  marketCap: string;
  pe: number;
}

// API配置
const API_CONFIG = {
  // 后端代理服务器地址
  // 本地开发: http://localhost:3001
  // Vercel部署后，替换为您的Vercel地址，例如: https://your-project-name.vercel.app
  PROXY_URL: 'http://localhost:3001',
  // 部署到Vercel后，请修改上面这一行为您的Vercel地址
  
  // Tushare Token（已在后端配置）
  TUSHARE_TOKEN: '42a14c557055123e9464f371c4c9ae4a12f1a864e5a47ea4433d7e34',
};

/**
 * 检查API服务是否可用
 */
async function checkApiAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${API_CONFIG.PROXY_URL}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000), // 3秒超时
    });
    return response.ok;
  } catch (error) {
    console.log('API服务未启动，使用本地数据');
    return false;
  }
}

/**
 * 搜索股票
 * @param query 搜索关键词（股票代码或名称）
 */
export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  if (!query.trim()) {
    return [];
  }

  // 检查API是否可用
  const apiAvailable = await checkApiAvailable();
  
  if (apiAvailable) {
    try {
      const response = await fetch(
        `${API_CONFIG.PROXY_URL}/api/stock/search?q=${encodeURIComponent(query)}`,
        { 
          method: 'GET',
          signal: AbortSignal.timeout(10000), // 10秒超时
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ 使用Tushare实时数据');
        return data.results || [];
      }
    } catch (error) {
      console.log('Tushare API调用失败，使用本地数据:', error);
    }
  }

  // 后备方案：使用本地数据库
  console.log('📦 使用本地数据库');
  return getLocalStockDatabase(query);
}

/**
 * 获取股票实时行情
 * @param symbol 股票代码（如：600519.SH）
 */
export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  // 通过后端代理获取实时行情
  if (API_CONFIG.PROXY_URL) {
    try {
      const response = await fetch(
        `${API_CONFIG.PROXY_URL}/api/stock/quote?symbol=${symbol}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('获取行情失败:', error);
    }
  }

  // 尝试直接调用新浪财经接口（可能因CORS失败）
  try {
    const sinaSymbol = convertToSinaSymbol(symbol);
    const response = await fetch(
      `https://hq.sinajs.cn/list=${sinaSymbol}`,
      { mode: 'no-cors' }
    );
    // 由于no-cors模式无法读取响应，这里只是示例
    // 实际使用时需要通过JSONP或后端代理
  } catch (error) {
    console.error('新浪财经接口调用失败:', error);
  }

  return null;
}

/**
 * 批量获取股票行情
 * @param symbols 股票代码数组
 */
export async function getBatchStockQuotes(symbols: string[]): Promise<Map<string, StockQuote>> {
  const results = new Map<string, StockQuote>();
  
  if (API_CONFIG.PROXY_URL) {
    try {
      const response = await fetch(
        `${API_CONFIG.PROXY_URL}/api/stock/batch?symbols=${symbols.join(',')}`
      );
      const data = await response.json();
      data.forEach((quote: StockQuote) => {
        results.set(quote.symbol, quote);
      });
    } catch (error) {
      console.error('批量获取行情失败:', error);
    }
  }

  return results;
}

/**
 * 转换股票代码为新浪财经格式
 * 600519.SH -> sh600519
 * 000001.SZ -> sz000001
 */
function convertToSinaSymbol(symbol: string): string {
  const [code, market] = symbol.split('.');
  const prefix = market.toLowerCase();
  return `${prefix}${code}`;
}

/**
 * 本地股票数据库（模拟数据，包含中国A股主要股票）
 */
function getLocalStockDatabase(query: string): StockSearchResult[] {
  const allStocks: StockSearchResult[] = [
    { symbol: '600519.SH', name: '贵州茅台', price: 1685.50, change: 28.30, changePercent: 1.71 },
    { symbol: '000001.SZ', name: '平安银行', price: 12.68, change: -0.15, changePercent: -1.17 },
    { symbol: '600036.SH', name: '招商银行', price: 38.42, change: 0.87, changePercent: 2.32 },
    { symbol: '300750.SZ', name: '宁德时代', price: 178.90, change: -4.25, changePercent: -2.32 },
    { symbol: '601318.SH', name: '中国平安', price: 45.67, change: 1.23, changePercent: 2.77 },
    { symbol: '000858.SZ', name: '五粮液', price: 128.35, change: 2.85, changePercent: 2.27 },
    { symbol: '601012.SH', name: '隆基绿能', price: 18.42, change: 0.68, changePercent: 3.83 },
    { symbol: '688981.SH', name: '中芯国际', price: 52.18, change: -1.45, changePercent: -2.70 },
    { symbol: '002594.SZ', name: '比亚迪', price: 256.78, change: 8.92, changePercent: 3.60 },
    { symbol: '600900.SH', name: '长江电力', price: 25.67, change: 0.45, changePercent: 1.79 },
    { symbol: '000333.SZ', name: '美的集团', price: 68.90, change: -1.20, changePercent: -1.71 },
    { symbol: '601888.SH', name: '中国中免', price: 92.34, change: 3.45, changePercent: 3.88 },
    { symbol: '600887.SH', name: '伊利股份', price: 32.18, change: 0.92, changePercent: 2.94 },
    { symbol: '000002.SZ', name: '万科A', price: 8.45, change: -0.28, changePercent: -3.21 },
    { symbol: '601398.SH', name: '工商银行', price: 5.68, change: 0.05, changePercent: 0.89 },
    { symbol: '000725.SZ', name: '京东方A', price: 3.89, change: 0.11, changePercent: 2.91 },
    { symbol: '600276.SH', name: '恒瑞医药', price: 48.76, change: 1.56, changePercent: 3.30 },
    { symbol: '002475.SZ', name: '立讯精密', price: 34.21, change: -0.89, changePercent: -2.54 },
    { symbol: '600009.SH', name: '上海机场', price: 52.34, change: 1.23, changePercent: 2.41 },
    { symbol: '002415.SZ', name: '海康威视', price: 35.67, change: -0.45, changePercent: -1.25 },
    { symbol: '600031.SH', name: '三一重工', price: 15.34, change: 0.34, changePercent: 2.27 },
    { symbol: '000063.SZ', name: '中兴通讯', price: 28.90, change: 1.15, changePercent: 4.14 },
    { symbol: '002230.SZ', name: '科大讯飞', price: 58.23, change: 2.34, changePercent: 4.19 },
    { symbol: '600030.SH', name: '中信证券', price: 23.45, change: 0.67, changePercent: 2.94 },
    { symbol: '601166.SH', name: '兴业银行', price: 18.76, change: 0.34, changePercent: 1.85 },
    { symbol: '000338.SZ', name: '潍柴动力', price: 14.23, change: -0.23, changePercent: -1.59 },
    { symbol: '600585.SH', name: '海螺水泥', price: 32.45, change: 0.89, changePercent: 2.82 },
    { symbol: '601336.SH', name: '新华保险', price: 38.90, change: 1.20, changePercent: 3.18 },
    { symbol: '600104.SH', name: '上汽集团', price: 16.78, change: -0.45, changePercent: -2.61 },
    { symbol: '000651.SZ', name: '格力电器', price: 34.56, change: 0.78, changePercent: 2.31 },
    { symbol: '002352.SZ', name: '顺丰控股', price: 45.23, change: 1.89, changePercent: 4.36 },
    { symbol: '600048.SH', name: '保利发展', price: 12.34, change: -0.12, changePercent: -0.96 },
    { symbol: '600606.SH', name: '绿地控股', price: 3.45, change: 0.05, changePercent: 1.47 },
    { symbol: '601988.SH', name: '中国银行', price: 4.12, change: 0.03, changePercent: 0.73 },
    { symbol: '601328.SH', name: '交通银行', price: 6.23, change: 0.08, changePercent: 1.30 },
    { symbol: '600015.SH', name: '华夏银行', price: 7.89, change: 0.12, changePercent: 1.54 },
    { symbol: '600000.SH', name: '浦发银行', price: 9.45, change: -0.05, changePercent: -0.53 },
    { symbol: '601169.SH', name: '北京银行', price: 5.67, change: 0.07, changePercent: 1.25 },
    { symbol: '600016.SH', name: '民生银行', price: 4.56, change: -0.03, changePercent: -0.65 },
    { symbol: '000568.SZ', name: '泸州老窖', price: 178.90, change: 3.45, changePercent: 1.97 },
    { symbol: '600809.SH', name: '山西汾酒', price: 234.56, change: 5.67, changePercent: 2.48 },
    { symbol: '000596.SZ', name: '古井贡酒', price: 156.78, change: 2.34, changePercent: 1.51 },
    { symbol: '603589.SH', name: '口子窖', price: 45.67, change: 0.89, changePercent: 1.99 },
    { symbol: '600779.SH', name: '水井坊', price: 67.89, change: 1.23, changePercent: 1.85 },
    { symbol: '000799.SZ', name: '酒鬼酒', price: 89.45, change: 2.12, changePercent: 2.43 },
    { symbol: '600436.SH', name: '片仔癀', price: 298.90, change: 6.78, changePercent: 2.32 },
    { symbol: '000538.SZ', name: '云南白药', price: 67.34, change: 1.45, changePercent: 2.20 },
    { symbol: '600196.SH', name: '复星医药', price: 34.56, change: -0.67, changePercent: -1.90 },
    { symbol: '002142.SZ', name: '宁波银行', price: 28.45, change: 0.56, changePercent: 2.01 },
    { symbol: '601601.SH', name: '中国太保', price: 25.89, change: 0.45, changePercent: 1.77 },
    { symbol: '002714.SZ', name: '牧原股份', price: 48.90, change: -1.23, changePercent: -2.45 },
    { symbol: '000876.SZ', name: '新希望', price: 16.78, change: 0.34, changePercent: 2.07 },
    { symbol: '600660.SH', name: '福耀玻璃', price: 38.90, change: 1.20, changePercent: 3.18 },
    { symbol: '002304.SZ', name: '洋河股份', price: 112.45, change: 2.34, changePercent: 2.13 },
    { symbol: '000895.SZ', name: '双汇发展', price: 32.67, change: 0.78, changePercent: 2.45 },
    { symbol: '600309.SH', name: '万华化学', price: 87.90, change: -1.23, changePercent: -1.38 },
    { symbol: '600690.SH', name: '海尔智家', price: 28.45, change: 0.67, changePercent: 2.41 },
    { symbol: '000100.SZ', name: 'TCL科技', price: 4.56, change: 0.08, changePercent: 1.79 },
    { symbol: '600588.SH', name: '用友网络', price: 23.45, change: 0.89, changePercent: 3.95 },
    { symbol: '002049.SZ', name: '紫光国微', price: 145.67, change: 3.45, changePercent: 2.43 },
    { symbol: '600745.SH', name: '闻泰科技', price: 56.78, change: -1.23, changePercent: -2.12 },
    { symbol: '688111.SH', name: '金山办公', price: 312.45, change: 8.90, changePercent: 2.93 },
    { symbol: '600498.SH', name: '烽火通信', price: 23.56, change: 0.67, changePercent: 2.93 },
    { symbol: '300059.SZ', name: '东方财富', price: 16.78, change: 0.45, changePercent: 2.76 },
    { symbol: '002027.SZ', name: '分众传媒', price: 6.78, change: 0.12, changePercent: 1.80 },
    { symbol: '600872.SH', name: '中炬高新', price: 34.56, change: 0.78, changePercent: 2.31 },
    { symbol: '002008.SZ', name: '大族激光', price: 28.90, change: -0.56, changePercent: -1.90 },
    { symbol: '300124.SZ', name: '汇川技术', price: 67.89, change: 1.45, changePercent: 2.18 },
    { symbol: '603288.SH', name: '海天味业', price: 89.45, change: -1.23, changePercent: -1.36 },
    { symbol: '600438.SH', name: '通威股份', price: 23.45, change: 0.67, changePercent: 2.94 },
  ];

  const lowerQuery = query.toLowerCase().trim();
  return allStocks.filter(stock =>
    stock.symbol.toLowerCase().includes(lowerQuery) ||
    stock.name.toLowerCase().includes(lowerQuery) ||
    stock.name.includes(query)
  ).slice(0, 30);
}

// 导出配置，方便外部使用
export { API_CONFIG };