/**
 * Vercel Serverless Function - 股票搜索接口
 * 路径: /api/stock/search
 */

const https = require('https');

// Tushare配置
const TUSHARE_TOKEN = '42a14c557055123e9464f371c4c9ae4a12f1a864e5a47ea4433d7e34';
const TUSHARE_API = 'http://api.tushare.pro';

// 缓存配置
const cache = new Map();
const CACHE_DURATION = 60000; // 60秒

// 调用Tushare API
function callTushare(apiName, params) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      api_name: apiName,
      token: TUSHARE_TOKEN,
      params: params || {},
      fields: ''
    });

    const options = {
      hostname: 'api.tushare.pro',
      port: 80,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = require('http').request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// 转换Tushare代码格式
function convertToFrontendFormat(tsCode) {
  return tsCode; // 已经是 600519.SH 格式
}

module.exports = async (req, res) => {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const query = req.query.q || '';
    
    if (!query) {
      return res.status(200).json({ results: [] });
    }

    // 检查缓存
    const cacheKey = `search_${query}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return res.status(200).json({ results: cached.data });
    }

    // 获取所有A股列表
    const stockList = await callTushare('stock_basic', {
      exchange: '',
      list_status: 'L'
    });

    if (!stockList.data || !stockList.data.items) {
      return res.status(200).json({ results: [] });
    }

    // 解析数据
    const fields = stockList.data.fields;
    const items = stockList.data.items;
    
    // 搜索匹配
    const queryLower = query.toLowerCase();
    const matched = items
      .filter(item => {
        const tsCode = item[fields.indexOf('ts_code')] || '';
        const symbol = item[fields.indexOf('symbol')] || '';
        const name = item[fields.indexOf('name')] || '';
        
        return name.includes(query) || 
               symbol.includes(query) || 
               tsCode.toLowerCase().includes(queryLower);
      })
      .slice(0, 30); // 限制30条

    // 获取今日行情
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let dailyData = {};
    
    try {
      const daily = await callTushare('daily', {
        trade_date: today
      });
      
      if (daily.data && daily.data.items) {
        const dailyFields = daily.data.fields;
        daily.data.items.forEach(item => {
          const tsCode = item[dailyFields.indexOf('ts_code')];
          dailyData[tsCode] = {
            close: item[dailyFields.indexOf('close')] || 0,
            change: item[dailyFields.indexOf('change')] || 0,
            pct_chg: item[dailyFields.indexOf('pct_chg')] || 0
          };
        });
      }
    } catch (e) {
      console.log('获取今日行情失败，使用历史数据');
    }

    // 构建结果
    const results = await Promise.all(
      matched.map(async item => {
        const tsCode = item[fields.indexOf('ts_code')];
        const name = item[fields.indexOf('name')];
        
        let price = 0, change = 0, changePercent = 0;
        
        // 尝试从今日数据获取
        if (dailyData[tsCode]) {
          price = parseFloat(dailyData[tsCode].close) || 0;
          change = parseFloat(dailyData[tsCode].change) || 0;
          changePercent = parseFloat(dailyData[tsCode].pct_chg) || 0;
        } else {
          // 获取最近一个交易日数据
          try {
            const recent = await callTushare('daily', {
              ts_code: tsCode,
              limit: 1
            });
            
            if (recent.data && recent.data.items && recent.data.items.length > 0) {
              const recentFields = recent.data.fields;
              const recentItem = recent.data.items[0];
              price = parseFloat(recentItem[recentFields.indexOf('close')]) || 0;
              change = parseFloat(recentItem[recentFields.indexOf('change')]) || 0;
              changePercent = parseFloat(recentItem[recentFields.indexOf('pct_chg')]) || 0;
            }
          } catch (e) {
            console.log(`获取${tsCode}数据失败`);
          }
        }

        return {
          symbol: convertToFrontendFormat(tsCode),
          name: name,
          price: price,
          change: change,
          changePercent: changePercent
        };
      })
    );

    // 缓存结果
    cache.set(cacheKey, {
      data: results,
      timestamp: Date.now()
    });

    return res.status(200).json({ results });

  } catch (error) {
    console.error('搜索错误:', error);
    return res.status(500).json({ 
      error: error.message,
      results: [] 
    });
  }
};
