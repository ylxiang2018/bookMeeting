import { Booking } from '@/types';
import initialBookings from '@/data/bookings.json';
import { toast } from 'sonner';

// API 基础URL
// 使用localhost，确保在不同环境下都能连接
export const API_BASE_URL = 'http://192.168.22.40:3001/api';

// In-memory storage for bookings
let bookings: Booking[] = [];
let isInitializing = false;

// Callback for bookings updates
let onBookingsUpdate: (bookings: Booking[]) => void = () => { };

export const setOnBookingsUpdate = (callback: (bookings: Booking[]) => void) => {
  onBookingsUpdate = callback;
};

// Get all bookings
export const getBookings = (): Booking[] => {
  return [...bookings]; // Return a copy to prevent direct mutation
};

// 检查预订冲突
// 允许会议时间头尾重叠（即一个会议结束时另一个会议开始）
export const checkBookingConflict = (newBooking: Booking): boolean => {
  return bookings.some(booking => booking.roomId === newBooking.roomId
    && booking.date === newBooking.date
    // 严格重叠（不允许完全匹配的开始/结束时间）
    && newBooking.startTime < booking.endTime && newBooking.endTime > booking.startTime);
};

// 通用API请求函数
const apiRequest = async <T>(
  endpoint: string,
  method: string = 'GET',
  body?: any,
): Promise<T> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // 处理204 No Content响应
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json() as T;
  } catch (error) {
    console.error(`API请求失败 (${endpoint}):`, error);
    throw error;
  }
};

// Initialize bookings from backend API
export const initializeBookings = async(): Promise<void> => {
  // 防止重复初始化
  if (isInitializing) return;

  try {
    // 尝试从后端API加载数据
    const fetchedBookings = await apiRequest<Booking[]>('/bookings');

    if (fetchedBookings && fetchedBookings.length >= 0) {
      // Convert string dates back to Date objects
      bookings = fetchedBookings.map((booking: any) => ({
        ...booking,
        createdAt: new Date(booking.createdAt),
      }));
    } else {
      // 初始化默认数据
      bookings = initialBookings.map((booking: any) => ({
        ...booking,
        createdAt: new Date(booking.createdAt),
      }));

      // 将初始数据保存到后端
      for (const booking of bookings) {
        try {
          await apiRequest('/bookings', 'POST', {
            ...booking,
            createdAt: booking.createdAt.toISOString(),
          });
        } catch (error) {
          console.error('保存初始数据失败:', error);
        }
      }
    }
    isInitializing = true;
  } catch (error) {
    console.error('初始化会议预定时出错:', error);
    // 降级到本地初始数据
    bookings = initialBookings.map((booking: any) => ({
      ...booking,
      createdAt: new Date(booking.createdAt),
    }));
    toast.error('连接后端服务失败，使用本地数据');
  } finally {
    isInitializing = false;
  }
};

// 同步版本的初始化函数，用于向后兼容
export const initializeBookingsSync = (): void => {
  initializeBookings().catch(console.error);
};

// Get all bookings (async version)
export const loadBookingsAsync = async(): Promise<Booking[]> => {
  if (bookings.length === 0) {
    await initializeBookings();
  } else {
    // 从后端刷新数据
    try {
      const fetchedBookings = await apiRequest<Booking[]>('/bookings');
      bookings = fetchedBookings.map((booking: any) => ({
        ...booking,
        createdAt: new Date(booking.createdAt),
      }));
    } catch (error) {
      console.error('刷新数据失败，使用缓存数据:', error);
    }
  }
  return [...bookings];
};

// 同步版本的加载函数，用于向后兼容
export const loadBookings = (): Booking[] => {
  if (bookings.length === 0) {
    initializeBookingsSync();
  }
  return [...bookings];
};

// Import bookings from JSON file
export const importBookingsFromJson = (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async(e) => {
      try {
        const content = e.target?.result as string;
        const importedBookings = JSON.parse(content) as Booking[];

        // Validate imported data
        if (Array.isArray(importedBookings)) {
          // 清除现有数据
          await Promise.all(
            bookings.map(booking => apiRequest(`/bookings/${booking.id}`, 'DELETE').catch(() => { })),
          );

          // 导入新数据
          for (const booking of importedBookings) {
            const formattedBooking = {
              ...booking,
              createdAt: new Date(booking.createdAt).toISOString(),
            };
            await apiRequest('/bookings', 'POST', formattedBooking);
          }

          // 重新加载数据
          await initializeBookings();
          toast.success('成功从文件导入会议预定');
          resolve();
        } else {
          throw new Error('无效的数据格式');
        }
      } catch (error) {
        console.error('导入数据失败:', error);
        toast.error('导入数据失败，请检查文件格式');
        reject(error);
      }
    };
    reader.readAsText(file);
  });
};

