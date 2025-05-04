import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/hooks/useAuth";
import DeliveryMap from "@/components/DeliveryMap";
import DeliveryChat from "@/components/DeliveryChat";
import React from "react";

type OrderTrackingProps = {
  orderId: number;
};

export default function OrderTracking({ orderId }: OrderTrackingProps) {
  const { user } = useAuth();
  const socket = useSocket();
  const [orderStatus, setOrderStatus] = useState<string>("pending");
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Fetch order details
  const { data: orderData, isLoading } = useQuery<{
    order: Order;
    items: any[];
  }>({
    queryKey: [`/api/orders/${orderId}`],
  });
  
  // Subscribe to order updates via WebSocket
  useEffect(() => {
    if (!socket || !user) return;
    
    // Authenticate the WebSocket connection
    socket.send(JSON.stringify({
      type: 'auth',
      userId: user.id
    }));
    
    // Subscribe to order updates
    socket.send(JSON.stringify({
      type: 'subscribe',
      orderId
    }));
    
    // Handle incoming messages
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'order_update' && data.data.id === orderId) {
          setOrderStatus(data.data.status);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    socket.addEventListener('message', handleMessage);
    
    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, user, orderId]);
  
  // Update order status from fetched data
  useEffect(() => {
    if (orderData?.order?.status) {
      setOrderStatus(orderData.order.status);
    }
  }, [orderData]);
  
  // Determine which step is active
  const steps = {
    confirmed: orderStatus !== 'pending',
    prepared: ['preparing', 'ready', 'out_for_delivery', 'delivered'].includes(orderStatus),
    out_for_delivery: ['out_for_delivery', 'delivered'].includes(orderStatus),
    delivered: orderStatus === 'delivered'
  };
  
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
            <h1 className="font-bold text-lg">Delivery Status</h1>
            <p className="text-sm text-gray-500">
              Order #{orderData?.order?.id || orderId}
            </p>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-4 mb-6 max-w-3xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#CB202D]"></div>
          </div>
        ) : (
          <React.Fragment>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {orderData?.items?.[0]?.menu_item?.restaurant_name || "Restaurant"}
              </h2>
              <div className="mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium" 
                style={{
                  backgroundColor: getStatusBadgeColor(orderStatus).replace('bg-', '#'),
                  color: 'white'
                }}>
                {formatOrderStatus(orderStatus)}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-bold">
                    {orderData?.items?.[0]?.menu_item?.restaurant_name || "Restaurant Name"}
                  </h2>
                  <span className={`text-xs ${getStatusBadgeColor(orderStatus)} text-white px-2 py-1 rounded`}>
                    {formatOrderStatus(orderStatus)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Order #{orderData?.order?.id} | {formatDate(orderData?.order?.created_at ? orderData.order.created_at.toString() : undefined)}
                </p>
              </div>
              
              <div className="p-4">
                <div className="flex items-center mb-6">
                  <div className="relative flex items-center">
                    <div className={`h-8 w-8 ${steps.confirmed ? 'bg-[#CB202D]' : 'bg-gray-300'} rounded-full flex items-center justify-center z-10`}>
                      {steps.confirmed ? (
                        <i className="fas fa-check text-white text-xs"></i>
                      ) : (
                        <i className="fas fa-concierge-bell text-white text-xs"></i>
                      )}
                    </div>
                    <div className={`h-1 w-16 ${steps.prepared ? 'bg-[#CB202D]' : 'bg-gray-300'} ml-1`}></div>
                  </div>
                  <div className="relative flex items-center">
                    <div className={`h-8 w-8 ${steps.prepared ? 'bg-[#CB202D]' : 'bg-gray-300'} rounded-full flex items-center justify-center z-10`}>
                      {steps.prepared ? (
                        <i className="fas fa-check text-white text-xs"></i>
                      ) : (
                        <i className="fas fa-utensils text-white text-xs"></i>
                      )}
                    </div>
                    <div className={`h-1 w-16 ${steps.out_for_delivery ? 'bg-[#CB202D]' : 'bg-gray-300'} ml-1`}></div>
                  </div>
                  <div className="relative flex items-center">
                    <div className={`h-8 w-8 ${steps.out_for_delivery ? 'bg-[#CB202D]' : 'bg-gray-300'} rounded-full flex items-center justify-center z-10 relative`}>
                      {steps.out_for_delivery && !steps.delivered && (
                        <React.Fragment>
                          <div className="h-2 w-2 bg-white rounded-full absolute"></div>
                          <div className="h-8 w-8 bg-[#CB202D] rounded-full absolute animate-ping opacity-30"></div>
                        </React.Fragment>
                      )}
                      {steps.delivered ? (
                        <i className="fas fa-check text-white text-xs"></i>
                      ) : (
                        <i className="fas fa-motorcycle text-white text-xs"></i>
                      )}
                    </div>
                    <div className={`h-1 w-16 ${steps.delivered ? 'bg-[#CB202D]' : 'bg-gray-300'} ml-1`}></div>
                  </div>
                  <div className="relative flex items-center">
                    <div className={`h-8 w-8 ${steps.delivered ? 'bg-[#CB202D]' : 'bg-gray-300'} rounded-full flex items-center justify-center z-10`}>
                      <i className="fas fa-home text-white text-xs"></i>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-600 mb-6">
                  <span className={steps.confirmed ? 'text-[#CB202D] font-medium' : ''}>
                    Order <br/>Confirmed
                  </span>
                  <span className={steps.prepared ? 'text-[#CB202D] font-medium' : ''}>
                    Order <br/>Prepared
                  </span>
                  <span className={steps.out_for_delivery ? 'text-[#CB202D] font-medium' : ''}>
                    Out for <br/>Delivery
                  </span>
                  <span className={steps.delivered ? 'text-[#CB202D] font-medium' : ''}>
                    Order <br/>Delivered
                  </span>
                </div>
                
                <div className="text-center mb-4">
                  <p className="text-lg font-bold">{getStatusMessage(orderStatus)}</p>
                  <p className="text-sm text-gray-600">
                    Estimated delivery by {getEstimatedDeliveryTime(orderData?.order?.created_at ? orderData.order.created_at.toString() : undefined)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="rounded-t-lg overflow-hidden">
                {orderData?.order ? (
                  <DeliveryMap 
                    order={orderData.order} 
                    restaurantAddress={orderData?.items?.[0]?.menu_item?.restaurant_name || "Restaurant"}
                    customerAddress={orderData.order.delivery_address || "Your address"}
                  />
                ) : (
                  <div className="h-64 bg-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <i className="fas fa-map-marker-alt text-[#CB202D] text-4xl mb-2"></i>
                      <p className="text-gray-500">Loading map...</p>
                    </div>
                  </div>
                )}
              </div>
              
              {steps.out_for_delivery && (
                <div className="p-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-gray-100 rounded-full mr-3 overflow-hidden">
                      <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Delivery Person" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-medium">Rajesh Kumar</h3>
                        <div className="flex items-center">
                          <i className="fas fa-star text-yellow-400 text-xs mr-1"></i>
                          <span className="text-sm">4.8</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Your delivery partner</p>
                    </div>
                  </div>
                  
                  <div className="flex mt-4">
                    <button className="flex-1 mr-3 bg-[#CB202D] text-white py-2 rounded-lg font-medium">
                      <i className="fas fa-phone-alt mr-2"></i>
                      Call
                    </button>
                    <button 
                      className="flex-1 border border-[#CB202D] text-[#CB202D] py-2 rounded-lg font-medium flex items-center justify-center"
                      onClick={() => setIsChatOpen(true)}
                    >
                      <i className="fas fa-comment-alt mr-2"></i>
                      Chat
                    </button>
                  </div>
                  
                  {/* Chat component */}
                  {isChatOpen && (
                    <DeliveryChat
                      isOpen={isChatOpen}
                      onClose={() => setIsChatOpen(false)}
                      orderId={orderId}
                      driverName="Rajesh Kumar"
                    />
                  )}
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-bold mb-2">Order Summary</h2>
                <p className="text-sm text-gray-600">{orderData?.items?.length || 0} items</p>
              </div>
              
              <div className="p-4">
                <div className="space-y-3 mb-4">
                  {orderData?.items?.map((item) => (
                    <div key={item.order_item.id} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`h-2 w-2 ${item.menu_item.is_vegetarian ? 'bg-green-500' : 'bg-red-500'} rounded-full mr-2`}></div>
                        <span className="text-sm">{item.order_item.quantity} × {item.menu_item.name}</span>
                      </div>
                      <span className="text-sm">₹{item.order_item.price * item.order_item.quantity}</span>
                    </div>
                  ))}
                </div>
                
                {/* Detailed Bill Section */}
                <div className="border-t border-gray-200 pt-3 mb-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Item Total</span>
                      <span>₹{(orderData?.order?.total_amount || 0) - 70}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span>₹40</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">GST and Restaurant Charges</span>
                      <span>₹30</span>
                    </div>
                    
                    {orderData?.order?.payment_status === 'discount_applied' && (
                      <div className="flex justify-between items-center text-sm text-green-600">
                        <span>Discount Applied</span>
                        <span>-₹50</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center font-bold mt-2 pt-2 border-t border-gray-200">
                      <span>Total Paid</span>
                      <span>₹{orderData?.order?.total_amount || 0}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="bg-blue-50 rounded-lg p-3 mb-3 border border-blue-100">
                    <div className="flex items-start">
                      <div className="text-blue-500 mr-2">
                        <i className="fas fa-info-circle text-lg"></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-700">Order Status: <span className="font-bold text-green-600">{formatOrderStatus(orderStatus)}</span></p>
                        <p className="text-xs text-gray-600 mt-1">
                          {orderData?.order?.payment_method === 'ONLINE' ? 'Paid online' : 'Paid via cash on delivery'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => window.print()} 
                    className="w-full border border-[#CB202D] text-[#CB202D] py-2 rounded-lg font-medium"
                  >
                    <i className="fas fa-print mr-2"></i>
                    Print Bill
                  </button>
                </div>
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
    </section>
  );
}

function formatOrderStatus(status: string): string {
  switch (status) {
    case 'pending': return 'Pending';
    case 'confirmed': return 'Confirmed';
    case 'preparing': return 'Preparing';
    case 'ready': return 'Ready';
    case 'out_for_delivery': return 'On the way';
    case 'delivered': return 'Delivered';
    case 'cancelled': return 'Cancelled';
    default: return 'Processing';
  }
}

function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'pending': return 'bg-yellow-500';
    case 'confirmed': return 'bg-blue-500';
    case 'preparing': return 'bg-blue-500';
    case 'ready': return 'bg-blue-500';
    case 'out_for_delivery': return 'bg-[#4CAF50]';
    case 'delivered': return 'bg-[#4CAF50]';
    case 'cancelled': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
}

function getStatusMessage(status: string): string {
  switch (status) {
    case 'pending': return 'Your order is being processed';
    case 'confirmed': return 'Your order has been confirmed!';
    case 'preparing': return 'Your food is being prepared!';
    case 'ready': return 'Your food is ready for pickup!';
    case 'out_for_delivery': return 'Your food is on the way!';
    case 'delivered': return 'Your food has been delivered!';
    case 'cancelled': return 'Your order has been cancelled';
    default: return 'Your order is being processed';
  }
}

function formatDate(dateString?: string): string {
  if (!dateString) return 'Today';
  
  const date = new Date(dateString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
  return `Today, ${formattedHours}:${formattedMinutes} ${ampm}`;
}

function getEstimatedDeliveryTime(createdAt?: string): string {
  if (!createdAt) return 'Soon';
  
  const orderDate = new Date(createdAt);
  const estimatedMinutes = 40;
  const deliveryDate = new Date(orderDate.getTime() + estimatedMinutes * 60000);
  
  const hours = deliveryDate.getHours();
  const minutes = deliveryDate.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

function getStatusTextColor(status: string): string {
  switch (status) {
    case 'pending': return 'text-yellow-600';
    case 'confirmed': return 'text-blue-600';
    case 'preparing': return 'text-blue-600';
    case 'ready': return 'text-blue-600';
    case 'out_for_delivery': return 'text-green-600';
    case 'delivered': return 'text-green-600';
    case 'cancelled': return 'text-red-600';
    default: return 'text-gray-600';
  }
}
