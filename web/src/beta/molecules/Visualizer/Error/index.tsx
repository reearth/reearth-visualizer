import type { FallbackProps } from "react-error-boundary";

export default function Error({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div>
      <h1>Oops! An Error Occurred</h1>
      <p>{error.message}</p>
      <p>
        <button style={{ color: "#fff" }} onClick={resetErrorBoundary}>
          Retry
        </button>
      </p>
    </div>
  );
}
