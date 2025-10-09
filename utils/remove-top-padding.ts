/**
 * Utility script to remove top padding from all screens
 * This removes paddingTop: insets.top from all View components
 */

export const filesToUpdate = [
  'app/(tabs)/wallet.tsx',
  'app/(tabs)/chat.tsx',
  'app/(auth)/welcome.tsx',
  'app/(tabs)/product/[id].tsx',
  'app/home.tsx',
  'app/(tabs)/categories.tsx',
  'app/(tabs)/cart.tsx',
  'app/checkout.tsx',
  'app/payment-processing.tsx',
  'app/order-success.tsx',
  'app/(tabs)/orders.tsx',
  'app/(tabs)/requests.tsx',
  'app/my-products.tsx',
  'app/favorites.tsx',
  'app/insights.tsx',
  'app/notifications.tsx',
  'app/address.tsx',
  'app/dispute/[disputeId].tsx',
  'app/disputes.tsx',
  'app/logistics.tsx',
  'app/route-optimization.tsx',
  'app/flash-sale.tsx',
  'app/trending-deals.tsx',
  'app/upcoming-events.tsx',
  'app/offers-promos.tsx',
  'app/post-product.tsx',
  'app/post-service.tsx',
  'app/post-request.tsx',
  'app/my-drafts.tsx',
  'app/my-posts.tsx',
  'app/order-details.tsx',
  'app/order-tracking.tsx',
  'app/order-qr.tsx',
  'app/qr-scanner.tsx',
  'app/verification-dashboard.tsx',
  'app/(tabs)/community.tsx',
  'app/vendor-profile.tsx',
  'app/success-stories.tsx',
  'app/knowledge-hub.tsx',
  'app/delivery-scheduling.tsx',
  'app/multi-seller-order-tracking.tsx',
  'app/dashboard.tsx',
  'app/onboarding/welcome.tsx',
  'app/onboarding/intro-tour.tsx',
  'app/onboarding/role-selection.tsx',
  'app/onboarding/shop/profile.tsx',
  'app/onboarding/shop/products.tsx',
  'app/onboarding/shop/wallet.tsx',
  'app/onboarding/shop/tutorial.tsx',
  'app/onboarding/logistics/role.tsx',
  'app/onboarding/logistics/owner.tsx',
  'app/onboarding/logistics/driver.tsx',
  'app/onboarding/logistics/delivery.tsx',
  'app/onboarding/logistics/payment.tsx',
  'app/onboarding/farm/profile.tsx',
  'app/onboarding/farm/crops.tsx',
  'app/onboarding/farm/workers.tsx',
  'app/onboarding/farm/analytics.tsx',
  'app/onboarding/service/profile.tsx',
  'app/onboarding/service/offerings.tsx',
  'app/onboarding/service/pricing.tsx',
  'app/onboarding/service/availability.tsx',
  'app/shop-activation.tsx',
  'app/vendor/[vendorId].tsx',
  'app/inboarding/service-role.tsx',
  'app/inboarding/service-details.tsx',
  'app/inboarding/service-types.tsx',
  'app/inboarding/service-verification.tsx',
  'app/inboarding/service-equipment.tsx',
  'app/inboarding/service-availability.tsx',
  'app/inboarding/service-payment.tsx',
  'app/inboarding/service-summary.tsx',
  'app/service-provider-dashboard.tsx',
  'app/wallet-welcome.tsx',
  'app/wallet-create-pin.tsx',
  'app/wallet-onboarding.tsx',
  'app/delivery-location-confirm.tsx',
  'app/order-details-enhanced.tsx',
  'app/live-tracking.tsx',
  'app/my-verification.tsx',
  'app/my-subscription.tsx',
  'app/my-loyalty.tsx',
  'app/logistics-delivery-management.tsx',
];

export const instructions = `
To remove top padding from screens:

1. Remove: { paddingTop: insets.top }
2. Remove: { paddingTop: insets.top + 16 }
3. Remove: { paddingTop: insets.top + 12 }
4. Remove: { paddingTop: insets.top + 20 }
5. Remove: { paddingTop: insets.top, paddingBottom: insets.bottom }
6. Remove: { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }

Replace with:
- style={styles.container} (if no other inline styles)
- style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]} (if other styles exist)
- style={[styles.container, { paddingBottom: insets.bottom }]} (keep bottom padding)
`;
