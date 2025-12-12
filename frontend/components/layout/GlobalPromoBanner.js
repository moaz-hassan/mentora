'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { X, Gift, Clock } from 'lucide-react';

export default function GlobalPromoBanner() {
  const [promo, setPromo] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const pathname = usePathname();

  // Hide banner on dashboard pages
  const isDashboard = pathname?.startsWith('/dashboard');
  
  useEffect(() => {
    // Don't fetch if on dashboard
    if (isDashboard) return;
    
    // Check if user dismissed the banner in this session
    const isDismissedSession = sessionStorage.getItem('promo-banner-dismissed');
    if (isDismissedSession) {
      setDismissed(true);
      return;
    }

    // Fetch active global coupon
    const fetchPromo = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/coupons/global-promo`);
        const data = await res.json();
        if (data.success && data.data) {
          setPromo(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch promo:', error);
      }
    };

    fetchPromo();
  }, []);

  // Update countdown timer
  useEffect(() => {
    if (!promo?.expiresAt) return;

    const updateTimer = () => {
      const now = new Date();
      const expires = new Date(promo.expiresAt);
      const diff = expires - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m left`);
      } else {
        setTimeLeft(`${minutes}m left`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [promo]);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('promo-banner-dismissed', 'true');
  };

  if (isDashboard || dismissed || !promo) return null;

  const discountText = promo.discountType === 'percentage' 
    ? `${promo.discountValue}% OFF` 
    : `$${promo.discountValue} OFF`;

  return (
    <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white py-2.5 px-4 relative animate-gradient-x">
      <div className="container mx-auto flex items-center justify-center gap-4 text-sm md:text-base">
        <Gift className="w-5 h-5 animate-bounce" />
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="font-bold">{discountText}</span>
          <span>on all courses!</span>
          <span className="hidden sm:inline">Use code:</span>
          <code className="bg-white/20 px-2 py-0.5 rounded font-mono font-bold tracking-wider">
            {promo.code}
          </code>
        </div>
        <div className="hidden md:flex items-center gap-1 text-white/80">
          <Clock className="w-4 h-4" />
          <span className="text-xs">{timeLeft}</span>
        </div>
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
          aria-label="Dismiss promotion"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
