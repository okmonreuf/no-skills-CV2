import { LoadingScreen } from "@/components/common/LoadingScreen";
import { useAuth } from "@/hooks/use-auth";
import { Outlet, Navigate, useLocation } from "react-router-dom";

export function ProtectedLayout() {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingScreen label="Vérification de la session" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
