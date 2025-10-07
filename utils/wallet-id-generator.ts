/**
 * Generates a unique 12-digit wallet ID
 * Format: XXXXXXXXXXXX (12 numeric digits)
 */
export function generateWalletDisplayId(): string {
  let walletId = '';
  for (let i = 0; i < 12; i++) {
    walletId += Math.floor(Math.random() * 10).toString();
  }
  return walletId;
}

/**
 * Validates if a wallet display ID is 12 digits
 */
export function isValidWalletDisplayId(displayId: string): boolean {
  return /^\d{12}$/.test(displayId);
}

/**
 * Formats wallet display ID for display (XXX-XXX-XXX-XXX)
 */
export function formatWalletDisplayId(displayId: string): string {
  if (!isValidWalletDisplayId(displayId)) return displayId;
  
  return `${displayId.substring(0, 3)}-${displayId.substring(3, 6)}-${displayId.substring(6, 9)}-${displayId.substring(9, 12)}`;
}
