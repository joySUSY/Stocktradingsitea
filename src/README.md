# 📈 股票盯盘系统

为父母设计的简洁、易用的A股监控Dashboard，支持全市场5000+只股票搜索和实时监控。

---

## ✨ 主要功能

- 🔍 **全市场搜索** - 支持5000+只A股（沪深主板、创业板、科创板）
- 👀 **关注股票** - 仅观察，不记录持仓
- 💰 **持仓管理** - 记录成本价和持仓量，自动计算盈亏
- 📊 **实时数据** - 接入Tushare Pro，获取真实行情
- 🤖 **AI助手** - 金融专家视角的股票分析（界面已完成）
- 🎨 **iOS风格** - 简洁流畅的设计，使用Nowar Sans字体
- 💾 **数据持久化** - 自选股保存在本地，不会丢失

---

## 🚀 快速开始

### 方案1：Vercel部署（推荐，最简单）⭐

**优势：**
- ✅ 完全免费
- ✅ 不需要运行本地服务器
- ✅ 永久在线，随时随地访问
- ✅ 5分钟搞定

**步骤：**
1. 注册Vercel（用GitHub登录）：https://vercel.com
2. 上传代码到GitHub
3. 在Vercel导入项目，点击Deploy
4. 复制API地址，更新 `/utils/stockApi.ts` 的配置

📖 **详细教程：** 查看 [⭐️一键部署Vercel.md](./⭐️一键部署Vercel.md)

---

### 方案2：本地运行Python后端

**适合：** 想在本地运行的用户

**步骤：**

#### Windows用户：
1. 双击 `backend/start_server.bat`
2. 等待服务启动
3. 开始使用

#### Mac/Linux用户：
```bash
cd backend
chmod +x start_server.sh
./start_server.sh
```

📖 **详细教程：** 查看 [QUICK_START.md](./QUICK_START.md)

---

## 📊 数据源

- **Tushare Pro** - 专业的金融数据接口
- **已配置Token** - 开箱即用
- **支持范围**：
  - 🔵 上海主板（600xxx.SH）
  - 🟢 深圳主板（000xxx.SZ）
  - 🟡 创业板（300xxx.SZ）
  - 🔴 科创板（688xxx.SH）
  - 总计：**5000+只股票**

---

## 📁 项目结构

```
stock-dashboard/
├── App.tsx                    # 主应用
├── components/                # React组件
│   ├── AddStockModal.tsx     # 添加股票弹窗
│   ├── AIAssistant.tsx       # AI助手界面
│   ├── StockCard.tsx         # 股票卡片
│   └── ...
├── utils/
│   ├── stockApi.ts           # API集成（前端）
│   └── stockUtils.ts         # 工具函数
├── api/                      # Vercel Serverless函数
│   └── stock/
│       ├── search.js         # 搜索接口
│       └── health.js         # 健康检查
├── backend/                  # Python后端（本地运行）
│   ├── stock_api_server.py   # Flask服务器
│   ├── start_server.bat      # Windows启动脚本
│   └── start_server.sh       # Mac/Linux启动脚本
├── vercel.json               # Vercel配置
├── package.json              # Node.js配置
└── README.md                 # 本文件
```

---

## 🎯 使用指南

### 1. 添加自选股
1. 点击右上角 "➕ 添加自选股" 按钮
2. 输入股票代码或名称（如：茅台、600519、比亚迪）
3. 选择股票类型：
   - 👀 **仅关注** - 只观察行情
   - 💰 **已购入** - 记录成本和数量

### 2. 管理持仓
- **查看盈亏** - 自动计算当前盈亏
- **编辑持仓** - 点击股票卡片右上角的 "..." 菜单
- **删除股票** - 在菜单中选择删除

### 3. 查看统计
- **持仓总览** - 查看总市值和总盈亏
- **持仓占比** - 查看各股票占比
- **持仓明细** - 查看详细的持仓信息

### 4. AI分析（开发中）
- 点击右下角 "🤖" 按钮
- 输入股票代码
- AI会进行专业分析和建议

---

## ⚙️ 技术栈

### 前端
- **React** - 用户界面
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式系统
- **Motion** (Framer Motion) - 动画效果
- **Lucide React** - 图标库

