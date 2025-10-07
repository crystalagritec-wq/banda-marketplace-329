// Safaricom Daraja API Configuration
// This file contains all the configuration needed for Daraja API integration

export interface DarajaConfig {
  baseUrl: string;
  consumerKey: string;
  consumerSecret: string;
  businessShortCode: string;
  passkey: string;
  callbackUrl: string;
  environment: 'sandbox' | 'production';
}

// Environment-specific configurations
const SANDBOX_CONFIG: DarajaConfig = {
  baseUrl: 'https://sandbox.safaricom.co.ke',
  consumerKey: process.env.EXPO_PUBLIC_DARAJA_CONSUMER_KEY || 'your_sandbox_consumer_key',
  consumerSecret: process.env.EXPO_PUBLIC_DARAJA_CONSUMER_SECRET || 'your_sandbox_consumer_secret',
  businessShortCode: '174379', // Default sandbox shortcode
  passkey: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919', // Default sandbox passkey
  callbackUrl: process.env.EXPO_PUBLIC_DARAJA_CALLBACK_URL || 'https://your-banda-backend.com/api/payments/mpesa/callback',
  environment: 'sandbox',
};

const PRODUCTION_CONFIG: DarajaConfig = {
  baseUrl: 'https://api.safaricom.co.ke',
  consumerKey: process.env.EXPO_PUBLIC_DARAJA_CONSUMER_KEY || '',
  consumerSecret: process.env.EXPO_PUBLIC_DARAJA_CONSUMER_SECRET || '',
  businessShortCode: process.env.EXPO_PUBLIC_DARAJA_BUSINESS_SHORTCODE || '',
  passkey: process.env.EXPO_PUBLIC_DARAJA_PASSKEY || '',
  callbackUrl: process.env.EXPO_PUBLIC_DARAJA_CALLBACK_URL || '',
  environment: 'production',
};

// API Endpoints
export const DARAJA_ENDPOINTS = {
  OAUTH: '/oauth/v1/generate?grant_type=client_credentials',
  STK_PUSH: '/mpesa/stkpush/v1/processrequest',
  STK_QUERY: '/mpesa/stkpushquery/v1/query',
  ACCOUNT_BALANCE: '/mpesa/accountbalance/v1/query',
  TRANSACTION_STATUS: '/mpesa/transactionstatus/v1/query',
  REVERSAL: '/mpesa/reversal/v1/request',
};

// Get current configuration based on environment
export function getDarajaConfig(): DarajaConfig {
  const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';
  const useProduction = process.env.EXPO_PUBLIC_DARAJA_ENVIRONMENT === 'production';
  
  if (useProduction && !isDevelopment) {
    console.log('🔴 Using Daraja PRODUCTION environment');
    return PRODUCTION_CONFIG;
  } else {
    console.log('🟡 Using Daraja SANDBOX environment');
    return SANDBOX_CONFIG;
  }
}

