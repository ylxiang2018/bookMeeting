import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { v4 as uuidv4 } from 'uuid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate a unique ID
export function generateId(): string {
  return uuidv4();
}

// Format time difference for display
export function formatTimeDifference(start: string, end: string): string {
  const startHours = parseInt(start.split(':')[0]);
  const startMinutes = parseInt(start.split(':')[1]);
  const endHours = parseInt(end.split(':')[0]);
  const endMinutes = parseInt(end.split(':')[1]);

  const hours = endHours - startHours;
  const minutes = endMinutes - startMinutes;

  let result = '';
  if (hours > 0) {
    result += `${hours}小时`;
  }
  if (minutes > 0) {
    result += `${minutes}分钟`;
  }

  return result || '0分钟';
}
