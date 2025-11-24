import "./globals.css";
import { Inter } from "next/font/google";
import ToastProvider from "@/components/ToastProvider";
import { NotificationToastContainer } from "@/components/NotificationToast";


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "E-Learn - Online Learning Platform",
  description: "Learn new skills with our comprehensive online courses",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider />
        <NotificationToastContainer />
        {children}
      </body>
    </html>
  );
}
