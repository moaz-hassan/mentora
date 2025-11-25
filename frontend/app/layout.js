import "./globals.css";
import { Inter } from "next/font/google";
import ToastProvider from "@/components/ToastProvider";
import { NotificationToastContainer } from "@/components/NotificationToast";
import FloatingChatWidget from "@/components/FloatingChatWidget";
import { ThemeProvider } from "@/components/ThemeProvider";


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "E-Learn - Online Learning Platform",
  description: "Learn new skills with our comprehensive online courses",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <ToastProvider />
          <NotificationToastContainer />
          {children}
          <FloatingChatWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
