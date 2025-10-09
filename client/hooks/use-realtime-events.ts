import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type {
  ChatEvent,
  DirectMessagesResponse,
  GeneralMessagesResponse,
  LogsResponse,
  UsersResponse,
} from "@shared/api";

export function useRealtimeEvents(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let closed = false;
    let eventSource: EventSource | null = null;
    let retryTimeout: number | undefined;

    const connect = () => {
      if (closed) {
        return;
      }

      eventSource = new EventSource("/api/events/stream", { withCredentials: true } as EventSourceInit);

      const updateGeneral = (messageEvent: Extract<ChatEvent, { type: "general-message" }>) => {
        queryClient.setQueryData<GeneralMessagesResponse | undefined>(["general-messages"], (existing) => {
          if (!existing) {
            return { messages: [messageEvent.message] };
          }
          return {
            messages: [...existing.messages, messageEvent.message].slice(-200),
          };
        });
      };

      const removeGeneral = (messageEvent: Extract<ChatEvent, { type: "general-message-deleted" }>) => {
        queryClient.setQueryData<GeneralMessagesResponse | undefined>(["general-messages"], (existing) => {
          if (!existing) {
            return existing;
          }
          return {
            messages: existing.messages.filter((message) => message.id !== messageEvent.messageId),
          };
        });
      };

      const updateDirect = (messageEvent: Extract<ChatEvent, { type: "direct-message" }>) => {
        const participants = [messageEvent.message.senderUsername, messageEvent.message.recipientUsername];
        participants.forEach((username) => {
          queryClient.setQueryData<DirectMessagesResponse | undefined>(
            ["direct-messages", username],
            (existing) => {
              if (!existing) {
                return { messages: [messageEvent.message] };
              }
              return {
                ...existing,
                messages: [...existing.messages, messageEvent.message].slice(-200),
              };
            },
          );
        });
      };

      const updateUsers = (event: Extract<ChatEvent, { type: "user-status" }>) => {
        queryClient.setQueryData<UsersResponse | undefined>(["users"], (existing) => {
          const user = event.user;
          if (!existing) {
            return { users: [user] };
          }
          const index = existing.users.findIndex((candidate) => candidate.id === user.id);
          if (index === -1) {
            return { users: [...existing.users, user] };
          }
          const clone = [...existing.users];
          clone[index] = user;
          return { users: clone };
        });
      };

      const updateLogs = (event: Extract<ChatEvent, { type: "moderation-log" }>) => {
        queryClient.setQueryData<LogsResponse | undefined>(["admin-logs"], (existing) => {
          if (!existing) {
            return { logs: [event.log] };
          }
          return { logs: [event.log, ...existing.logs].slice(0, 250) };
        });
      };

      eventSource.addEventListener("message", (rawEvent) => {
        if (closed) {
          return;
        }
        try {
          const event = JSON.parse((rawEvent as MessageEvent).data) as ChatEvent;
          switch (event.type) {
            case "general-message":
              updateGeneral(event);
              break;
            case "general-message-deleted":
              removeGeneral(event);
              break;
            case "direct-message":
              updateDirect(event);
              break;
            case "user-status":
              updateUsers(event);
              break;
            case "moderation-log":
              updateLogs(event);
              break;
            default:
              break;
          }
        } catch (error) {
          console.error("SSE parse error", error);
        }
      });

      eventSource.onerror = () => {
        if (closed) {
          return;
        }
        eventSource?.close();
        retryTimeout = window.setTimeout(connect, 2000);
      };
    };

    connect();

    return () => {
      closed = true;
      if (retryTimeout) {
        window.clearTimeout(retryTimeout);
      }
      eventSource?.close();
    };
  }, [enabled, queryClient]);
}
