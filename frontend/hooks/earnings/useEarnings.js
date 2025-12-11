import { useState, useEffect, useCallback } from "react";
import { getRevenueAnalytics } from "@/lib/apiCalls/analytics/getRevenueAnalytics.apiCall";
import { toast } from "sonner";

/**
 * Custom hook for earnings data
 * @returns {Object} Earnings data and loading state
 */
export function useEarnings() {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("6months");

  const fetchEarnings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const endDate = new Date();
      const startDate = new Date();

      // Set date range based on selection
      switch (timeRange) {
        case "1month":
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case "3months":
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case "6months":
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case "1year":
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(startDate.getMonth() - 6);
      }

      const response = await getRevenueAnalytics(
        startDate.toISOString(),
        endDate.toISOString()
      );

      if (response.success) {
        setEarnings(response.data);
      } else {
        throw new Error(response.message || "Failed to load earnings");
      }
    } catch (error) {
      console.error("Error fetching earnings:", error);
      setError(error.message);
      toast.error("Failed to load earnings data");
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  return {
    earnings,
    loading,
    error,
    timeRange,
    setTimeRange,
    refetch: fetchEarnings,
  };
}
