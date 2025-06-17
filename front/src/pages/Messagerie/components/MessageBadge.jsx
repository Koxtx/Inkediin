import React from 'react';
import { useMessagerie } from '../../../hooks/useMessagerie';

export default function MessageBadge({ className = "" }) {
  const { getTotalUnreadCount } = useMessagerie();
  
  const unreadCount = getTotalUnreadCount();
  
  if (unreadCount === 0) return null;
  
  return (
    <div className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ${className}`}>
      {unreadCount > 99 ? '99+' : unreadCount}
    </div>
  );
}