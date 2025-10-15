export default function BodyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-brand mb-4">📊 Body</h1>
          <p className="text-xl text-text-muted mb-8">
            Coming soon - Track your body metrics and progress
          </p>
          <div className="bg-surface rounded-lg p-8 border border-border">
            <p className="text-text-muted">
              This section will include body measurements, progress photos, 
              and analytics to track your physical transformation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

