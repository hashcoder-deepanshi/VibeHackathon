import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Send, X, Phone, LucideMessageSquare, Mic, Image, MapPin } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/utils";

type Message = {
  id: string;
  text: string;
  sender: "user" | "driver";
  timestamp: Date;
  status?: "sent" | "delivered" | "read";
  type?: "text" | "location" | "image" | "voice";
  attachment?: string;
};

type DeliveryChatProps = {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  driverName: string;
  driverPhoneNumber?: string;
};

export default function DeliveryChat({ isOpen, onClose, orderId, driverName, driverPhoneNumber }: DeliveryChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `Hello! I'm ${driverName}, your delivery partner for order #${orderId}. I'll be delivering your food today.`,
      sender: "driver",
      timestamp: new Date(Date.now() - 60000 * 2),
      status: "read"
    },
    {
      id: "2",
      text: `I've picked up your order and am on my way to deliver it.`,
      sender: "driver",
      timestamp: new Date(Date.now() - 60000),
      status: "read"
    }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const socket = useSocket();
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  // Listen for new messages from the server
  useEffect(() => {
    if (!socket) return;
    
    const handleDeliveryMessage = (data: { orderId: number; message: string }) => {
      if (data.orderId === orderId) {
        addMessage(data.message, "driver");
      }
    };
    
    socket.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "delivery_message") {
          handleDeliveryMessage(data);
        }
      } catch (error) {
        console.error("Error parsing socket message:", error);
      }
    });
    
    return () => {
      // Cleanup if needed
    };
  }, [socket, orderId]);

  const addMessage = (text: string, sender: "user" | "driver", type: "text" | "location" | "image" | "voice" = "text", attachment?: string) => {
    const newMsg: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
      status: sender === "user" ? "sent" : undefined,
      type,
      attachment
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Add message to UI
    addMessage(newMessage, "user");
    
    // Send to server in real app
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: "delivery_message",
        orderId,
        message: newMessage
      }));
    }
    
    setNewMessage("");
    
    // Simulate driver typing after a delay
    setTimeout(() => {
      setIsTyping(true);
      
      // Simulate driver response after typing
      setTimeout(() => {
        setIsTyping(false);
        
        // Get a relevant auto-response
        if (newMessage.toLowerCase().includes("time") || newMessage.toLowerCase().includes("long")) {
          addMessage("Your order will arrive in about 15-20 minutes.", "driver");
        } else if (newMessage.toLowerCase().includes("where") || newMessage.toLowerCase().includes("location")) {
          addMessage("I'm currently near the main intersection. I'll be there very soon!", "driver");
        } else if (newMessage.toLowerCase().includes("thank")) {
          addMessage("You're welcome! Enjoy your meal.", "driver");
        } else {
          addMessage("I'll do my best to deliver your order as quickly as possible. Thanks for your patience!", "driver");
        }
      }, 2000 + Math.random() * 1000);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const shareLocation = () => {
    // In a real app, we would use the browser's geolocation API
    const mockLocation = "https://maps.google.com/?q=40.7128,-74.0060";
    
    const newMsg: Message = {
      id: Date.now().toString(),
      text: "I've shared my current location",
      sender: "user",
      timestamp: new Date(),
      type: "location",
      attachment: mockLocation
    };
    
    setMessages((prev) => [...prev, newMsg]);
    
    toast({
      title: "Location shared",
      description: "Your current location has been shared with the driver."
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader className="border-b pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden">
                <img 
                  src="https://randomuser.me/api/portraits/men/32.jpg" 
                  alt={driverName} 
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <DialogTitle className="text-base font-medium">{driverName}</DialogTitle>
                <p className="text-xs text-muted-foreground">Delivery Partner</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 rounded-full bg-gray-100"
                onClick={() => {
                  if (driverPhoneNumber) {
                    window.location.href = `tel:${driverPhoneNumber}`;
                  } else {
                    toast({
                      title: "Call driver",
                      description: "Calling functionality is not available in this demo."
                    });
                  }
                }}
              >
                <Phone className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 rounded-full bg-gray-100"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
                    message.sender === "user"
                      ? "bg-[#CB202D] text-white rounded-tr-none"
                      : "bg-gray-100 text-gray-800 rounded-tl-none"
                  }`}
                >
                  {message.type === 'location' ? (
                    <div className="flex flex-col">
                      <div className="flex items-center mb-1">
                        <MapPin className={`h-4 w-4 mr-1 ${message.sender === "user" ? "text-red-100" : "text-gray-500"}`} />
                        <p className="text-sm font-medium">Location shared</p>
                      </div>
                      <a 
                        href={message.attachment} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`text-xs underline ${message.sender === "user" ? "text-red-100" : "text-blue-500"}`}
                      >
                        View on map
                      </a>
                    </div>
                  ) : message.type === 'image' ? (
                    <div>
                      <img 
                        src={message.attachment} 
                        alt="Shared media"
                        className="max-w-full rounded-md mb-1" 
                      />
                      <p className="text-sm">{message.text}</p>
                    </div>
                  ) : (
                    <p className="text-sm">{message.text}</p>
                  )}
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className={`text-xs ${message.sender === "user" ? "text-red-100" : "text-gray-500"}`}>
                      {formatTime(message.timestamp)}
                    </p>
                    {message.sender === "user" && message.status && (
                      <span className="text-xs text-red-100 ml-2">
                        {message.status === "sent" ? "✓" : message.status === "delivered" ? "✓✓" : "✓✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg rounded-tl-none max-w-[80%]">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>
        </ScrollArea>
        
        <DialogFooter className="flex-shrink-0 border-t p-2">
          <div className="flex items-center gap-2 w-full mb-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full"
              onClick={() => 
                toast({
                  title: "Attach photos",
                  description: "Photo sharing is not available in this demo."
                })
              }
            >
              <Image className="h-4 w-4 text-gray-500" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full"
              onClick={shareLocation}
            >
              <MapPin className="h-4 w-4 text-gray-500" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full"
              onClick={() => 
                toast({
                  title: "Voice message",
                  description: "Voice messaging is not available in this demo."
                })
              }
            >
              <Mic className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
          <div className="flex w-full gap-2">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              className="bg-[#CB202D] hover:bg-[#a51a23]"
              disabled={!newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}