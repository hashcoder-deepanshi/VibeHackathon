import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface Category {
  id: number;
  name: string;
  image: string;
}

export default function FoodCategories({ onCategorySelect }: { onCategorySelect: (category: string) => void }) {
  // Fetch categories from API
  const { data: categoriesData, isLoading, error } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Fallback categories if API fails
  const fallbackCategories = [
    { id: 1, name: "Pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" },
    { id: 2, name: "Burger", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" },
    { id: 3, name: "Biryani", image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" },
    { id: 4, name: "Chinese", image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" },
    { id: 5, name: "Dessert", image: "https://images.unsplash.com/photo-1517244683847-7456b63c5969?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" },
    { id: 6, name: "South Indian", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" },
    { id: 7, name: "Coffee", image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" },
    { id: 8, name: "Thali", image: "https://images.unsplash.com/photo-1533630018502-3de8f9089f65?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" },
  ];

  const categories = categoriesData || fallbackCategories;

  const handleCategoryClick = (categoryName: string) => {
    onCategorySelect(categoryName);
  };

  return (
    <section className="container mx-auto py-8 px-4 border-b border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-[#1C1C1C]">Eat what makes you happy</h2>
      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-6">
        {categories.map((category) => (
          <div 
            key={category.id} 
            className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
            onClick={() => handleCategoryClick(category.name)}
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden mb-2">
              <img 
                src={category.image} 
                alt={category.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-medium text-center">{category.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
