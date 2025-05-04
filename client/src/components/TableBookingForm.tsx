import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const tableBookingSchema = z.object({
  booking_date: z.date({
    required_error: "Please select a date",
  }),
  booking_time: z.string({
    required_error: "Please select a time",
  }),
  guests: z.string().min(1, "Please select number of guests"),
  special_request: z.string().optional().default(""),
});

type TableBookingFormValues = z.infer<typeof tableBookingSchema>;

type TableBookingFormProps = {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: number;
  restaurantName: string;
};

export default function TableBookingForm({
  isOpen,
  onClose,
  restaurantId,
  restaurantName,
}: TableBookingFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const form = useForm<TableBookingFormValues>({
    resolver: zodResolver(tableBookingSchema) as any,
    defaultValues: {
      booking_date: new Date(),
      guests: "2",
      special_request: "",
    },
  });

  // Get available time slots for the selected date
  const { data: timeSlots, isLoading: isLoadingTimeSlots } = useQuery({
    queryKey: ["/api/restaurants", restaurantId, "available-times", selectedDate],
    queryFn: async () => {
      if (!selectedDate) return { availableTimes: [] };
      
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const res = await apiRequest(
        "GET",
        `/api/restaurants/${restaurantId}/available-times?date=${formattedDate}`
      );
      return res.json();
    },
    enabled: !!restaurantId && !!selectedDate,
  });

  // Handle date change
  useEffect(() => {
    if (selectedDate) {
      form.setValue("booking_date", selectedDate);
    }
  }, [selectedDate, form]);

  // Book table mutation
  const bookTableMutation = useMutation({
    mutationFn: async (data: TableBookingFormValues) => {
      const response = await apiRequest(
        "POST",
        `/api/restaurants/${restaurantId}/book-table`,
        data
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Table booked successfully!",
        description: `Your reservation at ${restaurantName} has been confirmed.`,
        variant: "default",
      });
      
      // Invalidate any relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/table-bookings"] });
      
      onClose();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to book table",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit: SubmitHandler<TableBookingFormValues> = (data) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to book a table",
        variant: "destructive",
      });
      return;
    }
    
    bookTableMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            Reserve a Table
          </DialogTitle>
          <DialogDescription>
            Book a table at {restaurantName}. Fill out the details below to secure your reservation.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="booking_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "MMMM d, yyyy")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setSelectedDate(date);
                        }}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="booking_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingTimeSlots ? (
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          <span className="ml-2">Loading available times...</span>
                        </div>
                      ) : (
                        timeSlots?.availableTimes.map((time: string) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))
                      )}
                      {!isLoadingTimeSlots && (!timeSlots?.availableTimes || timeSlots.availableTimes.length === 0) && (
                        <div className="py-2 px-2 text-sm text-muted-foreground">
                          No available times for this date
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of People</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select number of guests" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "person" : "people"}
                        </SelectItem>
                      ))}
                      <SelectItem value="11">More than 10 people</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="special_request"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Requests</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any special requests? (e.g., window table, birthday celebration, etc.)"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button 
                variant="outline" 
                type="button" 
                onClick={onClose}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-red-500 hover:bg-red-600 text-white" 
                disabled={bookTableMutation.isPending}
              >
                {bookTableMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  "Book Now"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}