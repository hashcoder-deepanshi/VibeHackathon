import { useState } from "react";
import { MenuItem } from "@shared/schema";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Leaf, Apple, Wheat } from "lucide-react";

type MenuItemProps = {
  item: MenuItem;
  showLoginModal?: () => void;
};

export default function MenuItemComponent({ item, showLoginModal }: MenuItemProps) {
  const { addToCart, isItemInCart, getCartItemQuantity } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const handleAddToCart = async () => {
    if (!user) {
      if (showLoginModal) {
        showLoginModal();
      }
      return;
    }
    
    setIsAddingToCart(true);
    try {
      await addToCart({
        menu_item_id: item.id,
        quantity: 1,
        user_id: user.id
      });
      toast({
        title: "Added to cart",
        description: `${item.name} has been added to your cart`,
      });
    } catch (error) {
      toast({
        title: "Failed to add item",
        description: "There was an error adding this item to your cart",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  const isInCart = user ? isItemInCart(item.id) : false;
  const quantity = user ? getCartItemQuantity(item.id) : 0;
  
  return (
    <div className="flex border-b border-gray-200 pb-6">
      <div className="flex-shrink-0 mr-4">
        <div className="relative">
          <img 
            src={item.image || "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=240&q=80"} 
            alt={item.name} 
            className="w-28 h-28 object-cover rounded-lg"
          />
          <button className="absolute bottom-2 right-2 bg-white text-[#CB202D] w-6 h-6 rounded-full flex items-center justify-center shadow-md">
            <i className="far fa-heart"></i>
          </button>
        </div>
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <div>
            <h3 className="font-medium">{item.name}</h3>
            {(item.is_vegetarian || item.is_vegan || item.is_jain || item.is_gluten_free) && (
              <div className="flex flex-wrap gap-1 mt-1">
                {item.is_vegetarian && (
                  <Badge variant="outline" className="text-xs px-2 py-0 bg-green-50 border-green-200 flex items-center">
                    <Leaf className="h-3 w-3 mr-1 text-green-600" />
                    Vegetarian
                  </Badge>
                )}
                {item.is_vegan && (
                  <Badge variant="outline" className="text-xs px-2 py-0 bg-green-50 border-green-200 flex items-center">
                    <Apple className="h-3 w-3 mr-1 text-green-600" />
                    Vegan
                  </Badge>
                )}
                {item.is_jain && (
                  <Badge variant="outline" className="text-xs px-2 py-0 bg-orange-50 border-orange-200 flex items-center">
                    <Leaf className="h-3 w-3 mr-1 text-orange-600" />
                    Jain
                  </Badge>
                )}
                {item.is_gluten_free && (
                  <Badge variant="outline" className="text-xs px-2 py-0 bg-yellow-50 border-yellow-200 flex items-center">
                    <Wheat className="h-3 w-3 mr-1 text-yellow-600" />
                    Gluten-Free
                  </Badge>
                )}
              </div>
            )}
          </div>
          <div>
            {isInCart ? (
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="px-2 py-1 h-auto border-[#CB202D] text-[#CB202D]"
                  onClick={() => quantity > 1 && addToCart({
                    menu_item_id: item.id,
                    quantity: quantity - 1,
                    user_id: user!.id
                  })}
                >
                  -
                </Button>
                <span className="mx-2 text-sm">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="px-2 py-1 h-auto border-[#CB202D] text-[#CB202D]"
                  onClick={() => addToCart({
                    menu_item_id: item.id,
                    quantity: quantity + 1,
                    user_id: user!.id
                  })}
                >
                  +
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                disabled={isAddingToCart}
                className="bg-white border border-[#CB202D] text-[#CB202D] px-6 py-1 rounded text-sm font-medium"
                onClick={handleAddToCart}
              >
                {isAddingToCart ? "Adding..." : "Add"}
              </Button>
            )}
          </div>
        </div>
        <div className="text-[#696969] text-sm mb-1">₹{item.price}</div>
        <p className="text-gray-500 text-sm mb-2">{item.description}</p>
        <div className="flex items-center text-xs text-gray-400">
          <i className="fas fa-star mr-1"></i>
          <span>4.3 • 120+ ratings</span>
        </div>
      </div>
    </div>
  );
}
