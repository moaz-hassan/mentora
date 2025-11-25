"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  Users,
  DollarSign,
  MessageSquare,
  BarChart3,
  FileCheck,
  Settings,
  HelpCircle,
  Clock,
  TrendingUp,
  X,
} from "lucide-react";
import Link from "next/link";

export default function InstructorSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState({
    pages: [],
    courses: [],
    actions: [],
    help: [],
  });
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // All searchable items in the dashboard
  const searchableItems = {
    pages: [
      {
        title: "Dashboard Overview",
        description: "View your teaching performance and statistics",
        icon: BarChart3,
        path: "/dashboard/instructor",
        keywords: ["home", "overview", "stats", "statistics", "performance"],
      },
      {
        title: "My Courses",
        description: "Manage and view all your courses",
        icon: BookOpen,
        path: "/dashboard/instructor/courses",
        keywords: ["courses", "manage", "edit", "view", "list"],
      },
      {
        title: "Create Course",
        description: "Create a new course",
        icon: BookOpen,
        path: "/dashboard/instructor/create-course",
        keywords: ["create", "new", "add", "course", "upload"],
      },
      {
        title: "Analytics",
        description: "View detailed analytics and insights",
        icon: TrendingUp,
        path: "/dashboard/instructor/analytics",
        keywords: ["analytics", "insights", "data", "metrics", "performance", "enrollment", "trends"],
      },
      {
        title: "Earnings",
        description: "Track your revenue and payouts",
        icon: DollarSign,
        path: "/dashboard/instructor/earnings",
        keywords: ["earnings", "revenue", "money", "payout", "income", "payment"],
      },
      {
        title: "Chats",
        description: "Message your students",
        icon: MessageSquare,
        path: "/dashboard/instructor/chats",
        keywords: ["chat", "message", "communication", "students", "talk"],
      },
      {
        title: "Pending Reviews",
        description: "Courses awaiting admin approval",
        icon: FileCheck,
        path: "/dashboard/instructor/pending-reviews",
        keywords: ["pending", "review", "approval", "waiting", "submitted"],
      },
      {
        title: "Settings",
        description: "Manage your account settings",
        icon: Settings,
        path: "/dashboard/instructor/settings",
        keywords: ["settings", "profile", "account", "preferences", "password"],
      },
      {
        title: "Help & Support",
        description: "Get help and find answers",
        icon: HelpCircle,
        path: "/dashboard/instructor/help",
        keywords: ["help", "support", "faq", "guide", "tutorial", "how to"],
      },
    ],
    actions: [
      {
        title: "Upload a new course",
        description: "Start creating your next course",
        icon: BookOpen,
        action: () => router.push("/dashboard/instructor/create-course"),
        keywords: ["upload", "create", "new course", "add course"],
      },
      {
        title: "View revenue analytics",
        description: "Check your earnings and revenue trends",
        icon: DollarSign,
        action: () => router.push("/dashboard/instructor/earnings"),
        keywords: ["revenue", "earnings", "money", "analytics"],
      },
      {
        title: "Check student messages",
        description: "View and respond to student messages",
        icon: MessageSquare,
        action: () => router.push("/dashboard/instructor/chats"),
        keywords: ["messages", "chat", "students", "communication"],
      },
      {
        title: "View enrollment trends",
        description: "See how your enrollments are performing",
        icon: Users,
        action: () => router.push("/dashboard/instructor/analytics"),
        keywords: ["enrollments", "students", "trends", "growth"],
      },
    ],
    help: [
      {
        title: "How to create a course",
        description: "Learn the steps to create and publish your first course",
        icon: HelpCircle,
        path: "/dashboard/instructor/help#create-course",
        keywords: ["create", "course", "how to", "tutorial", "guide"],
      },
      {
        title: "Understanding revenue analytics",
        description: "Learn how to track and analyze your earnings",
        icon: HelpCircle,
        path: "/dashboard/instructor/help#revenue-analytics",
        keywords: ["revenue", "analytics", "earnings", "money", "track"],
      },
      {
        title: "Communicating with students",
        description: "Best practices for student engagement",
        icon: HelpCircle,
        path: "/dashboard/instructor/help#student-communication",
        keywords: ["communication", "students", "chat", "messages", "engagement"],
      },
    ],
  };

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery);
    } else {
      setResults({ pages: [], courses: [], actions: [], help: [] });
    }
  }, [searchQuery]);

  const performSearch = (query) => {
    setLoading(true);
    const lowerQuery = query.toLowerCase();

    // Search pages
    const matchedPages = searchableItems.pages.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery) ||
        item.keywords.some((keyword) => keyword.includes(lowerQuery))
    );

    // Search actions
    const matchedActions = searchableItems.actions.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery) ||
        item.keywords.some((keyword) => keyword.includes(lowerQuery))
    );

    // Search help articles
    const matchedHelp = searchableItems.help.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery) ||
        item.keywords.some((keyword) => keyword.includes(lowerQuery))
    );

    setResults({
      pages: matchedPages,
      actions: matchedActions,
      help: matchedHelp,
      courses: [], // Would be populated from API in real implementation
    });

    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery);
      router.push(`/dashboard/instructor/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const saveRecentSearch = (query) => {
    const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const totalResults =
    results.pages.length +
    results.actions.length +
    results.help.length +
    results.courses.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Search</h1>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for pages, courses, actions, or help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-lg"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </form>

        {/* Results Count */}
        {searchQuery && (
          <p className="mt-4 text-sm text-gray-600">
            {loading ? "Searching..." : `Found ${totalResults} results for "${searchQuery}"`}
          </p>
        )}
      </div>

      {/* Recent Searches */}
      {!searchQuery && recentSearches.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Recent Searches
            </h2>
            <button
              onClick={clearRecentSearches}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => setSearchQuery(search)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors text-sm"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchQuery && !loading && (
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Pages */}
          {results.pages.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pages</h2>
              <div className="space-y-3">
                {results.pages.map((page, index) => {
                  const Icon = page.icon;
                  return (
                    <Link
                      key={index}
                      href={page.path}
                      className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start">
                        <div className="p-2 bg-blue-100 rounded-lg mr-4">
                          <Icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {page.title}
                          </h3>
                          <p className="text-sm text-gray-600">{page.description}</p>
                          <p className="text-xs text-blue-600 mt-2">{page.path}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {results.actions.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                {results.actions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={action.action}
                      className="w-full text-left p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start">
                        <div className="p-2 bg-green-100 rounded-lg mr-4">
                          <Icon className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {action.title}
                          </h3>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Help Articles */}
          {results.help.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Help & Support
              </h2>
              <div className="space-y-3">
                {results.help.map((help, index) => {
                  const Icon = help.icon;
                  return (
                    <Link
                      key={index}
                      href={help.path}
                      className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start">
                        <div className="p-2 bg-purple-100 rounded-lg mr-4">
                          <Icon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {help.title}
                          </h3>
                          <p className="text-sm text-gray-600">{help.description}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Results */}
          {totalResults === 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-600 mb-6">
                Try searching with different keywords or browse our help center
              </p>
              <Link
                href="/dashboard/instructor/help"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Visit Help Center
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Popular Searches */}
      {!searchQuery && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Popular Searches
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { query: "create course", icon: BookOpen },
              { query: "earnings", icon: DollarSign },
              { query: "analytics", icon: BarChart3 },
              { query: "student messages", icon: MessageSquare },
              { query: "pending reviews", icon: FileCheck },
              { query: "help", icon: HelpCircle },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => setSearchQuery(item.query)}
                  className="flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left"
                >
                  <Icon className="w-5 h-5 text-gray-600 mr-3" />
                  <span className="text-gray-900">{item.query}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
