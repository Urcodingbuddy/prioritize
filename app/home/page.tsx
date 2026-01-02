"use client";

// Home page placeholder - will be replaced with modern UI later
export default function Dashboard() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="text-center space-y-4">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <span className="text-3xl">🏠</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight">Home</h1>
        <p className="text-muted-foreground text-sm max-w-md">
          Your personal dashboard will appear here. We&apos;re building
          something amazing.
        </p>
      </div>
    </div>
  );
}
