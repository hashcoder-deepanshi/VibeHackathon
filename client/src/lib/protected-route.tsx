import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
  requiredRole,
}: {
  path: string;
  component: () => JSX.Element;
  requiredRole?: string;
}) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-[#CB202D]" />
        </div>
      </Route>
    );
  }

  if (!user) {
    // Redirect to auth page if not logged in
    return (
      <Route path={path}>
        {() => {
          setLocation("/auth");
          return null;
        }}
      </Route>
    );
  }

  if (requiredRole && user.role !== requiredRole) {
    // If a specific role is required but the user doesn't have it
    return (
      <Route path={path}>
        {() => {
          setLocation("/");
          return null;
        }}
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
