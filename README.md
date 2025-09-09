# 会议预定系统

## 项目简介

这是一个基于 React + TypeScript + Node.js 的前后端分离会议预定系统，允许用户查看会议室状态并进行会议预定操作。系统支持日期选择、时间段预约、会议室详情展示等核心功能，提供了直观的用户界面和流畅的操作体验。

## 技术栈

- **前端**：React 18、TypeScript、Vite、Tailwind CSS、Framer Motion
- **后端**：Node.js、Express、TypeScript
- **数据存储**：JSON 文件存储
- **构建工具**：Vite、TypeScript Compiler

## 项目结构

```
├── src/             # 前端源码目录
│   ├── components/  # React组件目录
│   │   ├── BookingForm.tsx     # 预订表单组件
│   │   ├── BookingList.tsx     # 预订列表组件
│   │   ├── DateSelector.tsx    # 日期选择组件
│   │   ├── Empty.tsx           # 空状态组件
│   │   ├── RoomCard.tsx        # 会议室卡片组件
│   │   └── TimeSlotSelector.tsx # 时间段选择组件
│   ├── contexts/    # React Context状态管理
│   │   ├── authContext.ts      # 认证上下文
│   │   ├── bookingContext.jsx  # 预订上下文
│   ├── lib/         # 工具函数库
│   │   ├── dateUtils.ts        # 日期处理工具
│   │   ├── fileSystemUtils.ts  # 文件系统工具
│   │   ├── storageUtils.ts     # 存储工具
│   │   └── utils.ts            # 通用工具函数
│   ├── pages/       # 页面组件
│   │   └── Home.tsx            # 首页组件
│   ├── types/       # TypeScript类型定义
│   │   └── index.ts            # 类型声明文件
│   ├── data/        # 静态数据
│   │   └── bookings.json       # 模拟预订数据
│   ├── hooks/       # 自定义钩子
│   │   └── useTheme.ts         # 主题钩子
│   ├── App.tsx      # 应用主组件
│   ├── index.css    # 全局样式
│   └── main.tsx     # 应用入口文件
├── server/          # 后端源码目录
│   ├── src/         # 后端代码
│   │   ├── db.ts               # 数据操作模块
│   │   ├── index.ts            # 服务器入口
│   │   ├── routes.ts           # API路由定义
│   │   └── types.ts            # 后端类型定义
│   ├── package.json            # 后端依赖配置
│   └── tsconfig.json           # 后端TypeScript配置
├── data.json        # 会议预定数据存储文件
├── nginx.conf       # Nginx配置文件（用于生产环境部署）
├── package.json     # 前端依赖配置
├── tsconfig.json    # 前端TypeScript配置
└── vite.config.ts   # Vite构建配置
```

## 核心功能

### 前端功能
- 会议室列表展示，包含基本信息和图片
- 日期选择器，支持选择不同日期查看预订情况
- 时间段选择器，直观显示可预订和已预订的时间段
- 预订表单，收集会议主题、参与人数等信息
- 使用React Context进行全局状态管理
- 响应式设计，适配不同屏幕尺寸

### 后端功能
- RESTful API接口，支持获取和管理预订数据
- 基于文件系统的JSON数据存储
- CORS跨域请求处理
- 服务器优雅启动和关闭机制
- 支持局域网访问配置

## 环境准备

### 系统要求
- Node.js 16.x 或更高版本
- npm 8.x 或更高版本，或 pnpm 7.x 或更高版本

### 安装依赖

#### 1. 前端依赖安装

```bash
# 在项目根目录执行
npm install
# 或使用 pnpm
pnpm install
```

#### 2. 后端依赖安装

```bash
# 进入 server 目录
cd server
npm install
# 或使用 pnpm
pnpm install
# 返回项目根目录
cd ..
```

## 本地开发运行

### 1. 启动后端服务

```bash
# 方式一：在新终端中单独启动后端
cd server
npm run dev  # 开发模式
# 或
npm start    # 生产模式（需要先构建）

# 方式二：在项目根目录一次性启动前后端（需自行实现）
```

后端服务默认运行在 http://localhost:3001

### 2. 启动前端开发服务器

```bash
# 在项目根目录执行
npm run dev
```

前端开发服务器运行在 http://localhost:3000

## 构建项目

### 1. 构建后端

```bash
cd server
npm run build
```

### 2. 构建前端

```bash
# 返回项目根目录
cd ..
npm run build
```

前端构建产物将输出到 `dist/static` 目录

## 生产环境部署

### 1. 使用 Nginx 部署（推荐）

项目根目录已包含 `nginx.conf` 文件，可根据实际情况调整配置后使用。

### 2. 直接运行构建后的文件

```bash
# 启动后端
cd server
npm start

# 启动前端（可使用任何静态文件服务器）
cd dist/static
npx serve
```

## 局域网访问配置

本项目已配置支持局域网内其他机器访问：

1. 后端服务已配置监听所有网络接口（0.0.0.0:3001）
2. 前端开发服务器已配置 `--host` 参数

其他机器可通过以下地址访问：
- 前端：http://[您的IP地址]:3000
- 后端：http://[您的IP地址]:3001

## 数据存储

会议预定数据存储在项目根目录的 `data.json` 文件中。系统启动时会自动检测并创建该文件（如果不存在）。

## 开发说明

### API代理配置

前端开发服务器已配置API代理，将所有以 `/api` 开头的请求转发到后端服务：
```typescript
// vite.config.ts 中的代理配置
server: {
  proxy: {
    '/api': {
      target: 'http://192.168.22.40:3001',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

### 数据初始化

后端服务启动时会自动初始化数据存储文件 `data.json`，确保系统正常运行。

## 常见问题

1. **Q: 为什么删除会议预定功能失败？**
   A: 已修复此问题，原因是后端返回 204 No Content 状态码时前端未正确处理。

2. **Q: 如何查看我的本地 IP 地址？**
   A: 在 Windows 系统中，可使用 `ipconfig` 命令查看；在 macOS/Linux 系统中，可使用 `ifconfig` 或 `ip addr` 命令查看。

3. **Q: 数据存储在哪个文件中？**
   A: 会议预定数据存储在项目根目录的 `data.json` 文件中。
