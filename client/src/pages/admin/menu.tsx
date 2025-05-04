import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import AdminSidebar from "@/components/AdminSidebar";
import { MenuItem, Restaurant, InsertMenuItem } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Pencil, Plus, MoreVertical, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function AdminMenu() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedRestaurant, setSelectedRestaurant] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentMenuItem, setCurrentMenuItem] = useState<MenuItem | null>(null);
  const [menuFormData, setMenuFormData] = useState<Partial<InsertMenuItem>>({
    name: "",
    description: "",
    price: 0,
    category: "",
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: false,
    is_jain: false,
    is_available: true,
  });
  
  // Fetch user's restaurants
  const { data: restaurants, isLoading: isLoadingRestaurants } = useQuery<Restaurant[]>({
    queryKey: ["/api/admin/restaurants"],
    enabled: !!user && user.role === "admin"
  });
  
  // Fetch menu items for selected restaurant
  const { data: menuItems, isLoading: isLoadingMenu } = useQuery<MenuItem[]>({
    queryKey: [`/api/restaurants/${selectedRestaurant}/menu`],
    enabled: !!selectedRestaurant
  });
  
  // Add menu item mutation
  const addMenuItemMutation = useMutation({
    mutationFn: async (item: InsertMenuItem) => {
      const res = await apiRequest("POST", `/api/admin/restaurants/${selectedRestaurant}/menu`, item);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/restaurants/${selectedRestaurant}/menu`] });
      setIsAddModalOpen(false);
      resetForm();
      toast({
        title: "Menu item added",
        description: "The menu item has been added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error adding menu item",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Update menu item mutation
  const updateMenuItemMutation = useMutation({
    mutationFn: async (item: Partial<MenuItem>) => {
      const res = await apiRequest("PUT", `/api/admin/menu/${item.id}`, item);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/restaurants/${selectedRestaurant}/menu`] });
      setIsEditModalOpen(false);
      setCurrentMenuItem(null);
      resetForm();
      toast({
        title: "Menu item updated",
        description: "The menu item has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating menu item",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete menu item mutation
  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/menu/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/restaurants/${selectedRestaurant}/menu`] });
      toast({
        title: "Menu item deleted",
        description: "The menu item has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting menu item",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Set default restaurant if available
  useEffect(() => {
    if (restaurants && restaurants.length > 0 && !selectedRestaurant) {
      setSelectedRestaurant(restaurants[0].id);
    }
  }, [restaurants, selectedRestaurant]);
  
  // Redirect non-admin users
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      setLocation("/auth");
    }
  }, [user, isLoading, setLocation]);
  
  const resetForm = () => {
    setMenuFormData({
      name: "",
      description: "",
      price: 0,
      category: "",
      is_vegetarian: false,
      is_vegan: false,
      is_gluten_free: false,
      is_jain: false,
      is_available: true,
    });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMenuFormData({
      ...menuFormData,
      [name]: name === "price" ? parseFloat(value) : value,
    });
  };
  
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setMenuFormData({
      ...menuFormData,
      [name]: checked,
    });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setMenuFormData({
      ...menuFormData,
      [name]: value,
    });
  };
  
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant) return;
    
    const newItem: InsertMenuItem = {
      ...menuFormData as InsertMenuItem,
      restaurant_id: selectedRestaurant,
    };
    
    addMenuItemMutation.mutate(newItem);
  };
  
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMenuItem) return;
    
    const updatedItem = {
      ...menuFormData,
      id: currentMenuItem.id,
    };
    
    updateMenuItemMutation.mutate(updatedItem);
  };
  
  const handleEditClick = (item: MenuItem) => {
    setCurrentMenuItem(item);
    setMenuFormData({
      name: item.name,
      description: item.description || "",
      price: item.price,
      category: item.category || "",
      is_vegetarian: item.is_vegetarian || false,
      is_vegan: item.is_vegan || false,
      is_gluten_free: item.is_gluten_free || false,
      is_jain: item.is_jain || false,
      is_available: item.is_available,
    });
    setIsEditModalOpen(true);
  };
  
  const handleDeleteClick = (id: number) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      deleteMenuItemMutation.mutate(id);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#CB202D]"></div>
      </div>
    );
  }
  
  // Group menu items by category
  const menuItemsByCategory: Record<string, MenuItem[]> = {};
  if (menuItems) {
    menuItems.forEach((item) => {
      const category = item.category || "Uncategorized";
      if (!menuItemsByCategory[category]) {
        menuItemsByCategory[category] = [];
      }
      menuItemsByCategory[category].push(item);
    });
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Menu Management</h1>
            
            <div className="flex items-center gap-4">
              <div className="w-64">
                <Select 
                  value={selectedRestaurant?.toString() || ""} 
                  onValueChange={(value) => setSelectedRestaurant(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a restaurant" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants?.map((restaurant) => (
                      <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                        {restaurant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#CB202D] hover:bg-[#b31217]">
                    <Plus className="h-4 w-4 mr-2" /> Add Menu Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Add New Menu Item</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Item Name</Label>
                          <Input 
                            id="name" 
                            name="name" 
                            value={menuFormData.name} 
                            onChange={handleInputChange} 
                            required 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="price">Price (₹)</Label>
                          <Input 
                            id="price" 
                            name="price" 
                            type="number" 
                            step="0.01" 
                            value={menuFormData.price} 
                            onChange={handleInputChange} 
                            required 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input 
                          id="category" 
                          name="category" 
                          value={menuFormData.category} 
                          onChange={handleInputChange} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                          id="description" 
                          name="description" 
                          value={menuFormData.description} 
                          onChange={handleInputChange} 
                          rows={3} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Dietary Options</Label>
                        <div className="flex flex-wrap gap-4 mt-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="is_vegetarian" 
                              checked={menuFormData.is_vegetarian} 
                              onCheckedChange={(checked) => handleCheckboxChange("is_vegetarian", checked as boolean)} 
                            />
                            <Label htmlFor="is_vegetarian" className="font-normal">Vegetarian</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="is_vegan" 
                              checked={menuFormData.is_vegan} 
                              onCheckedChange={(checked) => handleCheckboxChange("is_vegan", checked as boolean)} 
                            />
                            <Label htmlFor="is_vegan" className="font-normal">Vegan</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="is_gluten_free" 
                              checked={menuFormData.is_gluten_free} 
                              onCheckedChange={(checked) => handleCheckboxChange("is_gluten_free", checked as boolean)} 
                            />
                            <Label htmlFor="is_gluten_free" className="font-normal">Gluten Free</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="is_jain" 
                              checked={menuFormData.is_jain} 
                              onCheckedChange={(checked) => handleCheckboxChange("is_jain", checked as boolean)} 
                            />
                            <Label htmlFor="is_jain" className="font-normal">Jain</Label>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="is_available" 
                          checked={menuFormData.is_available} 
                          onCheckedChange={(checked) => handleCheckboxChange("is_available", checked as boolean)} 
                        />
                        <Label htmlFor="is_available" className="font-normal">Available for ordering</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-[#CB202D] hover:bg-[#b31217]"
                        disabled={addMenuItemMutation.isPending}
                      >
                        {addMenuItemMutation.isPending ? "Adding..." : "Add Item"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {isLoadingRestaurants || isLoadingMenu ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#CB202D]"></div>
            </div>
          ) : !selectedRestaurant ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500 mb-4">Select a restaurant to manage its menu</p>
                {restaurants?.length === 0 && (
                  <p className="text-gray-500">You don't have any restaurants yet</p>
                )}
              </CardContent>
            </Card>
          ) : menuItems?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500 mb-4">No menu items found for this restaurant</p>
                <Button 
                  className="bg-[#CB202D] hover:bg-[#b31217]"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add your first menu item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {Object.entries(menuItemsByCategory).map(([category, items]) => (
                <div key={category}>
                  <h2 className="text-xl font-bold mb-4">{category}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                      <Card key={item.id} className={!item.is_available ? "opacity-60" : ""}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg font-bold">{item.name}</CardTitle>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditClick(item)}>
                                  <Pencil className="h-4 w-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-500"
                                  onClick={() => handleDeleteClick(item.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <CardDescription>₹{item.price.toFixed(2)}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.is_vegetarian && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">Veg</span>
                            )}
                            {item.is_vegan && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">Vegan</span>
                            )}
                            {item.is_jain && (
                              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded">Jain</span>
                            )}
                            {item.is_gluten_free && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">GF</span>
                            )}
                            {!item.is_available && (
                              <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded">Unavailable</span>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-[#CB202D] border-[#CB202D]"
                            onClick={() => handleEditClick(item)}
                          >
                            <Pencil className="h-3 w-3 mr-2" /> Edit
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Item Name</Label>
                  <Input 
                    id="edit-name" 
                    name="name" 
                    value={menuFormData.name} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price (₹)</Label>
                  <Input 
                    id="edit-price" 
                    name="price" 
                    type="number" 
                    step="0.01" 
                    value={menuFormData.price} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Input 
                  id="edit-category" 
                  name="category" 
                  value={menuFormData.category} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  name="description" 
                  value={menuFormData.description} 
                  onChange={handleInputChange} 
                  rows={3} 
                />
              </div>
              <div className="space-y-2">
                <Label>Dietary Options</Label>
                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="edit-is_vegetarian" 
                      checked={menuFormData.is_vegetarian} 
                      onCheckedChange={(checked) => handleCheckboxChange("is_vegetarian", checked as boolean)} 
                    />
                    <Label htmlFor="edit-is_vegetarian" className="font-normal">Vegetarian</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="edit-is_vegan" 
                      checked={menuFormData.is_vegan} 
                      onCheckedChange={(checked) => handleCheckboxChange("is_vegan", checked as boolean)} 
                    />
                    <Label htmlFor="edit-is_vegan" className="font-normal">Vegan</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="edit-is_gluten_free" 
                      checked={menuFormData.is_gluten_free} 
                      onCheckedChange={(checked) => handleCheckboxChange("is_gluten_free", checked as boolean)} 
                    />
                    <Label htmlFor="edit-is_gluten_free" className="font-normal">Gluten Free</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="edit-is_jain" 
                      checked={menuFormData.is_jain} 
                      onCheckedChange={(checked) => handleCheckboxChange("is_jain", checked as boolean)} 
                    />
                    <Label htmlFor="edit-is_jain" className="font-normal">Jain</Label>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="edit-is_available" 
                  checked={menuFormData.is_available} 
                  onCheckedChange={(checked) => handleCheckboxChange("is_available", checked as boolean)} 
                />
                <Label htmlFor="edit-is_available" className="font-normal">Available for ordering</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-[#CB202D] hover:bg-[#b31217]"
                disabled={updateMenuItemMutation.isPending}
              >
                {updateMenuItemMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
