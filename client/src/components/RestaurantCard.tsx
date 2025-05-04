import { Link } from "wouter";
import { Restaurant } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Leaf, Wheat, Apple } from "lucide-react";

type RestaurantCardProps = {
  restaurant: Restaurant;
};

// Helper function to get the appropriate dietary icon
const getDietaryIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'vegetarian':
      return <Leaf className="h-3 w-3 mr-1" />;
    case 'vegan':
      return <Apple className="h-3 w-3 mr-1" />;
    case 'gluten_free':
    case 'gluten-free':
      return <Wheat className="h-3 w-3 mr-1" />;
    default:
      return <Leaf className="h-3 w-3 mr-1" />;
  }
};

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <div className="restaurant-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-200 cursor-pointer">
        <div className="relative">
          <img 
            src={restaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"} 
            alt={`${restaurant.name} Interior`} 
            className="w-full h-48 object-cover"
          />
          <div className="absolute bottom-2 right-2 text-white text-xs bg-black bg-opacity-70 rounded px-2 py-1">
            <i className="fas fa-image mr-1"></i> {restaurant.photos?.length || "15"}+ Photos
          </div>
          <div className="absolute top-2 right-2 text-white text-xs bg-black bg-opacity-70 rounded px-2 py-1">
            <i className="far fa-clock mr-1"></i> {restaurant.estimated_delivery_time || "30-35"} mins
          </div>
          {Math.random() > 0.5 && (
            <div className="absolute top-2 left-2 text-white text-xs bg-[#CB202D] rounded px-2 py-1">
              <i className="fas fa-tag mr-1"></i> {Math.floor(Math.random() * 40) + 10}% OFF
            </div>
          )}
        </div>
        <div className="p-3">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold text-lg truncate">{restaurant.name}</h3>
            <div className="rating-badge">
              {restaurant.rating ? restaurant.rating.toFixed(1) : "New"} ★
            </div>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
            <div className="truncate">{restaurant.cuisine_type?.join(", ") || "Multi Cuisine"}</div>
            <div>₹{restaurant.price_range || "500"} for two</div>
          </div>
          <div className="py-2 flex flex-wrap gap-1">
            {restaurant.dietary_options?.map((option, index) => (
              <Badge 
                key={index}
                variant="outline"
                className="text-xs px-2 py-0 bg-green-50 border-green-200"
              >
                {getDietaryIcon(option)}
                {option.charAt(0).toUpperCase() + option.slice(1).replace('_', ' ')}
              </Badge>
            ))}
          </div>
          
          <div className="border-t border-gray-200 pt-2 flex justify-between items-center text-sm">
            <div className="text-[#696969]">{restaurant.city}, {restaurant.address?.split(",")[0]}</div>
            <div className="text-[#4CAF50] flex items-center">
              <span className="w-2 h-2 rounded-full bg-[#4CAF50] mr-1"></span>
              <span>Open Now</span>
            </div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
          .rating-badge {
            background-color: #4CAF50;
            color: white;
            padding: 2px 5px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: bold;
          }
        `
      }} />
    </Link>
  );
}
