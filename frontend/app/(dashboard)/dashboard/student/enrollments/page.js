"use client";

import { useEffect, useState } from "react";
import EnrollmentCard from "@/components/student/EnrollmentCard";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BookOpen, Search } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/enrollments", {
          withCredentials: true,
        });
        if (response.data.success) {
          setEnrollments(response.data.data);
          setFilteredEnrollments(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching enrollments:", error);
        toast({
          title: "Error",
          description: "Failed to load enrollments.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrollments();
  }, [toast]);

  useEffect(() => {
    let result = enrollments;

    // Filter by search query
    if (searchQuery) {
      result = result.filter((enrollment) =>
        enrollment.Course.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by tab
    if (activeTab === "in-progress") {
      result = result.filter(
        (enrollment) => (enrollment.progress?.completionPercentage || 0) < 100
      );
    } else if (activeTab === "completed") {
      result = result.filter(
        (enrollment) => (enrollment.progress?.completionPercentage || 0) >= 100
      );
    }

    setFilteredEnrollments(result);
  }, [enrollments, searchQuery, activeTab]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Learning</h1>
          <p className="text-muted-foreground">
            Track your progress and continue learning.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Courses</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <EnrollmentGrid enrollments={filteredEnrollments} />
        </TabsContent>
        <TabsContent value="in-progress" className="space-y-6">
          <EnrollmentGrid enrollments={filteredEnrollments} />
        </TabsContent>
        <TabsContent value="completed" className="space-y-6">
          <EnrollmentGrid enrollments={filteredEnrollments} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EnrollmentGrid({ enrollments }) {
  if (enrollments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/20 border-dashed">
        <div className="bg-background p-4 rounded-full mb-4 shadow-sm">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No courses found</h3>
        <p className="text-muted-foreground max-w-sm mb-6">
          Try adjusting your search or filters, or browse our catalog to find new courses.
        </p>
        <Button asChild>
          <Link href="/courses">Browse Courses</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {enrollments.map((enrollment) => (
        <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
      ))}
    </div>
  );
}
