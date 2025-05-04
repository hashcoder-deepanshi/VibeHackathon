import { useState, useEffect, useCallback, useRef } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { Order } from "@shared/schema";

// Default map center (Bangalore)
const defaultCenter = {
  lat: 12.9716,
  lng: 77.5946
};

// Different map styles
const mapStyles = {
  default: {
    height: "300px",
    width: "100%",
    borderRadius: "8px",
  }
};

type DeliveryMapProps = {
  order?: Order;
  restaurantAddress?: string;
  customerAddress?: string;
};

type MarkerPosition = {
  lat: number;
  lng: number;
};

const bikeIcon = {
  url: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png",
  scaledSize: { width: 40, height: 40 } as google.maps.Size,
};

export default function DeliveryMap({ order, restaurantAddress, customerAddress }: DeliveryMapProps) {
  // For demo purposes, generate random coordinates near Bangalore
  const getRandomCoordinates = useCallback((base: typeof defaultCenter, offset: number = 0.02) => {
    return {
      lat: base.lat + (Math.random() - 0.5) * offset,
      lng: base.lng + (Math.random() - 0.5) * offset
    };
  }, []);
  
  const [isLoaded, setIsLoaded] = useState(false);
  
  // In a real app, these would come from the restaurant and customer data
  const [restaurantPosition, setRestaurantPosition] = useState<MarkerPosition>(getRandomCoordinates(defaultCenter));
  const [customerPosition, setCustomerPosition] = useState<MarkerPosition>(getRandomCoordinates(defaultCenter));
  const [deliveryPosition, setDeliveryPosition] = useState<MarkerPosition>(restaurantPosition);
  
  // Animation ref to store the animation frame
  const animationRef = useRef<number>();
  
  // Cleanup function to cancel any ongoing animation
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Start animation based on order status
  useEffect(() => {
    if (!order || !isLoaded) return;
    
    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (order.status === "in_transit" || order.status === "on_the_way") {
      // Custom animation implementation
      const startPosition = { ...restaurantPosition };
      const endPosition = { ...customerPosition };
      const animationDuration = 15000; // ms
      const startTime = Date.now();
      
      const animateDelivery = () => {
        const now = Date.now();
        const elapsedTime = now - startTime;
        const progress = Math.min(elapsedTime / animationDuration, 1);
        
        // Linear interpolation between start and end positions
        const currentLat = startPosition.lat + (endPosition.lat - startPosition.lat) * progress;
        const currentLng = startPosition.lng + (endPosition.lng - startPosition.lng) * progress;
        
        setDeliveryPosition({
          lat: currentLat,
          lng: currentLng
        });
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animateDelivery);
        }
      };
      
      animationRef.current = requestAnimationFrame(animateDelivery);
    } else if (order.status === "preparing") {
      setDeliveryPosition(restaurantPosition);
    } else if (order.status === "delivered") {
      setDeliveryPosition(customerPosition);
    }
    
    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [order?.status, isLoaded, restaurantPosition, customerPosition]);
  
  // Use the Google Maps API key from environment variables
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  
  const onMapLoad = () => {
    setIsLoaded(true);
  };
  
  return (
    <div className="delivery-map">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Delivery Tracking</h3>
        {order && (
          <div className="text-sm text-gray-600">
            {order.status === "preparing" && "Your order is being prepared at the restaurant."}
            {order.status === "in_transit" && "Your order is on the way!"}
            {order.status === "on_the_way" && "Your order is on the way!"}
            {order.status === "delivered" && "Your order has been delivered. Enjoy!"}
          </div>
        )}
      </div>
      
      <LoadScript googleMapsApiKey={apiKey} onLoad={() => console.log("Maps API loaded")}>
        <GoogleMap
          mapContainerStyle={mapStyles.default}
          center={defaultCenter}
          zoom={13}
          onLoad={onMapLoad}
        >
          {/* Restaurant marker */}
          <Marker
            position={restaurantPosition}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            }}
            title="Restaurant"
          />
          
          {/* Customer marker */}
          <Marker
            position={customerPosition}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            }}
            title="Delivery Address"
          />
          
          {/* Delivery person marker */}
          {order && order.status !== "pending" && (
            <Marker
              position={deliveryPosition}
              icon={bikeIcon}
              title="Delivery Person"
            />
          )}
        </GoogleMap>
      </LoadScript>
      
      <div className="mt-4 text-xs text-gray-500">
        <div className="flex items-center mb-1">
          <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
          <span>Restaurant: {restaurantAddress || "Loading address..."}</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
          <span>Delivery Address: {customerAddress || "Loading address..."}</span>
        </div>
      </div>
    </div>
  );
}