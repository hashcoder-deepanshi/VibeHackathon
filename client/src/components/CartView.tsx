import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import UpiSplitPayment, { SplitFriend } from "@/components/UpiSplitPayment";
import { v4 as uuidv4 } from 'uuid';

export default function CartView() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { cartItems, updateCartItem, getTotalAmount, clearCart } = useCart();
  const { toast } = useToast();
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [splitFriends, setSplitFriends] = useState<SplitFriend[]>([]);
  const [upiId, setUpiId] = useState("");
  const [showSplitPayment, setShowSplitPayment] = useState(false);
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  
  // Mutate function to create an order
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      // Calculate total from cart items
      const total = getTotalAmount();
      
      // Create the order payload
      const orderPayload = {
        user_id: user?.id,
        restaurant_id: cartItems[0]?.menu_item.restaurant_id, // Assuming all items are from the same restaurant
        total_amount: total,
        delivery_address: user?.address || "123 HSR Layout, 5th Main, Bangalore - 560102",
        payment_method: "UPI",
        payment_status: "completed", // Simulating a completed payment
        status: "pending",
        special_instructions: deliveryInstructions,
        split_details: splitEnabled ? splitFriends : null,
        items: cartItems.map(item => ({
          menu_item_id: item.menu_item.id,
          quantity: item.cart_item.quantity,
          price: item.menu_item.price
        }))
      };
      
      const res = await apiRequest("POST", "/api/orders", orderPayload);
      return res.json();
    },
    onSuccess: (data) => {
      clearCart();
      toast({
        title: "Order Placed Successfully",
        description: `Your order #${data.id} has been placed.`,
      });
      setLocation(`/tracking/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Place Order",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity >= 0) {
      updateCartItem(itemId, newQuantity);
    }
  };
  
  const addSplitFriend = () => {
    setSplitFriends([
      ...splitFriends, 
      { 
        id: uuidv4(),
        name: `Friend ${splitFriends.length + 1}`, 
        share: 0,
        paid: false
      }
    ]);
  };
  
  const updateFriendShare = (index: number, share: number) => {
    const newFriends = [...splitFriends];
    newFriends[index].share = share;
    setSplitFriends(newFriends);
  };
  
  const handleUpdateFriends = (friends: SplitFriend[]) => {
    setSplitFriends(friends);
  };
  
  const handlePaymentComplete = () => {
    if (splitFriends.every(f => f.paid)) {
      // If all friends have paid, proceed with order
      createOrderMutation.mutate();
    } else {
      toast({
        title: "Payment in Progress",
        description: "Some friends still need to pay their share",
      });
    }
  };
  
  const handlePlaceOrder = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to place an order",
        variant: "destructive",
      });
      return;
    }
    
    // Validate UPI ID if split is enabled
    if (splitEnabled && !upiId) {
      toast({
        title: "UPI ID Required",
        description: "Please enter your UPI ID for split payment",
        variant: "destructive",
      });
      return;
    }
    
    createOrderMutation.mutate();
  };
  
  const subtotal = getTotalAmount();
  const deliveryFee = 40;
  const taxes = Math.round(subtotal * 0.05);
  const restaurantCharges = Math.round(subtotal * 0.03);
  const total = subtotal + deliveryFee + taxes + restaurantCharges;
  
  return (
    <section className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center">
          <Link href={cartItems.length > 0 && cartItems[0]?.menu_item ? `/restaurant/${cartItems[0].menu_item.restaurant_id}` : "/"}>
            <button className="mr-4 text-gray-500">
              <i className="fas fa-arrow-left text-lg"></i>
            </button>
          </Link>
          <div>
            <h1 className="font-bold text-lg">Secure Checkout</h1>
            <p className="text-sm text-gray-500">
              {cartItems.length > 0 && cartItems[0]?.menu_item?.restaurant_id 
                ? "Restaurant Name" // Ideally this would be the restaurant name
                : "Your Cart"}
            </p>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-4 mb-24">
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-shopping-cart text-4xl text-gray-300 mb-4"></i>
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add some delicious items from restaurants</p>
            <Link href="/">
              <Button className="bg-[#CB202D] hover:bg-[#b31217] text-white">
                Browse Restaurants
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h2 className="text-lg font-bold mb-4">Delivery Address</h2>
              <div className="flex items-start mb-4">
                <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-home text-gray-500"></i>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-medium">Home</h3>
                    <span className="text-[#CB202D] text-sm">Change</span>
                  </div>
                  <p className="text-sm text-gray-600">{user?.address || "123 HSR Layout, 5th Main, Bangalore - 560102"}</p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center mb-2">
                  <i className="fas fa-clock text-gray-500 mr-2"></i>
                  <span className="text-sm text-gray-600">Delivery in 35-40 min</span>
                </div>
                <div className="mb-3">
                  <label className="text-sm font-medium text-gray-700 block mb-1">Delivery Instructions (optional)</label>
                  <Input 
                    placeholder="E.g. Door code, landmark, etc." 
                    value={deliveryInstructions} 
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h2 className="text-lg font-bold mb-4">Your Order ({cartItems.length} items)</h2>
              
              <div className="space-y-4 mb-4">
                {cartItems.map(({ cart_item, menu_item }) => (
                  <div key={cart_item.id} className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="h-4 w-4 border border-[#CB202D] rounded-sm flex items-center justify-center mr-2">
                        <span className="block h-2 w-2 bg-[#CB202D] rounded-sm"></span>
                      </div>
                      <span className="text-sm font-medium">{menu_item.name}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center mr-4">
                        <button 
                          className="h-6 w-6 border border-gray-300 rounded-md flex items-center justify-center" 
                          onClick={() => handleQuantityChange(cart_item.id, cart_item.quantity - 1)}
                        >
                          <i className="fas fa-minus text-xs text-gray-500"></i>
                        </button>
                        <span className="mx-2 text-sm">{cart_item.quantity}</span>
                        <button 
                          className="h-6 w-6 border border-gray-300 rounded-md flex items-center justify-center"
                          onClick={() => handleQuantityChange(cart_item.id, cart_item.quantity + 1)}
                        >
                          <i className="fas fa-plus text-xs text-gray-500"></i>
                        </button>
                      </div>
                      <span className="text-sm">₹{(menu_item.price * cart_item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center mb-2">
                  <i className="fas fa-utensils text-gray-500 mr-2"></i>
                  <Link href={cartItems.length > 0 && cartItems[0]?.menu_item ? `/restaurant/${cartItems[0].menu_item.restaurant_id}` : "/"}>
                    <button className="text-[#CB202D] font-medium text-sm">Add more items</button>
                  </Link>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-tag text-gray-500 mr-2"></i>
                  <button className="text-[#CB202D] font-medium text-sm">Apply coupon</button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Split Bill</h2>
                <div className="flex items-center">
                  <span className="mr-2 text-sm">Enable</span>
                  <button 
                    className={`w-10 h-6 ${splitEnabled ? 'bg-[#CB202D]' : 'bg-gray-200'} rounded-full p-1 transition-colors duration-300 ease-in-out`}
                    onClick={() => setSplitEnabled(!splitEnabled)}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${splitEnabled ? 'translate-x-4' : ''}`}></div>
                  </button>
                </div>
              </div>
              
              {splitEnabled && (
                <>
                  <p className="text-sm text-gray-600 mb-4">Split the bill with friends using UPI</p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-medium text-xs">
                            {user?.name?.substring(0, 2).toUpperCase() || "ME"}
                          </span>
                        </div>
                        <span className="text-sm font-medium">You</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium mr-2">₹{splitFriends.length ? (total - splitFriends.reduce((acc, friend) => acc + friend.share, 0)).toFixed(2) : total.toFixed(2)}</span>
                        <div className="w-5 h-5 rounded-full bg-gray-200"></div>
                      </div>
                    </div>
                    
                    {splitFriends.map((friend, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-green-600 font-medium text-xs">{friend.name.substring(0, 2).toUpperCase()}</span>
                          </div>
                          <span className="text-sm font-medium">{friend.name}</span>
                        </div>
                        <div className="flex items-center">
                          <Input 
                            type="number" 
                            className="w-24 mr-2 h-8 text-sm" 
                            value={friend.share} 
                            onChange={(e) => updateFriendShare(index, Number(e.target.value))}
                          />
                          <div className="w-5 h-5 rounded-full bg-gray-200"></div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex items-center">
                      <button 
                        className="text-[#CB202D] flex items-center font-medium text-sm"
                        onClick={addSplitFriend}
                      >
                        <i className="fas fa-plus-circle mr-2"></i>
                        <span>Add friends to split</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200">
                    <div className="mb-3">
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Enter UPI ID</label>
                      <Input 
                        type="text" 
                        placeholder="yourname@upi" 
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full text-sm"
                      />
                    </div>
                    <Button className="bg-[#CB202D] hover:bg-[#b31217] text-white text-sm font-medium px-4 py-2 rounded-md">
                      Verify UPI
                    </Button>
                  </div>
                </>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-bold mb-4">Bill Details</h2>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Item Total</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">GST</span>
                  <span>₹{taxes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Restaurant Charges</span>
                  <span>₹{restaurantCharges.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-3 mb-3">
                <div className="flex justify-between items-center font-bold">
                  <span>To Pay</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md-up p-4 border-t border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <div>
              <div className="text-sm font-bold">₹{total.toFixed(2)}</div>
              <button className="text-[#CB202D] text-xs font-medium">View Detailed Bill</button>
            </div>
            <Button 
              className="bg-[#CB202D] hover:bg-[#b31217] text-white font-medium px-6 py-2 rounded-lg transition"
              onClick={handlePlaceOrder}
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? "Processing..." : "Proceed to Pay"}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
