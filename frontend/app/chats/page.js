import { MessageSquare } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Select a chat to start messaging</h3>
      <p className="max-w-sm">
        Choose a conversation from the sidebar or join a course discussion to start chatting.
      </p>
    </div>
  );
}
