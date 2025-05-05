import React from 'react'

export default function Filter({ icon, label }) {
  return (
    <button className="flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300">
    {icon}
    <span className="text-sm whitespace-nowrap">{label}</span>
  </button>
  )
}
