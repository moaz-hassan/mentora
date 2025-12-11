"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useAuthStore from "@/store/authStore";
import { useSettings } from "@/hooks/profile/useSettings";
import { useChats } from "@/hooks/chat/useChats";
import ProfileHeader from "@/components/pages/profile/ProfileHeader";
import ProfileTabs from "@/components/pages/profile/ProfileTabs";
import ChatSidebar from "@/components/pages/profile/chat/ChatSidebar";
import ProfilePageSkeleton from "@/components/pages/profile/ProfilePageSkeleton";
import ProfileTab from "@/components/pages/profile/tabs/ProfileTab";
import MyLearningTab from "@/components/pages/profile/tabs/MyLearningTab";
import AccountSettingsTab from "@/components/pages/profile/tabs/AccountSettingsTab";
import PaymentMethodsTab from "@/components/pages/profile/tabs/PaymentMethodsTab";
import getUserEnrollments from "@/lib/apiCalls/enrollments/enrollments.apiCall";

const VALID_TABS = ["profile", "my-learning", "account-settings", "payment-methods"];

function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  
  const tabFromUrl = searchParams.get("tab");
  const initialTab = VALID_TABS.includes(tabFromUrl) ? tabFromUrl : "profile";
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [certificateCount, setCertificateCount] = useState(0);
  
  const { loading, userData, profileData, handleUserChange, handleProfileChange, handleSocialLinkChange, updateAvatar, refetch } = useSettings();
  const { chatRooms, loading: chatsLoading } = useChats();

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && VALID_TABS.includes(tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", newTab);
    router.push(url.pathname + url.search, { scroll: false });
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getUserEnrollments();
        if (response.success) {
          const enrollments = response.data || [];
          setEnrollmentCount(enrollments.length);
          const completed = enrollments.filter(e => e.progress === 100 || e.completed_at);
          setCertificateCount(completed.length);
        }
      } catch (error) {
        console.error("Error fetching enrollment stats:", error);
      }
    };
    
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    
    if (isAuthenticated && user?.role) {
      if (user.role === "admin") {
        router.push("/dashboard/admin");
        return;
      }
      if (user.role === "instructor") {
        router.push("/dashboard/instructor");
        return;
      }
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (user?.role && user.role !== "student") {
    return null;
  }

  if (loading) {
    return <ProfilePageSkeleton />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <ProfileTab
            userData={userData}
            profileData={profileData}
            onUserChange={handleUserChange}
            onProfileChange={handleProfileChange}
            onSocialLinkChange={handleSocialLinkChange}
            onAvatarUpdate={updateAvatar}
            onRefetch={refetch}
          />
        );
      case "my-learning":
        return <MyLearningTab />;
      case "account-settings":
        return <AccountSettingsTab userData={userData} />;
      case "payment-methods":
        return <PaymentMethodsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-6">
            <ProfileHeader
              user={userData}
              profile={profileData}
              enrollmentCount={enrollmentCount}
              certificateCount={certificateCount}
            />
            
            <ProfileTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
            
            <div className="animate-fade-in">
              {renderTabContent()}
            </div>
          </div>

          {/* Chat Sidebar - Desktop */}
          <div className="hidden lg:block w-80 shrink-0">
            <ChatSidebar
              chats={chatRooms}
              loading={chatsLoading}
            />
          </div>
        </div>

        {/* Chat Sidebar - Mobile (Collapsible) */}
        <div className="lg:hidden mt-6">
          <ChatSidebar
            chats={chatRooms}
            loading={chatsLoading}
            collapsible
          />
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfilePageSkeleton />}>
      <ProfilePageContent />
    </Suspense>
  );
}
