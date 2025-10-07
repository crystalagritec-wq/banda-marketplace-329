/**
 * Generates a unique user ID for new users
 * Format: BANDA-YYYYMMDD-XXXXX (where XXXXX is a random 5-character alphanumeric string)
 */
export function generateUniqueUserId(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Generate random 5-character alphanumeric string
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';
  for (let i = 0; i < 5; i++) {
    randomString += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `BANDA-${year}${month}${day}-${randomString}`;
}

/**
 * Validates if a user ID follows the correct format
 */
export function isValidUserId(userId: string): boolean {
  const pattern = /^BANDA-\d{8}-[A-Z0-9]{5}$/;
  return pattern.test(userId);
}

/**
 * Extracts the date from a user ID
 */
export function getUserIdDate(userId: string): Date | null {
  if (!isValidUserId(userId)) return null;
  
  const datePart = userId.split('-')[1];
  const year = parseInt(datePart.substring(0, 4));
  const month = parseInt(datePart.substring(4, 6)) - 1; // Month is 0-indexed
  const day = parseInt(datePart.substring(6, 8));
  
  return new Date(year, month, day);
}