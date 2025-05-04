import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import OrderTracking from "@/components/OrderTracking";

export default function TrackingPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const orderId = params?.id ? parseInt(params.id) : 0;
  
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
  
  if (!orderId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-gray-600">The order you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }
  
  return <OrderTracking orderId={orderId} />;
}
