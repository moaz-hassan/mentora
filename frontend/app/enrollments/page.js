"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import EnrollmentCard from "@/components/pages/enrollments/EnrollmentCard";
import ViewToggle from "@/components/pages/enrollments/ViewToggle";
import { getMyEnrollments } from "@/lib/apiCalls/enrollments/enrollment.service";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function EnrollmentsPage() {
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("recent");
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await getMyEnrollments();
        
        if (response.success) {
          setEnrollments(response.data || []);
        } else {
          toast.error(response.message || "Failed to fetch enrollments");
        }
      } catch (error) {
        toast.error("An error occurred while fetching enrollments");
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  const filteredEnrollments = enrollments
    .filter((enrollment) =>
      enrollment.Course?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (filter === "recent") {
        const dateA = new Date(a.progress?.lastAccessed || 0);
        const dateB = new Date(b.progress?.lastAccessed || 0);
        return dateB - dateA;
      }
      
      return 0;
    });

  return (
    <div className="container w-8/9 mx-auto px-4 py-8 space-y-8">
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-4">
        <Link href="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-black transition-colors cursor-pointer ">
          Enrollments
        </span>
      </nav>
      {}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Enrollments</h1>
        <p className="text-muted-foreground">
          Welcome back! Continue your learning journey.
        </p>
      </div>

      {}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search my courses..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently Accessed</SelectItem>
              <SelectItem value="title">Title (A-Z)</SelectItem>
            </SelectContent>
          </Select>
          
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>
      </div>

      {}
      {loading ? (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-[200px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredEnrollments.length > 0 ? (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredEnrollments.map((enrollment) => (
            <EnrollmentCard 
              key={enrollment.id} 
              enrollment={enrollment} 
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No courses found
          </p>
        </div>
      )}
    </div>
  );
}
