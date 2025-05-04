import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import AdminSidebar from "@/components/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Order, Restaurant } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  
  // Fetch restaurant data
  const { data: restaurants } = useQuery<Restaurant[]>({
    queryKey: ["/api/admin/restaurants"],
    enabled: !!user && user.role === "admin"
  });
  
  // Fetch order data
  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    enabled: !!user && user.role === "admin"
  });
  
  // Redirect non-admin users
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      setLocation("/auth");
    }
  }, [user, isLoading, setLocation]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#CB202D]"></div>
      </div>
    );
  }
  
  // Mock data for dashboard
  const salesData = [
    { name: "Jan", sales: 4000 },
    { name: "Feb", sales: 3000 },
    { name: "Mar", sales: 5000 },
    { name: "Apr", sales: 4500 },
    { name: "May", sales: 6000 },
    { name: "Jun", sales: 5500 },
  ];
  
  const orderStatusData = [
    { name: "Pending", value: 25 },
    { name: "Preparing", value: 15 },
    { name: "Delivered", value: 60 },
  ];
  
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{orders?.length || "0"}</div>
                <p className="text-xs text-green-500 mt-1">+12.5% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₹{orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0).toFixed(2) || "0"}</div>
                <p className="text-xs text-green-500 mt-1">+8.2% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Active Restaurants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{restaurants?.length || "0"}</div>
                <p className="text-xs text-green-500 mt-1">+3 new this month</p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="sales" className="space-y-4">
            <TabsList>
              <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
              <TabsTrigger value="orders">Order Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sales" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Sales</CardTitle>
                  <CardDescription>
                    Sales performance over the last 6 months
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#CB202D" 
                        strokeWidth={2} 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="orders" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order Status Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of orders by current status
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={orderStatusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#CB202D" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left font-medium text-gray-500">Order ID</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-500">Customer</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-500">Amount</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-500">Status</th>
                        <th className="py-3 px-4 text-left font-medium text-gray-500">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders?.slice(0, 5).map((order) => (
                        <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-3 px-4">{order.id}</td>
                          <td className="py-3 px-4">User #{order.user_id}</td>
                          <td className="py-3 px-4">₹{order.total_amount.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">{new Date(order.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      {!orders?.length && (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-gray-500">No recent orders</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "preparing":
      return "bg-blue-100 text-blue-800";
    case "out_for_delivery":
      return "bg-purple-100 text-purple-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
