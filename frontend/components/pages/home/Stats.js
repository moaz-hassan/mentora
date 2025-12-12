"use client";

import { useEffect, useState, useRef } from "react";
import { BookOpen, Users, Award, GraduationCap, TrendingUp } from "lucide-react";

const stats = [
  {
    icon: BookOpen,
    value: 50000,
    suffix: "+",
    label: "Expert-Led Courses",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Users,
    value: 10,
    suffix: "M+",
    label: "Active Learners",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: GraduationCap,
    value: 300,
    suffix: "K+",
    label: "Certified Instructors",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Award,
    value: 1,
    suffix: "M+",
    label: "Certificates Issued",
    gradient: "from-orange-500 to-amber-500",
  },
];

function AnimatedCounter({ value, suffix, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smoother animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, value, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function Stats() {
  return (
    <section className="relative py-20 bg-white dark:bg-gray-950 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#f0f9ff_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[radial-gradient(circle_at_center,#1e3a5f20_1px,transparent_1px)]" />
      
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-4">
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Our Impact</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted by Millions Worldwide
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join a global community of learners and industry experts shaping the future of education
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="group relative bg-white dark:bg-gray-900 rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-md hover:bg-blue-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 transition-all duration-300"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4 shadow-md`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Value */}
                  <p className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </p>
                  
                  {/* Label */}
                  <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 font-medium">
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
