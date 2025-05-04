import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { format } from "date-fns";
import { TableBooking } from "@shared/schema";
import { Loader2, Calendar, Users, Clock, MessageSquare } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TableBookingsList() {
  const [filter, setFilter] = useState<string>("all");
  
  const { data: bookings, isLoading } = useQuery<TableBooking[]>({
    queryKey: ["/api/table-bookings"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium mb-2">No reservations yet</h3>
        <p className="text-muted-foreground">
          You haven't made any table reservations. Explore restaurants and book a table!
        </p>
      </div>
    );
  }

  // Sort bookings by date (newest first)
  const sortedBookings = [...bookings].sort((a, b) => {
    return new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime();
  });

  // Filter bookings based on status
  const filteredBookings = filter === "all" 
    ? sortedBookings 
    : sortedBookings.filter(booking => booking.status === filter);

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-500 hover:bg-green-600";
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "cancelled":
        return "bg-red-500 hover:bg-red-600";
      case "completed":
        return "bg-blue-500 hover:bg-blue-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <h2 className="text-2xl font-bold">Your Table Reservations</h2>
        <Select
          value={filter}
          onValueChange={setFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reservations</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{booking.restaurant_name}</CardTitle>
                  <CardDescription>
                    Booking #{booking.id}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span>
                    {format(new Date(booking.booking_date), "EEEE, MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{booking.booking_time}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-gray-500" />
                  <span>
                    {booking.guests} {booking.guests === 1 ? "person" : "people"}
                  </span>
                </div>
                {booking.special_request && (
                  <div className="flex items-start mt-1">
                    <MessageSquare className="h-4 w-4 mr-2 mt-1 text-gray-500" />
                    <span className="text-sm">{booking.special_request}</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-2 flex justify-end gap-2">
              {booking.status === "pending" && (
                <>
                  <Button variant="outline" size="sm">
                    Modify
                  </Button>
                  <Button variant="destructive" size="sm">
                    Cancel
                  </Button>
                </>
              )}
              {booking.status === "confirmed" && (
                <Button variant="destructive" size="sm">
                  Cancel
                </Button>
              )}
              {(booking.status === "completed" || booking.status === "cancelled") && (
                <Button variant="outline" size="sm">
                  Book Again
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}