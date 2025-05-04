import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  TruckIcon, UtensilsIcon, MoonIcon, StarIcon, LeafIcon, 
  PercentIcon, DollarSignIcon, ClockIcon, FilterIcon, 
  Coffee, Pizza, FishIcon, HeartIcon
} from "lucide-react";

type Filter = {
  id: string;
  name: string;
  active: boolean;
  icon: React.ReactNode;
};

export default function QuickFilters({ onFilterChange }: { onFilterChange: (filters: string[]) => void }) {
  const [filters, setFilters] = useState<Filter[]>([
    { id: "delivery", name: "Delivery", active: true, icon: <TruckIcon className="w-4 h-4" /> },
    { id: "dining_out", name: "Dining Out", active: false, icon: <UtensilsIcon className="w-4 h-4" /> },
    { id: "nightlife", name: "Nightlife", active: false, icon: <MoonIcon className="w-4 h-4" /> },
    { id: "rating_4+", name: "Rating 4.0+", active: false, icon: <StarIcon className="w-4 h-4" /> },
    { id: "pure_veg", name: "Pure Veg", active: false, icon: <LeafIcon className="w-4 h-4" /> },
    { id: "offers", name: "Offers", active: false, icon: <PercentIcon className="w-4 h-4" /> },
    { id: "price", name: "Price", active: false, icon: <DollarSignIcon className="w-4 h-4" /> },
    { id: "open_now", name: "Open Now", active: false, icon: <ClockIcon className="w-4 h-4" /> },
    { id: "cafe", name: "Café", active: false, icon: <Coffee className="w-4 h-4" /> },
    { id: "pizza", name: "Pizza", active: false, icon: <Pizza className="w-4 h-4" /> },
    { id: "seafood", name: "Seafood", active: false, icon: <FishIcon className="w-4 h-4" /> },
    { id: "popular", name: "Popular", active: false, icon: <HeartIcon className="w-4 h-4" /> },
  ]);

  const toggleFilter = (id: string) => {
    const updatedFilters = filters.map(filter => 
      filter.id === id ? { ...filter, active: !filter.active } : filter
    );
    setFilters(updatedFilters);
    
    // Notify parent component about the change
    const activeFilterIds = updatedFilters
      .filter(filter => filter.active)
      .map(filter => filter.id);
    
    onFilterChange(activeFilterIds);
  };

  return (
    <section className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#1C1C1C]">Quick Filters</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 text-sm border-gray-300 hover:bg-gray-50"
        >
          <span className="text-gray-600">All Filters</span>
          <FilterIcon className="w-4 h-4 text-[#CB202D]" />
        </Button>
      </div>

      <div className="relative">
        <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
          {filters.map(filter => (
            <Button
              key={filter.id}
              onClick={() => toggleFilter(filter.id)}
              variant="ghost"
              className={`min-w-max h-auto px-4 py-3 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-sm ${
                filter.active 
                  ? "bg-[#CB202D] text-white shadow-md transform scale-105" 
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <span className={`${filter.active ? "text-white" : "text-[#CB202D]"}`}>
                {filter.icon}
              </span>
              {filter.name}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
