import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { Restaurant, MenuItem as MenuItemType } from "@shared/schema";
import MenuItemComponent from "./MenuItem";
import WaitTimeTracker from "./WaitTimeTracker";
import ReviewForm from "./ReviewForm";
import ShareOptions from "./ShareOptions";
import TableBookingForm from "./TableBookingForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Leaf, Wheat, Apple, X, Calendar } from "lucide-react";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";

type RestaurantDetailProps = {
  restaurantId: number;
};

export default function RestaurantDetail({ restaurantId }: RestaurantDetailProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { cartItems, getTotalAmount, getTotalItems } = useCart();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedDietaryFilters, setSelectedDietaryFilters] = useState<string[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  // Fetch restaurant details
  const { data: restaurant, isLoading: isLoadingRestaurant } = useQuery<Restaurant>({
    queryKey: [`/api/restaurants/${restaurantId}`],
  });
  
  // Build query parameters for menu items with dietary filters
  const menuQueryParams = new URLSearchParams();
  selectedDietaryFilters.forEach(filter => {
    menuQueryParams.append("diet", filter);
  });
  
  // Fetch menu items with dietary filters if selected
  const menuQueryString = menuQueryParams.toString();
  const menuEndpoint = menuQueryString 
    ? `/api/restaurants/${restaurantId}/menu?${menuQueryString}`
    : `/api/restaurants/${restaurantId}/menu`;
    
  const { data: menuItems, isLoading: isLoadingMenu } = useQuery<MenuItemType[]>({
    queryKey: [menuEndpoint],
  });
  
  const showLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsSignupModalOpen(false);
  };
  
  const goToCheckout = () => {
    if (!user) {
      showLoginModal();
      return;
    }
    setLocation(`/checkout`);
  };
  
  // Group menu items by category
  const menuCategories = menuItems 
    ? Array.from(new Set(menuItems.map(item => item.category || "Uncategorized")))
    : [];
  
  const filteredMenuItems = menuItems
    ? activeCategory === "all" 
      ? menuItems 
      : menuItems.filter(item => item.category === activeCategory)
    : [];
  
  const isLoading = isLoadingRestaurant || isLoadingMenu;
  
  return (
    <section className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center">
          <Link href="/">
            <button className="mr-4 text-gray-500">
              <i className="fas fa-arrow-left text-lg"></i>
            </button>
          </Link>
          <div>
            <h1 className="font-bold text-lg">{isLoading ? "Restaurant Details" : restaurant?.name}</h1>
            <p className="text-sm text-gray-500">{isLoading ? "Loading..." : `${restaurant?.address}, ${restaurant?.city}`}</p>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-4">
        {isLoading ? (
          // Loading state
          <>
            <Skeleton className="w-full h-64 md:h-80 rounded-lg mb-4" />
            <div className="mb-6">
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <div className="flex gap-3">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="relative mb-4">
              <img 
                src={restaurant?.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"} 
                alt="Restaurant Cover" 
                className="w-full h-64 md:h-80 object-cover rounded-lg"
              />
              <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-md px-4 py-2 flex items-center space-x-6">
                <button className="flex items-center text-[#1C1C1C]">
                  <i className="far fa-images mr-2"></i>
                  <span>View Gallery</span>
                </button>
                <button 
                  className="flex items-center text-[#1C1C1C]"
                  onClick={() => setIsShareModalOpen(true)}
                >
                  <i className="fas fa-share-alt mr-2"></i>
                  <span>Share</span>
                </button>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{restaurant?.name}</h1>
                <div className="bg-[#4CAF50] text-white px-2 py-1 rounded text-sm font-medium">
                  {restaurant?.rating ? restaurant.rating.toFixed(1) : "New"} ★
                </div>
              </div>
              <p className="text-gray-600 mb-2">{restaurant?.cuisine_type?.join(", ") || "Multi Cuisine"}</p>
              <p className="text-gray-600 mb-4">{restaurant?.address}, {restaurant?.city}</p>
              <div className="flex items-center text-sm text-[#696969] mb-4">
                <div className="flex items-center mr-6">
                  <i className="far fa-clock mr-2"></i>
                  <span>Open now: {restaurant?.opening_time || "11am"} – {restaurant?.closing_time || "11pm"}</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-wallet mr-2"></i>
                  <span>₹{restaurant?.price_range || "600"} for two</span>
                </div>
              </div>
              
              {/* Smart Wait Time Tracker */}
              <div className="mb-4">
                <WaitTimeTracker 
                  restaurantId={restaurantId} 
                  googlePlaceId={restaurant?.google_place_id || undefined} 
                />
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button 
                  className="flex items-center bg-[#CB202D] hover:bg-[#a51a23] text-white px-4 py-2 rounded-lg"
                  onClick={() => {
                    if (restaurant?.phone) {
                      window.location.href = `tel:${restaurant.phone}`;
                    } else {
                      alert("Phone number not available");
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <span>Call</span>
                </Button>
                
                <Button 
                  className="flex items-center bg-[#CB202D] hover:bg-[#a51a23] text-white px-4 py-2 rounded-lg"
                  onClick={() => {
                    if (!user) {
                      setIsLoginModalOpen(true);
                      return;
                    }
                    // In a real app, this would save the restaurant to the user's favorites
                    alert("Restaurant saved to your favorites!");
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span>Save</span>
                </Button>
                
                <Button 
                  className="flex items-center bg-[#CB202D] hover:bg-[#a51a23] text-white px-4 py-2 rounded-lg"
                  onClick={() => {
                    if (restaurant?.address) {
                      const encodedAddress = encodeURIComponent(restaurant.address);
                      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
                    } else {
                      alert("Address not available");
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
                  </svg>
                  <span>Directions</span>
                </Button>
                
                <Button 
                  className="flex items-center bg-[#CB202D] hover:bg-[#a51a23] text-white px-4 py-2 rounded-lg"
                  onClick={() => {
                    if (!user) {
                      setIsLoginModalOpen(true);
                      return;
                    }
                    setIsBookingModalOpen(true);
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Book Table</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex items-center bg-white border border-gray-300 text-[#1C1C1C] hover:border-[#CB202D] hover:text-[#CB202D] px-4 py-2 rounded-lg"
                  onClick={() => {
                    if (!user) {
                      setIsLoginModalOpen(true);
                      return;
                    }
                    setIsReviewModalOpen(true);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <span>Add Review</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex items-center bg-white border border-gray-300 text-[#1C1C1C] hover:border-[#CB202D] hover:text-[#CB202D] px-4 py-2 rounded-lg"
                  onClick={() => setIsShareModalOpen(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                  <span>Share</span>
                </Button>
              </div>
            </div>
          </>
        )}
        
        <div className="border-t border-b border-gray-200 py-4 mb-6">
          <h2 className="text-xl font-bold mb-4">Order Online</h2>
          
          {/* Dietary Preferences Filter */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Dietary Preferences</h3>
              {selectedDietaryFilters.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-xs text-gray-500"
                  onClick={() => setSelectedDietaryFilters([])}
                >
                  Clear All
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {["vegetarian", "vegan", "gluten_free", "jain"].map((pref) => {
                const isSelected = selectedDietaryFilters.includes(pref);
                
                // Helper function to get the appropriate icon
                const getIcon = () => {
                  switch(pref) {
                    case "vegetarian": return <Leaf className="h-4 w-4 mr-2" />;
                    case "vegan": return <Apple className="h-4 w-4 mr-2" />;
                    case "gluten_free": return <Wheat className="h-4 w-4 mr-2" />;
                    case "jain": return <Leaf className="h-4 w-4 mr-2" />;
                    default: return <Leaf className="h-4 w-4 mr-2" />;
                  }
                };
                
                return (
                  <Badge
                    key={pref}
                    variant="outline"
                    className={`cursor-pointer flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      isSelected
                        ? "bg-[#CB202D] text-white border-[#CB202D]"
                        : "border-gray-300 text-gray-700 hover:border-[#CB202D] hover:text-[#CB202D]"
                    }`}
                    onClick={() => {
                      setSelectedDietaryFilters(prev => 
                        prev.includes(pref) 
                          ? prev.filter(f => f !== pref) 
                          : [...prev, pref]
                      );
                    }}
                  >
                    {getIcon()}
                    {pref.charAt(0).toUpperCase() + pref.slice(1).replace('_', ' ')}
                    {isSelected && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                );
              })}
            </div>
          </div>
          
          <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="flex overflow-x-auto space-x-4 pb-2 scroll-container h-auto bg-transparent">
              <TabsTrigger 
                value="all" 
                className={`min-w-max px-4 py-2 rounded-full text-sm font-medium 
                  ${activeCategory === "all" ? "bg-gray-200 text-[#1C1C1C]" : "border border-gray-300"}`}
              >
                All
              </TabsTrigger>
              {menuCategories.map((category) => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className={`min-w-max px-4 py-2 rounded-full text-sm font-medium
                    ${activeCategory === category ? "bg-gray-200 text-[#1C1C1C]" : "border border-gray-300"}`}
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="all" className="space-y-6 mb-8 mt-4">
              <h2 className="text-xl font-bold mb-4">
                {isLoading 
                  ? <Skeleton className="h-7 w-40" /> 
                  : `Recommended (${filteredMenuItems.length})`
                }
              </h2>
              
              {isLoading ? (
                // Loading skeletons for menu items
                [...Array(3)].map((_, i) => (
                  <div key={i} className="flex border-b border-gray-200 pb-6">
                    <Skeleton className="w-28 h-28 rounded-lg mr-4" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <Skeleton className="h-4 w-16 mb-1" />
                      <Skeleton className="h-4 w-4/5 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))
              ) : filteredMenuItems.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No menu items available</p>
              ) : (
                filteredMenuItems.map((item) => (
                  <MenuItemComponent 
                    key={item.id} 
                    item={item} 
                    showLoginModal={showLoginModal}
                  />
                ))
              )}
            </TabsContent>
            
            {menuCategories.map((category) => (
              <TabsContent key={category} value={category} className="space-y-6 mb-8 mt-4">
                <h2 className="text-xl font-bold mb-4">{category}</h2>
                {filteredMenuItems.map((item) => (
                  <MenuItemComponent 
                    key={item.id} 
                    item={item} 
                    showLoginModal={showLoginModal}
                  />
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
      
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md-up p-4 border-t border-gray-200">
          <Button 
            onClick={goToCheckout}
            className="w-full bg-[#CB202D] text-white font-medium py-3 rounded-lg hover:bg-[#b31217] transition"
          >
            Continue ({getTotalItems()} items) • ₹{getTotalAmount()}
          </Button>
        </div>
      )}
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onSwitchToSignup={() => {
          setIsLoginModalOpen(false);
          setIsSignupModalOpen(true);
        }} 
      />
      
      <SignupModal 
        isOpen={isSignupModalOpen} 
        onClose={() => setIsSignupModalOpen(false)} 
        onSwitchToLogin={() => {
          setIsSignupModalOpen(false);
          setIsLoginModalOpen(true);
        }} 
      />

      {restaurant && (
        <>
          <ReviewForm 
            restaurantId={restaurantId}
            restaurant={restaurant}
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
          />

          <ShareOptions
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            title={`${restaurant.name} on Zomato Clone`}
            url={window.location.href}
          />
          
          <TableBookingForm
            isOpen={isBookingModalOpen}
            onClose={() => setIsBookingModalOpen(false)}
            restaurantId={restaurantId}
            restaurantName={restaurant.name}
          />
        </>
      )}
      
      {/* Styles moved to index.css */}
    </section>
  );
}
