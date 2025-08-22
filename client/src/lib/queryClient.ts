import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = res.statusText;
    try {
      const text = await res.text();
      // Try to parse as JSON first
      try {
        const jsonError = JSON.parse(text);
        errorMessage = jsonError.error || jsonError.message || text;
      } catch {
        // If not JSON, use the text as is
        errorMessage = text || res.statusText;
      }
    } catch {
      errorMessage = res.statusText;
    }
    throw new Error(`${res.status}: ${errorMessage}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const token = localStorage.getItem('supabase_access_token');
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = localStorage.getItem('supabase_access_token');
    const headers: Record<string, string> = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Build URL with query parameters from filters
    let url = queryKey[0] as string;
    
    // If there are additional elements (like filters), convert them to query parameters
    if (queryKey.length > 1 && queryKey[1]) {
      const filters = queryKey[1] as Record<string, any>;
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          params.append(key, value);
        }
      });
      
      if (params.toString()) {
        url += (url.includes('?') ? '&' : '?') + params.toString();
      }
    }

    const res = await fetch(url, {
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes - more reasonable than Infinity
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors except 408, 429, and network errors
        if (error?.message?.includes('4')) {
          const status = parseInt(error.message.split(':')[0]);
          return status === 408 || status === 429;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: (failureCount, error) => {
        // Only retry network errors and 5xx errors
        if (error?.message?.includes('5') || error?.message?.includes('Network')) {
          return failureCount < 1;
        }
        return false;
      },
    },
  },
});
