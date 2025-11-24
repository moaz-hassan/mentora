"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function CTA() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Subscribe:", email);
    setEmail("");
  };

  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join 100,000+ learners who receive our weekly updates
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Subscribe to our newsletter and stay updated with the latest courses, tips, and exclusive offers
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-6 text-gray-900 bg-white border-0 rounded-lg text-base"
              required
            />
            <Button
              type="submit"
              size="lg"
              className="px-8 py-6 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-semibold whitespace-nowrap"
            >
              Subscribe
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
