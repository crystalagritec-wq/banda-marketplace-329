import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { trpc } from "@/lib/trpc";
import {
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Star,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react-native";

type RequestStatus = "pending" | "accepted" | "in_progress" | "completed" | "cancelled";

export default function ServiceRequestsManagementEnhanced() {
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus | "all">("all");
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = trpc.serviceProviders.getServiceRequestsEnhanced.useQuery({
    status: selectedStatus === "all" ? undefined : selectedStatus,
    limit: 50,
    offset: 0,
  });

  const updateStatusMutation = trpc.serviceProviders.updateRequestStatusEnhanced.useMutation({
    onSuccess: () => {
      Alert.alert("Success", "Request status updated successfully");
      refetch();
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });



  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleStatusUpdate = (requestId: string, status: Exclude<RequestStatus, "pending">) => {
    Alert.alert(
      "Update Status",
      `Are you sure you want to mark this request as ${status}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            updateStatusMutation.mutate({ requestId, status });
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FFA500";
      case "accepted":
        return "#4169E1";
      case "in_progress":
        return "#9370DB";
      case "completed":
        return "#32CD32";
      case "cancelled":
        return "#DC143C";
      default:
        return "#808080";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock size={16} color="#FFF" />;
      case "accepted":
      case "in_progress":
        return <Clock size={16} color="#FFF" />;
      case "completed":
        return <CheckCircle size={16} color="#FFF" />;
      case "cancelled":
        return <XCircle size={16} color="#FFF" />;
      default:
        return <Clock size={16} color="#FFF" />;
    }
  };

  const statusFilters: { label: string; value: RequestStatus | "all" }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Accepted", value: "accepted" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Service Requests",
          headerStyle: { backgroundColor: "#10B981" },
          headerTintColor: "#FFF",
        }}
      />

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterButton,
                selectedStatus === filter.value && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedStatus(filter.value)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedStatus === filter.value && styles.filterButtonTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {data?.requests && data.requests.length > 0 ? (
            data.requests.map((request: any) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <View style={styles.customerInfo}>
                    {request.users?.profile_photo ? (
                      <Image
                        source={{ uri: request.users.profile_photo }}
                        style={styles.customerAvatar}
                      />
                    ) : (
                      <View style={[styles.customerAvatar, styles.customerAvatarPlaceholder]}>
                        <Text style={styles.customerAvatarText}>
                          {request.users?.full_name?.charAt(0) || "?"}
                        </Text>
                      </View>
                    )}
                    <View style={styles.customerDetails}>
                      <Text style={styles.customerName}>{request.users?.full_name || "Unknown"}</Text>
                      <View style={styles.customerContact}>
                        <Phone size={12} color="#666" />
                        <Text style={styles.customerPhone}>{request.users?.phone || "N/A"}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                    {getStatusIcon(request.status)}
                    <Text style={styles.statusText}>{request.status}</Text>
                  </View>
                </View>

                <View style={styles.requestDetails}>
                  {request.scheduled_date && (
                    <View style={styles.detailRow}>
                      <Calendar size={16} color="#666" />
                      <Text style={styles.detailText}>
                        {new Date(request.scheduled_date).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                  {request.location && (
                    <View style={styles.detailRow}>
                      <MapPin size={16} color="#666" />
                      <Text style={styles.detailText}>{request.location}</Text>
                    </View>
                  )}
                  {request.description && (
                    <Text style={styles.description}>{request.description}</Text>
                  )}
                </View>

                {request.service_proofs && request.service_proofs.length > 0 && (
                  <View style={styles.proofSection}>
                    <Text style={styles.proofTitle}>Service Proof:</Text>
                    <Image
                      source={{ uri: request.service_proofs[0].image_url }}
                      style={styles.proofImage}
                    />
                  </View>
                )}

                {request.service_ratings && request.service_ratings.length > 0 && (
                  <View style={styles.ratingSection}>
                    <View style={styles.ratingHeader}>
                      <Star size={16} color="#FFD700" fill="#FFD700" />
                      <Text style={styles.ratingText}>
                        {request.service_ratings[0].rating}/5
                      </Text>
                    </View>
                    {request.service_ratings[0].review && (
                      <Text style={styles.reviewText}>{request.service_ratings[0].review}</Text>
                    )}
                  </View>
                )}

                <View style={styles.actionButtons}>
                  {request.status === "pending" && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.acceptButton]}
                        onPress={() => handleStatusUpdate(request.id, "accepted")}
                      >
                        <CheckCircle size={16} color="#FFF" />
                        <Text style={styles.actionButtonText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleStatusUpdate(request.id, "cancelled")}
                      >
                        <XCircle size={16} color="#FFF" />
                        <Text style={styles.actionButtonText}>Reject</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {request.status === "accepted" && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.startButton]}
                      onPress={() => handleStatusUpdate(request.id, "in_progress")}
                    >
                      <Clock size={16} color="#FFF" />
                      <Text style={styles.actionButtonText}>Start Service</Text>
                    </TouchableOpacity>
                  )}
                  {request.status === "in_progress" && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.completeButton]}
                      onPress={() => {
                        Alert.alert(
                          "Upload Proof",
                          "Please upload proof of service completion",
                          [
                            { text: "Cancel", style: "cancel" },
                            {
                              text: "Upload",
                              onPress: () => {
                                Alert.alert("Info", "Please implement image upload functionality");
                              },
                            },
                          ]
                        );
                      }}
                    >
                      <Upload size={16} color="#FFF" />
                      <Text style={styles.actionButtonText}>Complete & Upload Proof</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No service requests found</Text>
              <Text style={styles.emptySubtext}>
                Requests will appear here when customers book your services
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  filterContainer: {
    backgroundColor: "#FFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#10B981",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600" as const,
  },
  filterButtonTextActive: {
    color: "#FFF",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  requestCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  customerAvatarPlaceholder: {
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  customerAvatarText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700" as const,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  customerContact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statusText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600" as const,
    textTransform: "capitalize" as const,
  },
  requestDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
  },
  description: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
    marginTop: 8,
  },
  proofSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  proofTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 8,
  },
  proofImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  ratingSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  ratingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  reviewText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic" as const,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: "#10B981",
  },
  rejectButton: {
    backgroundColor: "#EF4444",
  },
  startButton: {
    backgroundColor: "#3B82F6",
  },
  completeButton: {
    backgroundColor: "#8B5CF6",
  },
  actionButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
