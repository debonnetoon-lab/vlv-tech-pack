import { io, Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "@/types/collaboration";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

class SocketService {
  private static instance: Socket | null = null;

  public static getInstance(): Socket<ServerToClientEvents, ClientToServerEvents> {
    if (!SocketService.instance) {
      SocketService.instance = io(SOCKET_URL, {
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });
    }
    return SocketService.instance as Socket<ServerToClientEvents, ClientToServerEvents>;
  }
}

export const socket = SocketService.getInstance();
