import { useCallback, useEffect, useRef, useState } from "react";
import { WebSocketStatus } from "../utils/types";

export const useWebSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState<WebSocketStatus>("disconnected");
  const [playerId, setPlayerId] = useState<string | null>(null);

  const reconnectAttemptsRef = useRef<number>(0);
  const maxReconnectAttempts = 10;
  const initialReconnectDelay = 1000;
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Connect to WebSocket
  const connect = useCallback(() => {
    // Clear any existing reconnect timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Close existing socket if any
    if (
      socketRef.current &&
      socketRef.current.readyState !== WebSocket.CLOSED
    ) {
      socketRef.current.close();
    }

    setStatus("connecting");

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname;
    const port =
      process.env.NODE_ENV === "development" ? "3001" : window.location.port;
    const wsUrl = `${protocol}//${host}${port ? `:${port}` : ""}`;
    console.log(`Connecting to WebSocket at: ${wsUrl}`);

    try {
      // Create new WebSocket connection
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setStatus("connected");
        setSocket(ws);
        console.log("Connected to WebSocket server");
        // Reset reconnect attempts on successful connection
        reconnectAttemptsRef.current = 0;
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = (event) => {
        setStatus("disconnected");
        setSocket(null);
        console.log(
          `Disconnected from server with code: ${event.code}, reason: ${event.reason}`
        );

        // Don't attempt to reconnect if max attempts reached
        if (
          event.code === 1000 ||
          reconnectAttemptsRef.current >= maxReconnectAttempts
        ) {
          console.log(
            event.code === 1000
              ? "Clean closure, not attempting to reconnect."
              : `Maximum reconnect attempts (${maxReconnectAttempts}) reached. Giving up.`
          );
          return;
        }

        // Calculate exponential backoff delay (1s, 2s, 4s, 8s, etc.)
        const delay =
          initialReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
        const jitter = Math.random() * 1000; // Add randomness
        const reconnectDelay = Math.min(delay + jitter, 30000); // Cap at 30 seconds

        console.log(
          `Attempting to reconnect in ${Math.round(
            reconnectDelay / 1000
          )} seconds...`
        );

        setStatus("reconnecting");
        reconnectAttemptsRef.current++;

        reconnectTimeoutRef.current = setTimeout(() => {
          console.log(
            `Reconnection attempt ${reconnectAttemptsRef.current}...`
          );
          connect();
        }, reconnectDelay);
      };
    } catch (error) {
      console.error("Error creating WebSocket:", error);
      setStatus("disconnected");

      // Try to reconnect after a delay
      setStatus("reconnecting");
      reconnectAttemptsRef.current++;

      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, initialReconnectDelay);
    }

    // Return a cleanup function
    return () => {
      if (socketRef.current) {
        try {
          socketRef.current.close(1000, "Component unmounting");
        } catch (err) {
          console.error("Error closing socket during cleanup:", err);
        }
        socketRef.current = null;
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, []);

  // Send message to server (with queue for reconnecting state)
  const messageQueueRef = useRef<Array<{ type: string; payload: any }>>([]);

  // Send message to server
  const sendMessage = useCallback(
    (type: string, payload: any) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type,
            payload,
          })
        );
        return true;
      } else if (status === "reconnecting" || status === "connecting") {
        // Queue message to be sent when reconnected
        messageQueueRef.current.push({ type, payload });
        console.log(`Socket not ready, queueing message: ${type}`);
        return true;
      }
      console.error(
        `Cannot send message: socket is ${socket ? "not open" : "null"}`
      );
      return false;
    },
    [socket, status]
  );

  // Process queued messages when connection is established
  useEffect(() => {
    if (
      status === "connected" ||
      (socket && messageQueueRef.current.length > 0)
    ) {
      console.log(
        `Processing ${messageQueueRef.current.length} queued messages`
      );

      // Process queued messages
      const messagesToProcess = [...messageQueueRef.current];
      messageQueueRef.current = [];

      messagesToProcess.forEach((msg) => {
        sendMessage(msg.type, msg.payload);
      });
    }
  }, [status, sendMessage]);

  // Handle messages from server (with error handling)
  const registerMessageHandler = useCallback(
    (handler: (event: MessageEvent) => void) => {
      if (!socket) return () => {};

      // Wrap the handler with error handling
      const safeHandler = (event: MessageEvent) => {
        try {
          handler(event);
        } catch (error) {
          console.error("Error in WebSocket message handler:", error);
        }
      };

      socket.addEventListener("message", safeHandler);
      return () => {
        if (socket) {
          // Check if socket still exists
          socket.removeEventListener("message", safeHandler);
        }
      };
    },
    [socket]
  );

  // Connect on mount
  useEffect(() => {
    const cleanup = connect();

    // Cleanup function
    return () => {
      cleanup();
    };
  }, [connect]);

  return {
    socket,
    status,
    playerId,
    setPlayerId,
    sendMessage,
    registerMessageHandler,
    connect,
  };
};
