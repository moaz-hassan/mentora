import Header from "@/components/pages/home/Header";
import Hero from "@/components/pages/home/Hero";
import Stats from "@/components/pages/home/Stats";
import FeaturedCourses from "@/components/pages/home/FeaturedCourses";
import Categories from "@/components/pages/home/Categories";
import Instructors from "@/components/pages/home/Instructors";
import Testimonials from "@/components/pages/home/Testimonials";
import CTA from "@/components/pages/home/CTA";
import Footer from "@/components/pages/home/Footer";
export const metadata = {
  title: "LearnHub - Learn Without Limits",
  description:
    "Start, switch, or advance your career with thousands of courses, certifications, and degrees from world-class universities and companies.",
};
export default function Home() {
  return (
    <div className="bg-white">
      <Header />
      <main>
        <Hero />
        <Stats />
        <FeaturedCourses />
        <Categories />
        <Instructors />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
