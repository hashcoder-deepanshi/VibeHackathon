import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import CartView from "@/components/CartView";

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  
  // Redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/auth");
    }
  }, [user, isLoading, setLocation]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#CB202D]"></div>
      </div>
    );
  }
  
  return <CartView />;
}
