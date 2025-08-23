'use client';

import { User, Settings, LogOut } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { getEnvironmentConfig } from '@/config/env';

export default function UserInfo() {
  const { user, loading, error, refreshUser } = useUser();
  const config = getEnvironmentConfig();

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        <span className="text-sm">Loading user...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
        <span className="text-sm">Error: {error}</span>
        <button
          onClick={refreshUser}
          className="text-xs underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
        <span className="text-sm">No user found</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* User Avatar */}
      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      </div>
      
      {/* User Info */}
      <div className="text-right">
        <div className="text-sm font-medium text-slate-900 dark:text-white">
          {user.name || 'User'}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          {user.id}
        </div>
      </div>
      
      {/* User Status */}
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${
          user.isAuthenticated ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {user.isAuthenticated ? 'Active' : 'Inactive'}
        </span>
      </div>
      
      {/* Environment Badge */}
      {config.isDev && (
        <div className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
          DEV
        </div>
      )}
    </div>
  );
}
