import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";
import { Copy, Info, Check, Share2, QrCode } from "lucide-react";

// UPI payment apps supported in India
const UPI_APPS = [
  { name: 'Google Pay', id: 'gpay', icon: 'fab fa-google-pay' },
  { name: 'PhonePe', id: 'phonepe', icon: 'fas fa-mobile-alt' },
  { name: 'Paytm', id: 'paytm', icon: 'fas fa-wallet' },
  { name: 'BHIM', id: 'bhim', icon: 'fas fa-money-bill' },
  { name: 'Amazon Pay', id: 'amazonpay', icon: 'fab fa-amazon' },
];

export type SplitFriend = {
  id: string;
  name: string;
  share: number;
  paid: boolean;
  upiId?: string;
};

type UpiSplitPaymentProps = {
  totalAmount: number;
  userAmount: number;
  splitFriends: SplitFriend[];
  onUpdateFriends: (friends: SplitFriend[]) => void;
  onPaymentComplete: () => void;
  merchantUpiId: string;
};

export default function UpiSplitPayment({
  totalAmount,
  userAmount,
  splitFriends,
  onUpdateFriends,
  onPaymentComplete,
  merchantUpiId
}: UpiSplitPaymentProps) {
  const { toast } = useToast();
  const [activeUpiApp, setActiveUpiApp] = useState<string>('gpay');
  const [currentUpiId, setCurrentUpiId] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [showQrDialog, setShowQrDialog] = useState<boolean>(false);
  const [showSplitLinkDialog, setShowSplitLinkDialog] = useState<boolean>(false);
  const [selectedFriendIndex, setSelectedFriendIndex] = useState<number>(-1);
  
  // Generate QR code for payment
  useEffect(() => {
    if (merchantUpiId && userAmount > 0) {
      const upiUrl = `upi://pay?pa=${merchantUpiId}&pn=Zomato&am=${userAmount.toFixed(2)}&cu=INR&tn=FoodOrder`;
      
      QRCode.toDataURL(upiUrl)
        .then(url => {
          setQrCodeUrl(url);
        })
        .catch(err => {
          console.error(err);
          toast({
            title: "QR Code generation failed",
            description: "Couldn't generate payment QR code",
            variant: "destructive",
          });
        });
    }
  }, [merchantUpiId, userAmount, toast]);

  // Generate a payment link for a friend
  const generatePaymentLink = (friend: SplitFriend, index: number) => {
    if (!merchantUpiId) return "";
    
    const upiUrl = `upi://pay?pa=${merchantUpiId}&pn=Zomato&am=${friend.share.toFixed(2)}&cu=INR&tn=SplitBill`;
    return upiUrl;
  };
  
  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(merchantUpiId);
    toast({
      title: "UPI ID copied",
      description: "UPI ID has been copied to clipboard",
    });
  };
  
  const handlePayWithUpi = () => {
    // In a real app, we would track the payment status via webhooks
    // Here we'll simulate a successful payment
    setTimeout(() => {
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully",
      });
      onPaymentComplete();
    }, 1500);
  };
  
  const handleFriendPayment = (index: number, paid: boolean) => {
    const updatedFriends = [...splitFriends];
    updatedFriends[index].paid = paid;
    onUpdateFriends(updatedFriends);
    
    if (paid) {
      toast({
        title: "Payment Received",
        description: `${splitFriends[index].name} has paid their share`,
      });
    }
  };
  
  const handleSharePaymentLink = (index: number) => {
    setSelectedFriendIndex(index);
    setShowSplitLinkDialog(true);
  };

  const copyFriendPaymentLink = () => {
    if (selectedFriendIndex === -1) return;
    
    const paymentLink = generatePaymentLink(splitFriends[selectedFriendIndex], selectedFriendIndex);
    navigator.clipboard.writeText(paymentLink);
    
    toast({
      title: "Payment link copied",
      description: "The payment link has been copied to clipboard",
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-lg font-bold mb-4">UPI Payment</h2>
      
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Your Payment (₹{userAmount.toFixed(2)})</h3>
        
        <Tabs defaultValue="app" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="app">UPI Apps</TabsTrigger>
            <TabsTrigger value="id">UPI ID</TabsTrigger>
          </TabsList>
          
          <TabsContent value="app" className="mt-4">
            <div className="grid grid-cols-5 gap-2 mb-4">
              {UPI_APPS.map(app => (
                <button
                  key={app.id}
                  className={`flex flex-col items-center p-2 rounded-md ${
                    activeUpiApp === app.id ? 'bg-[#CB202D] bg-opacity-10 border border-[#CB202D]' : 'border border-gray-200'
                  }`}
                  onClick={() => setActiveUpiApp(app.id)}
                >
                  <i className={`${app.icon} text-xl ${activeUpiApp === app.id ? 'text-[#CB202D]' : 'text-gray-600'}`}></i>
                  <span className={`text-xs mt-1 ${activeUpiApp === app.id ? 'text-[#CB202D] font-medium' : 'text-gray-600'}`}>
                    {app.name}
                  </span>
                </button>
              ))}
            </div>
            <Button 
              className="bg-[#CB202D] hover:bg-[#b31217] w-full"
              onClick={handlePayWithUpi}
            >
              Pay ₹{userAmount.toFixed(2)}
            </Button>
          </TabsContent>
          
          <TabsContent value="id" className="mt-4">
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Enter UPI ID</label>
              <div className="flex">
                <Input 
                  type="text" 
                  placeholder="yourname@upi" 
                  value={currentUpiId}
                  onChange={(e) => setCurrentUpiId(e.target.value)}
                  className="flex-1 text-sm"
                />
                <Button 
                  variant="outline"
                  className="ml-2 px-3"
                  onClick={handleCopyUpiId}
                >
                  <Copy size={16} />
                </Button>
                <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline"
                      className="ml-2 px-3"
                    >
                      <QrCode size={16} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Scan QR to Pay</DialogTitle>
                      <DialogDescription>
                        Scan this QR code with any UPI app to pay ₹{userAmount.toFixed(2)}
                      </DialogDescription>
                    </DialogHeader>
                    {qrCodeUrl && (
                      <div className="flex items-center justify-center p-4">
                        <img src={qrCodeUrl} alt="Payment QR Code" className="w-64 h-64" />
                      </div>
                    )}
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowQrDialog(false)}
                        className="mt-2 sm:mt-0"
                      >
                        Close
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <Button 
              className="bg-[#CB202D] hover:bg-[#b31217] w-full"
              onClick={handlePayWithUpi}
              disabled={!currentUpiId}
            >
              Pay ₹{userAmount.toFixed(2)}
            </Button>
          </TabsContent>
        </Tabs>
      </div>
      
      {splitFriends.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium mb-3">Friends' Payments</h3>
          
          <div className="space-y-4">
            {splitFriends.map((friend, index) => (
              <div key={friend.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center mr-3 
                    ${friend.paid ? 'bg-green-100' : 'bg-gray-100'}`}
                  >
                    {friend.paid ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <span className="text-gray-600 font-medium text-xs">
                        {friend.name.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      {friend.name} 
                      {friend.paid && <span className="text-green-600 ml-2 text-xs">• Paid</span>}
                    </div>
                    <div className="text-xs text-gray-500">₹{friend.share.toFixed(2)}</div>
                  </div>
                </div>
                
                {!friend.paid && (
                  <div className="flex items-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 mr-2"
                            onClick={() => handleSharePaymentLink(index)}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Share payment link</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => handleFriendPayment(index, true)}
                    >
                      Mark as Paid
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <Dialog open={showSplitLinkDialog} onOpenChange={setShowSplitLinkDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Share Payment Link</DialogTitle>
                <DialogDescription>
                  Share this payment link with {selectedFriendIndex !== -1 ? splitFriends[selectedFriendIndex]?.name : "friend"}
                </DialogDescription>
              </DialogHeader>
              
              {selectedFriendIndex !== -1 && (
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-2 p-2 border rounded-md bg-gray-50">
                    <div className="flex-1 text-sm truncate">
                      {generatePaymentLink(splitFriends[selectedFriendIndex], selectedFriendIndex)}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={copyFriendPaymentLink}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setShowSplitLinkDialog(false)}
                    >
                      Close
                    </Button>
                    <Button
                      className="bg-[#CB202D] hover:bg-[#b31217]"
                      onClick={() => {
                        setShowSplitLinkDialog(false);
                        // In a real app, we would open the native share dialog
                        // navigator.share({...})
                      }}
                    >
                      Share via WhatsApp
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}