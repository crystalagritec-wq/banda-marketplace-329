export interface PhoneValidationResult {
  isValid: boolean;
  error?: string;
  normalizedPhone?: string;
}

export interface CountryPhoneRule {
  code: string;
  name: string;
  dialCode: string;
  format: string;
  length: number;
  pattern: RegExp;
  example: string;
}

// Phone validation rules for East African countries
export const phoneRules: Record<string, CountryPhoneRule> = {
  KE: {
    code: 'KE',
    name: 'Kenya',
    dialCode: '+254',
    format: '07XXXXXXXX',
    length: 10,
    pattern: /^07\d{8}$/,
    example: '0712345678'
  },
  TZ: {
    code: 'TZ',
    name: 'Tanzania',
    dialCode: '+255',
    format: '06XXXXXXXX or 07XXXXXXXX',
    length: 10,
    pattern: /^0[67]\d{8}$/,
    example: '0712345678'
  },
  UG: {
    code: 'UG',
    name: 'Uganda',
    dialCode: '+256',
    format: '07XXXXXXXX',
    length: 10,
    pattern: /^07\d{8}$/,
    example: '0712345678'
  },
  RW: {
    code: 'RW',
    name: 'Rwanda',
    dialCode: '+250',
    format: '07XXXXXXXX',
    length: 10,
    pattern: /^07\d{8}$/,
    example: '0712345678'
  },
  SS: {
    code: 'SS',
    name: 'South Sudan',
    dialCode: '+211',
    format: '09XXXXXXX',
    length: 9,
    pattern: /^09\d{7}$/,
    example: '091234567'
  },
  ET: {
    code: 'ET',
    name: 'Ethiopia',
    dialCode: '+251',
    format: '09XXXXXXX',
    length: 9,
    pattern: /^09\d{7}$/,
    example: '091234567'
  }
};

/**
 * Validates a phone number based on country-specific rules
 */
export function validatePhoneNumber(phone: string, countryCode: string): PhoneValidationResult {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: 'Phone number is required.' };
  }

  const cleanPhone = phone.trim().replace(/\s+/g, '');
  const rule = phoneRules[countryCode.toUpperCase()];

  if (!rule) {
    return { isValid: false, error: 'Unsupported country code.' };
  }

  // Check length
  if (cleanPhone.length !== rule.length) {
    return { 
      isValid: false, 
      error: `Phone number must be ${rule.length} digits.` 
    };
  }

  // Check pattern
  if (!rule.pattern.test(cleanPhone)) {
    const startDigits = rule.format.substring(0, 2);
    if (countryCode === 'TZ') {
      return { 
        isValid: false, 
        error: 'Number must start with 06 or 07.' 
      };
    } else {
      return { 
        isValid: false, 
        error: `Number must start with ${startDigits}.` 
      };
    }
  }

  return { 
    isValid: true, 
    normalizedPhone: normalizePhoneNumber(cleanPhone, countryCode) 
  };
}

/**
 * Normalizes a phone number by adding the country dial code
 */
export function normalizePhoneNumber(phone: string, countryCode: string): string {
  const cleanPhone = phone.trim().replace(/\s+/g, '');
  const rule = phoneRules[countryCode.toUpperCase()];
  
  if (!rule) return cleanPhone;

  // Remove leading zero and add country dial code
  const phoneWithoutZero = cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone;
  return rule.dialCode + phoneWithoutZero;
}

/**
 * Formats a phone number for display
 */
export function formatPhoneNumber(phone: string, countryCode: string): string {
  const cleanPhone = phone.trim().replace(/\s+/g, '');
  const rule = phoneRules[countryCode.toUpperCase()];
  
  if (!rule || cleanPhone.length !== rule.length) return phone;

  // Format based on country (simple formatting)
  if (countryCode === 'SS' || countryCode === 'ET') {
    // 9 digits: 091 234 567
    return `${cleanPhone.substring(0, 3)} ${cleanPhone.substring(3, 6)} ${cleanPhone.substring(6)}`;
  } else {
    // 10 digits: 0712 345 678
    return `${cleanPhone.substring(0, 4)} ${cleanPhone.substring(4, 7)} ${cleanPhone.substring(7)}`;
  }
}

/**
 * Gets the country rule for a given country code
 */
export function getCountryRule(countryCode: string): CountryPhoneRule | null {
  return phoneRules[countryCode.toUpperCase()] || null;
}

/**
 * Gets all supported countries
 */
export function getSupportedCountries(): CountryPhoneRule[] {
  return Object.values(phoneRules);
}