import { Card } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Jessica Miller",
    role: "Software Developer",
    quote:
      "LearnHub has completely transformed my career. The courses are well structured, and the instructors are top notch. I landed my dream job just 3 months after completing the Web Development course!",
    rating: 5,
    bg: "from-blue-100 to-blue-200",
  },
  {
    name: "David Park",
    role: "Marketing Manager",
    quote:
      "The flexibility to learn at my own pace while working full-time was exactly what I needed. The quality of content is outstanding, and the community support is incredible.",
    rating: 5,
    bg: "from-purple-100 to-purple-200",
  },
  {
    name: "Rachel Foster",
    role: "UX Designer",
    quote:
      "Best investment I've made in myself. The practical projects helped me build a strong portfolio, and the certification gave me the credibility I needed to switch careers.",
    rating: 5,
    bg: "from-pink-100 to-pink-200",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What Our Students Say
          </h2>
          <p className="text-lg text-gray-600">
            Join thousands of satisfied learners who have transformed their careers
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <Card key={i} className="p-6 bg-white hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, idx) => (
                  <Star
                    key={idx}
                    className="w-5 h-5 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
              <Quote className="w-10 h-10 text-gray-300 mb-4" />
              <p className="text-gray-700 mb-6 leading-relaxed">
                {testimonial.quote}
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.bg} flex items-center justify-center`}
                >
                  <span className="text-lg font-semibold text-gray-700">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
