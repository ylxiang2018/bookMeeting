import { Router } from 'express';
import express from 'express';
import {
  getAllBookings,
  getBookingsByRoomAndDate,
  createBooking,
  updateBooking,
  deleteBooking
} from './db';
import { Booking } from './types';

const router = express.Router();

// 获取用户IP地址的辅助函数
const getUserIp = (req: express.Request): string => {
  // 检查代理头（如果应用运行在代理后面）
  const forwardedFor = req.headers['x-forwarded-for'] as string;
  if (forwardedFor) {
    // 如果有多个IP，取第一个
    return forwardedFor.split(',')[0].trim();
  }
  // 直接从请求对象获取IP
  return req.ip || 'unknown';
}
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await getAllBookings();
    res.json(bookings);
  } catch (error) {
    console.error('获取会议预定失败:', error);
    res.status(500).json({ error: '获取会议预定失败' });
  }
});

// 根据会议室ID和日期获取会议预定
router.get('/bookings/room/:roomId/date/:date', async (req, res) => {
  try {
    const { roomId, date } = req.params;
    const bookings = await getBookingsByRoomAndDate(roomId, date);
    res.json(bookings);
  } catch (error) {
    console.error('获取会议预定失败:', error);
    res.status(500).json({ error: '获取会议预定失败' });
  }
});

// 创建新的会议预定
router.post('/bookings', async (req, res) => {
  try {
    const booking: Booking = req.body;
    
    // 检查必要字段
    if (!booking.id || !booking.roomId || !booking.date || !booking.startTime || !booking.endTime || !booking.title || !booking.organizer) {
      return res.status(400).json({ error: '缺少必要的会议预定信息' });
    }
    
    // 确保有创建时间
    if (!booking.createdAt) {
      booking.createdAt = new Date();
    } else if (typeof booking.createdAt === 'string') {
      booking.createdAt = new Date(booking.createdAt);
    }
    
    // 添加用户IP地址
    booking.ipAddress = getUserIp(req);
    console.log(`用户 ${booking.organizer} (IP: ${booking.ipAddress}) 创建了会议预定: ${booking.title}`);
    
    const createdBooking = await createBooking(booking);
    res.status(201).json(createdBooking);
  } catch (error) {
    console.error('创建会议预定失败:', error);
    res.status(500).json({ error: '创建会议预定失败' });
  }
});

// 更新会议预定
router.put('/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBooking: Booking = req.body;
    
    // 检查必要字段
    if (!updatedBooking.roomId || !updatedBooking.date || !updatedBooking.startTime || !updatedBooking.endTime || !updatedBooking.title || !updatedBooking.organizer) {
      return res.status(400).json({ error: '缺少必要的会议预定信息' });
    }
    
    // 确保ID一致
    updatedBooking.id = id;
    
    const result = await updateBooking(id, updatedBooking);
    
    if (!result) {
      return res.status(404).json({ error: '未找到会议预定' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('更新会议预定失败:', error);
    res.status(500).json({ error: '更新会议预定失败' });
  }
});

// 删除会议预定
router.delete('/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userIp = getUserIp(req);
    
    // 先获取要删除的预订信息用于日志记录
    const bookings = await getAllBookings();
    const bookingToDelete = bookings.find(b => b.id === id);
    
    const result = await deleteBooking(id);
    
    if (!result) {
      return res.status(404).json({ error: '未找到会议预定' });
    }
    
    // 记录删除操作的IP
    if (bookingToDelete) {
      console.log(`用户 (IP: ${userIp}) 删除了会议预定: ${bookingToDelete.title} (ID: ${id})`);
    } else {
      console.log(`用户 (IP: ${userIp}) 删除了会议预定 (ID: ${id})`);
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('删除会议预定失败:', error);
    res.status(500).json({ error: '删除会议预定失败' });
  }
});

export default router;