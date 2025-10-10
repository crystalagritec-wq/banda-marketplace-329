/**
 * Delivery Time Validation Utilities
 * Ensures delivery time slots are valid and available
 */

export interface TimeSlot {
  id: string;
  label: string;
  start: string;
  end: string;
  available: boolean;
  isPast: boolean;
}

export interface BusinessHours {
  open: string;
  close: string;
  daysOfWeek: number[];
}

const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  open: '08:00',
  close: '20:00',
  daysOfWeek: [1, 2, 3, 4, 5, 6],
};

export function parseTime(timeString: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hours, minutes };
}

export function isTimeInPast(timeString: string, date: Date = new Date()): boolean {
  const { hours, minutes } = parseTime(timeString);
  const slotTime = new Date(date);
  slotTime.setHours(hours, minutes, 0, 0);
  
  return slotTime.getTime() < Date.now();
}

export function isWithinBusinessHours(
  timeString: string,
  businessHours: BusinessHours = DEFAULT_BUSINESS_HOURS
): boolean {
  const { hours, minutes } = parseTime(timeString);
  const timeInMinutes = hours * 60 + minutes;
  
  const openTime = parseTime(businessHours.open);
  const closeTime = parseTime(businessHours.close);
  
  const openInMinutes = openTime.hours * 60 + openTime.minutes;
  const closeInMinutes = closeTime.hours * 60 + closeTime.minutes;
  
  return timeInMinutes >= openInMinutes && timeInMinutes <= closeInMinutes;
}

export function isBusinessDay(
  date: Date = new Date(),
  businessHours: BusinessHours = DEFAULT_BUSINESS_HOURS
): boolean {
  const dayOfWeek = date.getDay();
  return businessHours.daysOfWeek.includes(dayOfWeek);
}

export function generateTimeSlots(
  startHour: number = 8,
  endHour: number = 20,
  intervalMinutes: number = 60,
  businessHours: BusinessHours = DEFAULT_BUSINESS_HOURS
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const now = new Date();
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const endHour = minute + intervalMinutes >= 60 ? hour + 1 : hour;
      const endMinute = (minute + intervalMinutes) % 60;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
      
      const isPast = isTimeInPast(startTime, now);
      const withinBusinessHours = isWithinBusinessHours(startTime, businessHours);
      
      const available = !isPast && withinBusinessHours && isBusinessDay(now, businessHours);
      
      slots.push({
        id: `slot-${hour}-${minute}`,
        label: `${startTime} - ${endTime}`,
        start: startTime,
        end: endTime,
        available,
        isPast,
      });
    }
  }
  
  return slots;
}

export function getNextAvailableSlot(
  slots: TimeSlot[]
): TimeSlot | null {
  return slots.find(slot => slot.available) || null;
}

export function filterAvailableSlots(slots: TimeSlot[]): TimeSlot[] {
  return slots.filter(slot => slot.available);
}

export function validateTimeSlot(
  slot: TimeSlot,
  businessHours: BusinessHours = DEFAULT_BUSINESS_HOURS
): { valid: boolean; reason?: string } {
  if (slot.isPast) {
    return { valid: false, reason: 'Time slot is in the past' };
  }
  
  if (!isWithinBusinessHours(slot.start, businessHours)) {
    return { valid: false, reason: 'Time slot is outside business hours' };
  }
  
  if (!isBusinessDay(new Date(), businessHours)) {
    return { valid: false, reason: 'Delivery not available on this day' };
  }
  
  if (!slot.available) {
    return { valid: false, reason: 'Time slot is not available' };
  }
  
  return { valid: true };
}

export function formatTimeSlot(slot: TimeSlot): string {
  return slot.label;
}

