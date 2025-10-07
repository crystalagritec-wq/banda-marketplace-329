# Banda QR System - Complete Implementation Guide

## Overview

The Banda QR system is a comprehensive solution for managing orders, deliveries, receipts, and disputes through QR codes. This system provides secure, trackable, and user-friendly verification processes across the entire marketplace ecosystem.

## QR Code Types

### 1. Order QR Codes
- **Purpose**: Order verification, pickup confirmation, delivery confirmation
- **Generated**: When an order is placed
- **Used by**: Buyers, sellers, drivers
- **Expires**: 24 hours after generation or when order is completed

### 2. Delivery QR Codes (Driver Badges)
- **Purpose**: Driver verification and identification
- **Generated**: When a driver is verified
- **Used by**: Drivers for identification, buyers/sellers for verification
- **Expires**: Never (permanent driver badge)

### 3. User QR Codes (Verification Badges)
- **Purpose**: User identity verification and trust building
- **Generated**: When user completes verification process
- **Used by**: All users for identity verification
- **Expires**: When verification status changes

### 4. Receipt QR Codes
- **Purpose**: Transaction verification and record keeping
- **Generated**: After every reserve action (release, refund, dispute)
- **Used by**: All parties for transaction verification
- **Expires**: Never (permanent record)

### 5. Dispute QR Codes
- **Purpose**: Dispute investigation and resolution
- **Generated**: When a dispute is raised
- **Used by**: Banda agents for on-site investigation
- **Expires**: When dispute is resolved

## Backend API Structure

### Core Procedures

#### 1. Generate QR Code
```typescript
// Route: /api/trpc/qr.generate
input: {
  qr_type: 'order' | 'delivery' | 'user' | 'receipt' | 'dispute',
  linked_id: string,
  payload: object,
  expires_hours?: number
}
```

#### 2. Scan QR Code
```typescript
// Route: /api/trpc/qr.scan
input: {
  qr_value: string,
  user_id: string,
  gps_location?: { latitude: number, longitude: number },
  device_info?: string
}
```

#### 3. Validate Fallback Code
```typescript
// Route: /api/trpc/qr.validateFallback
input: {
  order_id: string,
  fallback_code: string,
  user_id: string,
  gps_location?: { latitude: number, longitude: number },
  device_info?: string
}
```

### Order-Specific Procedures

#### 1. Generate Order QR
```typescript
// Route: /api/trpc/orders.generateQR
input: {
  order_id: string,
  order_details: {
    id: string,
    buyer_id: string,
    seller_ids?: string[],
    total?: number,
    items?: number,
    status?: string,
    reserve_status?: 'held' | 'released' | 'refunded' | 'disputed'
  },
  format?: 'png' | 'svg' | 'pdf'
}
```

#### 2. Get Detailed Order
```typescript
// Route: /api/trpc/orders.getDetailedOrder
input: {
  order_id: string
}
```

### Receipt Procedures

#### 1. Generate Receipt QR
```typescript
// Route: /api/trpc/qr.generateReceipt
input: {
  order_id: string,
  reserve_action: 'released' | 'refunded' | 'disputed',
  amount: number,
  transaction_id?: string,
  generated_by: string,
  receipt_type?: 'payment' | 'delivery' | 'refund' | 'dispute_resolution'
}
```

### Dispute Procedures

#### 1. Scan Dispute QR
```typescript
// Route: /api/trpc/qr.scanDispute
input: {
  qr_value: string,
  agent_id: string,
  gps_location?: { latitude: number, longitude: number },
  device_info?: string,
  resolution_notes?: string
}
```

### Utility Procedures

#### 1. Deactivate QR Code
```typescript
// Route: /api/trpc/qr.deactivate
input: {
  qr_id: string,
  reason?: string,
  deactivated_by: string
}
```

## Database Schema

### Core Tables

#### qr_codes
```sql
CREATE TABLE qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_type TEXT CHECK (qr_type IN ('order','delivery','user','receipt','dispute')),
    linked_id UUID NOT NULL,
    encoded_data JSONB NOT NULL,
    fallback_code TEXT UNIQUE NOT NULL,
    qr_image_url TEXT,
    verification_code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id)
);
```

