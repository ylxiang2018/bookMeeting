import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  addBooking, addBookingAsync, checkBookingConflict, initializeBookings,
} from '@/lib/storageUtils';
import React from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  roomName: string;
  date: string;
  selectedTimeRange?: { start: string; end: string };
  onBookingCreated: () => void;
}

export default function BookingForm({
  isOpen,
  onClose,
  roomId,
  roomName,
  date,
  selectedTimeRange,
  onBookingCreated,
}: BookingFormProps) {
  const [title, setTitle] = useState('');
  const [organizer, setOrganizer] = useState('');

  const [participantNames, setParticipantNames] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedTimeRange) {
      setStartTime(selectedTimeRange.start);
      setEndTime(selectedTimeRange.end);
    }
  }, [selectedTimeRange]);

  useEffect(() => {
    // Reset form when modal opens
    if (isOpen) {
      setTitle('');
      setOrganizer('');
      setParticipantNames('');
      setErrors({});
    }
  }, [isOpen]);

  // Convert time string to minutes since midnight for accurate comparison
  const timeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = '请输入会议标题';
    }

    if (!organizer.trim()) {
      newErrors.organizer = '请输入组织者姓名';
    }

    if (!startTime || !endTime) {
      newErrors.time = '请选择会议时间';
    } else if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
      newErrors.time = '结束时间必须晚于开始时间';
    } else {
      // Check for time slot conflicts
      const newBooking = {
        id: '',
        roomId,
        date,
        startTime,
        endTime,
        title: '',
        organizer: '',
        participantNames: '',
        createdAt: new Date(),
      };
      if (checkBookingConflict(newBooking)) {
        newErrors.time = '所选时间已被预订，请选择其他时间';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 异步处理表单提交
  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Create new booking
    const newBooking = {
      id: uuidv4(),
      roomId,
      date,
      startTime,
      endTime,
      title,
      organizer,
      participantNames,
      createdAt: new Date(),
    };

    try {
      // 使用异步保存函数
      await addBookingAsync(newBooking);

      // 成功提示已在addBookingAsync中显示，此处不再重复

      // Close modal and reset form
      onBookingCreated();
      onClose();
    } catch (error) {
      console.error('保存预订失败:', error);
      toast.error('保存预订失败，请重试', { dismissible: true });
      // 失败时使用同步保存作为备份
      try {
        addBooking(newBooking);
        onBookingCreated();
        onClose();
      } catch (backupError) {
        console.error('同步保存也失败:', backupError);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">预定会议室</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <i class="fa-solid fa-times"></i>
            </button>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <div className="font-medium">{roomName}</div>
            <div className="text-sm text-gray-600">
              {date} {startTime} - {endTime}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                会议标题
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2',
                  errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500',
                )}
                placeholder="请输入会议标题"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                组织者
              </label>
              <input
                type="text"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2',
                  errors.organizer ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500',
                )}
                placeholder="请输入您的姓名"
              />
              {errors.organizer && (
                <p className="mt-1 text-sm text-red-500">{errors.organizer}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                 参会人员
              </label>
              <input
                type="text"
                value={participantNames}
                onChange={(e) => setParticipantNames(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入参会人员姓名，多个姓名用逗号分隔（选填）"
              />
              <p className="mt-1 text-xs text-gray-500">提示：选填项，多个姓名请用逗号分隔</p>
            </div>

            {errors.time && (
              <p className="mt-1 text-sm text-red-500 mb-4">{errors.time}</p>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                确认预定
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
