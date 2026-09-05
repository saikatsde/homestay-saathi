export default function Loading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-[#EBF4EF] border border-[#D5E5DC] text-[#153224] flex items-center justify-center text-2xl animate-spin">
        🍵
      </div>
      <p className="text-sm font-semibold text-[#153224] font-outfit animate-pulse">
        Loading homestay records...
      </p>
    </div>
  );
}
