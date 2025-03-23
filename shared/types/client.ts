export interface WebSocketMessage {
  type: string;
  payload: any;
}

export type WebSocketStatus = "connecting" | "connected" | "disconnected" | "reconnecting"; 