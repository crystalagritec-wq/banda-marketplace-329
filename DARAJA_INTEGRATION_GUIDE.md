# Safaricom Daraja API Integration for Banda App

This document explains the complete Safaricom Daraja API integration implemented in the Banda mobile app for M-Pesa payments.

## Overview

The integration provides:
- ✅ Real-time M-Pesa STK Push payments
- ✅ Phone number validation with network detection
- ✅ Automatic payment status polling
- ✅ Sandbox and production environment support
- ✅ Comprehensive error handling
- ✅ User-friendly payment flow

## Files Structure

```
services/
├── payments.ts              # Main payment service with Daraja integration
constants/
├── daraja-config.ts         # Configuration and constants
app/
├── checkout.tsx             # Enhanced checkout with M-Pesa UI
```

## Configuration

### Environment Variables

Add these to your environment configuration:

```bash
# Daraja API Credentials
EXPO_PUBLIC_DARAJA_CONSUMER_KEY=your_consumer_key
EXPO_PUBLIC_DARAJA_CONSUMER_SECRET=your_consumer_secret
EXPO_PUBLIC_DARAJA_BUSINESS_SHORTCODE=your_shortcode
EXPO_PUBLIC_DARAJA_PASSKEY=your_passkey
EXPO_PUBLIC_DARAJA_CALLBACK_URL=https://your-backend.com/api/payments/mpesa/callback
EXPO_PUBLIC_DARAJA_ENVIRONMENT=sandbox  # or 'production'
```

### Default Sandbox Configuration

The app includes default sandbox credentials for testing:
- **Consumer Key**: Set in `daraja-config.ts`
- **Consumer Secret**: Set in `daraja-config.ts`
- **Business Shortcode**: `174379` (Safaricom sandbox)
- **Passkey**: Sandbox passkey included
- **Environment**: Automatically detects development vs production

## Key Features

### 1. Phone Number Validation

```typescript
// Validates and formats Kenyan mobile numbers
const validation = validateAndFormatMpesaPhone('+254712345678');
// Returns: { isValid: true, formatted: '254712345678', network: 'Safaricom' }
```

**Supported formats:**
- `0712345678` → `254712345678`
- `+254712345678` → `254712345678`
- `712345678` → `254712345678`

**Network Detection:**
- Safaricom: 254701-254729
- Airtel: 254730-254739
- Telkom: 254770-254779

### 2. STK Push Implementation

```typescript
const stkResponse = await initiateMpesaStk({
  orderId: 'ORDER_123',
  amount: 1000,
  phone: '254712345678',
  accountReference: 'BANDA-ORDER_123',
  transactionDesc: 'Banda Order Payment - 3 items'
});
```

**Features:**
- Automatic phone number formatting
- Network detection and validation
- Comprehensive error handling
- Development mode simulation
- Detailed logging for debugging

### 3. Payment Status Polling

```typescript
const status = await pollMpesaStatus(checkoutRequestID);
// Returns: { status: 'success' | 'failed' | 'processing', message: '...' }
```

**Status Mapping:**
- `ResultCode: '0'` → `success`
- `ResultCode: '1032'` → `failed` (user cancelled)
- `ResultCode: '1037'` → `failed` (timeout)
- Other codes → `processing` or `failed`

### 4. User Interface Enhancements

The checkout screen now includes:

**Daraja Connection Status:**
- ✅ Green indicator: API connection successful
- ⚠️ Yellow indicator: Configuration issues or connection failed

**M-Pesa Number Management:**
- Display current number with network badge
- Inline editing with real-time validation
- Network detection (Safaricom, Airtel, Telkom)
- Error messages for invalid numbers

**Payment Flow:**
- Pre-validation before order creation
- Real-time STK Push initiation
- User feedback with success/error messages
- Automatic navigation to payment processing screen

## Error Handling

### Common Error Scenarios

1. **Invalid Phone Number**
   ```
   "Please enter a valid Kenyan mobile number (e.g., 0712345678)"
   ```

2. **Insufficient Funds**
   ```
   "Insufficient funds in your account"
   ```

3. **User Cancelled**
   ```
   "Transaction was cancelled by user"
   ```

4. **Network Issues**
   ```
   "Unable to check payment status. Please wait..."
   ```

5. **Configuration Issues**
   ```
   "Configuration incomplete. Missing: consumerKey, consumerSecret"
   ```

### Error Recovery

- **Development Mode**: Falls back to simulation
- **Network Errors**: Retries with exponential backoff
- **Invalid Config**: Shows helpful error messages
- **User Cancellation**: Graceful handling with clear messaging

## Testing

### Test Phone Numbers (Sandbox)