### 后端
- **Node.js** - Vercel Serverless函数
- **Python Flask** - 本地开发服务器（可选）
- **Tushare Pro** - 数据源

### 部署
- **Vercel** - 免费部署平台
- **GitHub** - 代码托管

---

## 📖 文档导航

| 文档 | 说明 |
|------|------|
| [⭐️点我开始.txt](./⭐️点我开始.txt) | 快速入门提示 |
| [⭐️一键部署Vercel.md](./⭐️一键部署Vercel.md) | Vercel部署超简单教程 |
| [START_HERE.md](./START_HERE.md) | 开始使用指南 |
| [QUICK_START.md](./QUICK_START.md) | Python后端快速启动 |
| [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) | Vercel详细部署文档 |
| [API_INTEGRATION.md](./API_INTEGRATION.md) | API集成说明 |
| [backend/README.md](./backend/README.md) | 后端技术文档 |

---

## 🔧 配置说明

### Tushare Token
已预配置Token：`42a14c557055123e9464f371c4c9ae4a12f1a864e5a47ea4433d7e34`

### API地址配置
- **本地开发**: `http://localhost:3001`
- **Vercel部署**: 在 `/utils/stockApi.ts` 中修改 `PROXY_URL`

### 环境变量（可选）
创建 `.env` 文件：
```
REACT_APP_API_URL=https://your-project-name.vercel.app
```

---

## 💡 使用技巧

1. **最佳使用时间** - 交易日 9:30-15:00（数据最准确）
2. **数据更新** - 自动缓存60秒，减少API调用
3. **自选股备份** - 数据保存在浏览器，建议定期备份
4. **多设备同步** - 使用Vercel部署，随时随地访问
5. **股票搜索** - 支持代码、名称、拼音首字母搜索

---

## ⚠️ 注意事项

1. **数据延时** - 免费数据通常延时15分钟
2. **API限制** - Tushare免费用户每分钟200次
3. **浏览器兼容** - 推荐使用Chrome/Safari/Edge
4. **隐私说明** - 所有数据存储在本地，不上传服务器
5. **免责声明** - 本系统仅供学习参考，不构成投资建议

---

## 🐛 常见问题

### Q: 搜索只显示70只股票？
**A:** 后端服务未启动。请启动Python服务或部署到Vercel。

### Q: 如何部署到Vercel？
**A:** 查看 [⭐️一键部署Vercel.md](./⭐️一键部署Vercel.md)

### Q: Python后端如何启动？
**A:** Windows双击 `backend/start_server.bat`，Mac/Linux运行 `backend/start_server.sh`

### Q: Token会过期吗？
**A:** 长期不用可能失效，登录 https://tushare.pro 查看状态

### Q: 可以添加更多功能吗？
**A:** 可以！代码开源，欢迎定制开发

---

## 📊 系统架构

```
┌─────────────────┐
│   浏览器界面     │  用户交互
│   (React)       │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   API集成层     │  智能切换
│  (stockApi.ts)  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ↓         ↓
┌─────────┐ ┌──────────────┐
│本地数据 │ │ Vercel/Python│  后端服务
│ (70只)  │ │  (5000+只)   │
└─────────┘ └──────┬───────┘
                   │
                   ↓
            ┌──────────────┐
            │ Tushare Pro  │  数据源
            │ (A股全市场)  │
            └──────────────┘
```

---

## 🎉 特色亮点

- 🎨 **iOS风格设计** - 简洁美观，父母也能轻松上手
- 🇨🇳 **完全中文化** - 所有界面使用中文
- 📱 **响应式布局** - 支持手机、平板、电脑
- ⚡️ **极速搜索** - 防抖优化，流畅体验
- 💾 **智能缓存** - 减少API调用，提升速度
- 🔄 **自动降级** - API不可用时自动使用本地数据
- 🎯 **精准搜索** - 支持代码、名称、行业搜索

---

## 📞 获取帮助

- 📖 查看文档目录中的各类指南
- 🐛 遇到问题查看各文件中的"常见问题"章节
- 💡 查看代码注释了解实现细节

---

## 📄 许可证

本项目仅供个人学习使用。

---

**祝您和父母投资顺利！📈**

---

*最后更新：2024年11月*
