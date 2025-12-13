"use client";

import { useEffect, useState } from "react";
import { getCategories } from "@/lib/apiCalls/categories/getCategories.apiCall";
import {
  Code,
  Briefcase,
  Palette,
  TrendingUp,
  Camera,
  Music,
  Heart,
  Lightbulb,
  BookOpen,
  Globe,
  Cpu,
  PenTool,
  DollarSign,
  Users,
  Layers,
  Folder,
} from "lucide-react";
import Link from "next/link";


const categoryConfig = {
  development: { Icon: Code, color: "bg-blue-100 text-blue-600" },
  business: { Icon: Briefcase, color: "bg-purple-100 text-purple-600" },
  design: { Icon: Palette, color: "bg-pink-100 text-pink-600" },
  marketing: { Icon: TrendingUp, color: "bg-green-100 text-green-600" },
  photography: { Icon: Camera, color: "bg-orange-100 text-orange-600" },
  music: { Icon: Music, color: "bg-red-100 text-red-600" },
  "health & fitness": { Icon: Heart, color: "bg-teal-100 text-teal-600" },
  health: { Icon: Heart, color: "bg-teal-100 text-teal-600" },
  fitness: { Icon: Heart, color: "bg-teal-100 text-teal-600" },
  "personal development": { Icon: Lightbulb, color: "bg-yellow-100 text-yellow-600" },
  education: { Icon: BookOpen, color: "bg-indigo-100 text-indigo-600" },
  language: { Icon: Globe, color: "bg-cyan-100 text-cyan-600" },
  technology: { Icon: Cpu, color: "bg-slate-100 text-slate-600" },
  "it & software": { Icon: Cpu, color: "bg-slate-100 text-slate-600" },
  art: { Icon: PenTool, color: "bg-rose-100 text-rose-600" },
  finance: { Icon: DollarSign, color: "bg-emerald-100 text-emerald-600" },
  lifestyle: { Icon: Users, color: "bg-amber-100 text-amber-600" },
};

const defaultConfig = { Icon: Folder, color: "bg-gray-100 text-gray-600" };

function getCategoryConfig(name) {
  const key = name?.toLowerCase().trim();
  return categoryConfig[key] || defaultConfig;
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data } = await getCategories();
        setCategories(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Explore Top Categories</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Discover courses across a variety of subjects.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl animate-pulse">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mb-4" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">Unable to load categories</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Explore Top Categories</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Discover courses across a variety of subjects. Whatever your passion, we have the perfect course for you.
          </p>
        </div>
        

        {categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => {
              const { Icon, color } = getCategoryConfig(category.name);
              const courseCount = category.courses_count || category.coursesCount || 0;
              
              return (
                <Link 
                  key={category.id || category.name} 
                  href={`/courses?categories=${category.id}`}
                >
                  <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-1 transition-all duration-300 cursor-pointer group h-full">
                    <div className={`${color} p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white text-center mb-1">{category.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {courseCount > 0 
                        ? `${courseCount.toLocaleString()} ${courseCount === 1 ? 'course' : 'courses'}`
                        : 'Coming soon'
                      }
                    </p>
                  </div>
                </Link>
              );

            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No categories available yet</p>
          </div>
        )}
      </div>
    </section>
  );
}
