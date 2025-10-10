import { createTRPCRouter } from "@/backend/trpc/create-context";
import hiRoute from "@/backend/trpc/routes/example/hi/route";
import { walletDepositProcedure } from "@/backend/trpc/routes/wallet/deposit";
import { walletWithdrawProcedure } from "@/backend/trpc/routes/wallet/withdraw";
import { walletTransferProcedure } from "@/backend/trpc/routes/wallet/transfer";
import { getWalletBalanceProcedure } from "@/backend/trpc/routes/wallet/get-balance";
import { holdReserveProcedure } from "@/backend/trpc/routes/wallet/hold-reserve";
import { releaseReserveProcedure } from "@/backend/trpc/routes/wallet/release-reserve";
import { refundReserveProcedure } from "@/backend/trpc/routes/wallet/refund-reserve";
import { createPinProcedure } from "@/backend/trpc/routes/wallet/create-pin";
import { verifyPinProcedure } from "@/backend/trpc/routes/wallet/verify-pin";
import { updateProfileProcedure } from "@/backend/trpc/routes/profile/update";
import { fetchUserSessionProcedure } from "@/backend/trpc/routes/profile/fetch-session";
import { addToCartProcedure } from "@/backend/trpc/routes/products/add-to-cart";
import { updateQuantityProcedure } from "@/backend/trpc/routes/products/update-quantity";
import { fetchProductDetailsProcedure } from "@/backend/trpc/routes/products/fetch-details";
import { getProductPoliciesProcedure } from "@/backend/trpc/routes/products/get-policies";
import { getAIRecommendationsProcedure } from "@/backend/trpc/routes/products/get-ai-recommendations";
import { getFrequentlyBoughtTogetherProcedure } from "@/backend/trpc/routes/products/get-frequently-bought-together";
import { awardPurchasePointsProcedure } from "@/backend/trpc/routes/products/award-purchase-points";
import { getProductPointsProcedure } from "@/backend/trpc/routes/products/get-product-points";
import { fetchCategoriesByLocationProcedure } from "@/backend/trpc/routes/categories/fetch-by-location";
import { logPaymentSuccessProcedure } from "@/backend/trpc/routes/orders/log-payment-success";
import { generateOrderQRProcedure } from "@/backend/trpc/routes/orders/generate-qr";
import { notifySellerDriverProcedure } from "@/backend/trpc/routes/orders/notify-seller-driver";
import { generateDigitalReceiptProcedure } from "@/backend/trpc/routes/orders/generate-digital-receipt";
import { fetchOrderDetailsProcedure } from "@/backend/trpc/routes/orders/fetch-order-details";
import { getActiveOrdersProcedure } from "@/backend/trpc/routes/orders/get-active-orders";
import { getDetailedOrderProcedure } from "@/backend/trpc/routes/orders/get-detailed-order";
import { getMultiSellerOrderProcedure } from "@/backend/trpc/routes/orders/get-multi-seller-order";
import { raiseDisputeProcedure } from "@/backend/trpc/routes/orders/raise-dispute";
import { calculateDeliveryFeeProcedure } from "@/backend/trpc/routes/checkout/calculate-delivery-fee";
import { getAIDeliveryOptionsProcedure } from "@/backend/trpc/routes/checkout/get-ai-delivery-options";
import { updateCartProcedure } from "@/backend/trpc/routes/checkout/update-cart";
import { checkoutOrderProcedure } from "@/backend/trpc/routes/checkout/checkout-order";
import { multiSellerCheckoutProcedure } from "@/backend/trpc/routes/checkout/multi-seller-checkout";
import { getSellerDeliveryQuotesProcedure } from "@/backend/trpc/routes/checkout/get-seller-delivery-quotes";
import { optimizeSellerSelectionProcedure } from "@/backend/trpc/routes/checkout/optimize-seller-selection";
import { suggestDeliveryPoolingProcedure } from "@/backend/trpc/routes/checkout/suggest-delivery-pooling";
import { predictDeliveryEtaProcedure } from "@/backend/trpc/routes/checkout/predict-delivery-eta";
import { getCartUpsellsProcedure } from "@/backend/trpc/routes/checkout/get-cart-upsells";
import { processAgriPayPaymentProcedure } from "@/backend/trpc/routes/checkout/process-agripay-payment";
import { getDeliveriesProcedure } from "@/backend/trpc/routes/logistics/get-deliveries";
import { getProviderEarningsProcedure } from "@/backend/trpc/routes/logistics/get-provider-earnings";
import { generateDeliveryQRProcedure } from "@/backend/trpc/routes/logistics/generate-delivery-qr";
import { verifyDeliveryQRProcedure } from "@/backend/trpc/routes/logistics/verify-delivery-qr";
import { optimizeDeliveryRoutesProcedure } from "@/backend/trpc/routes/logistics/optimize-delivery-routes";
import { requestWithdrawalProcedure } from "@/backend/trpc/routes/logistics/request-withdrawal";
import { generateQRProcedure } from "@/backend/trpc/routes/qr/generate-qr";
import { scanQRProcedure } from "@/backend/trpc/routes/qr/scan-qr";
import { validateFallbackProcedure } from "@/backend/trpc/routes/qr/validate-fallback";
import { deactivateQRProcedure } from "@/backend/trpc/routes/qr/deactivate-qr";
import { generateReceiptQRProcedure } from "@/backend/trpc/routes/qr/generate-receipt-qr";
import { scanDisputeQRProcedure } from "@/backend/trpc/routes/qr/scan-dispute-qr";
import { getUserDashboardProcedure } from "@/backend/trpc/routes/dashboard/get-user-dashboard";
import { updateVerificationDocumentsProcedure } from "@/backend/trpc/routes/verification/update-documents";
import { upgradeSubscriptionProcedure } from "@/backend/trpc/routes/subscription/upgrade";
import { getMarketInsightsProcedure } from "@/backend/trpc/routes/insights/get-market-insights";
import { getUserTransactionsProcedure } from "@/backend/trpc/routes/wallet/get-transactions";
import { sendUserAlertProcedure } from "@/backend/trpc/routes/notifications/send-alert";
import { createPostProcedure } from "@/backend/trpc/routes/posts/create-post";
import { getUserPostsProcedure } from "@/backend/trpc/routes/posts/get-user-posts";
import { getMarketplaceProcedure } from "@/backend/trpc/routes/marketplace/get-items";
import { getFlashSalesProcedure } from "@/backend/trpc/routes/marketplace/get-flash-sales";
import { addToWishlistProcedure } from "@/backend/trpc/routes/wishlist/add-item";
import { getWishlistProcedure } from "@/backend/trpc/routes/wishlist/get-items";
import { updateOrderStatusProcedure } from "@/backend/trpc/routes/orders/update-status";
import { getNotificationsProcedure } from "@/backend/trpc/routes/notifications/get-notifications";
import { markNotificationReadProcedure } from "@/backend/trpc/routes/notifications/mark-read";
import { uploadImageProcedure } from "@/backend/trpc/routes/upload/image";
import { searchProcedure } from "@/backend/trpc/routes/search/search";
import { advancedSearchProcedure } from "@/backend/trpc/routes/search/advanced-search";
import { voiceSearchProcedure } from "@/backend/trpc/routes/search/voice-search";
import { imageSearchProcedure } from "@/backend/trpc/routes/search/image-search";
import { getTrendingSearchesProcedure, getRecentSearchesProcedure, saveSearchProcedure } from "@/backend/trpc/routes/search/trending-searches";
import { getAnalyticsProcedure } from "@/backend/trpc/routes/analytics/get-analytics";
import { getProductCountersProcedure } from "@/backend/trpc/routes/analytics/get-product-counters";
import { healthCheckProcedure } from "@/backend/trpc/routes/system/health";
import { getUserActivityProcedure } from "@/backend/trpc/routes/activity/get-user-activity";
import { logUserActivityProcedure } from "@/backend/trpc/routes/activity/log-user-activity";
import { awardLoyaltyPointsProcedure } from "@/backend/trpc/routes/loyalty/award-points";
import { getLoyaltyPointsProcedure } from "@/backend/trpc/routes/loyalty/get-points";
import { completeChallengeProcedure } from "@/backend/trpc/routes/loyalty/complete-challenge";
import { addBadgeProcedure } from "@/backend/trpc/routes/loyalty/add-badge";
import { submitReviewProcedure } from "@/backend/trpc/routes/reviews/submit-review";
import { getReviewStatsProcedure } from "@/backend/trpc/routes/reviews/get-review-stats";
import { incrementProductViewProcedure } from "@/backend/trpc/routes/analytics/increment-product-view";
import { splitPaymentProcedure } from "@/backend/trpc/routes/payments/split-payment";
import { releaseEscrowProcedure } from "@/backend/trpc/routes/payments/release-escrow";
import { notifySellersOfOrderProcedure } from "@/backend/trpc/routes/notifications/notify-sellers";
import { coordinatePickupsProcedure } from "@/backend/trpc/routes/logistics/coordinate-pickups";
import { syncCartProcedure } from "@/backend/trpc/routes/cart/sync-cart";
import { getCartProcedure } from "@/backend/trpc/routes/cart/get-cart";
import { validatePromoProcedure } from "@/backend/trpc/routes/cart/validate-promo";
import { trackCartEventProcedure } from "@/backend/trpc/routes/cart/track-event";
import { saveForLaterProcedure, getSavedItemsProcedure, moveToCartProcedure } from "@/backend/trpc/routes/cart/save-for-later";
import { calculateRouteProcedure } from "@/backend/trpc/routes/delivery/calculate-route";
import { calculateDeliveryCostProcedure } from "@/backend/trpc/routes/delivery/calculate-delivery-cost";
import { getMultiSellerRoutesProcedure } from "@/backend/trpc/routes/delivery/get-multi-seller-routes";
import { getDeliveryPreviewProcedure } from "@/backend/trpc/routes/products/get-delivery-preview";
import { locationAwareSearchProcedure } from "@/backend/trpc/routes/search/location-aware-search";
import { getNearestSellersProcedure } from "@/backend/trpc/routes/products/get-nearest-sellers";
import { findPoolingOpportunitiesProcedure } from "@/backend/trpc/routes/delivery/find-pooling-opportunities";
import { calculatePooledDeliveryProcedure } from "@/backend/trpc/routes/delivery/calculate-pooled-delivery";
import { suggestPoolingProcedure } from "@/backend/trpc/routes/delivery/suggest-pooling";
import { getShopDashboardProcedure } from "@/backend/trpc/routes/shop/get-dashboard";
import { getShopProductsProcedure } from "@/backend/trpc/routes/shop/get-products";
import { updateProductStockProcedure } from "@/backend/trpc/routes/shop/update-product-stock";
import { getShopAnalyticsProcedure } from "@/backend/trpc/routes/shop/get-analytics";
import { createShopProductProcedure } from "@/backend/trpc/routes/shop/create-product";
import { getVendorProductsProcedure } from "@/backend/trpc/routes/shop/get-vendor-products";
import { getVendorProfileProcedure } from "@/backend/trpc/routes/shop/get-vendor-profile";
import { updateShopProductProcedure } from "@/backend/trpc/routes/shop/update-product";
import { deleteShopProductProcedure } from "@/backend/trpc/routes/shop/delete-product";
import { getVendorOrdersProcedure } from "@/backend/trpc/routes/shop/get-vendor-orders";
import { getVendorCustomersProcedure } from "@/backend/trpc/routes/shop/get-vendor-customers";
import { getVendorStatsProcedure } from "@/backend/trpc/routes/shop/get-vendor-stats";
import { createPromotionProcedure } from "@/backend/trpc/routes/shop/create-promotion";
import { getPromotionsProcedure } from "@/backend/trpc/routes/shop/get-promotions";
import { updateVendorOrderStatusProcedure } from "@/backend/trpc/routes/shop/update-order-status";
import { getFinancialReportProcedure } from "@/backend/trpc/routes/shop/get-financial-report";
import { createOwnerProfileProcedure } from "@/backend/trpc/routes/logistics-inboarding/create-owner-profile";
import { createDriverProfileProcedure } from "@/backend/trpc/routes/logistics-inboarding/create-driver-profile";
import { getLogisticsProfileProcedure } from "@/backend/trpc/routes/logistics-inboarding/get-logistics-profile";
import { addSpecializationProcedure } from "@/backend/trpc/routes/service-providers/add-specialization";
import { getSpecializationsProcedure } from "@/backend/trpc/routes/service-providers/get-specializations";
import { createMarketplacePostProcedure } from "@/backend/trpc/routes/service-providers/create-marketplace-post";
import { getMarketplacePostsProcedure } from "@/backend/trpc/routes/service-providers/get-marketplace-posts";
import { getDashboardStatsProcedure as getServiceDashboardStatsProcedure } from "@/backend/trpc/routes/service-providers/get-dashboard-stats";
import { createServiceRequestProcedure } from "@/backend/trpc/routes/service-providers/create-service-request";
import { getServiceRequestsProcedure } from "@/backend/trpc/routes/service-providers/get-service-requests";
import { updateRequestStatusProcedure } from "@/backend/trpc/routes/service-providers/update-request-status";
import { updateDeliveryStatusProcedure } from "@/backend/trpc/routes/logistics/update-delivery-status";
import { updateDriverLocationProcedure as logisticsUpdateDriverLocationProcedure } from "@/backend/trpc/routes/logistics/update-driver-location";
import { getLiveTrackingProcedure } from "@/backend/trpc/routes/logistics/get-live-tracking";
import { getMyShopProcedure } from "@/backend/trpc/routes/shop/get-my-shop";
import { getMyServiceProfileProcedure } from "@/backend/trpc/routes/service-providers/get-my-profile";
import { createWalletProcedure } from "@/backend/trpc/routes/agripay/create-wallet";
import { getWalletProcedure } from "@/backend/trpc/routes/agripay/get-wallet";
import { fundWalletProcedure } from "@/backend/trpc/routes/agripay/fund-wallet";
import { withdrawFundsProcedure } from "@/backend/trpc/routes/agripay/withdraw-funds";
import { getTransactionsProcedure } from "@/backend/trpc/routes/agripay/get-transactions";
import { setPinProcedure } from "@/backend/trpc/routes/agripay/set-pin";
import { verifyPinProcedure as agripayVerifyPinProcedure } from "@/backend/trpc/routes/agripay/verify-pin";
import { holdReserveProcedure as tradeguardHoldReserveProcedure } from "@/backend/trpc/routes/tradeguard/hold-reserve";
import { releaseReserveProcedure as tradeguardReleaseReserveProcedure } from "@/backend/trpc/routes/tradeguard/release-reserve";
import { refundReserveProcedure as tradeguardRefundReserveProcedure } from "@/backend/trpc/routes/tradeguard/refund-reserve";
import { getReservesProcedure } from "@/backend/trpc/routes/tradeguard/get-reserves";
import { submitProofProcedure } from "@/backend/trpc/routes/tradeguard/submit-proof";
import { verifyProofProcedure } from "@/backend/trpc/routes/tradeguard/verify-proof";
import { raiseDisputeProcedure as tradeguardRaiseDisputeProcedure } from "@/backend/trpc/routes/tradeguard/raise-dispute";
import { resolveDisputeProcedure } from "@/backend/trpc/routes/tradeguard/resolve-dispute";
import { getDisputesProcedure } from "@/backend/trpc/routes/tradeguard/get-disputes";
import { releaseOrderReserveProcedure } from "@/backend/trpc/routes/orders/release-order-reserve";
import { detectFraudProcedure } from "@/backend/trpc/routes/agripay/detect-fraud";
import { agripayHealthCheckProcedure } from "@/backend/trpc/routes/system/agripay-health";
import { uploadPhotoProcedure } from "@/backend/trpc/routes/profile/upload-photo";
import { getActivityLogProcedure } from "@/backend/trpc/routes/profile/get-activity-log";
import { exportDataProcedure } from "@/backend/trpc/routes/profile/export-data";
import { getPreferencesProcedure } from "@/backend/trpc/routes/settings/get-preferences";
import { updatePreferencesProcedure } from "@/backend/trpc/routes/settings/update-preferences";
import { enable2FAProcedure } from "@/backend/trpc/routes/settings/enable-2fa";
import { verify2FAProcedure } from "@/backend/trpc/routes/settings/verify-2fa";
import { changePhoneProcedure } from "@/backend/trpc/routes/settings/change-phone";
import { getLiveLocationProcedure } from "@/backend/trpc/routes/tracking/get-live-location";
import { updateDriverLocationProcedure } from "@/backend/trpc/routes/tracking/update-driver-location";
import { addTipProcedure } from "@/backend/trpc/routes/tracking/add-tip";
import { addDeliveryInstructionsProcedure } from "@/backend/trpc/routes/tracking/add-delivery-instructions";
import { getETAProcedure } from "@/backend/trpc/routes/tracking/get-eta";
import { getAddressesProcedure } from "@/backend/trpc/routes/addresses/get-addresses";
import { addAddressProcedure } from "@/backend/trpc/routes/addresses/add-address";
import { updateAddressProcedure } from "@/backend/trpc/routes/addresses/update-address";
import { deleteAddressProcedure } from "@/backend/trpc/routes/addresses/delete-address";
import { setDefaultAddressProcedure } from "@/backend/trpc/routes/addresses/set-default-address";
import { getUserRewardsProcedure } from "@/backend/trpc/routes/rewards/get-user-rewards";
import { completeChallengeProcedure as rewardsCompleteChallengeProcedure } from "@/backend/trpc/routes/rewards/complete-challenge";
import { redeemPointsProcedure } from "@/backend/trpc/routes/rewards/redeem-points";
import { submitDocumentsProcedure } from "@/backend/trpc/routes/verification/submit-documents";
import { getSubscriptionPlansProcedure } from "@/backend/trpc/routes/subscription/get-plans";
import { createBoostProcedure } from "@/backend/trpc/routes/boost/create-boost";
import { getActiveBoostsProcedure } from "@/backend/trpc/routes/boost/get-active-boosts";
import { getBoostPackagesProcedure } from "@/backend/trpc/routes/boost/get-boost-packages";
import { cancelBoostProcedure } from "@/backend/trpc/routes/boost/cancel-boost";
import { createFarmProcedure } from "@/backend/trpc/routes/farm/create-farm";
import { getFarmsProcedure } from "@/backend/trpc/routes/farm/get-farms";
import { getFarmDashboardProcedure } from "@/backend/trpc/routes/farm/get-farm-dashboard";
import { addFarmRecordProcedure } from "@/backend/trpc/routes/farm/add-record";
import { addFarmTaskProcedure } from "@/backend/trpc/routes/farm/add-task";
import { updateFarmTaskProcedure } from "@/backend/trpc/routes/farm/update-task";
import { getFarmAnalyticsProcedure } from "@/backend/trpc/routes/farm/get-analytics";
import { getShopProductsFullProcedure } from "@/backend/trpc/routes/shop/get-shop-products-full";
import { bulkUpdateProductsProcedure } from "@/backend/trpc/routes/shop/bulk-update-products";
import { getInventoryAlertsProcedure } from "@/backend/trpc/routes/shop/get-inventory-alerts";
import { uploadServiceProofProcedure } from "@/backend/trpc/routes/service-providers/upload-service-proof";
import { rateServiceProviderProcedure } from "@/backend/trpc/routes/service-providers/rate-service-provider";
import { assignDriverProcedure } from "@/backend/trpc/routes/logistics/assign-driver";
import { getAvailableDriversProcedure } from "@/backend/trpc/routes/logistics/get-available-drivers";
import { uploadDeliveryProofProcedure } from "@/backend/trpc/routes/logistics/upload-delivery-proof";
import { rateDriverProcedure } from "@/backend/trpc/routes/logistics/rate-driver";
import { uploadServiceProofEnhancedProcedure } from "@/backend/trpc/routes/service-providers/upload-service-proof-enhanced";
import { rateServiceProviderEnhancedProcedure } from "@/backend/trpc/routes/service-providers/rate-service-provider-enhanced";
import { getServiceRequestsEnhancedProcedure } from "@/backend/trpc/routes/service-providers/get-service-requests-enhanced";
import { updateRequestStatusEnhancedProcedure } from "@/backend/trpc/routes/service-providers/update-request-status-enhanced";
import { uploadDeliveryProofEnhancedProcedure } from "@/backend/trpc/routes/logistics/upload-delivery-proof-enhanced";
import { rateDriverEnhancedProcedure } from "@/backend/trpc/routes/logistics/rate-driver-enhanced";
import { getDriverDeliveriesEnhancedProcedure } from "@/backend/trpc/routes/logistics/get-driver-deliveries-enhanced";
import { requestPayoutEnhancedProcedure } from "@/backend/trpc/routes/logistics/request-payout-enhanced";
import { updateDeliveryStatusEnhancedProcedure } from "@/backend/trpc/routes/logistics/update-delivery-status-enhanced";
import { uploadProductImagesProcedure } from "@/backend/trpc/routes/shop/upload-product-images";
import { createProductVariantProcedure } from "@/backend/trpc/routes/shop/create-product-variant";
import { getInventoryAlertsEnhancedProcedure } from "@/backend/trpc/routes/shop/get-inventory-alerts-enhanced";
import { submitShopVerificationProcedure } from "@/backend/trpc/routes/shop/submit-shop-verification";
import { completeShopOnboardingProcedure } from "@/backend/trpc/routes/shop/complete-onboarding";
import { completeServiceOnboardingProcedure } from "@/backend/trpc/routes/service-providers/complete-onboarding";
import { completeLogisticsOnboardingProcedure } from "@/backend/trpc/routes/logistics-inboarding/complete-onboarding";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  wallet: createTRPCRouter({
    getBalance: getWalletBalanceProcedure,
    deposit: walletDepositProcedure,
    withdraw: walletWithdrawProcedure,
    transfer: walletTransferProcedure,
    getTransactions: getUserTransactionsProcedure,
    holdReserve: holdReserveProcedure,
    releaseReserve: releaseReserveProcedure,
    refundReserve: refundReserveProcedure,
    createPin: createPinProcedure,
    verifyPin: verifyPinProcedure,
  }),
  profile: createTRPCRouter({
    update: updateProfileProcedure,
    fetchSession: fetchUserSessionProcedure,
    uploadPhoto: uploadPhotoProcedure,
    getActivityLog: getActivityLogProcedure,
    exportData: exportDataProcedure,
  }),
  products: createTRPCRouter({
    addToCart: addToCartProcedure,
    updateQuantity: updateQuantityProcedure,
    fetchDetails: fetchProductDetailsProcedure,
    getPolicies: getProductPoliciesProcedure,
    getAIRecommendations: getAIRecommendationsProcedure,
    getFrequentlyBoughtTogether: getFrequentlyBoughtTogetherProcedure,
    getDeliveryPreview: getDeliveryPreviewProcedure,
    getNearestSellers: getNearestSellersProcedure,
    awardPurchasePoints: awardPurchasePointsProcedure,
    getProductPoints: getProductPointsProcedure,
  }),
  categories: createTRPCRouter({
    fetchByLocation: fetchCategoriesByLocationProcedure,
  }),
  orders: createTRPCRouter({
    logPaymentSuccess: logPaymentSuccessProcedure,
    generateQR: generateOrderQRProcedure,
    notifySellerDriver: notifySellerDriverProcedure,
    generateDigitalReceipt: generateDigitalReceiptProcedure,
    fetchOrderDetails: fetchOrderDetailsProcedure,
    getActiveOrders: getActiveOrdersProcedure,
    getDetailedOrder: getDetailedOrderProcedure,
    getMultiSellerOrder: getMultiSellerOrderProcedure,
    raiseDispute: raiseDisputeProcedure,
    updateStatus: updateOrderStatusProcedure,
    releaseReserve: releaseOrderReserveProcedure,
  }),
  checkout: createTRPCRouter({
    calculateDeliveryFee: calculateDeliveryFeeProcedure,
    getAIDeliveryOptions: getAIDeliveryOptionsProcedure,
    updateCart: updateCartProcedure,
    checkoutOrder: checkoutOrderProcedure,
    multiSellerCheckout: multiSellerCheckoutProcedure,
    getSellerDeliveryQuotes: getSellerDeliveryQuotesProcedure,
    optimizeSellerSelection: optimizeSellerSelectionProcedure,
    suggestDeliveryPooling: suggestDeliveryPoolingProcedure,
    predictDeliveryEta: predictDeliveryEtaProcedure,
    getCartUpsells: getCartUpsellsProcedure,
    processAgriPayPayment: processAgriPayPaymentProcedure,
  }),
  logistics: createTRPCRouter({
    getDeliveries: getDeliveriesProcedure,
    getProviderEarnings: getProviderEarningsProcedure,
    generateDeliveryQR: generateDeliveryQRProcedure,
    verifyDeliveryQR: verifyDeliveryQRProcedure,
    optimizeDeliveryRoutes: optimizeDeliveryRoutesProcedure,
    requestWithdrawal: requestWithdrawalProcedure,
    coordinatePickups: coordinatePickupsProcedure,
    updateDeliveryStatus: updateDeliveryStatusProcedure,
    updateDriverLocation: logisticsUpdateDriverLocationProcedure,
    getLiveTracking: getLiveTrackingProcedure,
    assignDriver: assignDriverProcedure,
    getAvailableDrivers: getAvailableDriversProcedure,
    uploadDeliveryProof: uploadDeliveryProofProcedure,
    rateDriver: rateDriverProcedure,
    uploadDeliveryProofEnhanced: uploadDeliveryProofEnhancedProcedure,
    rateDriverEnhanced: rateDriverEnhancedProcedure,
    getDriverDeliveriesEnhanced: getDriverDeliveriesEnhancedProcedure,
    requestPayoutEnhanced: requestPayoutEnhancedProcedure,
    updateDeliveryStatusEnhanced: updateDeliveryStatusEnhancedProcedure,
  }),
  qr: createTRPCRouter({
    generate: generateQRProcedure,
    scan: scanQRProcedure,
    validateFallback: validateFallbackProcedure,
    deactivate: deactivateQRProcedure,
    generateReceipt: generateReceiptQRProcedure,
    scanDispute: scanDisputeQRProcedure,
  }),
  dashboard: createTRPCRouter({
    getUserDashboard: getUserDashboardProcedure,
  }),
  verification: createTRPCRouter({
    updateDocuments: updateVerificationDocumentsProcedure,
    submitDocuments: submitDocumentsProcedure,
  }),
  subscription: createTRPCRouter({
    upgrade: upgradeSubscriptionProcedure,
    getPlans: getSubscriptionPlansProcedure,
  }),
  rewards: createTRPCRouter({
    getUserRewards: getUserRewardsProcedure,
    completeChallenge: rewardsCompleteChallengeProcedure,
    redeemPoints: redeemPointsProcedure,
  }),
  insights: createTRPCRouter({
    getMarketInsights: getMarketInsightsProcedure,
  }),
  notifications: createTRPCRouter({
    sendAlert: sendUserAlertProcedure,
    getNotifications: getNotificationsProcedure,
    markRead: markNotificationReadProcedure,
    notifySellers: notifySellersOfOrderProcedure,
  }),
  posts: createTRPCRouter({
    create: createPostProcedure,
    getUserPosts: getUserPostsProcedure,
  }),
  marketplace: createTRPCRouter({
    getItems: getMarketplaceProcedure,
    getFlashSales: getFlashSalesProcedure,
  }),
  wishlist: createTRPCRouter({
    addItem: addToWishlistProcedure,
    getItems: getWishlistProcedure,
  }),
  upload: createTRPCRouter({
    image: uploadImageProcedure,
  }),
  search: createTRPCRouter({
    search: searchProcedure,
    advanced: advancedSearchProcedure,
    voice: voiceSearchProcedure,
    image: imageSearchProcedure,
    trending: getTrendingSearchesProcedure,
    recent: getRecentSearchesProcedure,
    save: saveSearchProcedure,
    locationAware: locationAwareSearchProcedure,
  }),
  analytics: createTRPCRouter({
    getAnalytics: getAnalyticsProcedure,
    getProductCounters: getProductCountersProcedure,
    incrementProductView: incrementProductViewProcedure,
  }),
  system: createTRPCRouter({
    health: healthCheckProcedure,
    agripayHealth: agripayHealthCheckProcedure,
  }),
  activity: createTRPCRouter({
    getUserActivity: getUserActivityProcedure,
    logActivity: logUserActivityProcedure,
  }),
  loyalty: createTRPCRouter({
    awardPoints: awardLoyaltyPointsProcedure,
    getPoints: getLoyaltyPointsProcedure,
    completeChallenge: completeChallengeProcedure,
    addBadge: addBadgeProcedure,
  }),
  reviews: createTRPCRouter({
    submit: submitReviewProcedure,
    getStats: getReviewStatsProcedure,
  }),
  payments: createTRPCRouter({
    splitPayment: splitPaymentProcedure,
    releaseEscrow: releaseEscrowProcedure,
  }),
  cart: createTRPCRouter({
    sync: syncCartProcedure,
    get: getCartProcedure,
    validatePromo: validatePromoProcedure,
    trackEvent: trackCartEventProcedure,
    saveForLater: saveForLaterProcedure,
    getSavedItems: getSavedItemsProcedure,
    moveToCart: moveToCartProcedure,
  }),
  delivery: createTRPCRouter({
    calculateRoute: calculateRouteProcedure,
    calculateCost: calculateDeliveryCostProcedure,
    getMultiSellerRoutes: getMultiSellerRoutesProcedure,
    findPoolingOpportunities: findPoolingOpportunitiesProcedure,
    calculatePooledDelivery: calculatePooledDeliveryProcedure,
    suggestPooling: suggestPoolingProcedure,
  }),
  shop: createTRPCRouter({
    getDashboard: getShopDashboardProcedure,
    getProducts: getShopProductsProcedure,
    getShopProductsFull: getShopProductsFullProcedure,
    bulkUpdateProducts: bulkUpdateProductsProcedure,
    getInventoryAlerts: getInventoryAlertsProcedure,
    updateProductStock: updateProductStockProcedure,
    getAnalytics: getShopAnalyticsProcedure,
    createProduct: createShopProductProcedure,
    getVendorProducts: getVendorProductsProcedure,
    getVendorProfile: getVendorProfileProcedure,
    updateProduct: updateShopProductProcedure,
    deleteProduct: deleteShopProductProcedure,
    getVendorOrders: getVendorOrdersProcedure,
    getVendorCustomers: getVendorCustomersProcedure,
    getVendorStats: getVendorStatsProcedure,
    createPromotion: createPromotionProcedure,
    getPromotions: getPromotionsProcedure,
    updateOrderStatus: updateVendorOrderStatusProcedure,
    getFinancialReport: getFinancialReportProcedure,
    getMyShop: getMyShopProcedure,
    uploadProductImages: uploadProductImagesProcedure,
    createProductVariant: createProductVariantProcedure,
    getInventoryAlertsEnhanced: getInventoryAlertsEnhancedProcedure,
    submitShopVerification: submitShopVerificationProcedure,
    completeOnboarding: completeShopOnboardingProcedure,
  }),
  logisticsInboarding: createTRPCRouter({
    createOwnerProfile: createOwnerProfileProcedure,
    createDriverProfile: createDriverProfileProcedure,
    getProfile: getLogisticsProfileProcedure,
    completeOnboarding: completeLogisticsOnboardingProcedure,
  }),
  serviceProviders: createTRPCRouter({
    addSpecialization: addSpecializationProcedure,
    getSpecializations: getSpecializationsProcedure,
    createMarketplacePost: createMarketplacePostProcedure,
    getMarketplacePosts: getMarketplacePostsProcedure,
    getDashboardStats: getServiceDashboardStatsProcedure,
    createServiceRequest: createServiceRequestProcedure,
    getServiceRequests: getServiceRequestsProcedure,
    updateRequestStatus: updateRequestStatusProcedure,
    uploadServiceProof: uploadServiceProofProcedure,
    rateServiceProvider: rateServiceProviderProcedure,
    getMyProfile: getMyServiceProfileProcedure,
    uploadServiceProofEnhanced: uploadServiceProofEnhancedProcedure,
    rateServiceProviderEnhanced: rateServiceProviderEnhancedProcedure,
    getServiceRequestsEnhanced: getServiceRequestsEnhancedProcedure,
    updateRequestStatusEnhanced: updateRequestStatusEnhancedProcedure,
    completeOnboarding: completeServiceOnboardingProcedure,
  }),
  agripay: createTRPCRouter({
    createWallet: createWalletProcedure,
    getWallet: getWalletProcedure,
    fundWallet: fundWalletProcedure,
    withdrawFunds: withdrawFundsProcedure,
    getTransactions: getTransactionsProcedure,
    setPin: setPinProcedure,
    verifyPin: agripayVerifyPinProcedure,
    detectFraud: detectFraudProcedure,
  }),
  tradeguard: createTRPCRouter({
    holdReserve: tradeguardHoldReserveProcedure,
    releaseReserve: tradeguardReleaseReserveProcedure,
    refundReserve: tradeguardRefundReserveProcedure,
    getReserves: getReservesProcedure,
    submitProof: submitProofProcedure,
    verifyProof: verifyProofProcedure,
    raiseDispute: tradeguardRaiseDisputeProcedure,
    resolveDispute: resolveDisputeProcedure,
    getDisputes: getDisputesProcedure,
  }),
  settings: createTRPCRouter({
    getPreferences: getPreferencesProcedure,
    updatePreferences: updatePreferencesProcedure,
    enable2FA: enable2FAProcedure,
    verify2FA: verify2FAProcedure,
    changePhone: changePhoneProcedure,
  }),
  tracking: createTRPCRouter({
    getLiveLocation: getLiveLocationProcedure,
    updateDriverLocation: updateDriverLocationProcedure,
    addTip: addTipProcedure,
    addDeliveryInstructions: addDeliveryInstructionsProcedure,
    getETA: getETAProcedure,
  }),
  addresses: createTRPCRouter({
    getAddresses: getAddressesProcedure,
    addAddress: addAddressProcedure,
    updateAddress: updateAddressProcedure,
    deleteAddress: deleteAddressProcedure,
    setDefaultAddress: setDefaultAddressProcedure,
  }),
  boost: createTRPCRouter({
    createBoost: createBoostProcedure,
    getActiveBoosts: getActiveBoostsProcedure,
    getPackages: getBoostPackagesProcedure,
    cancelBoost: cancelBoostProcedure,
  }),
  farm: createTRPCRouter({
    createFarm: createFarmProcedure,
    getFarms: getFarmsProcedure,
    getDashboard: getFarmDashboardProcedure,
    addRecord: addFarmRecordProcedure,
    addTask: addFarmTaskProcedure,
    updateTask: updateFarmTaskProcedure,
    getAnalytics: getFarmAnalyticsProcedure,
  }),
});

export type AppRouter = typeof appRouter;