import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Restaurant } from "@shared/schema";

const reviewFormSchema = z.object({
  rating: z.coerce.number().min(1, { message: "Please select a rating" }).max(5),
  content: z.string().min(5, { message: "Review must be at least 5 characters" }).max(1000, { message: "Review cannot exceed 1000 characters" })
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
  restaurantId: number;
  restaurant: Restaurant | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReviewForm({ restaurantId, restaurant, isOpen, onClose }: ReviewFormProps) {
  const [stars, setStars] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      content: ""
    }
  });

  const reviewMutation = useMutation({
    mutationFn: async (data: ReviewFormValues) => {
      const res = await apiRequest("POST", `/api/restaurants/${restaurantId}/reviews`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!"
      });
      queryClient.invalidateQueries({ queryKey: [`/api/restaurants/${restaurantId}/reviews`] });
      queryClient.invalidateQueries({ queryKey: [`/api/restaurants/${restaurantId}`] });
      form.reset();
      setStars(0);
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error submitting review",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = async (data: ReviewFormValues) => {
    if (data.rating === 0) {
      form.setError("rating", { message: "Please select a rating" });
      return;
    }
    reviewMutation.mutate(data);
  };

  const handleStarClick = (rating: number) => {
    setStars(rating);
    form.setValue("rating", rating);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="text-2xl focus:outline-none"
                          onClick={() => handleStarClick(star)}
                        >
                          <span className={star <= stars ? "text-yellow-400" : "text-gray-300"}>
                            ★
                          </span>
                        </button>
                      ))}
                      <Input 
                        type="hidden" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Review</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={`Share your experience at ${restaurant?.name}`}
                      className="resize-none min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Let others know about your dining experience.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={reviewMutation.isPending}
                className="bg-[#CB202D] hover:bg-[#b31217] text-white"
              >
                {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}