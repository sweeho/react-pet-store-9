import { ErrorFrame } from "@/components/shell";

const RootErrorBoundary = () => {
  return (
    <ErrorFrame
      title="Error"
      message="An error occurred. Please try again later."
      onRetry={() => window.location.reload()}
    />
  );
};

export default RootErrorBoundary;
