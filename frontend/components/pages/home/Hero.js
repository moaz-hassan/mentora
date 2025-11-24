"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuthStore";
import Image from "next/image";

export default function Hero() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-6">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
              <Star className="w-4 h-4 text-blue-600 fill-blue-600" />
              <p className="text-sm font-medium text-blue-700">
                Trusted by 10M+ learners worldwide
              </p>
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Learn Without Limits
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl">
              Start, switch, or advance your career with thousands of courses, certifications, and degrees from world-class universities and companies.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-8 py-6 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-semibold text-base"
                >
                  Get Started
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8 py-6 border-2 border-gray-300 hover:border-gray-400 rounded-lg font-semibold text-base"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  50K+
                </p>
                <p className="text-sm text-gray-600">Online Courses</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  300K+
                </p>
                <p className="text-sm text-gray-600">Certified Instructors</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  10M+
                </p>
                <p className="text-sm text-gray-600">Active Students</p>
              </div>
            </div>
          </div>

          {/* Right side - Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/hero-image.jpg"
                alt="Student learning on laptop"
                width={800}
                height={600}
                className="w-full h-auto object-cover"
                priority
              />
              {/* Rating Badge Overlay */}
              <div className="absolute bottom-8 left-8 bg-white rounded-lg shadow-lg p-4 flex items-center gap-3">
                <div className="bg-green-100 rounded-full p-2">
                  <Star className="w-6 h-6 text-green-600 fill-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">4.9/5</p>
                  <p className="text-sm text-gray-600">Average Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
