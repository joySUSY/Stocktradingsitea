# 股票API接入指南

本文档说明如何将股票盯盘系统接入真实的A股数据源。

## 当前状态

目前系统使用本地模拟数据（约70只A股样本），支持搜索功能。要接入真实数据，需要配置后端API服务。

## 推荐方案

### 方案1：搭建Node.js后端代理（推荐）⭐

这是最推荐的方案，可以绕过CORS限制，并且可以缓存数据、限流等。

#### 步骤：

1. **创建后端服务**（使用Express.js示例）

```javascript
// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

// 搜索股票
app.get('/api/stock/search', async (req, res) => {
  try {
    const query = req.query.q;
    const response = await axios.get(
      `https://suggest3.sinajs.cn/suggest/type=11,12&key=${encodeURIComponent(query)}`
    );
    
    // 解析新浪财经返回的数据
    const data = parseSinaSearchData(response.data);
    res.json({ results: data });
  } catch (error) {
    res.status(500).json({ error: '搜索失败' });
  }
});

// 获取实时行情
app.get('/api/stock/quote', async (req, res) => {
  try {
    const symbol = req.query.symbol;
    const sinaSymbol = convertToSinaSymbol(symbol);
    const response = await axios.get(
      `https://hq.sinajs.cn/list=${sinaSymbol}`
    );
    
    const data = parseSinaQuoteData(response.data);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: '获取行情失败' });
  }
});

app.listen(3001, () => {
  console.log('股票API代理服务运行在 http://localhost:3001');
});
```

2. **配置前端环境变量**

创建 `.env` 文件：
```env
REACT_APP_API_PROXY=http://localhost:3001
```

3. **修改代码使用真实API**

在 `AddStockModal.tsx` 中：
```typescript
import { searchStocks } from '../utils/stockApi';

const searchStocks = async (query: string) => {
  setIsSearching(true);
  try {
    const results = await searchStocks(query);
    setSearchResults(results);
  } catch (error) {
    console.error('搜索失败:', error);
  } finally {
    setIsSearching(false);
  }
};
```

---

### 方案2：使用Tushare数据接口

Tushare是专业的金融数据接口，需要注册获取token。

#### 步骤：

1. **注册Tushare账号**
   - 访问 https://tushare.pro/register
   - 获取token

2. **后端集成Tushare**

```python
# Python Flask 示例
from flask import Flask, request, jsonify
from flask_cors import CORS
import tushare as ts

app = Flask(__name__)
CORS(app)

# 设置token
ts.set_token('YOUR_TUSHARE_TOKEN')
pro = ts.pro_api()

@app.route('/api/stock/search')
def search_stocks():
    query = request.args.get('q', '')
    # 搜索股票
    df = pro.stock_basic(exchange='', list_status='L', 
                         fields='ts_code,symbol,name,area,industry')
    
    # 过滤结果
    results = df[df['name'].str.contains(query) | 
                 df['symbol'].str.contains(query)]
    
    return jsonify(results.to_dict('records'))

@app.route('/api/stock/quote')
def get_quote():
    symbol = request.args.get('symbol', '')
    # 获取实时行情
    df = pro.daily(ts_code=symbol, limit=1)
    return jsonify(df.to_dict('records')[0] if not df.empty else {})

if __name__ == '__main__':
    app.run(port=3001)
```

3. **配置环境变量**
```env
REACT_APP_API_PROXY=http://localhost:3001
REACT_APP_TUSHARE_TOKEN=your_token_here
```

---

### 方案3：使用AKShare（Python）

AKShare是开源免费的数据接口库。

```python
# Python Flask 示例
import akshare as ak
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/stock/search')
def search_stocks():
    query = request.args.get('q', '')
    # 获取所有A股列表
    stock_info = ak.stock_info_a_code_name()
    
    # 搜索
    results = stock_info[
        stock_info['name'].str.contains(query) | 
        stock_info['code'].str.contains(query)
    ]
    
    return jsonify(results.to_dict('records'))

@app.route('/api/stock/quote')
def get_quote():
    symbol = request.args.get('symbol', '')
    # 获取实时行情
    stock_data = ak.stock_zh_a_spot_em()
    result = stock_data[stock_data['代码'] == symbol.split('.')[0]]
    
    return jsonify(result.to_dict('records')[0] if not result.empty else {})

if __name__ == '__main__':
    app.run(port=3001)
```

---

### 方案4：使用东方财富API（无需认证）

东方财富提供了一些公开的API，但稳定性不保证。

#### 直接调用示例：

```javascript
// 搜索股票
const searchUrl = `http://searchapi.eastmoney.com/api/suggest/get?input=${query}&type=14&token=D43BF722C8E33BDC906FB84D85E326E8&count=20`;

// 获取实时行情
const quoteUrl = `http://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f43,f44,f45,f46,f47,f48,f49,f50,f51,f52`;
```

---

## 数据格式说明

### 搜索结果格式
```typescript
interface StockSearchResult {
  symbol: string;        // 股票代码，如 "600519.SH"
  name: string;          // 股票名称，如 "贵州茅台"
  price: number;         // 当前价格
  change: number;        // 涨跌额
  changePercent: number; // 涨跌幅百分比
}
```

### 行情数据格式
```typescript
interface StockQuote {
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
```

---

## 部署建议

### 开发环境
- 使用本地模拟数据（已实现）
- 或使用本地后端代理服务

### 生产环境
1. **后端服务部署**
   - 使用云服务器（阿里云、腾讯云等）
   - 部署Node.js/Python后端服务
   - 配置HTTPS和域名

2. **前端配置**
   - 修改 `.env` 文件中的 `REACT_APP_API_PROXY`
   - 指向生产环境的API地址

3. **数据更新频率**
   - 实时数据：WebSocket连接
   - 延时数据：定时轮询（3-5秒）
   - 缓存策略：Redis缓存热门股票数据

---

## 常见问题

### Q: 为什么直接调用会失败？
A: 浏览器的CORS（跨域资源共享）安全策略阻止了直接调用第三方API。需要通过后端代理。

### Q: 有免费的数据源吗？
A: 有的，新浪财经、东方财富、AKShare都是免费的，但可能有调用限制。

### Q: 数据延时多少？
A: 免费数据源通常延时15分钟，实时数据需要付费或使用券商API。

### Q: 如何获取历史数据？
A: Tushare和AKShare都提供历史数据接口，可以用于绘制K线图等功能。

---

## 联系与支持

如需帮助部署后端服务或接入数据源，请查看：
- Tushare文档：https://tushare.pro/document/1
- AKShare文档：https://akshare.akfamily.xyz/
- 新浪财经API：网上有很多教程

---

**注意：** 当前系统已实现约70只A股的本地搜索数据库，可以满足基本使用需求。要接入全市场5000+只股票，建议按照上述方案搭建后端服务。
