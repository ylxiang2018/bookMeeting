import React, { createContext, useState } from 'react';

// 使用JavaScript创建Context
const BookingContext = createContext({ bookings: [], setBookings: () => {} });

const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);

  return (
    <BookingContext.Provider value={{ bookings, setBookings }}>
      {children}
    </BookingContext.Provider>
  );
};

export { BookingProvider, BookingContext };