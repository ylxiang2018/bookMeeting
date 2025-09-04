import React from 'react';
import { useState, useEffect } from 'react';
import { formatDate, getToday, formatDateForDisplay } from '@/lib/dateUtils';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export default function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const [date, setDate] = useState<string>(selectedDate || getToday());
  
  useEffect(() => {
    setDate(selectedDate);
  }, [selectedDate]);
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = formatDate(new Date(e.target.value));
    setDate(newDate);
    onDateChange(newDate);
  };
  
  const prevDay = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 1);
    const formattedDate = formatDate(newDate);
    setDate(formattedDate);
    onDateChange(formattedDate);
  };
  
  const nextDay = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    const formattedDate = formatDate(newDate);
    setDate(formattedDate);
    onDateChange(formattedDate);
  };
  
  return (
    <div className="flex items-center justify-between flex-wrap gap-4 mb-8 bg-white rounded-xl shadow-sm p-4">
      <button 
        onClick={prevDay}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Previous day"
      >
        <i className="fa-solid fa-chevron-left"></i>
      </button>
      
      <div className="text-center flex-1 min-w-[180px]">
        <div className="text-sm text-gray-500">当前选择日期</div>
        <div className="text-xl font-medium mt-1">{formatDateForDisplay(date)}</div>
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="date"
          value={date}
          onChange={handleDateChange}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          id="date-picker"
          aria-label="Select date"
        />
        <span className="text-gray-500">
          <i className="fa-solid fa-calendar"></i>
        </span>
      </div>
      
      <button 
        onClick={nextDay}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Next day"
      >
        <i className="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  );
}