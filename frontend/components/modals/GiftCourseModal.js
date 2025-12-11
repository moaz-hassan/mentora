"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Gift, Loader2, Mail, MessageSquare } from "lucide-react";
import { giftCourse } from "@/lib/apiCalls/enrollments/giftCourse.apiCall";
import { toast } from "sonner";

export default function GiftCourseModal({ isOpen, onClose, courseId, courseTitle }) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!recipientEmail.trim()) {
      toast.error("Please enter recipient's email");
      return;
    }

    setLoading(true);
    try {
      const response = await giftCourse(courseId, recipientEmail, personalMessage);
      
      if (response.success) {
        toast.success(response.message || "Course gifted successfully!");
        setRecipientEmail("");
        setPersonalMessage("");
        onClose();
      } else {
        toast.error(response.message || "Failed to gift course");
      }
    } catch (error) {
      console.error("Error gifting course:", error);
      toast.error("An error occurred while gifting the course");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setRecipientEmail("");
      setPersonalMessage("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Gift This Course
          </DialogTitle>
          <DialogDescription>
            Send <strong>{courseTitle}</strong> as a gift to a friend. They'll receive an email with access to the course.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="recipientEmail" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Recipient's Email
            </Label>
            <Input
              id="recipientEmail"
              type="email"
              placeholder="friend@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              disabled={loading}
              required
            />
            <p className="text-xs text-muted-foreground">
              The recipient must have a registered account.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="personalMessage" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Personal Message (Optional)
            </Label>
            <Textarea
              id="personalMessage"
              placeholder="Write a personal message to include in the gift email..."
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              disabled={loading}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending Gift...
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4 mr-2" />
                  Send Gift
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