// Add a new booking (async version)
export const addBookingAsync = async(newBooking: Booking): Promise<Booking[]> => {
  try {
    // 检查预订冲突
    if (checkBookingConflict(newBooking)) {
      toast.error('预订时间冲突，请选择其他时间段');
      throw new Error('预订时间冲突');
    }

    const createdBooking = await apiRequest<Booking>('/bookings', 'POST', {
      ...newBooking,
      createdAt: newBooking.createdAt.toISOString(),
    });

    // 更新本地缓存
    bookings = [...bookings, {
      ...createdBooking,
      createdAt: new Date(createdBooking.createdAt),
    }];

    // 通知订阅者
    onBookingsUpdate([...bookings]);

    toast.success('会议预定已保存');
    return [...bookings];
  } catch (error) {
    console.error('添加会议预定失败:', error);
    toast.error('保存会议预定失败，请重试');
    throw error;
  }
};

// 同步版本的添加函数，用于向后兼容
export const addBooking = (newBooking: Booking): Booking[] => {
  // 检查预订冲突
  if (checkBookingConflict(newBooking)) {
    toast.error('预订时间冲突，请选择其他时间段');
    return [...bookings];
  }

  addBookingAsync(newBooking).catch(console.error);
  const updatedBookings = [...bookings, newBooking];
  bookings = updatedBookings;

  // 通知订阅者
  onBookingsUpdate([...updatedBookings]);

  return updatedBookings;
};

// Update an existing booking (async version)
export const updateBookingAsync = async(updatedBooking: Booking): Promise<Booking[]> => {
  try {
    const result = await apiRequest<Booking>(
      `/bookings/${updatedBooking.id}`,
      'PUT',
      {
        ...updatedBooking,
        createdAt: updatedBooking.createdAt.toISOString(),
      },
    );

    // 更新本地缓存
    bookings = bookings.map(booking => booking.id === updatedBooking.id ? {
      ...result,
      createdAt: new Date(result.createdAt),
    } : booking);

    // 通知订阅者
    onBookingsUpdate([...bookings]);

    toast.success('会议预定已更新');
    return [...bookings];
  } catch (error) {
    console.error('更新会议预定失败:', error);
    toast.error('更新会议预定失败，请重试');
    throw error;
  }
};

// 同步版本的更新函数，用于向后兼容
export const updateBooking = (updatedBooking: Booking): Booking[] => {
  updateBookingAsync(updatedBooking).catch(console.error);
  const updatedBookings = bookings.map(booking => booking.id === updatedBooking.id ? updatedBooking : booking);
  bookings = updatedBookings;

  // 通知订阅者
  onBookingsUpdate([...updatedBookings]);

  return updatedBookings;
};

// Delete a booking (async version)
export const deleteBookingAsync = async(bookingId: string): Promise<Booking[]> => {
  try {
    await apiRequest(`/bookings/${bookingId}`, 'DELETE');

    // 更新本地缓存
    bookings = bookings.filter(booking => booking.id !== bookingId);

    // 通知订阅者
    onBookingsUpdate([...bookings]);

    toast.success('会议预定已删除');
    return [...bookings];
  } catch (error) {
    console.error('删除会议预定失败:', error);
    toast.error('删除会议预定失败，请重试');
    throw error;
  }
};

// 同步版本的删除函数，用于向后兼容
export const deleteBooking = (bookingId: string): Booking[] => {
  deleteBookingAsync(bookingId).catch(console.error);
  const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
  bookings = updatedBookings;

  // 通知订阅者
  onBookingsUpdate([...updatedBookings]);

  return updatedBookings;
};

// Get bookings by room and date
export const getBookingsByRoomAndDate = async(
  roomId: string,
  date: string,
): Promise<Booking[]> => {
  try {
    const fetchedBookings = await apiRequest<Booking[]>(
      `/bookings/room/${roomId}/date/${date}`,
    );

    // 更新本地缓存中该房间和日期的预订
    const otherBookings = bookings.filter(
      b => !(b.roomId === roomId && b.date === date),
    );

    bookings = [...otherBookings, ...fetchedBookings.map((booking: any) => ({
      ...booking,
      createdAt: new Date(booking.createdAt),
    }))];

    return fetchedBookings;
  } catch (error) {
    console.error('获取特定房间和日期的预订失败:', error);
    // 降级到本地缓存
    return bookings.filter(b => b.roomId === roomId && b.date === date);
  }
};

// 同步版本的获取函数，用于向后兼容
export const getBookingsByRoomAndDateSync = (
  roomId: string,
  date: string,
): Booking[] => {
  getBookingsByRoomAndDate(roomId, date).catch(console.error);
  return bookings.filter(b => b.roomId === roomId && b.date === date);
};

// Initialize bookings when module is loaded
initializeBookingsSync();
