import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Copy, X } from "lucide-react";
import { SiWhatsapp, SiInstagram, SiFacebook } from "react-icons/si";
import { FaXTwitter } from "react-icons/fa6";
import { useToast } from "@/hooks/use-toast";

interface ShareOptionsProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

export default function ShareOptions({ isOpen, onClose, title, url }: ShareOptionsProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true);
        toast({
          title: "Link copied",
          description: "URL has been copied to clipboard",
        });
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
        toast({
          title: "Error copying link",
          description: "Please try again",
          variant: "destructive",
        });
      });
  };

  const handleShare = (platform: string) => {
    switch (platform) {
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
        break;
      case 'instagram':
        // There's no direct way to share to Instagram, so we'll show instructions
        toast({
          title: "Share to Instagram",
          description: "Copy the link and share it in an Instagram message or story",
        });
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      default:
        break;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share</DialogTitle>
          <DialogDescription>
            Share this restaurant with friends and family
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-4 mt-4">
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center gap-2 p-4 h-auto hover:bg-gray-50 transition-colors"
            onClick={() => handleShare('whatsapp')}
          >
            <SiWhatsapp className="h-6 w-6 text-green-500" />
            <span className="text-xs">WhatsApp</span>
          </Button>

          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center gap-2 p-4 h-auto hover:bg-gray-50 transition-colors"
            onClick={() => handleShare('instagram')}
          >
            <SiInstagram className="h-6 w-6 text-pink-500" />
            <span className="text-xs">Instagram</span>
          </Button>

          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center gap-2 p-4 h-auto hover:bg-gray-50 transition-colors"
            onClick={() => handleShare('facebook')}
          >
            <SiFacebook className="h-6 w-6 text-blue-600" />
            <span className="text-xs">Facebook</span>
          </Button>

          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center gap-2 p-4 h-auto hover:bg-gray-50 transition-colors"
            onClick={() => handleShare('twitter')}
          >
            <FaXTwitter className="h-6 w-6 text-black" />
            <span className="text-xs">Twitter</span>
          </Button>
        </div>

        <div className="flex items-center space-x-2 mt-4 bg-gray-100 p-2 rounded-md">
          <p className="text-sm flex-1 truncate">{url}</p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCopyLink} 
            className="h-8 px-2 flex items-center"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}