export function Eye({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className={className}
    >
      <path
        d="M6 2.625C2.25 2.625 0.75 6.00037 0.75 6.00037C0.75 6.00037 2.25 9.375 6 9.375C9.75 9.375 11.25 6.00037 11.25 6.00037C11.25 6.00037 9.75 2.625 6 2.625Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 7.875C7.03553 7.875 7.875 7.03553 7.875 6C7.875 4.96447 7.03553 4.125 6 4.125C4.96447 4.125 4.125 4.96447 4.125 6C4.125 7.03553 4.96447 7.875 6 7.875Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
