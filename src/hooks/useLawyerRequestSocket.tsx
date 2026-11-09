import { useEffect, useState } from "react";
import {
  connectLawyerRequestHub,
  type IncomingClientRequest,
} from "../services/requestSocket";

export function useLawyerRequestSocket(enabled: boolean) {
  const [requests, setRequests] = useState<IncomingClientRequest[]>([]);

  useEffect(() => {
    if (!enabled) return;

    const connection = connectLawyerRequestHub((request) => {
      setRequests((current) => {
        if (current.some((item) => item.id === request.id)) return current;
        return [request, ...current].slice(0, 30);
      });
    });
    if (!connection) return;

    let stopped = false;
    connection.start().catch(() => {
      if (!stopped) setRequests((current) => current);
    });

    return () => {
      stopped = true;
      connection.stop();
    };
  }, [enabled]);

  return requests;
}
