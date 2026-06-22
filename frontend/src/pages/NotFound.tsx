import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#6366f1]/5 via-[var(--background)] to-[#a855f7]/5 p-4">
      <div className="text-center max-w-lg">
        {/* Animated 404 Number */}
        <div className="relative mb-8">
          <h1 className="text-[150px] md:text-[200px] font-black leading-none bg-gradient-to-br from-[#6366f1] via-[#a855f7] to-[#ec4899] bg-clip-text text-transparent select-none">
            404
          </h1>
          {/* Floating decorative elements */}
          <div className="absolute top-10 left-10 w-3 h-3 bg-[#6366f1] rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-16 w-2 h-2 bg-[#a855f7] rounded-full animate-pulse delay-75"></div>
          <div className="absolute bottom-16 left-20 w-4 h-4 bg-[#ec4899] rounded-full animate-pulse delay-150"></div>
        </div>

        {/* Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[var(--text)] mb-3">
            Page not found
          </h2>
          <p className="text-[var(--text-muted)] text-lg mb-2">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            Let's get you back on track.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[#6366f1]/30 hover:-translate-y-0.5 transition-all duration-200"
          >
            <Home size={18} />
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 border border-[var(--border)] bg-[var(--card)] text-[var(--text)] rounded-xl font-semibold hover:bg-[var(--muted)] transition-all duration-200"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>

        {/* Search Suggestion */}
        <div className="mt-12 pt-8 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--text-muted)] mb-3">
            Looking for something specific?
          </p>
          <button
            onClick={() => navigate('/employees')}
            className="inline-flex items-center gap-2 text-sm text-[#6366f1] hover:text-[#5558e8] font-medium transition-colors"
          >
            <Search size={14} />
            Search Employees
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-[var(--text-muted)] mt-8">
          Error code: 404 • Page not found
        </p>
      </div>
    </div>
  );
}