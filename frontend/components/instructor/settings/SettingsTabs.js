

import { User, Lock, Link as LinkIcon } from "lucide-react";

export default function SettingsTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "social", label: "Social Links", icon: LinkIcon },
    { id: "security", label: "Security", icon: Lock },
  ];

  return (
    <div className="border-b border-gray-200 dark:border-neutral-800">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-300 hover:border-gray-300 dark:hover:border-neutral-600"
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
