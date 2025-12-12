"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, LogOut, Menu, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAuthStore from "@/store/authStore";
import { useRouter } from "next/navigation";
import UserDropdownMenu from "./UserDropDownMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import Image from "next/image";
import logo from "@/app/icon.png";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import NotificationBell from "@/components/common/NotificationBell";


export default function Header() {
  const { isAuthenticated, user, clearAuth, isLoading } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const isMobile = useIsMobile();


  useEffect(() => {
    
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    clearAuth();
    router.push("/");
  };

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  
  const showLoader = isInitializing || isLoading;

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b border-border shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-12">
            <Link href="/" className="flex items-center">
              <div className="w-10 h-10">
                <Image
                  src={logo}
                  alt="Logo"
                  width={20}
                  height={20}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="mt-2 text-2xl font-bold text-foreground">
                Mentora
              </span>
            </Link>

            <nav className="mt-2 hidden md:flex space-x-8">
              
              <Link
                href="/courses"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Courses
              </Link>
              <Link
                href="/help"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Help
              </Link>
            </nav>
          </div>

          <div className="hidden lg:flex items-center space-x-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for courses, instructors..."
                className="pl-10 w-80 bg-muted/50 border-border focus:bg-background transition-colors text-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchSubmit}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notification Bell - only for authenticated users (not admin) */}
            {!showLoader && isAuthenticated && user?.role !== "admin" && (
              <NotificationBell />
            )}

            {!isMobile && (
              <>
                {showLoader ? (
                  <div className="flex items-center justify-center w-[180px]">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : !isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    <Link href="/login">
                      <Button
                        variant="ghost"
                        className="font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link href="/sign-up">
                      <Button
                        variant="default"
                        className="font-medium cursor-pointer"
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <UserDropdownMenu
                    userName={user?.first_name + " " + user?.last_name}
                    userRole={user?.role}
                    userAvatarUrl={user?.Profile?.avatar_url}
                    onLogout={handleLogout}
                  />
                )}
              </>
            )}



          {isMobile && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-foreground"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          )}
          </div>
        </div>


        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 dark:border-neutral-800">
            <nav className="flex flex-col space-y-3 pt-4">
              {isAuthenticated && user && (
                <>
                  {user.role === "admin" || user.role === "instructor" ? (
                    <Link
                      href={`/dashboard/${user.role}`}
                      className="text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white font-medium px-2 py-2"
                    >
                      Dashboard
                    </Link>
                  ) : user.role === "student" ? (
                    <>
                      <Link
                        href="/profile"
                        className="text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white font-medium px-2 py-2"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/enrollments"
                        className="text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white font-medium px-2 py-2"
                      >
                        My courses
                      </Link>
                    </>
                  ) : null}
                </>
              )}
              <Link
                href="/courses"
                className="text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white font-medium px-2 py-2"
              >
                Courses
              </Link>
              <Link
                href="/about"
                className="text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white font-medium px-2 py-2"
              >
                About
              </Link>
              <Link
                href="/help"
                className="text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white font-medium px-2 py-2"
              >
                Help
              </Link>
              
              {showLoader ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !isAuthenticated ? (
                <div className="flex flex-col space-y-2">
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="text-center w-full font-medium text-muted-foreground bg-neutral-50 cursor-pointer"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button
                      variant="default"
                      className="text-center w-full font-medium text-white cursor-pointer"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
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