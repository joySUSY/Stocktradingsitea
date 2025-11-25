// 中国A股模拟数据
export const mockStocks = [
  { 
    symbol: '600519.SH', 
    name: '贵州茅台', 
    price: 1685.50, 
    change: 28.30, 
    changePercent: 1.71,
    prediction: 78,
    volume: '1.2万手',
    marketCap: '2.12万亿',
    pe: 32.5
  },
  { 
    symbol: '000001.SZ', 
    name: '平安银行', 
    price: 12.68, 
    change: -0.15, 
    changePercent: -1.17,
    prediction: 62,
    volume: '38.5万手',
    marketCap: '2453亿',
    pe: 5.8
  },
  { 
    symbol: '600036.SH', 
    name: '招商银行', 
    price: 38.42, 
    change: 0.87, 
    changePercent: 2.32,
    prediction: 75,
    volume: '15.3万手',
    marketCap: '9876亿',
    pe: 7.2
  },
  { 
    symbol: '300750.SZ', 
    name: '宁德时代', 
    price: 178.90, 
    change: -4.25, 
    changePercent: -2.32,
    prediction: 45,
    volume: '25.8万手',
    marketCap: '7834亿',
    pe: 28.9
  },
  { 
    symbol: '601318.SH', 
    name: '中国平安', 
    price: 45.67, 
    change: 1.23, 
    changePercent: 2.77,
    prediction: 68,
    volume: '42.1万手',
    marketCap: '8234亿',
    pe: 9.3
  },
  { 
    symbol: '000858.SZ', 
    name: '五粮液', 
    price: 128.35, 
    change: 2.85, 
    changePercent: 2.27,
    prediction: 81,
    volume: '8.7万手',
    marketCap: '4985亿',
    pe: 24.6
  },
  { 
    symbol: '601012.SH', 
    name: '隆基绿能', 
    price: 18.42, 
    change: 0.68, 
    changePercent: 3.83,
    prediction: 72,
    volume: '52.3万手',
    marketCap: '1456亿',
    pe: 15.2
  },
  { 
    symbol: '688981.SH', 
    name: '中芯国际', 
    price: 52.18, 
    change: -1.45, 
    changePercent: -2.70,
    prediction: 58,
    volume: '18.9万手',
    marketCap: '4123亿',
    pe: 42.1
  },
  { 
    symbol: '002594.SZ', 
    name: '比亚迪', 
    price: 256.78, 
    change: 8.92, 
    changePercent: 3.60,
    prediction: 85,
    volume: '32.5万手',
    marketCap: '7456亿',
    pe: 35.8
  },
  { 
    symbol: '600900.SH', 
    name: '长江电力', 
    price: 25.67, 
    change: 0.45, 
    changePercent: 1.79,
    prediction: 70,
    volume: '28.3万手',
    marketCap: '5789亿',
    pe: 18.4
  },
  { 
    symbol: '000333.SZ', 
    name: '美的集团', 
    price: 68.90, 
    change: -1.20, 
    changePercent: -1.71,
    prediction: 65,
    volume: '19.8万手',
    marketCap: '4823亿',
    pe: 14.2
  },
  { 
    symbol: '601888.SH', 
    name: '中国中免', 
    price: 92.34, 
    change: 3.45, 
    changePercent: 3.88,
    prediction: 77,
    volume: '24.6万手',
    marketCap: '1789亿',
    pe: 26.8
  },
  { 
    symbol: '600887.SH', 
    name: '伊利股份', 
    price: 32.18, 
    change: 0.92, 
    changePercent: 2.94,
    prediction: 73,
    volume: '21.4万手',
    marketCap: '2156亿',
    pe: 22.3
  },
  { 
    symbol: '000002.SZ', 
    name: '万科A', 
    price: 8.45, 
    change: -0.28, 
    changePercent: -3.21,
    prediction: 38,
    volume: '156.7万手',
    marketCap: '987亿',
    pe: 6.7
  },
  { 
    symbol: '601398.SH', 
    name: '工商银行', 
    price: 5.68, 
    change: 0.05, 
    changePercent: 0.89,
    prediction: 60,
    volume: '98.2万手',
    marketCap: '1.56万亿',
    pe: 4.9
  },
  { 
    symbol: '000725.SZ', 
    name: '京东方A', 
    price: 3.89, 
    change: 0.11, 
    changePercent: 2.91,
    prediction: 68,
    volume: '245.8万手',
    marketCap: '1523亿',
    pe: 35.6
  },
  { 
    symbol: '600276.SH', 
    name: '恒瑞医药', 
    price: 48.76, 
    change: 1.56, 
    changePercent: 3.30,
    prediction: 76,
    volume: '17.2万手',
    marketCap: '3245亿',
    pe: 41.2
  },
  { 
    symbol: '002475.SZ', 
    name: '立讯精密', 
    price: 34.21, 
    change: -0.89, 
    changePercent: -2.54,
    prediction: 55,
    volume: '32.6万手',
    marketCap: '2387亿',
    pe: 28.9
  }
];

export const mockNews = [
  {
    title: "公司发布强劲季度财报",
    summary: "公司业绩超市场预期，营收增长稳健，利润率显著提升。",
    time: "2小时前",
    sentiment: "positive"
  },
  {
    title: "多家机构上调目标价",
    summary: "多位分析师在产品发布后上调目标价，看好未来发展。",
    time: "5小时前",
    sentiment: "positive"
  },
  {
    title: "市场波动影响股价表现",
    summary: "受大盘波动影响，个股出现较大波动，建议关注基本面。",
    time: "1天前",
    sentiment: "neutral"
  }
];

export const initialMarketSummary = {
  totalValue: 3245.67,
  dailyChange: 38.52,
  dailyChangePercent: 1.20
};