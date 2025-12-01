import { useQuery } from "@tanstack/react-query";

interface SessionResponse {
  success: boolean;
  username?: string;
}

export const SESSION_QUERY_KEY = ["session"] as const;

export const useSession = () => {
  const query = useQuery<SessionResponse>({
    queryKey: SESSION_QUERY_KEY,
    queryFn: async () => {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
      });

      if (!response.ok) {
        return { success: false };
      }

      return (await response.json()) as SessionResponse;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
    retryDelay: 200,
  });

  return {
    isLoading: query.isLoading,
    isAuthenticated: query.data?.success === true,
    username: query.data?.username,
    refetch: query.refetch,
  };
};
