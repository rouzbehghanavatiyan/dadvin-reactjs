export default function ProviderIcon({ provider }) {
  if (provider === "linkedin")
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <rect width="24" height="24" rx="2" fill="#0A66C2" />
        <path
          fill="white"
          d="M5 9h3v10H5zm1.5-5A1.75 1.75 0 1 0 6.5 7.5 1.75 1.75 0 0 0 6.5 4ZM10 9h3v1.4c.5-.9 1.5-1.7 3-1.7 3 0 3.5 2 3.5 4.6V19h-3v-5c0-1.2 0-2.7-1.7-2.7s-1.9 1.3-1.9 2.6V19H10z"
        />
      </svg>
    );
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.89-1.74 2.98-4.3 2.98-7.36Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.41 13.92a6 6 0 0 1 0-3.84V7.49H3.07a10 10 0 0 0 0 9.02l3.34-2.59Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.96c1.47 0 2.79.5 3.82 1.5l2.86-2.86A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.49l3.34 2.59A6 6 0 0 1 12 5.96Z"
      />
    </svg>
  );
}
