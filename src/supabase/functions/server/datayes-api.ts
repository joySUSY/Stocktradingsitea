/**
 * 通联数据（DataYes）API集成
 * 文档: https://mall.datayes.com/dashboard
 */

const DATAYES_API_TOKEN = Deno.env.get('DATAYES_API_TOKEN') || '';
const DATAYES_BASE_URL = 'https://api.wmcloud.com/data/v1';

interface DataYesStockInfo {
  ticker: string;        // 股票代码 (e.g., "600519")
  secShortName: string;  // 股票简称 (e.g., "贵州茅台")
  exchangeCD: string;    // 交易所代码 (XSHG/XSHE)
  listStatusCD: string;  // 上市状态
}

interface DataYesQuote {
  ticker: string;
  secShortName: string;
  tradeDate: string;
  closePrice: number;
  openPrice: number;
  highestPrice: number;
  lowestPrice: number;
  turnoverVol: number;
  preClosePrice: number;
}

/**
 * 搜索股票基础信息
 * 由于通联数据不提供直接的股票搜索API，我们先获取全部股票列表然后本地过滤
 * API: /api/equity/getEqu.json
 */
export async function searchStocks(query: string): Promise<any[]> {
  if (!DATAYES_API_TOKEN) {
    console.error('❌ DATAYES_API_TOKEN 未设置');
    return [];
  }

  try {
    console.log('🔍 通联数据API - 搜索股票:', query);

    // 通联数据的股票列表API - 获取A股股票列表
    // 参数说明：field指定返回字段，listStatusCD指定上市状态(L=上市)
    const url = `${DATAYES_BASE_URL}/api/equity/getEqu.json`;
    const params = new URLSearchParams({
      field: 'ticker,secShortName,exchangeCD,listStatusCD',
      listStatusCD: 'L', // 只获取上市的股票
    });
    
    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DATAYES_API_TOKEN}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 通联数据API错误:', response.status, errorText);
      return [];
    }

    const data = await response.json();
    
    // 检查返回数据结构
    if (!data || data.retCode !== 1) {
      console.error('❌ 通联数据API返回错误:', data?.retMsg || '未知错误');
      return [];
    }

    if (!data.data || !Array.isArray(data.data)) {
      console.error('❌ 通联数据API返回格式错误，data字段为空或不是数组');
      return [];
    }

    console.log(`📊 通联数据API返回 ${data.data.length} 只股票`);

    // 过滤匹配的股票
    const queryLower = query.toLowerCase();
    const matched = data.data.filter((stock: DataYesStockInfo) => {
      return (
        stock.ticker.includes(query) ||
        stock.secShortName.includes(query) ||
        stock.secShortName.toLowerCase().includes(queryLower)
      );
    }).slice(0, 50);

    console.log(`✅ 找到 ${matched.length} 只匹配的股票`);
    return matched;

  } catch (error) {
    console.error('❌ 通联数据API异常:', error);
    return [];
  }
}

/**
 * 获取股票实时行情
 * API: /api/market/getMktEqud.json
 */
export async function getStockQuotes(tickers: string[]): Promise<Map<string, any>> {
  if (!DATAYES_API_TOKEN) {
    console.error('❌ DATAYES_API_TOKEN 未设置');
    return new Map();
  }

  if (tickers.length === 0) {
    return new Map();
  }

  try {
    console.log('📊 通联数据API - 获取行情:', tickers.length, '只股票');

    // 获取今天和前几天的日期（确保能获取到最新数据）
    const today = new Date();
    const endDate = today.toISOString().split('T')[0].replace(/-/g, '');
    
    // 往前推5天，确保能获取到最近的交易日数据
    const startDate = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0].replace(/-/g, '');
    
    // 通联数据的行情API
    const url = `${DATAYES_BASE_URL}/api/market/getMktEqud.json`;
    const params = new URLSearchParams({
      ticker: tickers.slice(0, 50).join(','), // 限制一次最多50只
      beginDate: startDate,
      endDate: endDate,
      field: 'ticker,secShortName,tradeDate,closePrice,openPrice,highestPrice,lowestPrice,turnoverVol,preClosePrice',
    });

    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DATAYES_API_TOKEN}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 通联数据行情API错误:', response.status, errorText);
      return new Map();
    }

    const data = await response.json();

    // 检查返回数据结构
    if (!data || data.retCode !== 1) {
      console.error('❌ 通联数据行情API返回错误:', data?.retMsg || '未知错误');
      return new Map();
    }

    if (!data.data || !Array.isArray(data.data)) {
      console.error('❌ 通联数据行情API返回格式错误');
      return new Map();
    }

    const results = new Map();
    
    // 对于每只股票，只取最新的一条数据
    const latestQuotes = new Map<string, DataYesQuote>();
    for (const quote of data.data as DataYesQuote[]) {
      const existing = latestQuotes.get(quote.ticker);
      if (!existing || quote.tradeDate > existing.tradeDate) {
        latestQuotes.set(quote.ticker, quote);
      }
    }
    
    // 转换为返回格式
    for (const [ticker, quote] of latestQuotes.entries()) {
      const change = quote.closePrice - quote.preClosePrice;
      const changePercent = quote.preClosePrice > 0 
        ? (change / quote.preClosePrice) * 100 
        : 0;

      results.set(ticker, {
        price: quote.closePrice,
        open: quote.openPrice,
        high: quote.highestPrice,
        low: quote.lowestPrice,
        volume: quote.turnoverVol,
        change: change,
        changePercent: changePercent,
      });
    }

    console.log(`✅ 获取到 ${results.size} 只股票的行情`);
    return results;

  } catch (error) {
    console.error('❌ 通联数据行情API异常:', error);
    return new Map();
  }
}

/**
 * 转换交易所代码
 * XSHG -> SH (上交所)
 * XSHE -> SZ (深交所)
 */
export function convertExchangeCode(exchangeCD: string): string {
  switch (exchangeCD) {
    case 'XSHG':
      return 'SH';
    case 'XSHE':
      return 'SZ';
    default:
      return exchangeCD;
  }
}
