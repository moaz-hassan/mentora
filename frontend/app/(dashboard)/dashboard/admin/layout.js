import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import NotFound from "@/app/not-found";
import getUserDataOnServer from "@/lib/apiCalls/auth/getUserDataOnServer.apiCall";
import AuthProvider from "@/components/AuthProvider";

export const metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for managing the platform",
};

export default async function AdminLayout({ children }) {
  const response = await getUserDataOnServer();
  
  // Check if there's an error in the response
  if (!response || response.error || !response.success) {
    return <NotFound />;
  }
  
  const userData = response?.data;
  
  // Check if user data exists and user is an admin
  if (!userData || userData.role !== "admin") {
    return <NotFound />;
  }
  
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar variant="inset" user={userData} />
      <SidebarInset>
        <SiteHeader user={userData} />
        <AuthProvider>
          {children}
        </AuthProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}