import { BookOpen, Users, Award, GraduationCap } from "lucide-react";

const stats = [
  {
    icon: BookOpen,
    value: "50,000+",
    label: "Expert-Led Courses",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Users,
    value: "10M+",
    label: "Active Learners",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: GraduationCap,
    value: "300K+",
    label: "Certified Instructors",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: Award,
    value: "1M+",
    label: "Certificates Issued",
    color: "bg-orange-100 text-orange-600",
  },
];

export default function Stats() {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className={`${stat.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-8 h-8" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
