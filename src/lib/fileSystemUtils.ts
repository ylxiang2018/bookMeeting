import { Booking } from '@/types';
import { toast } from 'sonner';

// 模拟文件系统接口
interface FileSystem {
  readFile(path: string): Promise<any>;
  writeFile(path: string, data: any): Promise<void>;
}

// 使用IndexedDB实现的文件系统
class IndexedDBFileSystem implements FileSystem {
  private dbName = 'meetingRoomDB';
  private storeName = 'files';
  private version = 1;
  private db: IDBDatabase | null = null;

  // 打开数据库连接
  private async openDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'path' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  // 读取文件
  async readFile(path: string): Promise<any> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(path);

        request.onsuccess = () => {
          if (request.result) {
            resolve(request.result.content);
          } else {
            // 文件不存在返回null
            resolve(null);
          }
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('读取文件失败:', error);
      toast.error('读取数据文件失败');
      throw error;
    }
  }

  // 写入文件
  async writeFile(path: string, data: any): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put({ path, content: data });

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('写入文件失败:', error);
      toast.error('保存数据文件失败');
      throw error;
    }
  }
}

// 导出文件系统实例
export const fileSystem = new IndexedDBFileSystem();

// 导出便捷的文件操作函数
export const readJsonFile = async (path: string): Promise<any> => {
  const content = await fileSystem.readFile(path);
  return content || []; // 如果文件不存在，返回空数组
};

export const writeJsonFile = async (path: string, data: any): Promise<void> => {
  await fileSystem.writeFile(path, data);
};