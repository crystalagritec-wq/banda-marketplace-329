import authAlerts from '@/constants/auth-alerts.json';

export type AlertType = 'error' | 'warning' | 'info' | 'success';
export type Language = 'en' | 'sw';

export interface Alert {
  code: string;
  message: string;
  type: AlertType;
}

export interface AlertPlaceholders {
  [key: string]: string | number;
}

/**
 * Format message template with placeholders
 */
export function formatMessage(template: string, placeholders: AlertPlaceholders = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(placeholders[key] ?? ''));
}

/**
 * Get alert by code with localization and placeholder support
 */
export function getAlert(
  code: string, 
  lang: Language = 'en', 
  placeholders: AlertPlaceholders = {}
): Alert {
  // Find alert in nested structure
  const findAlert = (obj: any): any => {
    for (const key in obj) {
      const value = obj[key];
      if (value && typeof value === 'object') {
        if (value.code === code) {
          return value;
        }
        const found = findAlert(value);
        if (found) return found;
      }
    }
    return null;
  };

  const alertData = findAlert(authAlerts);
  
  if (!alertData) {
    return {
      code: 'E000_UNKNOWN',
      message: 'Unknown error occurred',
      type: 'error'
    };
  }

  const message = alertData.message[lang] || alertData.message['en'] || 'Error occurred';
  
  return {
    code: alertData.code,
    message: formatMessage(message, placeholders),
    type: alertData.type
  };
}

/**
 * Map error code to field for UI placement
 */
export function mapCodeToField(code: string): string {
  if (code.startsWith('E2')) return 'fullName';
  if (code.startsWith('E3')) return 'email';
  if (code.startsWith('E4')) return 'password';
  if (code.startsWith('E5')) return 'phone';
  if (code.startsWith('E6')) return 'otp';
  if (code.startsWith('E7')) return 'social';
  if (code.startsWith('E8')) return 'terms';
  if (code.startsWith('E9')) return 'security';
  if (code.startsWith('E10')) return 'database';
  if (code.startsWith('S')) return 'success';
  return 'general';
}

/**
 * Get styling based on alert type
 */
export function getAlertStyle(type: AlertType) {
  switch (type) {
    case 'error':
      return {
        color: '#EF4444',
        backgroundColor: '#FEF2F2',
        borderColor: '#FECACA',
        icon: '❌'
      };
    case 'warning':
      return {
        color: '#F59E0B',
        backgroundColor: '#FFFBEB',
        borderColor: '#FDE68A',
        icon: '⚠️'
      };
    case 'info':
      return {
        color: '#3B82F6',
        backgroundColor: '#EFF6FF',
        borderColor: '#BFDBFE',
        icon: 'ℹ️'
      };
    case 'success':
      return {
        color: '#10B981',
        backgroundColor: '#ECFDF5',
        borderColor: '#A7F3D0',
        icon: '✅'
      };
    default:
      return {
        color: '#6B7280',
        backgroundColor: '#F9FAFB',
        borderColor: '#E5E7EB',
        icon: '•'
      };
  }
}

/**
 * Common alert codes for quick access
 */
export const ALERT_CODES = {
  // General
  FIELD_REQUIRED: 'E101_FIELD_REQUIRED',
  INVALID_FORMAT: 'E102_INVALID_FORMAT',
  
  // Full Name
  FULLNAME_REQUIRED: 'E201_FULLNAME_REQUIRED',
  FULLNAME_SHORT: 'E202_FULLNAME_SHORT',
  FULLNAME_LONG: 'E203_FULLNAME_LONG',
  FULLNAME_INVALID: 'E204_FULLNAME_INVALID',
  
  // Email
  EMAIL_REQUIRED: 'E301_EMAIL_REQUIRED',
  EMAIL_INVALID: 'E302_EMAIL_INVALID',
  EMAIL_LONG: 'E303_EMAIL_LONG',
  EMAIL_REGISTERED: 'E304_EMAIL_REGISTERED',
  EMAIL_NOT_FOUND: 'E305_EMAIL_NOT_FOUND',
  
  // Password
  PASS_REQUIRED: 'E401_PASS_REQUIRED',
  PASS_SHORT: 'E402_PASS_SHORT',
  PASS_LONG: 'E403_PASS_LONG',
  PASS_WEAK: 'E404_PASS_WEAK',
  PASS_MISMATCH: 'E405_PASS_MISMATCH',
  PASS_INCORRECT: 'E406_PASS_INCORRECT',
  
  // Phone
  PHONE_REQUIRED: 'E501_PHONE_REQUIRED',
  PHONE_INVALID: 'E502_PHONE_INVALID',
  PHONE_LENGTH: 'E503_PHONE_LENGTH',
  PHONE_START: 'E504_PHONE_START',
  PHONE_DUPLICATE: 'E505_PHONE_DUPLICATE',
  
  // OTP
  OTP_REQUIRED: 'E601_OTP_REQUIRED',
  OTP_LENGTH: 'E602_OTP_LENGTH',
  OTP_INVALID: 'E603_OTP_INVALID',
  OTP_EXPIRED: 'E604_OTP_EXPIRED',
  OTP_RESEND_WAIT: 'E605_OTP_RESEND_WAIT',
  OTP_TOO_MANY: 'E606_OTP_TOO_MANY',
  OTP_SUCCESS: 'S601_OTP_SUCCESS',
  OTP_SENT: 'S602_OTP_SENT',
  
  // Social Login
  SOCIAL_FAILED: 'E701_SOCIAL_FAILED',
  SOCIAL_LINKED: 'E702_SOCIAL_LINKED',
  SOCIAL_TOKEN: 'E703_SOCIAL_TOKEN',
  SOCIAL_PROFILE: 'E704_SOCIAL_PROFILE',
  
  // Terms
  TERMS_REQUIRED: 'E801_TERMS_REQUIRED',
  
  // Security
  TOO_MANY_FAILED: 'E901_TOO_MANY_FAILED',
  SESSION_EXPIRED: 'E902_SESSION_EXPIRED',
  SUSPICIOUS_ACTIVITY: 'E903_SUSPICIOUS_ACTIVITY',
  ACCOUNT_LOCKED: 'E904_ACCOUNT_LOCKED',
  
  // Database
  DB_NOT_CONFIGURED: 'E1001_DB_NOT_CONFIGURED',
  DB_CONNECTION: 'E1002_DB_CONNECTION',
  DB_OPERATION: 'E1003_DB_OPERATION',
  
  // Success
  LOGIN_SUCCESS: 'S100_LOGIN_SUCCESS',
  SIGNUP_SUCCESS: 'S101_SIGNUP_SUCCESS',
  PROFILE_UPDATED: 'S102_PROFILE_UPDATED',
  PASSWORD_RESET: 'S103_PASSWORD_RESET',
  LOGOUT_SUCCESS: 'S104_LOGOUT_SUCCESS'
} as const;

