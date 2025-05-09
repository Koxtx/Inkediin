import React from 'react'

export default function GuideCard({ icon, title, description }) {
    return (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-3xl">{icon}</div>
          <div>
            <h3 className="font-bold text-lg dark:text-white">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
          </div>
        </div>
      );
}
