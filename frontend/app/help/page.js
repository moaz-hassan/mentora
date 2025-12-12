"use client";

import { useState } from "react";
import { 
  BookOpen, 
  Video, 
  MessageCircle, 
  FileText, 
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  ArrowLeft
} from "lucide-react";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "How do I enroll in a course?",
      answer: "To enroll in a course, browse our course catalog, select the course you're interested in, and click the 'Enroll Now' button. You'll need to complete the payment process if it's a paid course."
    },
    {
      id: 2,
      question: "Can I get a refund?",
      answer: "Yes, we offer a 30-day money-back guarantee for all courses. If you're not satisfied with a course, you can request a refund within 30 days of purchase."
    },
    {
      id: 3,
      question: "How do I track my progress?",
      answer: "Your progress is automatically tracked as you complete lessons. You can view your progress on your dashboard or within each course page."
    },
    {
      id: 4,
      question: "Do I get a certificate after completing a course?",
      answer: "Yes! Upon completing all course requirements and passing the final assessment, you'll receive a certificate of completion that you can download and share."
    },
    {
      id: 5,
      question: "How do I contact an instructor?",
      answer: "You can contact instructors through the course discussion board or by using the messaging feature available on each course page."
    },
    {
      id: 6,
      question: "Can I access courses on mobile devices?",
      answer: "Yes, our platform is fully responsive and works on all devices including smartphones and tablets. You can learn on the go!"
    },
  ];

  const helpCategories = [
    {
      icon: BookOpen,
      title: "Getting Started",
      description: "Learn the basics of using our platform",
      color: "bg-blue-100 text-blue-600",
      articles: [
        { title: "Creating Your Account", content: "Learn how to sign up and set up your profile on our platform." },
        { title: "Navigating the Dashboard", content: "Understand the main features and layout of your dashboard." },
        { title: "Finding Courses", content: "Discover how to browse and search for courses that interest you." },
        { title: "Account Settings", content: "Manage your profile, preferences, and notification settings." },
      ]
    },
    {
      icon: Video,
      title: "Course Access",
      description: "How to access and navigate your courses",
      color: "bg-green-100 text-green-600",
      articles: [
        { title: "Enrolling in Courses", content: "Step-by-step guide to enrolling in free and paid courses." },
        { title: "Watching Video Lessons", content: "Learn how to play, pause, and adjust video playback settings." },
        { title: "Downloading Resources", content: "Access and download course materials and resources." },
        { title: "Tracking Progress", content: "Monitor your learning progress and completion status." },
      ]
    },
    {
      icon: FileText,
      title: "Certificates",
      description: "Information about course certificates",
      color: "bg-purple-100 text-purple-600",
      articles: [
        { title: "Earning Certificates", content: "Requirements and steps to earn your course completion certificate." },
        { title: "Downloading Certificates", content: "How to download and save your certificates." },
        { title: "Sharing Certificates", content: "Share your achievements on LinkedIn and other platforms." },
        { title: "Certificate Verification", content: "How employers can verify your certificates." },
      ]
    },
    {
      icon: MessageCircle,
      title: "Support",
      description: "Get help from our support team",
      color: "bg-orange-100 text-orange-600",
      articles: [
        { title: "Contacting Support", content: "Different ways to reach our support team for assistance." },
        { title: "Reporting Issues", content: "How to report technical problems or content issues." },
        { title: "Refund Policy", content: "Understanding our refund policy and how to request refunds." },
        { title: "Community Guidelines", content: "Rules and best practices for interacting on our platform." },
      ]
    },
  ];

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <HelpCircle className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Help Center</h1>
            <p className="text-xl text-blue-100 mb-8">
              Find answers to your questions and get the support you need
            </p>
            
            {}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 dark:text-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Browse by Category</h2>
          
          {!selectedCategory ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {helpCategories.map((category, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedCategory(category)}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1 border border-transparent dark:border-gray-700"
                >
                  <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mb-4`}>
                    <category.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {category.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border dark:border-gray-700">
              {}
              <div className="flex items-center justify-between mb-6 pb-6 border-b dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <div className={`w-12 h-12 rounded-lg ${selectedCategory.color} flex items-center justify-center`}>
                    <selectedCategory.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedCategory.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedCategory.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {}
              <div className="space-y-4">
                {selectedCategory.articles.map((article, index) => (
                  <div
                    key={index}
                    className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer"
                  >
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {article.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {article.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <div
                  key={faq.id}
                  className={`border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${
                    index === 0 ? 'rounded-t-lg' : ''
                  } ${index === filteredFaqs.length - 1 ? 'rounded-b-lg' : ''}`}
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-left font-medium text-gray-900 dark:text-white">
                      {faq.question}
                    </span>
                    {expandedFaq === faq.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 ml-4" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 ml-4" />
                    )}
                  </button>
                  {expandedFaq === faq.id && (
                    <div className="px-6 pb-4 text-gray-600 dark:text-gray-400">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                No results found for "{searchQuery}"
              </div>
            )}
          </div>
        </div>

        {}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-8 text-center border dark:border-gray-700">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Still need help?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Can't find what you're looking for? Use our AI assistant (bottom-right corner) or contact our support team.
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}

