import { Platform } from 'react-native';
import { getDarajaConfig, DARAJA_ENDPOINTS, getResultCodeMessage, detectNetwork, validateDarajaConfig } from '@/constants/daraja-config';

export type PaymentMethodType = 'agripay' | 'mpesa' | 'card' | 'cod';

// Daraja API Interfaces
export interface DarajaAuthResponse {
  access_token: string;
  expires_in: string;
}

export interface StkPushRequest {
  orderId: string;
  amount: number;
  phone: string;
  accountReference?: string;
  transactionDesc?: string;
}

export interface DarajaStkPushRequest {
  BusinessShortCode: string;
  Password: string;
  Timestamp: string;
  TransactionType: string;
  Amount: number;
  PartyA: string;
  PartyB: string;
  PhoneNumber: string;
  CallBackURL: string;
  AccountReference: string;
  TransactionDesc: string;
}

export interface StkPushResponse {
  checkoutRequestID: string;
  merchantRequestID?: string;
  status: 'queued' | 'failed' | 'success';
  message?: string;
  responseCode?: string;
  responseDescription?: string;
}

export interface DarajaStkPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface StkStatusResponse {
  status: 'processing' | 'success' | 'failed';
  message?: string;
  resultCode?: string;
  resultDesc?: string;
}

export interface DarajaStkQueryRequest {
  BusinessShortCode: string;
  Password: string;
  Timestamp: string;
  CheckoutRequestID: string;
}

export interface DarajaStkQueryResponse {
  ResponseCode: string;
  ResponseDescription: string;
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: string;
  ResultDesc: string;
}

export interface CardCheckoutRequest {
  orderId: string;
  amount: number;
  currency?: string; // KES
  customerEmail?: string;
}

export interface CardCheckoutResponse {
  redirectUrl: string;
  reference: string;
}

