import React from "react";
import { WebSocketStatus } from "../utils/types";

interface ConnectionStatusProps {
  status: WebSocketStatus;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status }) => {
  let statusText = "";
  let className = "connection-status";

  switch (status) {
    case "connected":
      statusText = "Connected";
      className += " connected";
      break;
    case "connecting":
      statusText = "Connecting...";
      className += " connecting";
      break;
    case "reconnecting":
      statusText = "Reconnecting...";
      className += " reconnecting";
      break;
    case "disconnected":
    default:
      statusText = "Disconnected";
      className += " disconnected";
      break;
  }

  return <div className={className}>{statusText}</div>;
};

export default ConnectionStatus;
