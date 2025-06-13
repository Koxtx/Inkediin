import React from "react";

export default function ProfileTabs({ 
  availableTabs, 
  activeTab, 
  onTabChange 
}) {
  return (
    <div className="flex border-b dark:border-gray-700 mb-6 overflow-x-auto pb-1">
      {availableTabs.map((tab) => (
        <button
          key={tab.id}
          className={`px-4 py-2 mr-2 whitespace-nowrap transition-colors ${
            activeTab === tab.id
              ? "text-red-500 border-b-2 border-red-500 -mb-px font-medium"
              : "text-gray-600 dark:text-gray-300 hover:text-red-500"
          }`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}