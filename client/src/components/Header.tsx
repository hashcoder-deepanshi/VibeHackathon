import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function Header({ onSearch }: { onSearch?: (query: string) => void }) {
  const [, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Something went wrong while logging out",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const showLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsSignupModalOpen(false);
  };

  const showSignupModal = () => {
    setIsSignupModalOpen(true);
    setIsLoginModalOpen(false);
  };

  const closeModals = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="mr-6">
            <img 
              src="https://b.zmtcdn.com/web_assets/b40b97e677bc7b2ca77c58c61db266fe1603954218.png" 
              alt="Zomato Logo" 
              className="h-7"
            />
          </Link>
          <div className="hidden md:flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <div className="flex items-center px-3 border-r border-gray-300">
              <i className="fas fa-map-marker-alt text-[#CB202D] mr-2"></i>
              <span className="text-sm">Bangalore</span>
              <i className="fas fa-chevron-down text-xs ml-2 text-gray-500"></i>
            </div>
            <form onSubmit={handleSearch} className="flex items-center px-3 py-2 flex-1">
              <i className="fas fa-search text-gray-400 mr-2"></i>
              <Input
                type="text"
                placeholder="Search for restaurant, cuisine or a dish"
                className="w-full outline-none text-sm border-none px-0 py-0 h-auto"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
        </div>
        <div className="flex items-center">
          {user ? (
            <div className="flex items-center gap-4">
              <div onClick={() => setLocation("/profile")} className="flex items-center gap-2 cursor-pointer hover:text-[#CB202D] transition">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium">{user.name?.charAt(0)}</span>
                </div>
                <span className="text-gray-700 font-medium hidden md:inline">{user.name}</span>
              </div>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-gray-700 font-medium text-base hover:text-[#CB202D] transition"
              >
                Log out
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={showLoginModal}
                className="text-gray-700 font-medium text-base mr-6 hover:text-[#CB202D] transition"
              >
                Log in
              </Button>
              <Button
                variant="ghost"
                onClick={showSignupModal}
                className="text-gray-700 font-medium text-base hover:text-[#CB202D] transition"
              >
                Sign up
              </Button>
            </>
          )}
        </div>
      </div>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={closeModals} 
        onSwitchToSignup={showSignupModal} 
      />
      
      <SignupModal 
        isOpen={isSignupModalOpen} 
        onClose={closeModals} 
        onSwitchToLogin={showLoginModal} 
      />
    </header>
  );
}
