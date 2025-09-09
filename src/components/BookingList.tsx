import { Booking } from '@/types';

import { deleteBooking, deleteBookingAsync } from '@/lib/storageUtils';
import { toast } from 'sonner';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/authContext';

interface BookingListProps {
  bookings: Booking[];
  onBookingUpdated: () => void;
}

export default function BookingList({ bookings, onBookingUpdated }: BookingListProps) {
  const { user } = useContext(AuthContext);
  // Sort bookings by start time
  const sortedBookings = [...bookings].sort((a, b) => a.startTime.localeCompare(b.startTime));

  // 异步处理删除操作
  // 使用自定义确认对话框替代window.confirm
  const handleDelete = async(id: string) => {
    if (window.confirm('确定要取消这个预定吗？此操作不可撤销。')) {
      try {
        // 使用异步删除函数
        await deleteBookingAsync(id);

        // 成功提示已在deleteBookingAsync中显示，此处不再重复

        onBookingUpdated();
      } catch (error) {
        console.error('取消预定失败:', error);
        toast.error('取消预定失败，请重试', { dismissible: true });
        // 失败时使用同步删除作为备份
        try {
          deleteBooking(id);
          onBookingUpdated();
        } catch (backupError) {
          console.error('同步删除也失败:', backupError);
        }
      }
    }
  };

  if (sortedBookings.length === 0) {
    return (
      <div className="mt-4 text-center text-gray-500 text-sm">
        <i className="fa-regular fa-calendar-check fa-2x mb-2 block"></i>
        当天暂无预定
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {sortedBookings.map((booking) => (
        <div
          key={booking.id}
          className="bg-white rounded-lg shadow-sm p-3 border border-gray-100"
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium text-gray-900">{booking.title}</div>
              <div className="text-sm text-gray-600 mt-1">
                <span className="font-medium">组织者:</span> {booking.organizer}
              </div>

            </div>
            <div className="text-right">
              <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm font-medium">
                {booking.startTime} - {booking.endTime}
              </div>

              {user && booking.organizer === user.username && (
                <button
                  onClick={() => handleDelete(booking.id)}
                  className="mt-2 text-red-500 hover:text-red-700 text-sm"
                >
                  <i className="fa-solid fa-trash-can mr-1"></i> 取消
                </button>
              )}

            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
