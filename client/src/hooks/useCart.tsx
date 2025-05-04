import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { InsertCartItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

type CartContextType = {
  cartItems: any[];
  isLoading: boolean;
  error: Error | null;
  addToCart: (item: InsertCartItem) => Promise<void>;
  updateCartItem: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isItemInCart: (menuItemId: number) => boolean;
  getCartItemQuantity: (menuItemId: number) => number;
  getTotalItems: () => number;
  getTotalAmount: () => number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { 
    data: cartItems = [], 
    isLoading, 
    error,
    refetch: refetchCart
  } = useQuery({
    queryKey: ["/api/cart"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user, // Only fetch cart if user is logged in
  });

  // Add item to cart
  const addToCartMutation = useMutation({
    mutationFn: async (item: InsertCartItem) => {
      await apiRequest("POST", "/api/cart", item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding to cart",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  // Update cart item quantity
  const updateCartItemMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      if (quantity === 0) {
        await apiRequest("DELETE", `/api/cart/${itemId}`, {});
      } else {
        await apiRequest("PUT", `/api/cart/${itemId}`, { quantity });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating cart",
        description: error.message || "Failed to update cart item",
        variant: "destructive",
      });
    },
  });

  // Remove item from cart
  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await apiRequest("DELETE", `/api/cart/${itemId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error removing from cart",
        description: error.message || "Failed to remove item from cart",
        variant: "destructive",
      });
    },
  });

  // Clear cart
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/cart", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error clearing cart",
        description: error.message || "Failed to clear cart",
        variant: "destructive",
      });
    },
  });

  const addToCart = async (item: InsertCartItem) => {
    await addToCartMutation.mutateAsync(item);
  };

  const updateCartItem = async (itemId: number, quantity: number) => {
    await updateCartItemMutation.mutateAsync({ itemId, quantity });
  };

  const removeFromCart = async (itemId: number) => {
    await removeFromCartMutation.mutateAsync(itemId);
  };

  const clearCart = async () => {
    await clearCartMutation.mutateAsync();
  };

  const isItemInCart = (menuItemId: number) => {
    return cartItems.some((item) => item.menu_item.id === menuItemId);
  };

  const getCartItemQuantity = (menuItemId: number) => {
    const item = cartItems.find((item) => item.menu_item.id === menuItemId);
    return item ? item.cart_item.quantity : 0;
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.cart_item.quantity, 0);
  };

  const getTotalAmount = () => {
    return cartItems.reduce(
      (total, item) => total + item.menu_item.price * item.cart_item.quantity,
      0
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoading,
        error,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        isItemInCart,
        getCartItemQuantity,
        getTotalItems,
        getTotalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