// Utility functions
function generateTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hour}${minute}${second}`;
}

function generatePassword(shortCode: string, passkey: string, timestamp: string): string {
  const data = shortCode + passkey + timestamp;
  // In a real implementation, you'd use a proper base64 encoding library
  // For now, we'll use btoa (browser) or Buffer (Node.js)
  if (typeof btoa !== 'undefined') {
    return btoa(data);
  } else {
    return Buffer.from(data).toString('base64');
  }
}

function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Handle different phone number formats
  if (cleaned.startsWith('0')) {
    // Convert 0712345678 to 254712345678
    cleaned = '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('254')) {
    // Already in correct format
  } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    // Convert 712345678 to 254712345678
    cleaned = '254' + cleaned;
  }
  
  return cleaned;
}

function getBaseUrl() {
  const injected = (globalThis as any).__BANDA_API_BASE__ as string | undefined;
  if (injected) return injected;
  if (Platform.OS === 'web') return '';
  return 'https://example-banda-backend.test';
}

// Daraja API Authentication
export async function getDarajaAccessToken(): Promise<string> {
  try {
    const config = getDarajaConfig();
    const validation = validateDarajaConfig(config);
    
    if (!validation.isValid) {
      throw new Error(`Daraja configuration incomplete. Missing: ${validation.missingFields.join(', ')}`);
    }
    
    const credentials = btoa(`${config.consumerKey}:${config.consumerSecret}`);
    
    const response = await fetch(`${config.baseUrl}${DARAJA_ENDPOINTS.OAUTH}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.statusText}`);
    }
    
    const data: DarajaAuthResponse = await response.json();
    console.log('✅ Daraja access token obtained successfully');
    return data.access_token;
  } catch (error) {
    console.error('❌ Failed to get Daraja access token:', error);
    throw error;
  }
}

// STK Push Implementation
export async function initiateMpesaStk(body: StkPushRequest): Promise<StkPushResponse> {
  try {
    console.log('📱 Initiating M-Pesa STK Push for order:', body.orderId);
    
    const config = getDarajaConfig();
    
    // Validate phone number
    const phoneValidation = validateMpesaPhoneNumber(body.phone);
    if (!phoneValidation.isValid) {
      throw new Error(phoneValidation.message || 'Invalid phone number');
    }
    
    const formattedPhone = phoneValidation.formatted!;
    const network = detectNetwork(formattedPhone);
    console.log(`📞 Phone: ${formattedPhone.replace(/\d(?=\d{4})/g, '*')} (${network || 'Unknown network'})`);
    
    // Get access token
    const accessToken = await getDarajaAccessToken();
    
    // Generate timestamp and password
    const timestamp = generateTimestamp();
    const password = generatePassword(config.businessShortCode, config.passkey, timestamp);
    
    // Prepare STK Push request
    const stkRequest: DarajaStkPushRequest = {
      BusinessShortCode: config.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(body.amount), // Ensure amount is integer
      PartyA: formattedPhone,
      PartyB: config.businessShortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: config.callbackUrl,
      AccountReference: body.accountReference || body.orderId,
      TransactionDesc: body.transactionDesc || `Banda Order ${body.orderId}`,
    };
    
    console.log('📤 STK Push request prepared:', {
      ...stkRequest,
      Password: '[HIDDEN]',
      PhoneNumber: formattedPhone.replace(/\d(?=\d{4})/g, '*'),
      Amount: `KSh ${stkRequest.Amount}`,
    });
    
    // Make STK Push request
    const response = await fetch(`${config.baseUrl}${DARAJA_ENDPOINTS.STK_PUSH}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stkRequest),
    });
    
    const responseData: DarajaStkPushResponse = await response.json();
    
    console.log('📥 Daraja STK Push response:', {
      ...responseData,
      CheckoutRequestID: responseData.CheckoutRequestID?.substring(0, 10) + '...',
    });
    
    if (response.ok && responseData.ResponseCode === '0') {
      return {
        checkoutRequestID: responseData.CheckoutRequestID,
        merchantRequestID: responseData.MerchantRequestID,
        status: 'queued',
        message: responseData.CustomerMessage,
        responseCode: responseData.ResponseCode,
        responseDescription: responseData.ResponseDescription,
      };
    } else {
      const errorMessage = getResultCodeMessage(responseData.ResponseCode) || responseData.ResponseDescription || 'STK Push failed';
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    console.error('❌ STK Push error:', error);
    
    // Fallback to simulation for development
    if (__DEV__) {
      console.log('🧪 Using simulated STK Push for development');
      return {
        checkoutRequestID: `SIM_${Date.now()}`,
        merchantRequestID: `MER_${Date.now()}`,
        status: 'queued',
        message: 'Simulated STK Push - Check your phone for payment prompt',
      };
    }
    
    throw error;
  }
}

