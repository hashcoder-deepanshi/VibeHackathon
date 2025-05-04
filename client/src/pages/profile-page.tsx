import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Order, Review } from "../../shared/schema";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Skeleton } from "../components/ui/skeleton";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { formatDate, formatTime } from "../lib/utils";

export default function ProfilePage() {
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  
  // Sample data for demonstration purposes
  type Address = {
    id: number;
    type: string;
    full_address: string;
  };
  
  type PaymentMethod = {
    id: number;
    type: string;
    last4?: string;
    brand?: string;
    expiry?: string;
    bank_name?: string;
    upi_id?: string;
  };
  
  const [addresses, setAddresses] = useState<Address[]>([
    { id: 1, type: 'Home', full_address: '123 Main Street, Koramangala, Bangalore - 560034' },
    { id: 2, type: 'Work', full_address: 'ABC Tech Park, Whitefield, Bangalore - 560066' }
  ]);
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: 1, type: 'card', last4: '4242', brand: 'Visa', expiry: '12/24', bank_name: 'HDFC Bank' },
    { id: 2, type: 'upi', upi_id: 'user@upi', bank_name: 'SBI' }
  ]);
  
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user]);
  
  // Fetch user orders
  const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/user/orders"],
    enabled: !!user,
  });
  
  // Fetch user reviews
  const { data: reviews, isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: ["/api/user/reviews"],
    enabled: !!user,
  });
  
  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  const handleSaveProfile = () => {
    // Save profile logic would go here
    setIsEditing(false);
  };
  
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
            <p className="mb-6">You need to be logged in to view your profile.</p>
            <Button 
              onClick={() => navigate("/auth")}
              className="bg-[#CB202D] hover:bg-[#b31217] text-white"
            >
              Sign In
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">My Profile</h1>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button 
                      className="bg-[#CB202D] hover:bg-[#b31217] text-white"
                      onClick={handleSaveProfile}
                    >
                      Save
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center text-gray-700 text-4xl font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    {isEditing ? (
                      <Input 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="w-full"
                      />
                    ) : (
                      <p className="text-gray-900">{user.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    {isEditing ? (
                      <Input 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="w-full"
                      />
                    ) : (
                      <p className="text-gray-900">{user.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    {isEditing ? (
                      <Input 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        className="w-full"
                      />
                    ) : (
                      <p className="text-gray-900">{user.phone || "Not set"}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="orders">Order History</TabsTrigger>
              <TabsTrigger value="reviews">My Reviews</TabsTrigger>
              <TabsTrigger value="addresses">Saved Addresses</TabsTrigger>
              <TabsTrigger value="payments">Payment Methods</TabsTrigger>
            </TabsList>
            
            <TabsContent value="orders" className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Order History</h2>
              
              {isLoadingOrders ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                      <Skeleton className="h-4 w-full mb-2" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">Order #{order.id}</h3>
                          <p className="text-gray-600 text-sm">
                            {formatDate(order.created_at || new Date())} at {formatTime(order.created_at || new Date())}
                          </p>
                        </div>
                        <Badge className={
                          order.status === "delivered" 
                            ? "bg-green-100 text-green-800 border-green-200" 
                            : order.status === "in_transit" || order.status === "on_the_way"
                              ? "bg-blue-100 text-blue-800 border-blue-200"
                              : "bg-yellow-100 text-yellow-800 border-yellow-200"
                        }>
                          {order.status?.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-gray-700 text-sm mb-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                          <path d="M18.63 13A17.89 17.89 0 0 1 18 8"></path>
                          <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"></path>
                          <path d="M18 8a6 6 0 0 0-9.33-5"></path>
                          <path d="m1 1 22 22"></path>
                        </svg>
                        <span className="font-medium">
                          {(order as any).restaurant_name || `Restaurant #${order.restaurant_id}`}
                        </span>
                      </p>
                      <div className="flex justify-between items-center">
                        <p className="font-medium">₹{order.total_amount || "—"}</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/tracking/${order.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">You don't have any orders yet.</p>
                  <Button
                    className="mt-4 bg-[#CB202D] hover:bg-[#b31217] text-white"
                    onClick={() => navigate("/")}
                  >
                    Browse Restaurants
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="reviews" className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">My Reviews</h2>
              
              {isLoadingReviews ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ))}
                </div>
              ) : reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-semibold flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                          </svg>
                          {(review as any).restaurant_name || `Restaurant #${review.restaurant_id}`}
                        </h3>
                        <div className="flex items-center bg-green-50 px-2 py-1 rounded text-green-700 font-medium">
                          <span className="mr-1">{review.rating}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                          </svg>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2 italic">"{review.comment}"</p>
                      <div className="flex justify-between items-center">
                        <p className="text-gray-500 text-xs">{formatDate(review.created_at || new Date())}</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs text-[#CB202D] hover:text-[#a51a23]"
                          onClick={() => navigate(`/restaurant/${review.restaurant_id}`)}
                        >
                          View Restaurant
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">You haven't written any reviews yet.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="addresses" className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Saved Addresses</h2>
                <Button
                  className="bg-[#CB202D] hover:bg-[#b31217] text-white"
                  onClick={() => setIsAddingAddress(true)}
                >
                  Add New Address
                </Button>
              </div>
              
              {isAddingAddress ? (
                <div className="border rounded-lg p-6 mb-4">
                  <h3 className="text-lg font-semibold mb-4">Add New Address</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="address-type" className="block text-sm font-medium text-gray-700 mb-1">
                          Address Type
                        </label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="home">Home</SelectItem>
                            <SelectItem value="work">Work</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label htmlFor="flat-no" className="block text-sm font-medium text-gray-700 mb-1">
                          Flat/House No.
                        </label>
                        <Input id="flat-no" placeholder="e.g. 123, A-101" />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                        Street/Area
                      </label>
                      <Input id="street" placeholder="e.g. MG Road, Koramangala" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <Input id="city" placeholder="e.g. Bangalore" />
                      </div>
                      <div>
                        <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                          Pincode
                        </label>
                        <Input id="pincode" placeholder="e.g. 560001" />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddingAddress(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-[#CB202D] hover:bg-[#b31217] text-white"
                        onClick={() => {
                          const newAddress = {
                            id: addresses.length + 1,
                            type: 'Home', // Would come from form data
                            full_address: '123 New Street, Added Location, Bangalore - 560001' // Would be constructed from form data
                          };
                          setAddresses([...addresses, newAddress]);
                          setIsAddingAddress(false);
                        }}
                      >
                        Save Address
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
              
              <div className="space-y-4">
                {addresses?.map((address) => (
                  <div key={address.id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{address.type}</h3>
                        <p className="text-gray-600 text-sm mt-1">{address.full_address}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="text-[#CB202D]">
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500"
                          onClick={() => {
                            setAddresses(addresses.filter(a => a.id !== address.id));
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!addresses || addresses.length === 0) && (
                  <div className="text-center py-8">
                    <p className="text-gray-600">You don't have any saved addresses yet.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="payments" className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Payment Methods</h2>
                <Button
                  className="bg-[#CB202D] hover:bg-[#b31217] text-white"
                  onClick={() => setIsAddingPayment(true)}
                >
                  Add Payment Method
                </Button>
              </div>
              
              {isAddingPayment ? (
                <div className="border rounded-lg p-6 mb-4">
                  <h3 className="text-lg font-semibold mb-4">Add Payment Method</h3>
                  
                  <Tabs defaultValue="card" className="w-full mb-4">
                    <TabsList className="mb-4">
                      <TabsTrigger value="card">Credit/Debit Card</TabsTrigger>
                      <TabsTrigger value="upi">UPI</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="card" className="space-y-4">
                      <div>
                        <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 mb-1">
                          Card Number
                        </label>
                        <Input id="card-number" placeholder="XXXX XXXX XXXX XXXX" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry Date
                          </label>
                          <Input id="expiry" placeholder="MM/YY" />
                        </div>
                        <div>
                          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                            CVV
                          </label>
                          <Input id="cvv" placeholder="XXX" type="password" />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="card-name" className="block text-sm font-medium text-gray-700 mb-1">
                          Name on Card
                        </label>
                        <Input id="card-name" placeholder="e.g. John Smith" />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="upi" className="space-y-4">
                      <div>
                        <label htmlFor="upi-id" className="block text-sm font-medium text-gray-700 mb-1">
                          UPI ID
                        </label>
                        <Input id="upi-id" placeholder="e.g. yourname@upi" />
                      </div>
                      
                      <div>
                        <label htmlFor="bank-name" className="block text-sm font-medium text-gray-700 mb-1">
                          Bank Name
                        </label>
                        <Input id="bank-name" placeholder="e.g. SBI, HDFC" />
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingPayment(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-[#CB202D] hover:bg-[#b31217] text-white"
                      onClick={() => {
                        // Add a mock payment method (in a real app this would save form data)
                        const newPaymentMethod = {
                          id: paymentMethods.length + 1,
                          type: 'card',
                          last4: '8765',
                          brand: 'Mastercard',
                          expiry: '12/25',
                          bank_name: 'ICICI Bank'
                        };
                        setPaymentMethods([...paymentMethods, newPaymentMethod]);
                        setIsAddingPayment(false);
                      }}
                    >
                      Save Payment Method
                    </Button>
                  </div>
                </div>
              ) : null}
              
              <div className="space-y-4">
                {paymentMethods?.map((method) => (
                  <div key={method.id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        {method.type === 'card' ? (
                          <i className="fas fa-credit-card text-gray-400 mr-3"></i>
                        ) : (
                          <i className="fas fa-university text-gray-400 mr-3"></i>
                        )}
                        <div>
                          <h3 className="font-semibold">{method.type === 'card' ? `${method.brand} Card` : 'UPI'}</h3>
                          <p className="text-gray-600 text-sm mt-1">
                            {method.type === 'card' ? `••••${method.last4} - ${method.bank_name}` : method.upi_id}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500"
                        onClick={() => {
                          setPaymentMethods(paymentMethods.filter(m => m.id !== method.id));
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                
                {(!paymentMethods || paymentMethods.length === 0) && (
                  <div className="text-center py-8">
                    <p className="text-gray-600">You don't have any saved payment methods.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}