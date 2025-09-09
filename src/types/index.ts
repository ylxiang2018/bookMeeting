export interface MeetingRoom {
  id: string;
  name: string;
  capacity: number;
  amenities: string[];
  imageUrl: string;
}

export interface Booking {
  id: string;
  roomId: string;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  title: string;
  organizer: string;

  createdAt: Date;
  participantNames?: string;
  ipAddress?: string; // 由服务端记录的用户IP地址
}

export interface TimeSlot {
  time: string;
  available: boolean;
  bookingId?: string;
}
