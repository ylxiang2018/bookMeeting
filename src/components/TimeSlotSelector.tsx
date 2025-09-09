import { useState, useEffect, useContext } from 'react';
import { TimeSlot } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { BookingContext } from '../contexts/bookingContext';

interface TimeSlotSelectorProps {
  slots: TimeSlot[];
  onSelect: (startTime: string, endTime: string) => void;
  roomId: string;
  date: string;
  disabled?: boolean;
}

export default function TimeSlotSelector({
  slots,
  onSelect,
  roomId,
  date,
  disabled = false,
}: TimeSlotSelectorProps) {
  const { bookings } = useContext(BookingContext);
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);
  const [selectedEndTime, setSelectedEndTime] = useState<string | null>(null);
  const [conflictDetected, setConflictDetected] = useState(false);
  const [startEndError, setStartEndError] = useState(false);
  const [availableStartTimes, setAvailableStartTimes] = useState<string[]>([]);
  const [availableEndTimes, setAvailableEndTimes] = useState<string[]>([]);

  // Convert time string to minutes since midnight for accurate comparison
  const timeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Check for booking conflicts
  // Allows overlapping only if one meeting ends exactly when the other starts
  const checkConflict = (startTime: string, endTime: string): boolean => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    return bookings.some(booking => booking.roomId === roomId
    && booking.date === date
    // Allow booking to end exactly when another booking starts
    && startMinutes < timeToMinutes(booking.endTime)
    && endMinutes > timeToMinutes(booking.startTime));
  };

  // Filter available time slots and reset state
  useEffect(() => {
    // Get all time slots (both available and booked)
    const allSlots = slots.map(slot => slot.time);

    // Get all booking end times for the current room and date
    const bookingEndTimes = bookings
      .filter(booking => booking.roomId === roomId && booking.date === date)
      .map(booking => booking.endTime);

    // Combine all slots and booking end times, then remove duplicates
    const updatedAvailableStartTimes = [...new Set([...allSlots, ...bookingEndTimes])];

    // Sort the available start times
    updatedAvailableStartTimes.sort((a, b) => timeToMinutes(a) - timeToMinutes(b));

    setAvailableStartTimes(updatedAvailableStartTimes);
    setAvailableEndTimes([]);
    setSelectedStartTime(null);
    setSelectedEndTime(null);
    setConflictDetected(false);
    setStartEndError(false);
  }, [slots, bookings, roomId, date]);

  // Update available end times when start time changes
  useEffect(() => {
    if (selectedStartTime) {
      const startMinutes = timeToMinutes(selectedStartTime);
      const validEndTimes = availableStartTimes.filter(time => timeToMinutes(time) > startMinutes);
      setAvailableEndTimes(validEndTimes);
      setSelectedEndTime(null);
    } else {
      setAvailableEndTimes([]);
      setSelectedEndTime(null);
    }
    setConflictDetected(false);
  }, [selectedStartTime, availableStartTimes]);

  // Handle end time selection and check for conflicts
  useEffect(() => {
    if (selectedStartTime && selectedEndTime) {
      // Check if start time is before end time
      const startMinutes = timeToMinutes(selectedStartTime);
      const endMinutes = timeToMinutes(selectedEndTime);
      const isStartBeforeEnd = startMinutes < endMinutes;
      setStartEndError(!isStartBeforeEnd);

      if (isStartBeforeEnd) {
        const hasConflict = checkConflict(selectedStartTime, selectedEndTime);
        setConflictDetected(hasConflict);
        if (!hasConflict) {
          onSelect(selectedStartTime, selectedEndTime);
        } else {
          toast.error('所选时间段已被预订，请选择其他时间', { dismissible: true });
        }
      } else {
        setConflictDetected(false);
        toast.error('会议的开始时间必须小于结束时间', { dismissible: true });
      }
    } else {
      setStartEndError(false);
    }
  }, [selectedEndTime, selectedStartTime, onSelect, roomId, date, bookings]);

  // Additional effect to check for conflicts when roomId, date, or existingBookings change
  useEffect(() => {
    if (selectedStartTime && selectedEndTime && !startEndError) {
      const hasConflict = checkConflict(selectedStartTime, selectedEndTime);
      setConflictDetected(hasConflict);
      if (hasConflict) {
        toast.error('所选时间段已被预订，请选择其他时间', { dismissible: true });
      }
    }
  }, [roomId, date, bookings, selectedStartTime, selectedEndTime, startEndError]);

  // Check if a slot is in the selected range
  const isInSelectedRange = (slot: TimeSlot) => {
    if (!selectedStartTime || !selectedEndTime) return false;
    return slot.time >= selectedStartTime && slot.time <= selectedEndTime;
  };

  // Check if a slot is the start or end of the selection
  const isSelectionEdge = (slot: TimeSlot) => {
    return slot.time === selectedStartTime || slot.time === selectedEndTime;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
      {/* Time Selection Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
          <select
            id="startTime"
            value={selectedStartTime || ''}
            onChange={(e) => setSelectedStartTime(e.target.value || null)}
            disabled={disabled || availableStartTimes.length === 0}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${disabled || availableStartTimes.length === 0 ? 'border-gray-300 bg-gray-100 cursor-not-allowed' : 'border-gray-300 hover:border-blue-300'}`}
          >
            <option value="">选择开始时间</option>
            {availableStartTimes.map((time, index) => (
              <option key={index} value={time}>{time}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
          <select
            id="endTime"
            value={selectedEndTime || ''}
            onChange={(e) => setSelectedEndTime(e.target.value || null)}
            disabled={disabled || !selectedStartTime || availableEndTimes.length === 0}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${(disabled || !selectedStartTime || availableEndTimes.length === 0) ? 'border-gray-300 bg-gray-100 cursor-not-allowed' : 'border-gray-300 focus:ring-blue-500'}`}
          >
            <option value="">选择结束时间</option>
            {availableEndTimes.map((time, index) => (
              <option key={index} value={time}>{time}</option>
            ))}
          </select>
        </div>
      </div>
      {startEndError && (
        <div className="mb-4 text-red-500 text-sm flex items-center">
          <i className="fa-solid fa-exclamation-circle mr-2"></i>
          <span>会议的开始时间必须小于结束时间</span>
        </div>
      )}
      {conflictDetected && !startEndError && (
        <div className="mb-4 text-red-500 text-sm flex items-center">
          <i className="fa-solid fa-exclamation-circle mr-2"></i>
          <span>所选时间段已被预订，请选择其他时间</span>
        </div>
      )}

      {/* Time Slots Display with border */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">会议室占用情况</h3>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {slots.map((slot, index) => (
              <div
                key={index}
                className={cn(
                  'py-2 text-sm rounded-lg transition-all duration-200 text-center border',
                  !slot.available
                    ? 'bg-gray-100 text-gray-400 border-gray-300'
                    : isSelectionEdge(slot)
                      ? 'bg-blue-600 text-white font-medium border-transparent shadow-sm'
                      : isInSelectedRange(slot)
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50',
                )}
              >
                {slot.time}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-600">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-600 rounded-sm mr-1"></div>
              <span>选择的时间点</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-100 rounded-sm mr-1"></div>
              <span>选择的时间段</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-100 rounded-sm mr-1"></div>
              <span>已被占用</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-white border border-gray-200 rounded-sm mr-1"></div>
              <span>可用时间</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
