# 股票API后端服务

这个后端服务使用Tushare Pro接口为前端提供A股实时数据。

## 快速开始

### 1. 安装Python环境

确保已安装Python 3.8或更高版本。检查版本：
```bash
python --version
# 或
python3 --version
```

### 2. 安装依赖

在 `backend` 文件夹中运行：

**Windows:**
```bash
cd backend
pip install -r requirements.txt
```

**Mac/Linux:**
```bash
cd backend
pip3 install -r requirements.txt
```

### 3. 启动服务

**Windows:**
```bash
python stock_api_server.py
```

**Mac/Linux:**
```bash
python3 stock_api_server.py
```

看到以下输出表示启动成功：
```
============================================================
🚀 股票数据API服务器启动中...
============================================================
📊 Tushare Token: 42a14c557055123e...
🌐 服务地址: http://localhost:3001
📝 API文档: http://localhost:3001
============================================================
按 Ctrl+C 停止服务
============================================================
```

### 4. 测试服务

在浏览器中访问：
- http://localhost:3001 - 查看API文档
- http://localhost:3001/api/stock/search?q=茅台 - 测试搜索功能
- http://localhost:3001/api/health - 健康检查

### 5. 配置前端

前端已经自动配置好了，只要后端服务在运行，前端就会自动连接。

## 可用接口

### 1. 搜索股票
```
GET /api/stock/search?q=关键词
```
示例：
- `/api/stock/search?q=茅台`
- `/api/stock/search?q=600519`
- `/api/stock/search?q=银行`

返回格式：
```json
{
  "results": [
    {
      "symbol": "600519.SH",
      "name": "贵州茅台",
      "price": 1685.50,
      "change": 28.30,
      "changePercent": 1.71,
      "industry": "白酒",
      "market": "主板"
    }
  ]
}
```

### 2. 获取股票详情
```
GET /api/stock/quote?symbol=600519.SH
```

返回格式：
```json
{
  "symbol": "600519.SH",
  "name": "贵州茅台",
  "price": 1685.50,
  "open": 1670.00,
  "high": 1695.00,
  "low": 1665.00,
  "volume": "1.2万手",
  "marketCap": "2.12万亿",
  "pe": 32.5
}
```

### 3. 批量获取行情
```
GET /api/stock/batch?symbols=600519.SH,000001.SZ,600036.SH
```

### 4. 健康检查
```
GET /api/health
```

## 注意事项

1. **Tushare访问限制**
   - 免费用户每分钟200次调用
   - 已实现60秒缓存机制
   - 超限会自动使用缓存数据

2. **数据延时**
   - 日线数据实时更新
   - 分钟线需要更高权限

3. **运行时间**
   - 建议在股票交易时间运行（9:30-15:00）
   - 非交易时间返回最近一个交易日数据

4. **停止服务**
   - 按 `Ctrl + C` 停止服务

## 常见问题

### Q: 提示"No module named 'flask'"
A: 请先安装依赖：`pip install -r requirements.txt`

### Q: 端口3001被占用
A: 修改 `stock_api_server.py` 最后一行的端口号，同时需要修改前端的 `.env` 文件

### Q: 搜索结果为空
A: 检查是否是交易时间，或者Tushare服务是否正常

### Q: Token过期或无效
A: 登录 https://tushare.pro 检查token状态

## 后续优化建议

1. **添加WebSocket支持** - 实现真正的实时推送
2. **数据库缓存** - 使用Redis缓存热门数据
3. **日志系统** - 记录API调用情况
4. **限流保护** - 防止频繁调用
5. **HTTPS支持** - 生产环境使用加密传输

## 技术支持

- Tushare官方文档：https://tushare.pro/document/1
- Flask文档：https://flask.palletsprojects.com/