// Validation function to check if all required config is present
export function validateDarajaConfig(config: DarajaConfig): { isValid: boolean; missingFields: string[] } {
  const requiredFields: (keyof DarajaConfig)[] = [
    'baseUrl',
    'consumerKey', 
    'consumerSecret',
    'businessShortCode',
    'passkey',
    'callbackUrl'
  ];
  
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (!config[field] || config[field] === '' || config[field].startsWith('your_')) {
      missingFields.push(field);
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

// Transaction types supported by Daraja
export const TRANSACTION_TYPES = {
  CUSTOMER_PAY_BILL_ONLINE: 'CustomerPayBillOnline',
  CUSTOMER_BUY_GOODS_ONLINE: 'CustomerBuyGoodsOnline',
} as const;

// Common result codes from Daraja API
export const DARAJA_RESULT_CODES = {
  SUCCESS: '0',
  INSUFFICIENT_FUNDS: '1',
  LESS_THAN_MINIMUM: '2',
  MORE_THAN_MAXIMUM: '3',
  WOULD_EXCEED_DAILY_LIMIT: '4',
  WOULD_EXCEED_MINIMUM_BALANCE: '5',
  UNRESOLVED_PRIMARY_PARTY: '6',
  UNRESOLVED_RECEIVER_PARTY: '7',
  WOULD_EXCEED_MAXIMUM_BALANCE: '8',
  INVALID_DEBIT_ACCOUNT: '11',
  INVALID_CREDIT_ACCOUNT: '12',
  UNRESOLVED_DEBIT_ACCOUNT: '13',
  UNRESOLVED_CREDIT_ACCOUNT: '14',
  DUPLICATE_DETECTED: '15',
  INTERNAL_FAILURE: '17',
  UNRESOLVED_INITIATOR: '20',
  TRAFFIC_BLOCKING_CONDITION: '26',
  USER_CANCELLED: '1032',
  TIMEOUT: '1037',
} as const;

// Human-readable messages for result codes
export const RESULT_CODE_MESSAGES: Record<string, string> = {
  '0': 'Transaction completed successfully',
  '1': 'Insufficient funds in your account',
  '2': 'Amount is less than minimum allowed',
  '3': 'Amount exceeds maximum allowed',
  '4': 'Transaction would exceed daily transaction limit',
  '5': 'Transaction would exceed minimum balance',
  '6': 'Could not resolve sender details',
  '7': 'Could not resolve receiver details',
  '8': 'Transaction would exceed maximum balance',
  '11': 'Invalid sender account',
  '12': 'Invalid receiver account',
  '13': 'Could not resolve sender account',
  '14': 'Could not resolve receiver account',
  '15': 'Duplicate transaction detected',
  '17': 'Internal system failure',
  '20': 'Could not resolve transaction initiator',
  '26': 'System temporarily unavailable',
  '1032': 'Transaction was cancelled by user',
  '1037': 'Transaction timed out',
};

// Get user-friendly message for result code
export function getResultCodeMessage(code: string): string {
  return RESULT_CODE_MESSAGES[code] || `Unknown error (Code: ${code})`;
}

// Phone number validation patterns
export const PHONE_PATTERNS = {
  KENYAN_MOBILE: /^254[17]\d{8}$/,
  KENYAN_MOBILE_LOCAL: /^0[17]\d{8}$/,
  SAFARICOM: /^254[17][0-9]{8}$/,
  AIRTEL: /^254[17][0-9]{8}$/,
};

// Supported Kenyan mobile networks
export const KENYAN_NETWORKS = {
  SAFARICOM: { prefix: ['254701', '254702', '254703', '254704', '254705', '254706', '254707', '254708', '254709', '254710', '254711', '254712', '254713', '254714', '254715', '254716', '254717', '254718', '254719', '254720', '254721', '254722', '254723', '254724', '254725', '254726', '254727', '254728', '254729'], name: 'Safaricom' },
  AIRTEL: { prefix: ['254730', '254731', '254732', '254733', '254734', '254735', '254736', '254737', '254738', '254739'], name: 'Airtel' },
  TELKOM: { prefix: ['254770', '254771', '254772', '254773', '254774', '254775', '254776', '254777', '254778', '254779'], name: 'Telkom' },
};

// Detect network from phone number
export function detectNetwork(phone: string): string | null {
  const cleaned = phone.replace(/\D/g, '');
  const formatted = cleaned.startsWith('0') ? '254' + cleaned.substring(1) : cleaned;
  
  for (const [network, config] of Object.entries(KENYAN_NETWORKS)) {
    for (const prefix of config.prefix) {
      if (formatted.startsWith(prefix)) {
        return config.name;
      }
    }
  }
  
  return null;
}

// Development/Testing utilities
export const TEST_PHONE_NUMBERS = {
  SAFARICOM_SUCCESS: '254708374149',
  SAFARICOM_INSUFFICIENT_FUNDS: '254708374150',
  SAFARICOM_INVALID: '254708374151',
  SAFARICOM_TIMEOUT: '254708374152',
};

export default getDarajaConfig;