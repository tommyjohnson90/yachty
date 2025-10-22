// App configuration
// This ensures the APP_URL is properly accessible throughout the application

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')

export const config = {
  appUrl: APP_URL,
} as const