```typescript
const TEST_NUMBERS = {
  SUCCESS: '254708374149',           // Always succeeds
  INSUFFICIENT_FUNDS: '254708374150', // Insufficient funds
  INVALID: '254708374151',           // Invalid number
  TIMEOUT: '254708374152',           // Times out
};
```

### Development Mode

When `__DEV__` is true:
- Uses simulated STK Push responses
- 70% success rate for testing
- No actual API calls made
- Detailed console logging

### Connection Testing

```typescript
const result = await testDarajaConnection();
console.log(result);
// { success: true, message: "Connected to Daraja SANDBOX environment" }
```

## Production Deployment

### 1. Get Production Credentials

1. Register at [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
2. Create a new app
3. Get production credentials:
   - Consumer Key
   - Consumer Secret
   - Business Shortcode
   - Passkey

### 2. Update Environment Variables

```bash
EXPO_PUBLIC_DARAJA_ENVIRONMENT=production
EXPO_PUBLIC_DARAJA_CONSUMER_KEY=your_production_key
EXPO_PUBLIC_DARAJA_CONSUMER_SECRET=your_production_secret
EXPO_PUBLIC_DARAJA_BUSINESS_SHORTCODE=your_production_shortcode
EXPO_PUBLIC_DARAJA_PASSKEY=your_production_passkey
```

### 3. Backend Callback Implementation

Implement the callback URL endpoint to handle payment confirmations:

```javascript
// POST /api/payments/mpesa/callback
app.post('/api/payments/mpesa/callback', (req, res) => {
  const { Body } = req.body;
  const { stkCallback } = Body;
  
  if (stkCallback.ResultCode === 0) {
    // Payment successful
    const { CheckoutRequestID, MpesaReceiptNumber, Amount } = stkCallback.CallbackMetadata.Item;
    // Update order status in database
  } else {
    // Payment failed
    console.log('Payment failed:', stkCallback.ResultDesc);
  }
  
  res.json({ ResultCode: 0, ResultDesc: 'Success' });
});
```

## Security Considerations

1. **Never expose credentials in client code**
2. **Use environment variables for all sensitive data**
3. **Implement proper callback URL validation**
4. **Log all transactions for audit purposes**
5. **Validate all incoming webhook data**
6. **Use HTTPS for all API communications**

## Monitoring and Analytics

### Key Metrics to Track

- STK Push success rate
- Payment completion time
- Error rates by type
- Network distribution (Safaricom vs others)
- User cancellation rates

### Logging

The integration includes comprehensive logging:
- 📱 STK Push initiation
- 📞 Phone number validation
- 🔍 Status polling
- ✅ Success confirmations
- ❌ Error details

## Troubleshooting

### Common Issues

1. **"Configuration incomplete"**
   - Check environment variables
   - Verify credentials are set correctly

2. **"Authentication failed"**
   - Verify consumer key and secret
   - Check if credentials are for correct environment

3. **"Invalid phone number"**
   - Ensure number is Kenyan mobile (254...)
   - Check network prefixes

4. **STK Push not received**
   - Verify phone number is correct
   - Check if user has sufficient balance
   - Ensure phone is on and has network

5. **Callback not received**
   - Verify callback URL is accessible
   - Check firewall settings
   - Ensure HTTPS is used

### Debug Mode

Enable detailed logging by setting:
```javascript
console.log('🔧 Debug mode enabled');
```

## API Reference

### Main Functions

#### `initiateMpesaStk(request: StkPushRequest): Promise<StkPushResponse>`
Initiates an M-Pesa STK Push payment.

#### `pollMpesaStatus(checkoutRequestID: string): Promise<StkStatusResponse>`
Checks the status of an STK Push payment.

#### `validateAndFormatMpesaPhone(phone: string): ValidationResult`
Validates and formats a phone number for M-Pesa.

#### `testDarajaConnection(): Promise<ConnectionResult>`
Tests the connection to Daraja API.

### Type Definitions

```typescript
interface StkPushRequest {
  orderId: string;
  amount: number;
  phone: string;
  accountReference?: string;
  transactionDesc?: string;
}

interface StkPushResponse {
  checkoutRequestID: string;
  merchantRequestID?: string;
  status: 'queued' | 'failed' | 'success';
  message?: string;
}

interface StkStatusResponse {
  status: 'processing' | 'success' | 'failed';
  message?: string;
  resultCode?: string;
  resultDesc?: string;
}
```

## Support

For issues with the Daraja integration:

1. Check the console logs for detailed error messages
2. Verify your configuration using `testDarajaConnection()`
3. Test with sandbox credentials first
4. Refer to [Safaricom Developer Documentation](https://developer.safaricom.co.ke/docs)

---

**Note**: This integration is designed for the Banda agricultural marketplace app and includes specific business logic for order processing and delivery management.