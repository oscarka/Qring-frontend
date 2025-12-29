# Qring Health Dashboard

Qring 健康数据可视化仪表板，基于 React + TypeScript + Vite 构建。

## 📋 功能特性

- ✅ 实时健康数据展示（心率、HRV、压力、血氧等）
- ✅ 多时间范围选择（1天、3天、7天、10天、30天）
- ✅ 交互式图表（使用 Recharts）
- ✅ 活动数据展示（步数、卡路里、距离）
- ✅ 睡眠数据详情
- ✅ 响应式设计（支持移动端和桌面端）
- ✅ 自动刷新（30秒）
- ✅ Mock 数据模式（开发测试用）

## 🚀 快速开始

### 环境要求

- Node.js 16.0+（推荐 18.0+）
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 配置 API 地址

创建 `.env` 文件（可选，默认使用相对路径）：

```bash
# 开发环境
VITE_API_BASE=http://localhost:5002/api

# 生产环境
VITE_API_BASE=https://your-backend-domain.com/api
```

### 运行开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

### 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录。

### 预览生产版本

```bash
npm run preview
```

## 📁 项目结构

```
.
├── components/           # React 组件
│   ├── charts/          # 图表组件
│   ├── common/          # 通用组件
│   ├── Dashboard.tsx    # 主仪表板
│   └── Sidebar.tsx      # 侧边栏
├── services/            # API 服务
│   ├── api.ts           # API 客户端
│   └── mockData.ts      # Mock 数据
├── types.ts             # TypeScript 类型定义
├── utils.ts             # 工具函数
├── constants.tsx        # 常量定义
├── vite.config.ts       # Vite 配置
├── tsconfig.json        # TypeScript 配置
└── package.json         # 项目配置
```

## 🎨 技术栈

- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Recharts** - 图表库
- **Tailwind CSS** - 样式框架（通过内联样式实现）
- **Axios** - HTTP 客户端

## 📡 API 配置

### 开发环境

使用 Vite 代理（`vite.config.ts`）：

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:5002',
    changeOrigin: true,
  }
}
```

### 生产环境

通过环境变量配置：

```bash
VITE_API_BASE=https://your-backend-domain.com/api
```

或在代码中直接使用相对路径：

```typescript
const API_BASE = '/api'
```

## 🚢 部署

### Cloudflare Pages 部署（推荐）

1. 在 Cloudflare Pages 创建新项目
2. 连接 GitHub 仓库
3. 配置构建命令：`npm run build`
4. 配置输出目录：`dist`
5. 配置环境变量（如需要）：`VITE_API_BASE`

### 其他静态托管

前端是纯静态应用，可以部署到任何静态文件服务器：

- **Netlify**
- **Vercel**
- **GitHub Pages**
- **Nginx**
- **Apache**

## 🔧 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 | 必需 |
|--------|------|--------|------|
| `VITE_API_BASE` | API 基础路径 | `/api` | 否 |

### Mock 数据模式

在 Dashboard 组件中，可以通过右上角按钮切换 Mock 数据和真实数据。

## 📊 数据展示

### 支持的数据类型

- **心率** (Heart Rate)
- **HRV** (Heart Rate Variability)
- **压力** (Stress)
- **血氧** (Blood Oxygen)
- **活动** (Activity)
- **睡眠** (Sleep)
- **运动记录** (Exercise)
- **运动+** (Sport Plus)
- **久坐提醒** (Sedentary)

### 时间范围

- 1天
- 3天
- 7天
- 10天
- 30天

## 🎯 功能说明

### 实时数据刷新

- 自动刷新间隔：30秒
- 可以手动刷新

### 图表交互

- 鼠标悬停显示数据详情
- 支持缩放和平移（部分图表）
- 响应式布局

### 数据表格

- 可展开的数据表格
- 显示原始数据
- 支持排序和筛选

## 🐛 故障排查

### 问题1：API 请求失败

- 检查后端服务是否运行
- 检查 API 地址配置
- 检查 CORS 配置

### 问题2：图表不显示

- 检查数据格式是否正确
- 检查控制台错误信息
- 确认 Recharts 版本兼容性

### 问题3：环境变量不生效

- 确保变量名以 `VITE_` 开头
- 重启开发服务器
- 检查 `.env` 文件位置

## 📚 相关文档

- [前端需求文档-总览.md](../Qring-development/前端需求文档-总览.md)
- [前端需求文档-第二部分-API接口规范.md](../Qring-development/前端需求文档-第二部分-API接口规范.md)
- [前端需求文档-第三部分-数据格式和数据处理要求.md](../Qring-development/前端需求文档-第三部分-数据格式和数据处理要求.md)

## 📄 许可证

MIT License

## 👥 贡献

欢迎提交 Issue 和 Pull Request！
