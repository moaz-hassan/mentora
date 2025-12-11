"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Award,
  Download,
  ArrowLeft,
  Calendar,
  User,
  BookOpen,
  CheckCircle2,
  Share2,
  GraduationCap,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { getCertificateById, getDownloadUrl } from "@/lib/apiCalls/certificates/certificate.service";

export default function CertificatePage({ params }) {
  const { certificateId } = use(params);
  const router = useRouter();
  const [certificate, setCertificate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await getCertificateById(certificateId);
        if (response.success) {
          setCertificate(response.data);
        } else {
          setError(response.message || "Failed to load certificate");
        }
      } catch (err) {
        setError("An error occurred while loading the certificate");
        console.error("Certificate fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (certificateId) {
      fetchCertificate();
    }
  }, [certificateId]);

  const handleDownload = async () => {
    try {
      const response = await getDownloadUrl(certificateId);
      if (response.success && response.downloadUrl) {
        
        const link = document.createElement('a');
        link.href = response.downloadUrl;
        link.download = `certificate-${certificateId}.pdf`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Download started!");
      } else {
        toast.error(response.message || "Failed to get download URL");
      }
    } catch (err) {
      toast.error("An error occurred while downloading");
      console.error("Download error:", err);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Certificate link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-[500px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8">
          <Award className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Certificate Not Found</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.push("/enrollments")}>
            Back to My Courses
          </Button>
        </div>
      </div>
    );
  }

  const student = certificate?.student;
  const course = certificate?.Course;
  const instructor = course?.Instructor;
  const metadata = certificate?.metadata || {};
  
  const studentName = metadata.studentName || `${student?.first_name || ""} ${student?.last_name || ""}`.trim();
  const courseTitle = metadata.courseTitle || course?.title || "Course";
  const instructorName = metadata.instructorName || (instructor ? `${instructor.first_name} ${instructor.last_name}` : "Instructor");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {}
          <div className="relative p-8 md:p-12 min-h-[500px]">
            {}
            <div className="absolute top-0 left-0 w-20 h-20 border-l-4 border-t-4 border-indigo-600 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-20 h-20 border-r-4 border-t-4 border-indigo-600 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-20 h-20 border-l-4 border-b-4 border-indigo-600 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-r-4 border-b-4 border-indigo-600 rounded-br-lg" />

            {}
            <div className="text-center space-y-4 pt-4">
              {}
              <div className="flex justify-center">
                <span className="bg-teal-600 text-white text-xs font-bold px-6 py-2 rounded-full tracking-wider">
                  CERTIFICATE OF COMPLETION
                </span>
              </div>

              {}
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-6">
                This certificate is proudly presented to
              </p>

              {}
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white py-2">
                {studentName}
              </h2>

              {}
              <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                for successfully completing the Mentora course
              </p>

              {}
              <h3 className="text-xl md:text-2xl font-bold text-teal-600 py-2">
                {courseTitle}
              </h3>
            </div>

            {}
            <div className="flex justify-between items-end mt-12 px-4">
              {}
              <div className="text-center">
                <div className="border-t border-gray-300 dark:border-gray-600 pt-2 w-36">
                  <p className="text-gray-900 dark:text-white font-medium italic">{instructorName}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Lead Instructor, Mentora</p>
                </div>
              </div>

              {}
              <div className="flex flex-col items-center gap-2">
                {certificate?.verified && (
                  <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-medium">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </div>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-2">
                  ID: {metadata.certificateCode || certificate?.id?.slice(0, 20)}
                </p>
              </div>

              {}
              <div className="text-center">
                <p className="text-teal-600 font-bold text-lg">{formatDate(certificate?.completion_date)}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Date of Completion</p>
              </div>
            </div>
          </div>
        </div>

          {}
          <div className="bg-gray-50 dark:bg-gray-800/50 px-8 py-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={handleDownload}
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Issued on {formatDate(certificate?.issued_at)}
              </p>
            </div>
          </div>
        </div>

        {}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          {}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              Course Details
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Course Name</p>
                <p className="font-medium">{courseTitle}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Instructor</p>
                <p className="font-medium">{instructorName}</p>
              </div>
              {course?.id && (
                <Link
                  href={`/courses/${course.id}`}
                  className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View Course Details →
                </Link>
              )}
            </div>
          </div>

          {}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Achievement
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">100% Completed</p>
                  <p className="text-sm text-muted-foreground">All lessons and quizzes finished</p>
                </div>
              </div>
              {(metadata.totalLessons > 0 || metadata.totalQuizzes > 0) && (
                <div className="flex gap-6 pt-2">
                  {metadata.totalLessons > 0 && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-indigo-600">{metadata.totalLessons}</p>
                      <p className="text-xs text-muted-foreground">Lessons</p>
                    </div>
                  )}
                  {metadata.totalQuizzes > 0 && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{metadata.totalQuizzes}</p>
                      <p className="text-xs text-muted-foreground">Quizzes</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
            Certificate Holder
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {studentName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-lg">{studentName}</p>
              <p className="text-sm text-muted-foreground">{metadata.studentEmail || student?.email}</p>
            </div>
          </div>
        </div>
      </div>
  );
}
