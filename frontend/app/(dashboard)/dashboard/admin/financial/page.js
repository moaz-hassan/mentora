"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  DollarSign,
  CreditCard,
  Wallet,
  TrendingUp,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  AnalyticsCard,
  ChartWrapper,
  DataTable,
  FilterBar,
  ExportButton,
} from "@/components/admin/shared";
import * as financialAPI from "@/lib/apiCalls/admin/financial.apiCall";


const revenueChartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
  payouts: { label: "Payouts", color: "hsl(var(--chart-2))" },
};

export default function FinancialDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [overview, setOverview] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  
  
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [overviewRes, revenueRes, payoutsRes, transactionsRes] = await Promise.all([
        financialAPI.getOverview(),
        financialAPI.getRevenue(),
        financialAPI.getPayouts(),
        financialAPI.getTransactions({ limit: 50 }),
      ]);

      if (overviewRes.success) setOverview(overviewRes.data);
      if (revenueRes.success) setRevenueData(revenueRes.data?.trend || []);
      if (payoutsRes.success) setPayouts(payoutsRes.data?.payouts || []);
      if (transactionsRes.success) setTransactions(transactionsRes.data?.transactions || []);
    } catch (error) {
      console.error("Error fetching financial data:", error);
      toast.error("Failed to load financial data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    toast.success("Data refreshed");
  };

  const handleProcessPayout = async () => {
    if (!selectedPayout) return;

    setProcessing(true);
    try {
      const res = await financialAPI.processPayout(selectedPayout.id);
      if (res.success) {
        toast.success("Payout processed successfully");
        setProcessDialogOpen(false);
        setSelectedPayout(null);
        fetchData();
      }
    } catch (error) {
      toast.error(error.message || "Failed to process payout");
    } finally {
      setProcessing(false);
    }
  };

  const handleExport = async (format) => {
    try {
      await financialAPI.export({ format });
      toast.success(`Export started - ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Export failed");
    }
  };

  const openProcessDialog = (payout) => {
    setSelectedPayout(payout);
    setProcessDialogOpen(true);
  };

  
  const payoutColumns = [
    {
      accessorKey: "instructorName",
      header: "Instructor",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.instructorName}</div>
      ),
    },
    {
      accessorKey: "totalEarnings",
      header: "Total Earnings",
      cell: ({ row }) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(row.original.totalEarnings || 0),
    },
    {
      accessorKey: "pendingAmount",
      header: "Pending",
      cell: ({ row }) => (
        <span className="text-yellow-600 font-medium">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(row.original.pendingAmount || 0)}
        </span>
      ),
    },
    {
      accessorKey: "paidAmount",
      header: "Paid",
      cell: ({ row }) => (
        <span className="text-green-600">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(row.original.paidAmount || 0)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const variants = {
          pending: "secondary",
          processing: "outline",
          completed: "default",
        };
        return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) =>
        row.original.pendingAmount > 0 && (
          <Button
            size="sm"
            onClick={() => openProcessDialog(row.original)}
          >
            Process Payout
          </Button>
        ),
    },
  ];

  
  const transactionColumns = [
    {
      accessorKey: "transactionId",
      header: "Transaction ID",
      cell: ({ row }) => (
        <code className="text-xs">{row.original.transactionId}</code>
      ),
    },
    {
      accessorKey: "studentName",
      header: "Student",
    },
    {
      accessorKey: "courseName",
      header: "Course",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate">{row.original.courseName}</div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(row.original.amount || 0),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const icons = {
          completed: <CheckCircle className="h-4 w-4 text-green-500" />,
          pending: <Clock className="h-4 w-4 text-yellow-500" />,
          failed: <XCircle className="h-4 w-4 text-red-500" />,
        };
        return (
          <div className="flex items-center gap-2">
            {icons[status]}
            <span className="capitalize">{status}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) =>
        row.original.createdAt
          ? format(new Date(row.original.createdAt), "MMM d, yyyy HH:mm")
          : "-",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Financial Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track revenue and manage payouts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
          <ExportButton onExport={handleExport} formats={["csv", "pdf"]} />
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Total Revenue"
          value={overview?.totalRevenue || 0}
          change={overview?.revenueChange}
          changeLabel="vs last month"
          icon={DollarSign}
          format="currency"
          loading={loading}
        />
        <AnalyticsCard
          title="Pending Payouts"
          value={overview?.pendingPayouts || 0}
          icon={Clock}
          format="currency"
          loading={loading}
        />
        <AnalyticsCard
          title="Completed Payouts"
          value={overview?.completedPayouts || 0}
          icon={Wallet}
          format="currency"
          loading={loading}
        />
        <AnalyticsCard
          title="Platform Commission"
          value={overview?.platformCommission || 0}
          icon={TrendingUp}
          format="currency"
          loading={loading}
        />
      </div>

      {}
      <ChartWrapper
        title="Revenue vs Payouts"
        description="Monthly comparison of revenue and instructor payouts"
        type="bar"
        data={revenueData}
        config={revenueChartConfig}
        dataKeys={["revenue", "payouts"]}
        xAxisKey="month"
        loading={loading}
        height={300}
      />

      {}
      <Tabs defaultValue="payouts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payouts">Instructor Payouts</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle>Instructor Payouts</CardTitle>
              <CardDescription>
                Manage instructor earnings and process payouts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={payoutColumns}
                data={payouts}
                loading={loading}
                searchKey="instructorName"
                searchPlaceholder="Search instructors..."
                pageSize={10}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                All payment transactions on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={transactionColumns}
                data={transactions}
                loading={loading}
                searchKey="transactionId"
                searchPlaceholder="Search by transaction ID..."
                pageSize={15}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {}
      <AlertDialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Process Payout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to process a payout of{" "}
              <span className="font-semibold">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(selectedPayout?.pendingAmount || 0)}
              </span>{" "}
              to {selectedPayout?.instructorName}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleProcessPayout} disabled={processing}>
              {processing ? "Processing..." : "Process Payout"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
