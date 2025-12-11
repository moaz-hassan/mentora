"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus, Sparkles, Clock } from "lucide-react";

export default function PaymentMethodsTab() {
  return (
    <div className="space-y-6">
      <Card className="border bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            Payment Methods
          </CardTitle>
          <CardDescription>Manage your payment options for course purchases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {}
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <CreditCard className="h-10 w-10 text-primary/60" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>

            {}
            <div className="space-y-2 max-w-sm">
              <h3 className="text-lg font-semibold text-foreground flex items-center justify-center gap-2">
                Coming Soon
                <Sparkles className="h-4 w-4 text-amber-500" />
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We're working on adding payment methods management. Soon you'll be able to save cards and manage your payment options here.
              </p>
            </div>

            {}
            <Button disabled variant="outline" className="mt-6 gap-2">
              <Plus className="h-4 w-4" />
              Add Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