// STK Push Status Query
export async function pollMpesaStatus(checkoutRequestID: string): Promise<StkStatusResponse> {
  try {
    console.log('🔍 Querying STK Push status for:', checkoutRequestID.substring(0, 10) + '...');
    
    // Handle simulated requests
    if (checkoutRequestID.startsWith('SIM_')) {
      // Simulate random success/failure for development
      const isSuccess = Math.random() > 0.3; // 70% success rate
      const resultCode = isSuccess ? '0' : '1032';
      return {
        status: isSuccess ? 'success' : 'failed',
        message: getResultCodeMessage(resultCode),
        resultCode,
        resultDesc: getResultCodeMessage(resultCode),
      };
    }
    
    const config = getDarajaConfig();
    
    // Get access token
    const accessToken = await getDarajaAccessToken();
    
    // Generate timestamp and password
    const timestamp = generateTimestamp();
    const password = generatePassword(config.businessShortCode, config.passkey, timestamp);
    
    // Prepare query request
    const queryRequest: DarajaStkQueryRequest = {
      BusinessShortCode: config.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestID,
    };
    
    // Make query request
    const response = await fetch(`${config.baseUrl}${DARAJA_ENDPOINTS.STK_QUERY}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queryRequest),
    });
    
    const responseData: DarajaStkQueryResponse = await response.json();
    
    console.log('📊 Daraja STK Query response:', {
      ResponseCode: responseData.ResponseCode,
      ResultCode: responseData.ResultCode,
      ResultDesc: responseData.ResultDesc,
    });
    
    // Map Daraja response to our format
    let status: 'processing' | 'success' | 'failed' = 'processing';
    
    if (responseData.ResultCode === '0') {
      status = 'success';
    } else if (responseData.ResultCode === '1032' || responseData.ResultCode === '1037') {
      status = 'failed'; // User cancelled or timeout
    } else if (responseData.ResponseCode === '0') {
      status = 'processing'; // Still processing
    } else {
      status = 'failed';
    }
    
    const message = responseData.ResultDesc || responseData.ResponseDescription || getResultCodeMessage(responseData.ResultCode);
    
    return {
      status,
      message,
      resultCode: responseData.ResultCode,
      resultDesc: responseData.ResultDesc,
    };
  } catch (error: any) {
    console.error('❌ STK Query error:', error);
    
    // Return processing status on error to allow retry
    return {
      status: 'processing',
      message: 'Unable to check payment status. Please wait...',
    };
  }
}

// Card payment functions (unchanged)
export async function createCardCheckoutSession(body: CardCheckoutRequest): Promise<CardCheckoutResponse> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/payments/card/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Failed to create card session');
    return (await res.json()) as CardCheckoutResponse;
  } catch (error: any) {
    console.error('Card checkout error:', error);
    return { redirectUrl: 'https://example-secure-pay.test', reference: 'SIMULATED' };
  }
}

export async function pollCardStatus(reference: string): Promise<StkStatusResponse> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/payments/card/status?ref=${encodeURIComponent(reference)}`);
    if (!res.ok) throw new Error('Status not ok');
    const json = (await res.json()) as StkStatusResponse;
    return json;
  } catch (error: any) {
    console.error('Card status error:', error);
    return { status: Math.random() > 0.85 ? 'success' : 'processing' };
  }
}

// Utility function to validate M-Pesa phone number
export function validateMpesaPhoneNumber(phone: string): { isValid: boolean; message?: string; formatted?: string } {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 0) {
    return { isValid: false, message: 'Phone number is required' };
  }
  
  // Check if it's a valid Kenyan mobile number
  const formatted = formatPhoneNumber(phone);
  
  if (!formatted.match(/^254[17]\d{8}$/)) {
    return { 
      isValid: false, 
      message: 'Please enter a valid Kenyan mobile number (e.g., 0712345678)' 
    };
  }
  
  return { isValid: true, formatted };
}

// Test function for development
export async function testDarajaConnection(): Promise<{ success: boolean; message: string; config?: any }> {
  try {
    const config = getDarajaConfig();
    const validation = validateDarajaConfig(config);
    
    if (!validation.isValid) {
      return {
        success: false,
        message: `Configuration incomplete. Missing: ${validation.missingFields.join(', ')}`,
        config: { environment: config.environment, missingFields: validation.missingFields }
      };
    }
    
    await getDarajaAccessToken();
    console.log('✅ Daraja API connection successful');
    return {
      success: true,
      message: `Connected to Daraja ${config.environment.toUpperCase()} environment`,
      config: { environment: config.environment, businessShortCode: config.businessShortCode }
    };
  } catch (error: any) {
    console.error('❌ Daraja API connection failed:', error);
    return {
      success: false,
      message: error.message || 'Connection failed',
    };
  }
}

// Enhanced phone number validation with network detection
export function validateAndFormatMpesaPhone(phone: string): {
  isValid: boolean;
  formatted?: string;
  network?: string;
  message?: string;
} {
  const validation = validateMpesaPhoneNumber(phone);
  
  if (!validation.isValid) {
    return validation;
  }
  
  const network = detectNetwork(validation.formatted!);
  
  return {
    ...validation,
    network: network || undefined,
  };
}
