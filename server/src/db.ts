import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Booking } from './types';

// ES模块中获取__dirname的方式
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 数据文件路径
const DATA_FILE = path.join(__dirname, '../../data.json');

// 初始化数据存储
export const initDb = async(): Promise<void> => {
  try {
    // 检查数据文件是否存在
    await fs.access(DATA_FILE);
  } catch (error) {
    // 如果文件不存在，创建一个空的 bookings 数组
    await fs.writeFile(DATA_FILE, JSON.stringify({ bookings: [] }, null, 2));
  }
};

// 读取数据
export const readData = async(): Promise<{ bookings: Booking[] }> => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取数据失败:', error);
    return { bookings: [] };
  }
};

// 写入数据
export const writeData = async(data: { bookings: Booking[] }): Promise<void> => {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('写入数据失败:', error);
    throw new Error('Failed to write data');
  }
};

// 获取所有会议预定
export const getAllBookings = async(): Promise<Booking[]> => {
  const data = await readData();
  return data.bookings;
};

// 根据会议室ID和日期获取会议预定
export const getBookingsByRoomAndDate = async(
  roomId: string,
  date: string,
): Promise<Booking[]> => {
  const data = await readData();
  return data.bookings.filter(
    booking => booking.roomId === roomId && booking.date === date,
  );
};

// 创建新的会议预定
export const createBooking = async(booking: Booking): Promise<Booking> => {
  const data = await readData();
  data.bookings.push(booking);
  await writeData(data);
  return booking;
};

// 更新会议预定
export const updateBooking = async(
  id: string,
  updatedBooking: Booking,
): Promise<Booking | null> => {
  const data = await readData();
  const index = data.bookings.findIndex(booking => booking.id === id);

  if (index === -1) {
    return null;
  }

  data.bookings[index] = updatedBooking;
  await writeData(data);
  return updatedBooking;
};

// 删除会议预定
export const deleteBooking = async(id: string): Promise<boolean> => {
  const data = await readData();
  const initialLength = data.bookings.length;
  data.bookings = data.bookings.filter(booking => booking.id !== id);

  if (data.bookings.length === initialLength) {
    return false; // 没有找到要删除的预定
  }

  await writeData(data);
  return true;
};

// 关闭数据库连接（文件存储不需要真正关闭）
export const closeDb = async(): Promise<void> => {
  // 文件存储不需要特殊的关闭操作
  return;
};
