import { useEffect } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Login schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// Register schema
const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  
  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync(data);
      // Redirect to home page on successful login
      setLocation("/");
    } catch (error) {
      console.error("Login error:", error);
    }
  };
  
  const onRegisterSubmit = async (data: RegisterFormValues) => {
    try {
      await registerMutation.mutateAsync(data);
      // Redirect to home page on successful registration
      setLocation("/");
    } catch (error) {
      console.error("Registration error:", error);
    }
  };
  
  // Redirect authenticated users
  if (user) {
    return null; // Rendering is handled by the useEffect
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Auth forms */}
            <div className="md:w-1/2 p-8">
              <h1 className="text-2xl font-bold mb-6 text-[#1C1C1C]">Welcome to Zomato</h1>
              
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-[#CB202D] text-white font-medium hover:bg-[#b31217]"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Logging in..." : "Log in"}
                      </Button>
                    </form>
                  </Form>
                  
                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">
                          Or continue with
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-3 gap-3">
                      <Button variant="outline" className="w-full">
                        <i className="fab fa-google mr-2"></i> Google
                      </Button>
                      <Button variant="outline" className="w-full">
                        <i className="fab fa-facebook-f mr-2"></i> Facebook
                      </Button>
                      <Button variant="outline" className="w-full">
                        <i className="fas fa-phone-alt mr-2"></i> Phone
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-[#CB202D] text-white font-medium hover:bg-[#b31217]"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating account..." : "Create account"}
                      </Button>
                    </form>
                  </Form>
                  
                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">
                          Or continue with
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-3 gap-3">
                      <Button variant="outline" className="w-full">
                        <i className="fab fa-google mr-2"></i> Google
                      </Button>
                      <Button variant="outline" className="w-full">
                        <i className="fab fa-facebook-f mr-2"></i> Facebook
                      </Button>
                      <Button variant="outline" className="w-full">
                        <i className="fas fa-phone-alt mr-2"></i> Phone
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Hero section */}
            <div className="md:w-1/2 bg-[#CB202D] p-8 text-white flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-4">Discover the best food & drinks in your city</h2>
              <p className="mb-6">
                Zomato helps you find the best restaurants, cafes, and bars in your area. 
                Order food online for delivery, dine out with friends, or explore new places to eat.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                    <i className="fas fa-utensils"></i>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">Extensive Restaurant Selection</h3>
                    <p className="text-white/70">Choose from thousands of local favorites</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                    <i className="fas fa-truck"></i>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">Fast Delivery</h3>
                    <p className="text-white/70">Get your food delivered in minutes</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                    <i className="fas fa-tag"></i>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">Great Offers</h3>
                    <p className="text-white/70">Enjoy exclusive deals and discounts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
