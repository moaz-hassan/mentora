"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, UserCircle, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, useAuthActions } from "@/hooks/useAuthStore";

export default function Header() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { clearAuth } = useAuthActions();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    clearAuth();
    // Redirect to home
    window.location.href = "/";
  };

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-12">
            <Link
              href="/"
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">LearnHub</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-8">
              <Link
                href="/categories"
                className="text-gray-700 hover:text-gray-900 transition-colors font-medium"
              >
                Categories
              </Link>
              <Link
                href="/courses"
                className="text-gray-700 hover:text-gray-900 transition-colors font-medium"
              >
                Courses
              </Link>
              <Link
                href="/instructors"
                className="text-gray-700 hover:text-gray-900 transition-colors font-medium"
              >
                Instructors
              </Link>
              <Link
                href="/for-business"
                className="text-gray-700 hover:text-gray-900 transition-colors font-medium"
              >
                For Business
              </Link>
            </nav>
          </div>

          {/* Right side - Desktop */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search for courses, instructors..."
                className="pl-10 w-80 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>

            <Link href="/teach" className="text-gray-700 hover:text-gray-900 font-medium">
              Teach on LearnHub
            </Link>

            <Button variant="ghost" className="text-gray-700">
              <UserCircle className="h-5 w-5 mr-2" />
              Sign In
            </Button>

            {/* Auth Section */}
            {!isLoading && !isAuthenticated ? (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="font-medium text-gray-700">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="bg-gray-900 hover:bg-gray-800 text-white font-medium">
                    Sign Up
                  </Button>
                </Link>
              </>
            ) : (
              <>
                {user && (
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name || user.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.role || "Student"}
                      </p>
                    </div>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:text-red-600"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-gray-200 hover:border-gray-900"
                  >
                    <UserCircle className="h-6 w-6 text-gray-900" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-3 pt-4">
              <Link
                href="/courses"
                className="text-gray-600 hover:text-gray-900 font-medium px-2 py-2"
              >
                Courses
              </Link>
              <Link
                href="/for-instructors"
                className="text-gray-600 hover:text-gray-900 font-medium px-2 py-2"
              >
                For Instructors
              </Link>
              <Link
                href="/about"
                className="text-gray-600 hover:text-gray-900 font-medium px-2 py-2"
              >
                About
              </Link>
              {!isAuthenticated ? (
                <>
                  <Link href="/login" className="w-full">
                    <Button variant="ghost" className="w-full justify-start">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/sign-up" className="w-full">
                    <Button className="w-full bg-linear-to-r from-indigo-600 to-purple-600">
                      Sign Up
                    </Button>
                  </Link>
                </>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
