import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Restaurant } from "@shared/schema";
import RestaurantCard from "./RestaurantCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type RestaurantListProps = {
  searchQuery: string;
  selectedFilters: string[];
  selectedCategory?: string;
  dietaryPreferences?: string[];
};

export default function RestaurantList({ 
  searchQuery, 
  selectedFilters, 
  selectedCategory,
  dietaryPreferences = [] 
}: RestaurantListProps) {
  const [page, setPage] = useState(1);
  
  // Build query parameters
  const queryParams = new URLSearchParams();
  if (searchQuery) queryParams.append("search", searchQuery);
  if (selectedCategory) queryParams.append("cuisine", selectedCategory);
  if (selectedFilters.includes("rating_4+")) queryParams.append("minRating", "4");
  
  // Add dietary preferences to query
  dietaryPreferences.forEach(pref => {
    queryParams.append("diet", pref);
  });
  
  queryParams.append("page", page.toString());
  queryParams.append("limit", "6");
  
  const queryKey = [`/api/restaurants?${queryParams.toString()}`];
  
  const { data, isLoading, error } = useQuery<{ data: Restaurant[], meta: { total: number, pages: number } }>({
    queryKey,
  });
  
  const restaurants = data?.data || [];
  const totalPages = data?.meta?.pages || 1;
  
  const loadMore = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };
  
  // Reset to page 1 when search/filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedFilters, selectedCategory, dietaryPreferences]);
  
  return (
    <section className="container mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6 text-[#1C1C1C]">
        {searchQuery 
          ? `Results for "${searchQuery}"` 
          : selectedCategory 
            ? `Best ${selectedCategory} Places` 
            : "Best Restaurants in Bangalore"}
      </h2>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-lg overflow-hidden shadow border border-gray-200">
              <Skeleton className="w-full h-48" />
              <div className="p-3">
                <div className="flex justify-between items-center mb-1">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-6 w-10" />
                </div>
                <div className="flex justify-between items-center mb-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="pt-2 flex justify-between items-center">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500 mb-2">Something went wrong</p>
          <p className="text-gray-600">We couldn't load the restaurants. Please try again later.</p>
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xl mb-2">No restaurants found</p>
          <p className="text-gray-600">Try adjusting your filters or search term</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
          
          {page < totalPages && (
            <div className="mt-8 text-center">
              <Button 
                onClick={loadMore}
                className="bg-white text-[#CB202D] border border-[#CB202D] rounded-lg px-6 py-3 font-medium hover:bg-[#CB202D] hover:text-white transition"
              >
                Show More Restaurants
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
