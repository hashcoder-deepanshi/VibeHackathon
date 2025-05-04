import { useParams } from "wouter";
import RestaurantDetail from "@/components/RestaurantDetail";

export default function RestaurantPage() {
  const params = useParams<{ id: string }>();
  const restaurantId = params?.id ? parseInt(params.id) : 0;
  
  if (!restaurantId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Restaurant Not Found</h1>
          <p className="text-gray-600">The restaurant you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }
  
  return <RestaurantDetail restaurantId={restaurantId} />;
}
