import React, { createContext, useState, ReactNode } from 'react';

// 使用TypeScript创建Context
export interface BookingType {
  id?: string;
  roomId: string;
  date: string;
  timeSlot: string;
  participants: number;
  purpose: string;
  organizer: string;
}

interface BookingContextType {
  bookings: BookingType[];
  setBookings: React.Dispatch<React.SetStateAction<BookingType[]>>;
}

const BookingContext = createContext<BookingContextType>({ 
  bookings: [], 
  setBookings: () => {} 
});

interface BookingProviderProps {
  children: ReactNode;
}

const BookingProvider = ({ children }: BookingProviderProps): React.ReactElement => {
  const [bookings, setBookings] = useState<BookingType[]>([]);

  return (
    <BookingContext.Provider value={{ bookings, setBookings }}>
      {children}
    </BookingContext.Provider>
  );
};

export { BookingProvider, BookingContext };