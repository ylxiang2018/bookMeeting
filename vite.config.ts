/** WARNING: DON'T EDIT THIS FILE */
/** WARNING: DON'T EDIT THIS FILE */
/** WARNING: DON'T EDIT THIS FILE */

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

function getPlugins() {
  const plugins = [react(), tsconfigPaths()];
  return plugins;
}

export default defineConfig({
  plugins: getPlugins(),
  // 配置HTML选项，保留原始标题
  html: {
    title: '会议预定',
  },
  // 添加API代理配置
  server: {
    proxy: {
      '/api': {
        target: 'http://192.168.22.40:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
