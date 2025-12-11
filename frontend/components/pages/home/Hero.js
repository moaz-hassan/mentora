import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import heroImage from "@/assets/images/header_img.jpg";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-blue-50 to-white dark:from-gray-900 dark:to-background py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left content */}
          <div className="space-y-8">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/10 border border-blue-100 dark:border-blue-900 rounded-full shadow-sm">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Trusted by 10M+ learners worldwide
              </p>
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight">
              Unlock Your <span className="text-primary">Potential</span>
            </h1>

            {/* Description */}
            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
              Start learning today with expert instructors and flexible courses
              designed to help you achieve your goals.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/courses">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-lg shadow-lg shadow-blue-500/20 transition-all hover:scale-105 cursor-pointer"
                >
                  Start Learning Today
                </Button>
              </Link>
            </div>
          </div>

          {/* Right side - Hero Image */}
          <div className="relative lg:h-[400px] flex items-center justify-center">
            <div className="relative w-full max-w-[600px] aspect-square lg:aspect-auto lg:h-full rounded-3xl overflow-hidden shadow-2xl ring-1 ring-border/50">
              <Image
                src={heroImage}
                alt="Student learning on laptop"
                fill
                className="object-cover"
                priority
                placeholder="blur"
              />
            </div>

            {/* Decorative blobs */}
            <div className="absolute -z-10 top-1/2 right-1/2 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl animate-blob" />
            <div className="absolute -z-10 bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
          </div>
        </div>
      </div>
    </section>
  );
}
