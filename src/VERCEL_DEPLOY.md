# 🚀 Vercel一键部署指南

现在您可以将后端API部署到Vercel，完全免费，支持全市场5000+只A股！

---

## 📋 部署步骤（超级简单！）

### 方式一：通过Vercel网站部署（推荐，最简单）⭐

#### 1. 注册Vercel账号
- 访问：https://vercel.com
- 点击"Sign Up"
- **建议用GitHub账号登录**（最方便）

#### 2. 导入项目

**选项A：如果您的项目已在GitHub**
1. 在Vercel首页点击"Add New..." → "Project"
2. 选择您的GitHub仓库
3. 点击"Import"
4. 等待部署完成（约2分钟）

**选项B：如果项目还未上传GitHub**
1. 先将项目上传到GitHub：
   - 访问 https://github.com/new
   - 创建新仓库（可以是private私有仓库）
   - 按照提示上传代码
2. 然后回到Vercel导入项目

#### 3. 配置部署
Vercel会自动识别配置，您只需：
- 点击"Deploy"按钮
- 等待部署完成

#### 4. 获取API地址
部署成功后，您会得到一个地址，例如：
```
https://your-project-name.vercel.app
```

#### 5. 更新前端配置
修改 `/utils/stockApi.ts` 文件第42行：
```typescript
// 将这一行：
PROXY_URL: 'http://localhost:3001',

// 改为您的Vercel地址：
PROXY_URL: 'https://your-project-name.vercel.app',
```

**完成！现在您的股票搜索可以访问全市场了！** 🎉

---

### 方式二：通过命令行部署（开发者推荐）

#### 1. 安装Vercel CLI
```bash
npm install -g vercel
```

#### 2. 登录
```bash
vercel login
```

#### 3. 部署
在项目根目录运行：
```bash
vercel
```

首次部署会问几个问题：
- Set up and deploy? → **Y**
- Which scope? → 选择您的账号
- Link to existing project? → **N**
- What's your project's name? → 输入名称（如：stock-api）
- In which directory is your code located? → **./** (直接回车)

#### 4. 生产环境部署
```bash
vercel --prod
```

---

## ✅ 部署成功检查

### 1. 测试API
在浏览器访问（替换成您的域名）：
```
https://your-project-name.vercel.app/api/stock/health
```

应该看到：
```json
{
  "status": "ok",
  "service": "Stock API Server (Vercel)",
  "tushare": "connected",
  "timestamp": "2024-11-24T..."
}
```

### 2. 测试搜索
```
https://your-project-name.vercel.app/api/stock/search?q=茅台
```

应该能看到股票数据

### 3. 在网站中测试
1. 打开您的股票盯盘网站
2. 点击"添加自选股"
3. 搜索任意股票
4. 浏览器控制台显示"✅ 使用Tushare实时数据" = 成功！

---

## 🎯 Vercel的优势

✅ **完全免费** - 每月100GB带宽  
✅ **自动HTTPS** - 免费SSL证书  
✅ **全球CDN** - 访问速度快  
✅ **自动部署** - Git推送后自动更新  
✅ **无需服务器** - 无需维护  
✅ **高可用性** - 99.99%在线时间  

---

## 📊 功能说明

部署后支持：
- 🔍 搜索全市场5000+只A股
- 📈 实时行情数据（Tushare Pro）
- 💾 自动缓存60秒
- 🌐 CORS跨域支持
- ⚡️ Serverless架构，按需运行

---

## ⚙️ 高级配置

### 自定义域名
1. 在Vercel项目设置中
2. 点击"Domains"
3. 添加您的域名
4. 按照提示配置DNS

### 环境变量（可选）
如果不想在代码中暴露Token：
1. Vercel项目设置 → Environment Variables
2. 添加：`TUSHARE_TOKEN` = `您的token`
3. 修改 `/api/stock/search.js` 第11行：
   ```javascript
   const TUSHARE_TOKEN = process.env.TUSHARE_TOKEN;
   ```

---

## 🔄 更新部署

### 方式一：GitHub自动部署
1. 修改代码
2. 推送到GitHub
3. Vercel自动检测并重新部署

### 方式二：手动部署
```bash
vercel --prod
```

---

## ⚠️ 注意事项

### Tushare限制
- 免费用户：每分钟200次请求
- 系统已实现缓存，正常使用不会超限
- 如超限，会有15分钟冷却期

### Vercel限制
- 免费版：10秒函数执行超时
- 免费版：每月100GB流量
- 一般个人使用完全够用

### 如果搜索慢
- 首次搜索较慢（冷启动）
- 后续搜索会快很多
- 缓存会显著提升速度

---

## 🐛 常见问题

### Q: 部署失败？
A: 检查 `vercel.json` 和 `package.json` 是否在项目根目录

### Q: API返回错误？
A: 
1. 检查Vercel函数日志
2. 确认Tushare Token有效
3. 查看是否超出调用限制

### Q: CORS错误？
A: 已在 `vercel.json` 中配置，通常不会有问题

### Q: 如何查看日志？
A: Vercel项目页面 → Deployments → 点击部署 → Functions → 查看日志

---

## 📞 获取帮助

- Vercel文档：https://vercel.com/docs
- Tushare文档：https://tushare.pro/document/1
- GitHub Issues：在您的仓库中提问

---

## 🎉 快速开始

最简单的方式：
1. 注册Vercel（用GitHub账号）
2. 上传代码到GitHub
3. 在Vercel导入项目
4. 点击Deploy
5. 复制API地址，更新前端配置

**5分钟搞定！** 🚀

---

**提示：** 部署成功后，记得把您的Vercel地址填入 `/utils/stockApi.ts` 的 `PROXY_URL` 配置中！
