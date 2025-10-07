import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Stack, router } from "expo-router";
import { trpc } from "@/lib/trpc";
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Shield, Wallet, TrendingUp } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SystemTestScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const healthQuery = trpc.system.agripayHealth.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await healthQuery.refetch();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "operational":
        return "#10b981";
      case "degraded":
      case "warning":
        return "#f59e0b";
      case "unhealthy":
      case "error":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "operational":
        return CheckCircle;
      case "degraded":
      case "warning":
        return AlertCircle;
      case "unhealthy":
      case "error":
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  if (healthQuery.isLoading && !healthQuery.data) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: "System Health Check" }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Running health checks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const health = healthQuery.data?.health;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "System Health Check",
          headerRight: () => (
            <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
              <RefreshCw size={20} color="#10b981" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {health && (
          <>
            <View style={styles.overviewCard}>
              <View style={styles.statusHeader}>
                {React.createElement(getStatusIcon(health.status), {
                  size: 48,
                  color: getStatusColor(health.status),
                })}
                <Text
                  style={[
                    styles.statusTitle,
                    { color: getStatusColor(health.status) },
                  ]}
                >
                  {health.status.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.timestamp}>
                Last checked: {new Date(health.timestamp).toLocaleString()}
              </Text>
              <Text style={styles.responseTime}>
                Response time: {health.responseTime}ms
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Services Status</Text>

              <ServiceCard
                icon={Database}
                title="Database"
                status={health.services.database.status}
                details={`Response: ${health.services.database.responseTime}ms`}
              />

              <ServiceCard
                icon={Wallet}
                title="AgriPay Wallet System"
                status={health.services.agripay.status}
                details={`${health.services.agripay.totalWallets} wallets | ${health.services.agripay.recentTransactions} recent transactions`}
              />

              <ServiceCard
                icon={Shield}
                title="TradeGuard Escrow"
                status={health.services.tradeguard.status}
                details={`${health.services.tradeguard.activeReserves} active reserves | ${health.services.tradeguard.openDisputes} open disputes`}
              />

              <ServiceCard
                icon={AlertCircle}
                title="Fraud Detection"
                status={health.services.fraud.status}
                details={`${health.services.fraud.openAlerts} open alerts`}
              />

              <ServiceCard
                icon={TrendingUp}
                title="Payout System"
                status={health.services.payouts.status}
                details={`${health.services.payouts.pendingPayouts} pending payouts`}
              />
            </View>

            {health.cronJobs && health.cronJobs.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cron Jobs</Text>
                {health.cronJobs.map((job: any, index: number) => (
                  <View key={index} style={styles.cronJobCard}>
                    <Text style={styles.cronJobName}>{job.jobname}</Text>
                    <Text style={styles.cronJobSchedule}>
                      Schedule: {job.schedule}
                    </Text>
                    <Text style={styles.cronJobLastRun}>
                      Last run: {job.last_run ? new Date(job.last_run).toLocaleString() : "Never"}
                    </Text>
                    <View
                      style={[
                        styles.cronJobStatus,
                        {
                          backgroundColor: job.active
                            ? "#10b98120"
                            : "#ef444420",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.cronJobStatusText,
                          { color: job.active ? "#10b981" : "#ef4444" },
                        ]}
                      >
                        {job.active ? "Active" : "Inactive"}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {health.alerts && health.alerts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>System Alerts</Text>
                {health.alerts.map((alert: any, index: number) => (
                  <View
                    key={index}
                    style={[
                      styles.alertCard,
                      {
                        borderLeftColor:
                          alert.severity === "critical"
                            ? "#ef4444"
                            : alert.severity === "warning"
                            ? "#f59e0b"
                            : "#3b82f6",
                      },
                    ]}
                  >
                    <Text style={styles.alertType}>{alert.type}</Text>
                    <Text style={styles.alertMessage}>{alert.message}</Text>
                    <Text
                      style={[
                        styles.alertSeverity,
                        {
                          color:
                            alert.severity === "critical"
                              ? "#ef4444"
                              : alert.severity === "warning"
                              ? "#f59e0b"
                              : "#3b82f6",
                        },
                      ]}
                    >
                      {alert.severity.toUpperCase()}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push("/wallet")}
              >
                <Wallet size={20} color="#fff" />
                <Text style={styles.actionButtonText}>View Wallet</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push("/disputes")}
              >
                <Shield size={20} color="#fff" />
                <Text style={styles.actionButtonText}>View Disputes</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {healthQuery.error && (
          <View style={styles.errorCard}>
            <XCircle size={48} color="#ef4444" />
            <Text style={styles.errorTitle}>Health Check Failed</Text>
            <Text style={styles.errorMessage}>
              {healthQuery.error.message}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => healthQuery.refetch()}
            >
              <RefreshCw size={16} color="#fff" />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ServiceCard({
  icon: Icon,
  title,
  status,
  details,
}: {
  icon: any;
  title: string;
  status: string;
  details: string;
}) {
  const statusColor =
    status === "operational"
      ? "#10b981"
      : status === "warning"
      ? "#f59e0b"
      : "#ef4444";

  return (
    <View style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <Icon size={24} color={statusColor} />
        <Text style={styles.serviceTitle}>{title}</Text>
      </View>
      <View
        style={[
          styles.serviceStatus,
          { backgroundColor: `${statusColor}20` },
        ]}
      >
        <Text style={[styles.serviceStatusText, { color: statusColor }]}>
          {status.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.serviceDetails}>{details}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
  },
  refreshButton: {
    padding: 8,
  },
  overviewCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    alignItems: "center",
    gap: 12,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
  },
  timestamp: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 12,
  },
  responseTime: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 12,
  },
  serviceCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  serviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
    flex: 1,
  },
  serviceStatus: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  serviceStatusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  serviceDetails: {
    fontSize: 14,
    color: "#6b7280",
  },
  cronJobCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cronJobName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#111827",
    marginBottom: 4,
  },
  cronJobSchedule: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  cronJobLastRun: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  cronJobStatus: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cronJobStatusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  alertCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  alertType: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#111827",
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  alertSeverity: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  actionButton: {
    backgroundColor: "#10b981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  errorCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#ef4444",
    marginTop: 12,
  },
  errorMessage: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: "#10b981",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600" as const,
  },
});
