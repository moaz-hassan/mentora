"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";


export function AnalyticsCard({
  title,
  value,
  change,
  changeLabel = "vs last period",
  icon: Icon,
  loading = false,
  className,
  format = "number",
}) {
  const formatValue = (val) => {
    if (val === null || val === undefined) return "-";
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      case "percent":
        return `${val}%`;
      default:
        return new Intl.NumberFormat("en-US").format(val);
    }
  };

  const getTrendIcon = () => {
    if (change === 0 || change === null || change === undefined) {
      return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
    return change > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getChangeColor = () => {
    if (change === 0 || change === null || change === undefined) {
      return "text-muted-foreground";
    }
    return change > 0 ? "text-green-500" : "text-red-500";
  };

  if (loading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {change !== undefined && change !== null && (
          <div className="flex items-center gap-1 mt-1">
            {getTrendIcon()}
            <span className={cn("text-xs font-medium", getChangeColor())}>
              {change > 0 ? "+" : ""}
              {change.toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">{changeLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AnalyticsCard;
