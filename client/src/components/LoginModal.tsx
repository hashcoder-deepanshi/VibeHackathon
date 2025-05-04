import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginModal({ isOpen, onClose, onSwitchToSignup }: LoginModalProps) {
  const { loginMutation } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setErrorMessage(null);
      await loginMutation.mutateAsync(data);
      onClose();
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage((error as Error).message || "Failed to log in. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1C1C1C]">Login</DialogTitle>
          <DialogDescription>
            Enter your credentials to access your account
          </DialogDescription>
        </DialogHeader>
        
        {errorMessage && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
            {errorMessage}
          </div>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      placeholder="Email" 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#CB202D]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Password" 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#CB202D]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-[#CB202D] text-white font-medium py-3 rounded-lg hover:bg-[#b31217] transition"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-4">or login with</p>
          <div className="flex justify-center space-x-4">
            <button className="flex items-center justify-center w-12 h-12 border border-gray-300 rounded-full hover:bg-gray-50 transition">
              <i className="fab fa-google text-lg"></i>
            </button>
            <button className="flex items-center justify-center w-12 h-12 border border-gray-300 rounded-full hover:bg-gray-50 transition">
              <i className="fab fa-facebook-f text-lg"></i>
            </button>
            <button className="flex items-center justify-center w-12 h-12 border border-gray-300 rounded-full hover:bg-gray-50 transition">
              <i className="fas fa-phone-alt text-lg"></i>
            </button>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            New to Zomato? 
            <Button 
              variant="link" 
              className="text-[#CB202D] font-medium pl-1"
              onClick={onSwitchToSignup}
            >
              Create account
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