#### qr_scan_logs
```sql
CREATE TABLE qr_scan_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_id UUID REFERENCES qr_codes(id),
    scanned_by UUID REFERENCES auth.users(id),
    gps_location JSONB,
    device_info TEXT,
    success BOOLEAN NOT NULL,
    reason TEXT,
    action_result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Enhanced Tables

#### orders (Enhanced)
- Added `seller_ids` array for multiple sellers
- Added `reserve_status` for escrow management
- Added comprehensive tracking fields

#### order_disputes
- Complete dispute management system
- Evidence storage and tracking
- Agent assignment and resolution

#### receipts
- Digital receipt generation
- Multiple receipt types
- QR code integration

## QR Data Structure

### Standard QR Payload
```json
{
  "type": "order|delivery|user|receipt|dispute",
  "id": "qr_unique_id",
  "related_id": "linked_object_id",
  "timestamp": "2025-09-27T10:00:00Z",
  "signature": "secure_hash",
  // Type-specific fields...
}
```

### Order QR Example
```json
{
  "type": "order",
  "id": "qr_1727432400000",
  "related_id": "order_abc123",
  "order_id": "order_abc123",
  "buyer_id": "user_buyer123",
  "seller_ids": ["user_seller456", "user_seller789"],
  "role": "buyer",
  "reserve_status": "held",
  "timestamp": "2025-09-27T10:00:00Z",
  "signature": "BANDA_ABC123_1727432400000",
  "total": 3500,
  "items": 2,
  "status": "confirmed"
}
```

## Security Features

### 1. Signature Verification
- Each QR code contains a unique signature
- Signatures are generated using order ID, timestamp, and secret key
- Prevents tampering and forgery

### 2. Expiry Management
- Order QRs expire after 24 hours or completion
- Receipt QRs never expire (permanent records)
- Dispute QRs expire when resolved

### 3. Fallback Codes
- Manual entry option when QR scanning fails
- Format: `TYPE-XXXXXX` (e.g., `ORDER-A1B2C3`)
- Same security validation as QR codes

### 4. GPS and Device Tracking
- All scans logged with location and device info
- Audit trail for security and dispute resolution
- Geofencing capabilities for delivery verification

## User Workflows

### 1. Order Placement to Delivery
1. **Order Created**: System generates Order QR
2. **Seller Confirmation**: Seller scans to confirm order
3. **Driver Pickup**: Driver scans Order QR at seller location
4. **In Transit**: Optional checkpoint scans for tracking
5. **Delivery**: Buyer scans Order QR to confirm delivery
6. **Reserve Release**: Payment automatically released to sellers
7. **Receipt Generation**: Digital receipt with QR created

### 2. Dispute Resolution
1. **Dispute Raised**: System generates Dispute QR
2. **Agent Assignment**: Banda agent receives dispute details
3. **On-Site Investigation**: Agent scans Dispute QR at location
4. **Evidence Collection**: Photos, videos, notes added to dispute
5. **Resolution**: Agent resolves dispute through system
6. **Receipt Generation**: Resolution receipt with QR created

### 3. Driver Verification
1. **Driver Registration**: Driver submits verification documents
2. **Verification Process**: Banda team verifies driver
3. **Badge Generation**: Permanent Delivery QR badge created
4. **Usage**: Driver shows badge for all deliveries

## Error Handling

### Common Error Scenarios
1. **Invalid QR Format**: Clear error message with fallback option
2. **Expired QR Code**: Regeneration option provided
3. **Unauthorized Scan**: Role-based error messages
4. **Network Issues**: Offline mode with sync when online
5. **GPS Issues**: Manual location entry option

### Error Messages
- ✅ Success: "QR code scanned successfully"
- 🚫 Invalid: "Invalid QR code format"
- ⏰ Expired: "QR code has expired"
- 🔒 Unauthorized: "You don't have permission to scan this QR code"
- 📶 Network: "Network error - scan saved for later sync"

## Frontend Integration

### React Native Components
- `QRCodeScanner`: Camera-based QR scanning
- `QRCodeDisplay`: QR code visualization
- `FallbackInput`: Manual code entry
- `QRHistory`: Scan history and logs

### Key Hooks
- `useQRScanner`: QR scanning functionality
- `useQRGenerator`: QR code generation
- `useQRValidation`: Fallback code validation

## Testing Strategy

### Unit Tests
- QR generation logic
- Signature validation
- Expiry checking
- Fallback code format

### Integration Tests
- End-to-end order flow
- Dispute resolution process
- Multi-party scanning scenarios

### Security Tests
- Signature tampering attempts
- Expired code usage
- Unauthorized access attempts

## Performance Considerations

### Database Optimization
- Indexed columns for fast lookups
- Partitioned scan logs by date
- Archived old QR codes

### Caching Strategy
- Active QR codes cached in Redis
- Scan results cached for offline mode
- User permissions cached

### Scalability
- Horizontal scaling for scan processing
- CDN for QR code images
- Background processing for analytics

## Monitoring and Analytics

### Key Metrics
- QR generation rate
- Scan success rate
- Average scan time
- Error frequency by type

### Alerts
- High error rates
- Suspicious scanning patterns
- System performance issues

### Reports
- Daily scan summary
- Dispute resolution metrics
- Driver performance analytics

## Future Enhancements

### Planned Features
1. **Batch QR Generation**: Multiple QRs at once
2. **Dynamic QR Updates**: Real-time QR data updates
3. **Blockchain Integration**: Immutable scan records
4. **AI Fraud Detection**: Suspicious pattern detection
5. **Voice Commands**: Accessibility improvements

### API Versioning
- Current version: v1
- Backward compatibility maintained
- Deprecation notices for old endpoints

## Support and Troubleshooting

### Common Issues
1. **QR Won't Scan**: Check camera permissions, lighting
2. **Fallback Not Working**: Verify code format and expiry
3. **Permission Denied**: Check user role and order ownership
4. **Network Errors**: Enable offline mode, retry when online

### Debug Information
- Scan logs with timestamps
- Error codes and messages
- Device and location data
- User context information

---

This comprehensive QR system provides secure, trackable, and user-friendly verification processes for the entire Banda marketplace ecosystem. The system is designed to be scalable, maintainable, and extensible for future enhancements.