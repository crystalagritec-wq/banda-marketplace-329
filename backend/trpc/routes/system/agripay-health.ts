import { publicProcedure } from "@/backend/trpc/create-context";

export const agripayHealthCheckProcedure = publicProcedure.query(async ({ ctx }) => {
  try {
    const startTime = Date.now();

    const [
      walletsCount,
      activeReserves,
      openDisputes,
      fraudAlerts,
      pendingPayouts,
      recentTransactions,
      cronJobStatus,
    ] = await Promise.all([
      ctx.supabase
        .from("agripay_wallets")
        .select("id", { count: "exact", head: true }),
      
      ctx.supabase
        .from("tradeguard_reserves")
        .select("id", { count: "exact", head: true })
        .eq("status", "held"),
      
      ctx.supabase
        .from("tradeguard_disputes")
        .select("id", { count: "exact", head: true })
        .eq("status", "open"),
      
      ctx.supabase
        .from("fraud_alerts")
        .select("id", { count: "exact", head: true })
        .eq("status", "open"),
      
      ctx.supabase
        .from("payout_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      
      ctx.supabase
        .from("wallet_transactions")
        .select("id", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 3600000).toISOString()),
      
      ctx.supabase.rpc("get_cron_job_status").then(res => res.data || []),
    ]);

    const responseTime = Date.now() - startTime;

    const health: {
      status: "healthy" | "degraded" | "unhealthy";
      timestamp: string;
      responseTime: number;
      services: any;
      cronJobs: any;
      alerts: { type: string; message: string; severity: string }[];
    } = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      responseTime,
      services: {
        database: {
          status: "operational" as const,
          responseTime,
        },
        agripay: {
          status: "operational" as const,
          totalWallets: walletsCount.count || 0,
          recentTransactions: recentTransactions.count || 0,
        },
        tradeguard: {
          status: "operational" as const,
          activeReserves: activeReserves.count || 0,
          openDisputes: openDisputes.count || 0,
        },
        fraud: {
          status: fraudAlerts.count && fraudAlerts.count > 10 ? "warning" as const : "operational" as const,
          openAlerts: fraudAlerts.count || 0,
        },
        payouts: {
          status: "operational" as const,
          pendingPayouts: pendingPayouts.count || 0,
        },
      },
      cronJobs: cronJobStatus,
      alerts: [] as { type: string; message: string; severity: string }[],
    };

    if (fraudAlerts.count && fraudAlerts.count > 10) {
      health.alerts.push({
        type: "fraud_detection",
        message: `${fraudAlerts.count} open fraud alerts require attention`,
        severity: "warning",
      });
    }

    if (openDisputes.count && openDisputes.count > 5) {
      health.alerts.push({
        type: "disputes",
        message: `${openDisputes.count} open disputes pending resolution`,
        severity: "info",
      });
    }

    if (activeReserves.count && activeReserves.count > 100) {
      health.alerts.push({
        type: "reserves",
        message: `${activeReserves.count} active reserves in escrow`,
        severity: "info",
      });
    }

    if (health.alerts.length > 0) {
      health.status = "degraded";
    }

    return {
      success: true,
      health,
    };
  } catch (error: any) {
    console.error("[AgriPay Health Check] Error:", error);
    
    return {
      success: false,
      health: {
        status: "unhealthy" as const,
        timestamp: new Date().toISOString(),
        responseTime: 0,
        services: {
          database: {
            status: "error" as const,
            responseTime: 0,
          },
          agripay: {
            status: "error" as const,
            totalWallets: 0,
            recentTransactions: 0,
          },
          tradeguard: {
            status: "error" as const,
            activeReserves: 0,
            openDisputes: 0,
          },
          fraud: {
            status: "error" as const,
            openAlerts: 0,
          },
          payouts: {
            status: "error" as const,
            pendingPayouts: 0,
          },
        },
        cronJobs: [],
        alerts: [
          {
            type: "system_error",
            message: error.message || "Health check failed",
            severity: "critical",
          },
        ],
      },
      error: error.message,
    };
  }
});
