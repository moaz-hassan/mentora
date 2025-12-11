"use client";

import { CheckCircle2 } from "lucide-react";


export default function OverviewTab({
  description,
  learningObjectives = [],
  lessonTitle,
}) {
  
  const defaultObjectives = [
    "Understand the core principles and best practices",
    "Apply practical techniques to real-world scenarios",
    "Develop problem-solving skills through hands-on examples",
    "Build confidence in implementing advanced solutions",
  ];

  const objectives = learningObjectives.length > 0 ? learningObjectives : defaultObjectives;

  return (
    <div className="py-6 space-y-8">
      {}
      <section>
        <h2 className="text-xl font-semibold mb-4">About This Lesson</h2>
        <p className="text-muted-foreground leading-relaxed">
          {description ||
            `Explore all the resources available to help you succeed in this course. Through practical examples and real-world applications, you'll gain hands-on experience that you can immediately apply to your own projects. This lesson is designed to be both informative and engaging, with clear explanations and visual demonstrations.`}
        </p>
      </section>

      {}
      <section>
        <h3 className="text-lg font-semibold mb-4">What You'll Learn</h3>
        <ul className="space-y-3">
          {objectives.map((objective, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{objective}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
