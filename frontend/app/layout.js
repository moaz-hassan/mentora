import "./globals.css";
import { Inter } from "next/font/google";
import ToastProvider from "@/components/common/ToastProvider";
import { NotificationToastContainer } from "@/components/notifications/NotificationToast";
import FloatingChatWidget from "@/components/pages/chats/FloatingChatWidget";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Mentora",
  description: "Learn new skills with our comprehensive online courses",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider />
            <NotificationToastContainer />
            {children}
            <FloatingChatWidget />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
