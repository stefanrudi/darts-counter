import React from "react";

interface ConnectionStatusProps {
  isConnected: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected }) => {
  const statusText = isConnected ? "Connected" : "Disconnected";
  const className = `connection-status ${isConnected ? "connected" : "disconnected"}`;

  return <div className={className}>{statusText}</div>;
};

export default ConnectionStatus;
