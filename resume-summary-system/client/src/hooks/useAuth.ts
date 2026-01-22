import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

export function useAuth() {
  const { data: user, isLoading: loading, error } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  const logout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/";
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    logout,
    getLoginUrl,
  };
}
