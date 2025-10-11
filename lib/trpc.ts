import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  if (__DEV__) {
    console.warn('⚠️ EXPO_PUBLIC_RORK_API_BASE_URL not set, using localhost');
    return 'http://localhost:8081';
  }

  throw new Error(
    "No base url found. Please set EXPO_PUBLIC_RORK_API_BASE_URL in .env.local"
  );
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});