export function getDeliveryTimeEstimate(
  distance: number,
  vehicleType: 'boda' | 'van' | 'truck' | 'pickup' = 'van'
): { minMinutes: number; maxMinutes: number; label: string } {
  const baseSpeedMap = {
    boda: 35,
    van: 40,
    truck: 35,
    pickup: 40,
  };
  
  const speed = baseSpeedMap[vehicleType];
  const travelTimeHours = distance / speed;
  const travelTimeMinutes = Math.ceil(travelTimeHours * 60);
  
  const preparationTime = 15;
  const bufferTime = 10;
  
  const minMinutes = travelTimeMinutes + preparationTime;
  const maxMinutes = travelTimeMinutes + preparationTime + bufferTime;
  
  let label = '';
  if (maxMinutes < 60) {
    label = `${minMinutes}-${maxMinutes} mins`;
  } else {
    const minHours = Math.floor(minMinutes / 60);
    const maxHours = Math.ceil(maxMinutes / 60);
    if (minHours === maxHours) {
      label = `${minHours} hour${minHours > 1 ? 's' : ''}`;
    } else {
      label = `${minHours}-${maxHours} hours`;
    }
  }
  
  return { minMinutes, maxMinutes, label };
}

export function getEarliestDeliveryTime(
  currentTime: Date = new Date(),
  preparationMinutes: number = 30
): Date {
  const earliestTime = new Date(currentTime.getTime() + preparationMinutes * 60 * 1000);
  
  earliestTime.setMinutes(Math.ceil(earliestTime.getMinutes() / 15) * 15);
  earliestTime.setSeconds(0);
  earliestTime.setMilliseconds(0);
  
  return earliestTime;
}

export interface DeliverySlot {
  id: string;
  label: string;
  start: string;
  end: string;
}

export function validateDeliverySlot(slotStart: string, slotEnd: string): {
  isValid: boolean;
  reason?: string;
} {
  const now = new Date();
  const slotStartDate = new Date(slotStart);
  const slotEndDate = new Date(slotEnd);

  if (isNaN(slotStartDate.getTime()) || isNaN(slotEndDate.getTime())) {
    return {
      isValid: false,
      reason: 'Invalid time slot format',
    };
  }

  const bufferMinutes = 30;
  const minStartTime = new Date(now.getTime() + bufferMinutes * 60000);
  
  if (slotStartDate < minStartTime) {
    return {
      isValid: false,
      reason: `This time slot has already passed. Please select a slot at least ${bufferMinutes} minutes from now`,
    };
  }

  const businessHoursStart = 6;
  const businessHoursEnd = 22;
  const slotHour = slotStartDate.getHours();

  if (slotHour < businessHoursStart || slotHour >= businessHoursEnd) {
    return {
      isValid: false,
      reason: `Deliveries are only available between ${businessHoursStart}:00 and ${businessHoursEnd}:00`,
    };
  }

  const maxDaysAhead = 14;
  const maxDate = new Date(now.getTime() + maxDaysAhead * 24 * 60 * 60 * 1000);
  if (slotStartDate > maxDate) {
    return {
      isValid: false,
      reason: `Cannot schedule deliveries more than ${maxDaysAhead} days in advance`,
    };
  }

  return { isValid: true };
}

export function filterValidSlots(slots: DeliverySlot[]): DeliverySlot[] {
  return slots.filter(slot => {
    const validation = validateDeliverySlot(slot.start, slot.end);
    return validation.isValid;
  }).sort((a, b) => {
    const aStart = new Date(a.start).getTime();
    const bStart = new Date(b.start).getTime();
    return aStart - bStart;
  });
}

export function getNextAvailableDeliverySlot(slots: DeliverySlot[]): DeliverySlot | null {
  const validSlots = filterValidSlots(slots);
  return validSlots.length > 0 ? validSlots[0] : null;
}

export function isSlotAvailableToday(slot: DeliverySlot): boolean {
  const now = new Date();
  const slotDate = new Date(slot.start);
  return (
    slotDate.getDate() === now.getDate() &&
    slotDate.getMonth() === now.getMonth() &&
    slotDate.getFullYear() === now.getFullYear()
  );
}

export function formatSlotTime(slot: DeliverySlot): string {
  const start = new Date(slot.start);
  const end = new Date(slot.end);
  
  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };
  
  return `${formatTime(start)} - ${formatTime(end)}`;
}
