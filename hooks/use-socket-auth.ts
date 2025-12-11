"use client";

import { useEffect } from "react";
import { useSocket } from "@/lib/socket-context";
import { createClient } from "@/lib/supabase/client";

export function useSocketAuth() {
  const { socket, joinUserRoom } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const initializeConnection = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          joinUserRoom(user.id);
        }
      } catch (error) {
        console.error("Error initializing socket connection:", error);
      }
    };

    if (socket.connected) {
      initializeConnection();
    } else {
      socket.on("connect", initializeConnection);
    }

    return () => {
      socket.off("connect", initializeConnection);
    };
  }, [socket, joinUserRoom]);
}

export default useSocketAuth;
