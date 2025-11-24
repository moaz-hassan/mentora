import { Code, Briefcase, Palette, TrendingUp, Camera, Music, Heart, Lightbulb } from "lucide-react";
import Link from "next/link";

const categories = [
  { name: "Development", Icon: Code, courses: "12,500 courses", color: "bg-blue-100 text-blue-600" },
  { name: "Business", Icon: Briefcase, courses: "8,200 courses", color: "bg-purple-100 text-purple-600" },
  { name: "Design", Icon: Palette, courses: "6,800 courses", color: "bg-pink-100 text-pink-600" },
  { name: "Marketing", Icon: TrendingUp, courses: "5,400 courses", color: "bg-green-100 text-green-600" },
  { name: "Photography", Icon: Camera, courses: "3,200 courses", color: "bg-orange-100 text-orange-600" },
  { name: "Music", Icon: Music, courses: "2,800 courses", color: "bg-red-100 text-red-600" },
  { name: "Health & Fitness", Icon: Heart, courses: "4,100 courses", color: "bg-teal-100 text-teal-600" },
  { name: "Personal Development", Icon: Lightbulb, courses: "7,300 courses", color: "bg-yellow-100 text-yellow-600" },
];

export default function Categories() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore Top Categories</h2>
          <p className="text-lg text-gray-600">
            Discover courses across a variety of subjects. Whatever your passion, we have the perfect course for you.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map(({ name, Icon, courses, color }, i) => (
            <Link key={i} href={`/categories/${name.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="flex flex-col items-center p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer group">
                <div className={`${color} p-4 rounded-full mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-8 w-8" />
                </div>
                <p className="font-semibold text-gray-900 text-center mb-1">{name}</p>
                <p className="text-sm text-gray-500">{courses}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}