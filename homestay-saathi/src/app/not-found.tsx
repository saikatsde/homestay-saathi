import Link from 'next/link';
import { Home, AlertCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] flex items-center justify-center shadow-xs">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold font-outfit text-[#153224]">
          404 - Page Not Found
        </h1>
        <p className="text-sm text-[#4A5B51] max-w-md mx-auto">
          The homestay page or record you are looking for does not exist or has been moved.
        </p>
      </div>

      <div className="pt-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-[#153224] hover:bg-[#1E4633] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Return to Homestay Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
