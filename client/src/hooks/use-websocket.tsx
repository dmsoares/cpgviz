import { useEffect, useState } from "react";

const useWebSocket = (url: string) => {
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onopen = () => {
      console.log("WebSocket connection established");
    };

    socket.onmessage = (event) => {
      console.log("Message from server:", event.data);
      setMessage(event.data);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      socket.close();
    };
  }, []);

  return message;
};

export default useWebSocket;
