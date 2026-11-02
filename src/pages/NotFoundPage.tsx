import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-6">
      <p className="text-xs font-mono text-blue-500">404 · Route Not Found</p>
      <h1 className="text-3xl sm:text-5xl font-display font-bold tracking-tight">
        Page Not Found
      </h1>
      <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto">
        The route you requested does not exist in S Hari Shankar’s portfolio directory.
      </p>
      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Portfolio Overview</span>
        </Link>
      </div>
    </div>
  );
};
