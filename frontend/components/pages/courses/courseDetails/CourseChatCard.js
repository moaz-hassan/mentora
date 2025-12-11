"use client";

import { MessageCircle } from "lucide-react";

export default function CourseChatCard({ isEnrolled }) {
  return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-600 dark:from-indigo-900 dark:to-violet-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group">
      {}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors duration-500" />
      <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-black/10 rounded-full blur-xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold">Course Community</h3>
        </div>

        <p className="text-indigo-100 text-sm leading-relaxed">
          {isEnrolled 
            ? "You're part of the community! Access the chat room from your enrollment page to connect with fellow students."
            : "Get access to the exclusive student community. Connect with peers and instructors when you enroll."}
        </p>
      </div>
    </div>
  );
}


