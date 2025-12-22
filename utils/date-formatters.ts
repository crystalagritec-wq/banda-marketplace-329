import { format, formatDistance, differenceInMinutes, differenceInDays, addHours, isAfter, isBefore, parseISO } from 'date-fns';

export function formatOrderDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
}

export function formatOrderTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'hh:mm a');
}

export function formatOrderDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy • hh:mm a');
}

export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true });
}

export function formatDeliveryETA(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  } else {
    const days = Math.floor(minutes / 1440);
    return `${days} day${days > 1 ? 's' : ''}`;
  }
}

export function formatDeliveryETALong(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const minutesDiff = differenceInMinutes(dateObj, now);
  
  if (minutesDiff < 0) {
    return 'Arrived';
  } else if (minutesDiff < 60) {
    return `Arriving in ${minutesDiff} minutes`;
  } else if (minutesDiff < 1440) {
    const hours = Math.floor(minutesDiff / 60);
    return `Arriving in ${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    return `Arriving on ${format(dateObj, 'MMM dd')}`;
  }
}

export function formatEventDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd');
}

export function formatEventDateRange(startDate: Date | string, endDate: Date | string): string {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  const startMonth = format(start, 'MMM');
  const endMonth = format(end, 'MMM');
  const startDay = format(start, 'dd');
  const endDay = format(end, 'dd');
  
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}–${endDay}`;
  } else {
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
  }
}

export function formatFlashSaleCountdown(endTime: Date | string): string {
  const end = typeof endTime === 'string' ? parseISO(endTime) : endTime;
  const now = new Date();
  
  const totalSeconds = Math.floor((end.getTime() - now.getTime()) / 1000);
  
  if (totalSeconds <= 0) {
    return '00:00:00';
  }
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  const pad = (n: number) => String(n).padStart(2, '0');
  
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function formatPromoExpiry(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const daysDiff = differenceInDays(dateObj, now);
  
  if (daysDiff < 0) {
    return 'Expired';
  } else if (daysDiff === 0) {
    return 'Expires today';
  } else if (daysDiff === 1) {
    return 'Expires tomorrow';
  } else if (daysDiff < 7) {
    return `Expires in ${daysDiff} days`;
  } else {
    return `Expires ${format(dateObj, 'MMM dd')}`;
  }
}

export function formatNotificationTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const minutesDiff = differenceInMinutes(now, dateObj);
  
  if (minutesDiff < 1) {
    return 'Just now';
  } else if (minutesDiff < 60) {
    return `${minutesDiff}m ago`;
  } else if (minutesDiff < 1440) {
    const hours = Math.floor(minutesDiff / 60);
    return `${hours}h ago`;
  } else if (minutesDiff < 10080) {
    const days = Math.floor(minutesDiff / 1440);
    return `${days}d ago`;
  } else {
    return format(dateObj, 'MMM dd');
  }
}

export function calculateTimeRemaining(endDate: Date | string): { hours: number; minutes: number; seconds: number; total: number } {
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  const now = new Date();
  const totalSeconds = Math.floor((end.getTime() - now.getTime()) / 1000);
  
  if (totalSeconds <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, total: 0 };
  }
  
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    total: totalSeconds,
  };
}

export function isExpired(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isBefore(dateObj, new Date());
}

export function willExpireSoon(date: Date | string, hoursThreshold: number = 24): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const threshold = addHours(now, hoursThreshold);
  return isAfter(dateObj, now) && isBefore(dateObj, threshold);
}
