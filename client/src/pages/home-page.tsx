import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import QuickFilters from "@/components/QuickFilters";
import FoodCategories from "@/components/FoodCategories";
import RestaurantList from "@/components/RestaurantList";
import DietaryFilters from "@/components/DietaryFilters";
import Footer from "@/components/Footer";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>(["delivery"]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Reset category when searching
    setSelectedCategory("");
  };
  
  const handleFilterChange = (filters: string[]) => {
    setSelectedFilters(filters);
  };
  
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    // Reset search when category is selected
    setSearchQuery("");
  };
  
  const handleDietaryFilterChange = (filters: string[]) => {
    setDietaryPreferences(filters);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header onSearch={handleSearch} />
      
      <main className="flex-grow">
        <HeroSection onSearch={handleSearch} />
        
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            <div className="w-full md:w-1/4">
              <div className="bg-white rounded-lg shadow p-4 mb-4">
                <QuickFilters onFilterChange={handleFilterChange} />
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <DietaryFilters onFilterChange={handleDietaryFilterChange} />
              </div>
            </div>
            
            <div className="w-full md:w-3/4">
              <FoodCategories onCategorySelect={handleCategorySelect} />
              <RestaurantList 
                searchQuery={searchQuery} 
                selectedFilters={selectedFilters} 
                selectedCategory={selectedCategory}
                dietaryPreferences={dietaryPreferences}
              />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
