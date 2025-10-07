# Testing Auth Alerts System

## ✅ What's Been Implemented

### 1. **Sign Up Screen Alerts**
- **Field-level validation**: Shows alerts directly under each input field
- **Global alerts**: Shows system-wide messages at the top
- **Real-time validation**: Alerts clear when user starts typing
- **Visual feedback**: Input fields change color and style when there's an error

**Test Cases:**
- Leave full name empty → Shows "Full name is required"
- Enter invalid email → Shows "Invalid email format"
- Enter weak password → Shows "Password must be at least 8 characters"
- Passwords don't match → Shows "Passwords do not match"
- Don't agree to terms → Shows "You must accept Terms & Privacy Policy"

### 2. **OTP Verification Screen Alerts**
- **OTP validation**: Shows specific error messages for different OTP issues
- **Localized messages**: Supports both English and Swahili
- **Error scenarios**: Handles invalid OTP, expired OTP, too many attempts

**Test Cases:**
- Enter less than 6 digits → Shows "OTP must be 6 digits"
- Enter invalid OTP (not 123456, 000000, 111111, 999999) → Shows random error:
  - "Invalid OTP. Please try again"
  - "OTP expired. Request a new code"
  - "Too many wrong attempts. Try again in 5 minutes"

### 3. **Sign In Screen Alerts**
- Already implemented with the same alert system
- Shows validation errors for email and password
- Handles authentication errors

## 🎨 Alert Types & Styling

### Alert Types:
- **Error** (red): ❌ Critical validation failures
- **Warning** (orange): ⚠️ Important notices
- **Info** (blue): ℹ️ Informational messages
- **Success** (green): ✅ Successful operations

### Visual Features:
- **Icons**: Each alert type has a distinct emoji/icon
- **Colors**: Background and text colors match the alert type
- **Positioning**: Field-level alerts appear under inputs, global alerts at top
- **Animation**: Smooth fade-in/out animations

## 🌍 Localization Support

All alerts support both English and Swahili:
- English: "Email is required."
- Swahili: "Barua pepe inahitajika."

## 🧪 How to Test

### Sign Up Screen:
1. Go to sign up screen
2. Try submitting without filling fields
3. Enter invalid data (bad email, weak password, etc.)
4. Watch alerts appear under each field
5. Start typing to see alerts disappear

### OTP Screen:
1. Go through sign up flow to reach OTP screen
2. Try entering wrong OTP codes
3. Try entering incomplete OTP
4. Use demo codes (123456, 000000, 111111, 999999) to succeed

### Language Toggle:
1. Tap the language button (Globe icon) in top right
2. Switch between English and Swahili
3. Trigger validation errors to see localized messages

## 📱 Cross-Platform Compatibility

The alerts system works on:
- ✅ iOS
- ✅ Android  
- ✅ Web (React Native Web compatible)

## 🔧 Technical Implementation

- **Alert System**: Uses `@/utils/auth-alerts.ts` for centralized alert management
- **Validation**: Uses `validateInput()` function with proper error codes
- **State Management**: Local state for field-level and global alerts
- **Styling**: Consistent styling with `getAlertStyle()` helper
- **Error Mapping**: Maps different error types to appropriate alert codes

The alerts system is now fully functional and provides excellent user feedback during authentication flows! 🎉