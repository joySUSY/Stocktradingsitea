// 生成完整的A股股票列表
// 基于真实A股市场结构

const industries = [
  '白酒', '啤酒', '黄酒', '葡萄酒', '饮料',
  '银行', '保险', '证券', '信托', '期货',
  '房地产', '物业管理', '建筑装饰', '建筑材料', '水泥',
  '汽车整车', '汽车零部件', '新能源车', '汽车服务',
  '锂电池', '光伏', '风电', '核电', '储能',
  '半导体', '集成电路', '半导体设备', '半导体材料', '芯片设计',
  '医药', '中药', '化学制药', '生物制药', '医疗器械', '医疗服务', 'CRO', '疫苗',
  '家电', '消费电子', '电子元件', '电子制造', 'PCB', '面板',
  '通信设备', '光模块', '光纤光缆', '网络安全', '物联网',
  '计算机应用', '软件开发', '云计算', '大数据', '人工智能',
  '钢铁', '煤炭', '有色金属', '稀土', '黄金', '铝', '铜',
  '化工', '化肥', '农药', '化纤', '塑料', '橡胶',
  '机械', '工程机械', '工控', '激光', '机器人', '自动化',
  '电力', '燃气', '水务', '环保', '新能源发电',
  '航空', '机场', '铁路', '港口', '物流', '快递',
  '石油', '石化', '油服', '天然气',
  '食品', '乳制品', '调味品', '肉制品', '农业', '饲料',
  '纺织', '服装', '鞋帽', '珠宝', '家纺',
  '传媒', '游戏', '影视', '广告', '出版', '教育',
  '旅游', '酒店', '餐饮', '免税',
  '零售', '百货', '超市', '电商',
  '互联网', '电信运营', '数据中心',
  '军工', '航天', '航空装备', '船舶',
  '文具', '家居', '轻工', '造纸'
];

// 生成股票代码和名称
function generateStockList() {
  const stocks = [];
  let stockCount = 0;
  
  // 上证主板 (600, 601, 603, 605开头)
  const shPrefixes = ['600', '601', '603', '605'];
  for (const prefix of shPrefixes) {
    for (let i = 0; i < 999 && stockCount < 2000; i++) {
      const code = `${prefix}${String(i).padStart(3, '0')}`;
      const industry = industries[Math.floor(Math.random() * industries.length)];
      const name = generateStockName(code, industry);
      stocks.push({
        symbol: `sh${code}`,
        name: name,
        code: code,
        market: 'SH',
        industry: industry
      });
      stockCount++;
    }
  }
  
  // 科创板 (688开头)
  for (let i = 0; i < 500 && stockCount < 3000; i++) {
    const code = `688${String(i).padStart(3, '0')}`;
    const techIndustries = ['半导体', '集成电路', '人工智能', '生物制药', 'CRO', '新能源', '高端装备'];
    const industry = techIndustries[Math.floor(Math.random() * techIndustries.length)];
    const name = generateStockName(code, industry);
    stocks.push({
      symbol: `sh${code}`,
      name: name,
      code: code,
      market: 'SH',
      industry: industry
    });
    stockCount++;
  }
  
  // 深证主板 (000开头)
  for (let i = 1; i < 999 && stockCount < 3500; i++) {
    const code = `000${String(i).padStart(3, '0')}`;
    const industry = industries[Math.floor(Math.random() * industries.length)];
    const name = generateStockName(code, industry);
    stocks.push({
      symbol: `sz${code}`,
      name: name,
      code: code,
      market: 'SZ',
      industry: industry
    });
    stockCount++;
  }
  
  // 中小板 (002开头)
  for (let i = 0; i < 999 && stockCount < 4500; i++) {
    const code = `002${String(i).padStart(3, '0')}`;
    const industry = industries[Math.floor(Math.random() * industries.length)];
    const name = generateStockName(code, industry);
    stocks.push({
      symbol: `sz${code}`,
      name: name,
      code: code,
      market: 'SZ',
      industry: industry
    });
    stockCount++;
  }
  
  // 创业板 (300开头)
  for (let i = 0; i < 999 && stockCount < 5000; i++) {
    const code = `300${String(i).padStart(3, '0')}`;
    const growthIndustries = ['新能源', '生物医药', '信息技术', '高端制造', '新材料'];
    const industry = growthIndustries[Math.floor(Math.random() * growthIndustries.length)];
    const name = generateStockName(code, industry);
    stocks.push({
      symbol: `sz${code}`,
      name: name,
      code: code,
      market: 'SZ',
      industry: industry
    });
    stockCount++;
  }
  
  return stocks;
}

// 生成股票名称
function generateStockName(code: string, industry: string): string {
  const prefixes = [
    '中国', '华', '新', '大', '上海', '北京', '深圳', '广州', '江苏', '浙江',
    '山东', '四川', '湖北', '湖南', '河南', '安徽', '福建', '辽宁', '陕西', '重庆',
    '天津', '江西', '云南', '贵州', '广西', '山西', '河北', '吉林', '黑龙江', '内蒙古'
  ];
  
  const suffixes = {
    '白酒': ['酒业', '酒', '老窖', '酒厂', '酒业集团'],
    '银行': ['银行', '商业银行', '农村商业银行'],
    '证券': ['证券', '投资', '资本'],
    '房地产': ['置业', '地产', '房地产', '发展', '建设'],
    '汽车': ['汽车', '客车', '重工', '机械'],
    '医药': ['药业', '医药', '生物', '制药', '医疗'],
    '半导体': ['科技', '微电子', '集成电路', '芯片'],
    '默认': ['集团', '股份', '实业', '控股', '科技', '发展', '工业']
  };
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = (suffixes[industry] || suffixes['默认'])[Math.floor(Math.random() * (suffixes[industry] || suffixes['默认']).length)];
  
  return `${prefix}${suffix}`;
}

export const GENERATED_STOCK_LIST = generateStockList();
