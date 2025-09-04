import { useState, useEffect, useContext } from 'react';
import { MeetingRoom, Booking } from '@/types';
import { generateTimeSlots, getToday } from '@/lib/dateUtils';
import BookingList from './BookingList';
import { getBookingsByRoomAndDate, getBookingsByRoomAndDateSync } from '@/lib/storageUtils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { BookingContext } from '../contexts/bookingContext.jsx';

interface RoomCardProps {
  room: MeetingRoom;
  date: string;
  onBookingUpdated: () => void;
  onOpenBookingModal: (room: MeetingRoom, timeSlots: any) => void;
}

export default function RoomCard({ room, date, onBookingUpdated, onOpenBookingModal }: RoomCardProps) {
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const { bookings } = useContext(BookingContext);

  // 当room、date或bookings变化时，生成时间槽
  useEffect(() => {
    const filteredBookings = bookings.filter(booking => booking.roomId === room.id && booking.date === date);
    setTimeSlots(generateTimeSlots(filteredBookings, room.id, date));
    setFilteredBookings(filteredBookings);
  }, [bookings, room.id, date]);

  // 存储过滤后的预订
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);

  // 组件挂载时加载预订数据（如果需要）
  useEffect(() => {
    // 这里可以添加逻辑，如果需要从API加载数据
  }, []);

  const handleOpenBookingModal = () => {
    // 检查是否是过去的日期
    const today = getToday();
    if (date < today) {
      toast.error('无法预定当前日期之前的会议', { dismissible: true });
      return;
    }

    onOpenBookingModal(room, timeSlots);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 transition-transform hover:shadow-md hover:-translate-y-1 duration-200">
      {/* Room Image */}
      <div className="relative h-40 bg-gray-100">
        <img
          src={room.imageUrl}
          alt={room.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Room Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>

        </div>

        {/* Booking Button */}
        <button
          onClick={handleOpenBookingModal}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <i className="fa-solid fa-calendar-plus mr-2"></i> 选择时间预定
        </button>

        {/* Booking List */}
        <BookingList
          bookings={filteredBookings}
          onBookingUpdated={onBookingUpdated}
        />
      </div>
    </div>
  );
}