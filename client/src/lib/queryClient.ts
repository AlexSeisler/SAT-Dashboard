import { QueryClient, QueryFunction } from "@tanstack/react-query";

// 🔥 Hardcoded Render base URL (use your deployed backend address)
const API_BASE = "https://sat-dashboard-v4s0.onrender.com";

// --- Utility to throw on non-OK responses ---
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// --- Core API Request Helper ---
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  const fullUrl = `${API_BASE}${url.startsWith("/") ? url : `/${url}`}`;
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

// --- React Query Fetch Wrapper ---
type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const endpoint = queryKey.join("/");
    const fullUrl = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const res = await fetch(fullUrl, { credentials: "include" });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// --- React Query Client ---
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
