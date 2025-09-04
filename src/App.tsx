import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthContext } from '@/contexts/authContext';
import { BookingProvider } from './contexts/bookingContext.jsx';
import Home from "@/pages/Home";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <BookingProvider>
      <AuthContext.Provider
        value={{ isAuthenticated, setIsAuthenticated, logout }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/other" element={<div className="text-center text-xl">Other Page - Coming Soon</div>} />
        </Routes>
      </AuthContext.Provider>
    </BookingProvider>
  );
}
