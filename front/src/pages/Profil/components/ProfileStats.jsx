import React from "react";

export default function ProfileStats({ stats }) {
  if (!stats) return null;

  return (
    <div className="flex space-x-6 mb-6">
      <div className="text-center">
        <div className="font-bold text-lg">{stats.tattoos || 0}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Tatouages</div>
      </div>
      <div className="text-center">
        <div className="font-bold text-lg">{stats.followers || 0}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Abonnés</div>
      </div>
      <div className="text-center">
        <div className="font-bold text-lg">{stats.following || 0}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Abonnements</div>
      </div>
    </div>
  );
}