import { useEffect, useState } from "react";
import {
  connectLawyerRequestHub,
  type IncomingClientRequest,
} from "../services/requestSocket";
import { expireSession, isUnauthorizedResponse } from "../utils/authSession";

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
    connection.onclose((error) => {
      if (!stopped && error && isUnauthorizedResponse(undefined, null, error.message)) {
        expireSession();
      }
    });
    connection.start().catch((error: unknown) => {
      if (stopped) return;
      const message = error instanceof Error ? error.message : "";
      const status =
        error && typeof error === "object" && "statusCode" in error
          ? Number((error as { statusCode?: unknown }).statusCode)
          : undefined;
      if (isUnauthorizedResponse(status, null, message)) expireSession();
    });

    return () => {
      stopped = true;
      connection.stop();
    };
  }, [enabled]);

  return requests;
}
