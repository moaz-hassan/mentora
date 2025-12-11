"use client";
import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react'; 
import { useRouter } from 'next/navigation'; 

export default function NotFound() {
  const router = useRouter(); 

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {}
        <div className="mb-8">
          <div className="text-9xl font-bold text-gray-300 mb-4">404</div>
          <div className="w-32 h-1 bg-linear-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
        </div>

        {}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            The page you're looking for seems to have wandered off. Don't worry, even the best explorers sometimes take a wrong turn.
          </p>
          {}
          <p className="text-gray-500 mt-4 text-sm">
            You will be automatically redirected to the homepage in 5 seconds.
          </p>
        </div>

        {}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors group"
          >
            <Home className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Back to Home
          </Link>
          
          <div className="flex gap-3">
            <Link
              href="/products"
              className="flex-1 inline-flex items-center justify-center border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              <Search className="w-4 h-4 mr-2" />
              Browse Products
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="flex-1 inline-flex items-center justify-center border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>

        {}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            Need help? Contact our{' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-800 underline">
              support team
            </Link>
          </p>
        </div>

        {}
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-100 rounded-full opacity-50 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-purple-100 rounded-full opacity-50 animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-20 w-12 h-12 bg-pink-100 rounded-full opacity-50 animate-pulse delay-500"></div>
      </div>
    </div>
  );
}