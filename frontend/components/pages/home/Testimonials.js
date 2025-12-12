"use client";

import { Card } from "@/components/ui/card";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const testimonials = [
  {
    name: "Jessica Miller",
    role: "Software Developer",
    company: "Google",
    quote:
      "Mentora has completely transformed my career. The courses are well structured, and the instructors are top notch. I landed my dream job just 3 months after completing the Web Development course!",
    rating: 5,
    gradient: "from-blue-500 to-cyan-500",
    avatar: "JM",
  },
  {
    name: "David Park",
    role: "Marketing Manager",
    company: "Amazon",
    quote:
      "The flexibility to learn at my own pace while working full-time was exactly what I needed. The quality of content is outstanding, and the community support is incredible.",
    rating: 5,
    gradient: "from-purple-500 to-pink-500",
    avatar: "DP",
  },
  {
    name: "Rachel Foster",
    role: "UX Designer",
    company: "Apple",
    quote:
      "Best investment I've made in myself. The practical projects helped me build a strong portfolio, and the certification gave me the credibility I needed to switch careers.",
    rating: 5,
    gradient: "from-green-500 to-emerald-500",
    avatar: "RF",
  },
  {
    name: "Michael Chen",
    role: "Data Scientist",
    company: "Netflix",
    quote:
      "The machine learning courses here are exceptional. Real-world projects, expert instructors, and a supportive community. Couldn't ask for more!",
    rating: 5,
    gradient: "from-orange-500 to-amber-500",
    avatar: "MC",
  },
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="relative py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100/50 dark:bg-purple-900/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/30 rounded-full mb-4">
            <Quote className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Success Stories</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            What Our Students Say
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join thousands of satisfied learners who have transformed their careers with Mentora
          </p>
        </div>

        {/* Testimonials Grid - Desktop */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, i) => (
            <Card 
              key={i} 
              className="group relative p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden"
            >
              {/* Gradient glow on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${testimonial.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              {/* Stars */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, idx) => (
                  <Star
                    key={idx}
                    className="w-4 h-4 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
              
              {/* Quote */}
              <Quote className="w-8 h-8 text-gray-200 dark:text-gray-700 mb-3" />
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-sm line-clamp-4">
                {testimonial.quote}
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-3 mt-auto">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center shadow-md`}>
                  <span className="text-sm font-bold text-white">{testimonial.avatar}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Testimonials Carousel - Mobile */}
        <div className="md:hidden">
          <Card className="relative p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
            <div className="flex items-center gap-1 mb-4">
              {[...Array(testimonials[activeIndex].rating)].map((_, idx) => (
                <Star key={idx} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <Quote className="w-10 h-10 text-gray-200 dark:text-gray-700 mb-4" />
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {testimonials[activeIndex].quote}
            </p>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonials[activeIndex].gradient} flex items-center justify-center`}>
                <span className="text-lg font-bold text-white">{testimonials[activeIndex].avatar}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {testimonials[activeIndex].name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {testimonials[activeIndex].role} at {testimonials[activeIndex].company}
                </p>
              </div>
            </div>
          </Card>
          
          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prevTestimonial}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === activeIndex 
                      ? 'w-6 bg-blue-600' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={nextTestimonial}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
