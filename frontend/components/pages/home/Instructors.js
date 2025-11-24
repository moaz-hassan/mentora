import { Card, CardContent } from "@/components/ui/card";
import { Star, Users, BookOpen, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const instructors = [
  {
    name: "Dr. Angela Yu",
    title: "Lead Instructor & Developer",
    rating: 4.9,
    students: "850K Students",
    courses: "12 Courses",
    verified: true,
    bg: "from-blue-200 to-blue-400",
  },
  {
    name: "Sarah Johnson",
    title: "UX/UI Design Expert",
    rating: 4.8,
    students: "620K Students",
    courses: "8 Courses",
    verified: true,
    bg: "from-pink-200 to-pink-400",
  },
  {
    name: "Michael Chen",
    title: "Finance & Investment Pro",
    rating: 4.9,
    students: "540K Students",
    courses: "15 Courses",
    verified: true,
    bg: "from-green-200 to-green-400",
  },
  {
    name: "Emma Williams",
    title: "Marketing Strategist",
    rating: 4.7,
    students: "480K Students",
    courses: "10 Courses",
    verified: true,
    bg: "from-purple-200 to-purple-400",
  },
];

export default function Instructors() {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Learn From The Best
          </h2>
          <p className="text-lg text-gray-600">
            Our instructors are industry experts with years of real-world experience
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {instructors.map((instructor, idx) => (
            <Card key={idx} className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="relative inline-block mb-4">
                <div
                  className={`mx-auto size-24 rounded-full bg-gradient-to-br ${instructor.bg}`}
                />
                {instructor.verified && (
                  <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-lg text-gray-900">
                {instructor.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{instructor.title}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{instructor.rating}</span>
                  <span className="text-gray-500">Instructor Rating</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{instructor.students}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <BookOpen className="w-4 h-4" />
                  <span>{instructor.courses}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/instructors">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-gray-300 hover:border-gray-900"
            >
              View All Instructors
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}