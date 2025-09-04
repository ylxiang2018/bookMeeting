# 
# 会议预定系统

## 项目简介

这是一个基于 React + TypeScript + Node.js 的前后端分离会议预定系统，允许用户查看会议室状态并进行会议预定操作。

## 技术栈

- **前端**：React 18、TypeScript、Vite、Tailwind CSS、Framer Motion
- **后端**：Node.js、Express、TypeScript
- **数据存储**：JSON 文件存储

## 项目结构

```
├── src/             # 前端源码
├── server/          # 后端源码
├── data.json        # 会议预定数据存储文件
└── nginx.conf       # Nginx 配置文件（用于生产环境部署）
```

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
npm run dev  # 开发模式，支持热重载
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

会议预定数据存储在项目根目录的 `data.json` 文件中。

## 常见问题

1. **Q: 为什么删除会议预定功能失败？**
   A: 已修复此问题，原因是后端返回 204 No Content 状态码时前端未正确处理。

2. **Q: 如何查看我的本地 IP 地址？**
   A: 在 Windows 系统中，可使用 `ipconfig` 命令查看；在 macOS/Linux 系统中，可使用 `ifconfig` 或 `ip addr` 命令查看。

3. **Q: 数据存储在哪个文件中？**
   A: 会议预定数据存储在项目根目录的 `data.json` 文件中。
