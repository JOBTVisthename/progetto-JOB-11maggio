
import { ReactNode } from "react";

interface ErrorDisplayProps {
  error: string | null;
}

const ErrorDisplay = ({ error }: ErrorDisplayProps) => {
  if (!error) return null;
  
  return (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
      {error}
    </div>
  );
};

export default ErrorDisplay;
