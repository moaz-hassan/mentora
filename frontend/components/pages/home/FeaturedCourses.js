import { Card, CardContent } from "@/components/ui/card";
import { Star, Clock, Users, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const courses = [
  {
    id: 1,
    title: "Complete Web Development Bootcamp 2024",
    author: "Dr. Angela Yu",
    price: "$89.99",
    originalPrice: "$199.99",
    rating: 4.8,
    reviews: 125000,
    students: 125000,
    hours: 52,
    image: "/course-web-dev.jpg",
    category: "Development",
    badge: "Bestseller",
  },
  {
    id: 2,
    title: "The Complete Digital Marketing Course",
    author: "Rob Percival",
    price: "$79.99",
    originalPrice: "$189.99",
    rating: 4.6,
    reviews: 98000,
    students: 98000,
    hours: 38,
    image: "/course-marketing.jpg",
    category: "Marketing",
    badge: null,
  },
  {
    id: 3,
    title: "UI/UX Design Masterclass",
    author: "Sarah Johnson",
    price: "$94.99",
    originalPrice: "$199.99",
    rating: 4.9,
    reviews: 87000,
    students: 87000,
    hours: 45,
    image: "/course-design.jpg",
    category: "Design",
    badge: "Bestseller",
  },
  {
    id: 4,
    title: "Financial Analysis & Investment",
    author: "Michael Chen",
    price: "$84.99",
    originalPrice: "$179.99",
    rating: 4.7,
    reviews: 72000,
    students: 72000,
    hours: 32,
    image: "/course-finance.jpg",
    category: "Finance",
    badge: null,
  },
];

function CourseCard({ course }) {
  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer h-full">
        <div className="relative h-48 w-full bg-gradient-to-br from-gray-200 to-gray-300">
          {/* Placeholder for course image */}
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <span className="text-sm">{course.category}</span>
          </div>
          {course.badge && (
            <div className="absolute top-3 left-3 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
              {course.badge}
            </div>
          )}
          {course.category && (
            <div className="absolute top-3 right-3 bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-medium">
              {course.category}
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 mb-2">
            {course.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3">{course.author}</p>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="ml-1 text-sm font-semibold text-gray-900">
                {course.rating}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              ({course.reviews.toLocaleString()})
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{course.hours} hours</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{(course.students / 1000).toFixed(0)}K</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-gray-900">
                {course.price}
              </span>
              <span className="ml-2 text-sm text-gray-500 line-through">
                {course.originalPrice}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function FeaturedCourses() {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Featured Courses</h2>
          <Link
            href="/courses"
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
          >
            View All Courses
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        <p className="text-gray-600 mb-8">
          Explore our most popular courses chosen by students
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}