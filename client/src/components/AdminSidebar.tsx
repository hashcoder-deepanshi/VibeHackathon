import { useState } from "react";
import { SidebarNav } from "@/components/ui/sidebar-nav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { 
  Home, 
  Menu, 
  Award, 
  ListOrdered, 
  Settings, 
  LogOut, 
  User, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logoutMutation } = useAuth();

  const navItems = [
    {
      href: "/admin/dashboard",
      title: "Dashboard",
      icon: <Home className="h-4 w-4" />,
    },
    {
      href: "/admin/menu",
      title: "Menu Management",
      icon: <Menu className="h-4 w-4" />,
    },
    {
      href: "/admin/orders",
      title: "Orders",
      icon: <ListOrdered className="h-4 w-4" />,
    },
    {
      href: "/admin/reviews",
      title: "Reviews",
      icon: <Award className="h-4 w-4" />,
    },
    {
      href: "/admin/settings",
      title: "Settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-between py-6">
      <div>
        <div className="flex items-center justify-between px-4 mb-6">
          {!collapsed && (
            <div className="flex items-center">
              <img 
                src="https://b.zmtcdn.com/web_assets/b40b97e677bc7b2ca77c58c61db266fe1603954218.png" 
                alt="Zomato Logo" 
                className="h-6" 
              />
              <span className="ml-2 font-semibold text-[#CB202D]">Admin</span>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCollapsed(!collapsed)}
            className="md:flex hidden"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="px-4 mb-6">
          {!collapsed && (
            <div className="flex items-center p-2 bg-gray-100 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-[#CB202D] flex items-center justify-center text-white font-medium mr-2">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || "Restaurant Admin"}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || "admin@example.com"}</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-[#CB202D] flex items-center justify-center text-white font-medium">
                {user?.name?.charAt(0) || "U"}
              </div>
            </div>
          )}
        </div>
        
        <div className={collapsed ? "px-2" : "px-3"}>
          <SidebarNav 
            items={navItems.map(item => ({
              ...item,
              title: collapsed ? "" : item.title,
            }))} 
            className="space-y-1"
          />
        </div>
      </div>
      
      <div className="px-3 mt-auto">
        <Button 
          variant="ghost" 
          className={`w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50 ${collapsed ? "px-2" : ""}`}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {!collapsed && "Logout"}
        </Button>
      </div>
    </div>
  );

  // Mobile sidebar (sheet/drawer)
  const MobileSidebar = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );

  // Desktop sidebar
  const DesktopSidebar = () => (
    <div className={`hidden md:block h-screen bg-white border-r border-gray-200 ${collapsed ? "w-16" : "w-64"} transition-all duration-300 ease-in-out`}>
      <SidebarContent />
    </div>
  );

  return (
    <>
      <MobileSidebar />
      <DesktopSidebar />
    </>
  );
}
