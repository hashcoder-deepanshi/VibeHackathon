import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Leaf, Wheat, Apple, Cookie, X } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type DietaryPreference = {
  id: string;
  name: string;
  icon: React.ReactNode;
};

const dietaryPreferences: DietaryPreference[] = [
  { id: "vegetarian", name: "Vegetarian", icon: <Leaf className="h-4 w-4 mr-2" /> },
  { id: "vegan", name: "Vegan", icon: <Apple className="h-4 w-4 mr-2" /> },
  { id: "jain", name: "Jain", icon: <Leaf className="h-4 w-4 mr-2" /> },
  { id: "gluten_free", name: "Gluten Free", icon: <Wheat className="h-4 w-4 mr-2" /> },
];

interface DietaryFiltersProps {
  onFilterChange: (filters: string[]) => void;
  className?: string;
}

export default function DietaryFilters({ onFilterChange, className = "" }: DietaryFiltersProps) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  
  // Update parent component when filters change
  useEffect(() => {
    onFilterChange(selectedFilters);
  }, [selectedFilters, onFilterChange]);
  
  const toggleFilter = (id: string) => {
    setSelectedFilters(prev => 
      prev.includes(id) 
        ? prev.filter(f => f !== id) 
        : [...prev, id]
    );
  };
  
  const clearAllFilters = () => {
    setSelectedFilters([]);
  };
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Dietary Preferences</h3>
        
        {selectedFilters.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs text-gray-500"
            onClick={clearAllFilters}
          >
            Clear All
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {dietaryPreferences.map((preference) => (
          <Badge
            key={preference.id}
            variant="outline"
            className={`cursor-pointer flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              selectedFilters.includes(preference.id)
                ? "bg-[#CB202D] text-white border-[#CB202D]"
                : "border-gray-300 text-gray-700 hover:border-[#CB202D] hover:text-[#CB202D]"
            }`}
            onClick={() => toggleFilter(preference.id)}
          >
            {preference.icon}
            {preference.name}
            {selectedFilters.includes(preference.id) && (
              <X className="h-3 w-3 ml-1" />
            )}
          </Badge>
        ))}
      </div>
      
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full mt-2">
              Filter by Diet
              {selectedFilters.length > 0 && (
                <Badge className="ml-2 bg-[#CB202D] text-white">{selectedFilters.length}</Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Dietary Preferences</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {dietaryPreferences.map((preference) => (
              <DropdownMenuItem 
                key={preference.id}
                onClick={() => toggleFilter(preference.id)}
                className="cursor-pointer"
              >
                <div className="flex items-center">
                  {preference.icon}
                  {preference.name}
                  {selectedFilters.includes(preference.id) && (
                    <Badge className="ml-2 bg-[#CB202D] text-white px-1 py-0">✓</Badge>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
            {selectedFilters.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={clearAllFilters}>
                  <div className="flex items-center text-gray-500 w-full justify-center">
                    Clear All Filters
                  </div>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}