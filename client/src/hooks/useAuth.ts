import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export function useAuth() {
  const token = localStorage.getItem('supabase_access_token');
  const storedUser = localStorage.getItem('supabase_user');
  
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: !!token,
    staleTime: 1 * 60 * 1000, // Data becomes stale after 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes to keep profile fresh
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  // If there's an auth error, clear localStorage
  if (error && token) {
    localStorage.removeItem('supabase_access_token');
    localStorage.removeItem('supabase_user');
    window.location.reload();
  }

  const logout = () => {
    localStorage.removeItem('supabase_access_token');
    localStorage.removeItem('supabase_user');
    queryClient.invalidateQueries();
    window.location.href = "/login";
  };

  // Update localStorage with fresh user data when available
  if (user && JSON.stringify(user) !== storedUser) {
    localStorage.setItem('supabase_user', JSON.stringify(user));
  }

  // Use fetched user if available, otherwise use stored user
  const currentUser = user || (storedUser ? JSON.parse(storedUser) : null);

  return {
    user: currentUser,
    isLoading: !!token && isLoading,
    isAuthenticated: !!token && (!!user || !!storedUser),
    logout,
  };
}
