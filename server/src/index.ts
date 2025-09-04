import express from 'express';
import cors from 'cors';
import { initDb, closeDb } from './db';
import router from './routes';

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api', router);

// 根路径路由
app.get('/', (req, res) => {
  res.json({ message: '会议预定系统后端服务' });
});

// 启动服务器
const startServer = async () => {
  try {
    // 初始化数据库
    await initDb();

    // 启动服务器，监听所有网络接口，允许其他机器访问
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`服务器运行在 http://0.0.0.0:${PORT}`);
      console.log(`本地访问地址: http://localhost:${PORT}`);
      console.log(`局域网访问地址: http://192.168.22.40:${PORT}`);
    });

    // 优雅关闭
    process.on('SIGINT', async () => {
      await closeDb();
      server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

// 启动服务器
startServer();