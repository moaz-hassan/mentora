import React from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * ErrorState - Error display with retry functionality
 * Shows error message and provides options to retry or go back
 */
const ErrorState = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-background p-4">
      <div className="bg-card border rounded-lg p-8 max-w-md w-full text-center shadow-lg">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-destructive/10 rounded-full">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
        </div>
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">
          {message || "Failed to load course content. Please try again."}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <Button onClick={onRetry} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          )}
          <Button variant="outline" asChild className="gap-2">
            <Link href="/enrollments">
              <ArrowLeft className="w-4 h-4" />
              Back to Enrollments
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
