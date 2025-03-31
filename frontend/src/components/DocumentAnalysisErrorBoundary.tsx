'use client';

import { useEffect } from 'react';
import { Button } from "@/components/ui/button";

export function DocumentAnalysisErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="p-4 border border-destructive rounded-lg bg-destructive/10">
      <h3 className="text-lg font-medium text-destructive mb-2">
        Analysis Error
      </h3>
      <p className="text-sm mb-4">{error.message}</p>
      <Button variant="outline" onClick={reset}>
        Try Again
      </Button>
    </div>
  );
}