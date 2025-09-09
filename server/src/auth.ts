import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  AuthData, User, LoginRequest, LoginResponse, ChangePasswordRequest, ChangePasswordResponse,
} from './types';

// ES模块中获取当前文件路径的方法
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 计算项目根目录，然后构建到src目录的路径
const projectRoot = path.resolve(__dirname, '../../');
const srcDir = path.join(projectRoot, 'server', 'src');

// 用户数据文件路径 - 始终指向src目录下的文件
const USER_DATA_FILE = path.join(srcDir, 'userData.json');

/**
 * 读取用户数据
 */
export const readUserData = async(): Promise<AuthData> => {
  try {
    console.log('读取用户数据文件路径:', USER_DATA_FILE);
    const data = await fs.readFile(USER_DATA_FILE, 'utf-8');
    const authData = JSON.parse(data) as AuthData;
    console.log('读取到的用户数据:', JSON.stringify(authData));
    return authData;
  } catch (error) {
    console.error('读取用户数据失败:', error);
    // 如果文件不存在或读取失败，返回默认数据结构
    return { users: [] };
  }
};

/**
 * 写入用户数据
 */
export const writeUserData = async(data: AuthData): Promise<void> => {
  try {
    await fs.writeFile(USER_DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('写入用户数据失败:', error);
    throw new Error('保存用户数据失败');
  }
};

/**
 * 用户登录
 */
export const login = async(credentials: LoginRequest): Promise<LoginResponse> => {
  const { username, password } = credentials;
  const authData = await readUserData();

  // 查找用户
  const user = authData.users.find(u => u.username === username && u.password === password);

  if (user) {
    // 不返回密码信息给前端
    const userWithoutPassword = {
      ...user,
      password: '',
    };

    return {
      success: true,
      user: userWithoutPassword,
    };
  } else {
    return {
      success: false,
      message: '用户名或密码错误',
    };
  }
};

/**
 * 修改密码
 */
export const changePassword = async(request: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
  const { username, currentPassword, newPassword } = request;
  const authData = await readUserData();

  // 查找用户
  const userIndex = authData.users.findIndex(u => u.username === username && u.password === currentPassword);

  if (userIndex === -1) {
    return {
      success: false,
      message: '当前用户名或密码错误',
    };
  }

  // 检查新密码是否为空
  if (!newPassword || newPassword.trim() === '') {
    return {
      success: false,
      message: '新密码不能为空',
    };
  }

  // 更新密码
  authData.users[userIndex] = {
    ...authData.users[userIndex],
    password: newPassword,
  };

  // 保存更新后的数据
  try {
    await writeUserData(authData);
    return {
      success: true,
      message: '密码修改成功',
    };
  } catch (error) {
    return {
      success: false,
      message: '密码修改失败，请稍后重试',
    };
  }
};

/**
 * 初始化用户数据（如果文件不存在）
 */
export const initUserData = async(): Promise<void> => {
  try {
    // 检查文件是否存在
    await fs.access(USER_DATA_FILE);
    console.log('用户数据文件已存在');
  } catch (error) {
    // 文件不存在，创建默认用户数据
    const defaultData: AuthData = {
      users: [
        {
          id: '1',
          username: 'admin',
          password: 'admin123',
          createdAt: new Date().toISOString(),
        },
      ],
    };
    await writeUserData(defaultData);
    console.log('用户数据文件已创建，初始用户: admin/admin123');
  }
};
