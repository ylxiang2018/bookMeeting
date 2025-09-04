import { useState, useEffect, useContext } from 'react';
import { Booking } from '@/types';
import { MeetingRoom } from '@/types';
import { getToday } from '@/lib/dateUtils';
import { importBookingsFromJson, loadBookings, initializeBookings, loadBookingsAsync, setOnBookingsUpdate } from '@/lib/storageUtils';
import DateSelector from '@/components/DateSelector';
import RoomCard from '@/components/RoomCard';
import TimeSlotSelector from '@/components/TimeSlotSelector';
import BookingForm from '@/components/BookingForm';
import { BookingContext } from '../contexts/bookingContext.jsx';

// Mock data for meeting rooms
const MEETING_ROOMS: MeetingRoom[] = [
  { id: 'room-1', name: '2204会议室', capacity: 10, amenities: [], imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Modern%20meeting%20room%20with%20large%20table%20and%20comfortable%20chairs&sign=1683ab84905037977a19a661658b4e9a' },
  { id: 'room-2', name: '2208会议室', capacity: 10, amenities: [], imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Collaborative%20meeting%20room%20with%20whiteboard%20and%20comfortable%20seating&sign=f0181b3976d89630cf57e2a281d98702' },
  { id: 'room-3', name: '2209会议室', capacity: 10, amenities: [], imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=Small%20meeting%20room%20with%20comfortable%20seating%20and%20modern%20equipment&sign=241c1001a0389b14f1dbce3706fc7acf' }
];

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<string>(getToday());
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRoom, setSelectedRoom] = useState<MeetingRoom | null>(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<{ start: string; end: string } | null>(null);

  const { bookings: allBookings, setBookings } = useContext(BookingContext);

  // 过滤出与现有会议室匹配的预订
  const validRoomIds = new Set(MEETING_ROOMS.map(room => room.id));
  const bookings = allBookings.filter(booking => validRoomIds.has(booking.roomId));

  // 组件挂载时初始化
  useEffect(() => {
    const initBookings = async () => {
      // 使用loadBookingsAsync确保数据已加载完成
      try {
        const allBookings = await loadBookingsAsync();
        setBookings(allBookings);

        // 设置预订更新回调
        setOnBookingsUpdate((updatedBookings) => {
          setBookings(updatedBookings);
        });
        setLoading(true);
      } catch (error) {
        console.error('初始化预订数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    initBookings();
  }, []);

  // 日期或房间变化时，不需要显式刷新预订数据
  // 因为RoomCard组件会根据bookings变化自动更新

  // 处理预订更新
  const handleBookingUpdated = () => {
    // 强制组件重新渲染
    setSelectedDate(selectedDate);
  };

  const handleOpenBookingModal = (room: MeetingRoom, slots: any) => {
    setSelectedRoom(room);
    setTimeSlots(slots);
    setShowTimeSlotModal(true);
  };

  const handleTimeSelect = (start: string, end: string) => {
    setSelectedTimeRange({ start, end });
    setShowTimeSlotModal(false);
    setShowBookingForm(true);
  };

  const handleBookingCreated = () => {
    setShowBookingForm(false);
    setSelectedTimeRange(null);
    handleBookingUpdated();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">会议室预定系统</h1>
          <p className="text-gray-600">便捷地预定和管理会议室资源</p>
        </header>

        <div className="mb-8">
          <DateSelector
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center items-center h-64">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600">加载会议数据中...</p>
              </div>
            </div>
          ) : (
            MEETING_ROOMS.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                date={selectedDate}
                onBookingUpdated={handleBookingUpdated}
                onOpenBookingModal={handleOpenBookingModal}
              />
            ))
          )}
        </div>
      </div>

      {/* Time Slot Selection Modal - Global */}
      {showTimeSlotModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">选择预定时间</h2>
                <button
                  onClick={() => setShowTimeSlotModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i class="fa-solid fa-times"></i>
                </button>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <div className="font-medium">{selectedRoom.name}</div>
                <div className="text-sm text-gray-600">
                  {selectedDate}
                </div>
              </div>

              <TimeSlotSelector
                slots={timeSlots}
                onSelect={handleTimeSelect}
                roomId={selectedRoom.id}
                date={selectedDate}
              />

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowTimeSlotModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 原导入/导出数据功能已移除 */}

      {/* Booking Form Modal - Global */}
      {showBookingForm && selectedRoom && selectedTimeRange && (
        <BookingForm
          isOpen={showBookingForm}
          onClose={() => setShowBookingForm(false)}
          roomId={selectedRoom.id}
          roomName={selectedRoom.name}
          date={selectedDate}
          selectedTimeRange={selectedTimeRange}
          onBookingCreated={handleBookingCreated}
        />
      )}
    </div>
  );
}