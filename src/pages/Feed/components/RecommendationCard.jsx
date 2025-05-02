import React from 'react'

export default function RecommendationCard({ title, artist, price }) {
  return (
    <div className="min-w-[150px] md:min-w-[180px]  rounded-lg overflow-hidden">
    <div className="w-full h-36 bg-gray-700"></div>
    <div className="p-3">
      <div className="text-sm font-bold mb-1">{title}</div>
      <div className="text-xs text-red-500">{artist}</div>
      <div className="text-xs text-gray-400 mt-1">{price}</div>
    </div>
  </div>
  )
}
