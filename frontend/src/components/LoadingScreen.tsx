export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent
                        rounded-full animate-spin" />
        <p className="text-cyan-400 text-sm tracking-widest font-mono uppercase">
          Authenticating
        </p>
      </div>
    </div>
  );
}