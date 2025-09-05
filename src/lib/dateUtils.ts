import { Booking, TimeSlot } from '@/types';

// Format date to YYYY-MM-DD string
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Get current date in YYYY-MM-DD format
export const getToday = (): string => {
  return formatDate(new Date());
};

// Get date string for a given number of days from today
export const getDateFromToday = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

// Format time from HH:MM:SS to HH:MM
export const formatTime = (timeString: string): string => {
  return timeString.slice(0, 5);
};

// Convert time string to minutes since midnight for accurate comparison
const timeToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

// Generate time slots for a day (default 9 AM to 6 PM, 30 min intervals)
export const generateTimeSlots = (
  bookings: Booking[], 
  roomId: string, 
  date: string,
  startTime = '09:00',
  endTime = '19:00',
  interval = 30
): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  
  let current = new Date(start);
  
  while (current < end) {
    const time = formatTime(current.toTimeString());
    const booking = bookings.find(b => 
      b.roomId === roomId && 
      b.date === date && 
      timeToMinutes(b.startTime) <= timeToMinutes(time) && 
      timeToMinutes(b.endTime) >= timeToMinutes(time)
    );
    
    slots.push({
      time,
      available: !booking,
      bookingId: booking?.id
    });
    
    current.setMinutes(current.getMinutes() + interval);
  }
  
  return slots;
};

// Check if a time slot is available for booking
// Allows a booking to end exactly when another booking starts
export const isTimeSlotAvailable = (
  bookings: Booking[], 
  roomId: string, 
  date: string, 
  startTime: string, 
  endTime: string
): boolean => {
  return !bookings.some(booking => 
    booking.roomId === roomId && 
    booking.date === date && 
    !( 
      booking.endTime <= startTime || 
      booking.startTime >= endTime
    )
  );
};

// Format date to a human-readable string (e.g., "Monday, August 25, 2025")
export const formatDateForDisplay = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return new Date(dateString).toLocaleDateString('zh-CN', options);
};