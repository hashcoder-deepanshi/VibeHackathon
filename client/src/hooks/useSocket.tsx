import { createContext, ReactNode, useContext, useEffect, useState } from "react";

const SocketContext = createContext<WebSocket | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    
    // Connection opened
    ws.addEventListener("open", (event) => {
      console.log("WebSocket connection established");
    });
    
    // Listen for messages
    ws.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    });
    
    // Listen for errors
    ws.addEventListener("error", (event) => {
      console.error("WebSocket error:", event);
    });
    
    // Listen for disconnection
    ws.addEventListener("close", (event) => {
      console.log("WebSocket connection closed:", event);
    });
    
    // Set the socket in state
    setSocket(ws);
    
    // Clean up on unmount
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
