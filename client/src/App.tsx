import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { SocketProvider } from "@/hooks/useSocket";
import { ProtectedRoute } from "@/lib/protected-route";

import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import RestaurantPage from "@/pages/restaurant-page";
import CheckoutPage from "@/pages/checkout-page";
import TrackingPage from "@/pages/tracking-page";
import ProfilePage from "@/pages/profile-page";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminMenu from "@/pages/admin/menu";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage}/>
      <Route path="/auth" component={AuthPage}/>
      <Route path="/restaurant/:id" component={RestaurantPage}/>
      <ProtectedRoute path="/checkout" component={CheckoutPage} />
      <ProtectedRoute path="/tracking/:id" component={TrackingPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} requiredRole="admin" />
      <ProtectedRoute path="/admin/menu" component={AdminMenu} requiredRole="admin" />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <SocketProvider>
              <Toaster />
              <Router />
            </SocketProvider>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
