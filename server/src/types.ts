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
  ipAddress?: string; // 用户IP地址
}