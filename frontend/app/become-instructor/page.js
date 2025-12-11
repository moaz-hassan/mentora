"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  DollarSign, 
  Award, 
  ArrowRight,
  Loader2,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { becomeInstructor } from "@/lib/apiCalls/users/becomeInstructor.apiCall";
import { toast } from "sonner";
import Cookies from "js-cookie";

export default function BecomeInstructorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleBecomeInstructor = async () => {
    setLoading(true);
    try {
      const response = await becomeInstructor();
      
      if (response.success) {
        setSuccess(true);
        toast.success(response.message);
        
        
        const userData = JSON.parse(Cookies.get("user") || "{}");
        userData.role = "instructor";
        Cookies.set("user", JSON.stringify(userData));
        
        
        setTimeout(() => {
          router.push("/instructor/dashboard");
        }, 2000);
      } else {
        toast.error(response.message || "Failed to become instructor");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: BookOpen,
      title: "Create Courses",
      description: "Design and publish your own courses to share your expertise with learners worldwide."
    },
    {
      icon: Users,
      title: "Build Your Audience",
      description: "Connect with students who are eager to learn from your unique knowledge and experience."
    },
    {
      icon: DollarSign,
      title: "Earn Revenue",
      description: "Monetize your expertise by selling courses and building a sustainable income stream."
    },
    {
      icon: Award,
      title: "Establish Authority",
      description: "Build your personal brand and become a recognized expert in your field."
    }
  ];

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome, Instructor! 🎉
          </h1>
          <p className="text-muted-foreground">
            Your account has been upgraded. Redirecting you to your instructor dashboard...
          </p>
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-16">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Start Your Teaching Journey
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Share Your Knowledge,
              <br />
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Inspire Learners
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join our community of instructors and transform lives through education. 
              Create courses, build your audience, and make an impact.
            </p>

            <div className="pt-6">
              <Button
                onClick={handleBecomeInstructor}
                disabled={loading}
                size="lg"
                className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/25"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Become an Instructor
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Why Become an Instructor?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Unlock new opportunities and make a difference in people&apos;s lives
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 rounded-3xl p-8 md:p-12 text-center border border-primary/20">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Ready to Start Teaching?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Take the first step towards becoming an instructor. It only takes a moment to upgrade your account.
          </p>
          <Button
            onClick={handleBecomeInstructor}
            disabled={loading}
            size="lg"
            className="h-12 px-8 font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>

      {}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-center">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Note:</strong> Only students who are not enrolled in any courses can become instructors. 
            If you have active course enrollments, you&apos;ll need to complete or unenroll from them first.
          </p>
        </div>
      </div>
    </div>
  );
}