/**
 * Validate input and return appropriate alert
 */
export function validateInput(
  type: 'fullName' | 'email' | 'password' | 'phone' | 'otp',
  value: string,
  options: {
    lang?: Language;
    countryCode?: string;
    minLength?: number;
    maxLength?: number;
  } = {}
): Alert | null {
  const { lang = 'en', countryCode = '+254', minLength = 2, maxLength = 50 } = options;
  
  if (!value || !value.trim()) {
    switch (type) {
      case 'fullName':
        return getAlert(ALERT_CODES.FULLNAME_REQUIRED, lang);
      case 'email':
        return getAlert(ALERT_CODES.EMAIL_REQUIRED, lang);
      case 'password':
        return getAlert(ALERT_CODES.PASS_REQUIRED, lang);
      case 'phone':
        return getAlert(ALERT_CODES.PHONE_REQUIRED, lang);
      case 'otp':
        return getAlert(ALERT_CODES.OTP_REQUIRED, lang);
    }
  }
  
  const trimmed = value.trim();
  
  switch (type) {
    case 'fullName':
      if (trimmed.length < minLength) {
        return getAlert(ALERT_CODES.FULLNAME_SHORT, lang);
      }
      if (trimmed.length > maxLength) {
        return getAlert(ALERT_CODES.FULLNAME_LONG, lang);
      }
      if (!/^[a-zA-Z\s]+$/.test(trimmed)) {
        return getAlert(ALERT_CODES.FULLNAME_INVALID, lang);
      }
      break;
      
    case 'email':
      if (trimmed.length > 100) {
        return getAlert(ALERT_CODES.EMAIL_LONG, lang);
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        return getAlert(ALERT_CODES.EMAIL_INVALID, lang);
      }
      break;
      
    case 'password':
      if (trimmed.length < 8) {
        return getAlert(ALERT_CODES.PASS_SHORT, lang, { min: 8 });
      }
      if (trimmed.length > 20) {
        return getAlert(ALERT_CODES.PASS_LONG, lang, { max: 20 });
      }
      if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(trimmed)) {
        return getAlert(ALERT_CODES.PASS_WEAK, lang);
      }
      break;
      
    case 'phone':
      const cleanPhone = trimmed.replace(/\D/g, '');
      // Basic validation - can be enhanced with country-specific rules
      if (cleanPhone.length < 8 || cleanPhone.length > 12) {
        return getAlert(ALERT_CODES.PHONE_INVALID, lang, { region: countryCode });
      }
      break;
      
    case 'otp':
      if (trimmed.length !== 6) {
        return getAlert(ALERT_CODES.OTP_LENGTH, lang, { length: 6 });
      }
      if (!/^\d{6}$/.test(trimmed)) {
        return getAlert(ALERT_CODES.OTP_INVALID, lang);
      }
      break;
  }
  
  return null; // No validation errors
}

/**
 * Create success alert
 */
export function createSuccessAlert(
  code: string,
  lang: Language = 'en',
  placeholders: AlertPlaceholders = {}
): Alert {
  return getAlert(code, lang, placeholders);
}

/**
 * Create error alert
 */
export function createErrorAlert(
  code: string,
  lang: Language = 'en',
  placeholders: AlertPlaceholders = {}
): Alert {
  return getAlert(code, lang, placeholders);
}