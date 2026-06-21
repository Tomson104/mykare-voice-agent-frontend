'use client';

import { useEffect, useState } from 'react';
import { RoomEvent } from 'livekit-client';
import { useSessionContext } from '@livekit/components-react';

/** One tool-call status message broadcast by the Python agent. */
export interface ToolEvent {
  tool: string;
  status: 'running' | 'success' | 'error';
  message: string;
  data?: Record<string, unknown>;
  ts: string;
}

/** End-of-call summary broadcast by the agent (Phase 5). */
export interface CallSummary {
  summary: string;
  appointments: Array<{ date: string; time: string; reason?: string }>;
  preferences?: string[];
  name?: string;
  phone?: string;
  ts: string;
}

const decoder = new TextDecoder();

/**
 * Listens to the LiveKit data channel for messages the agent publishes,
 * and exposes the running list of tool events plus the final call summary.
 */
export function useToolEvents() {
  const session = useSessionContext();
  const room = session.room;
  const [events, setEvents] = useState<ToolEvent[]>([]);
  const [summary, setSummary] = useState<CallSummary | null>(null);

  useEffect(() => {
    if (!room) return;

    const onData = (
      payload: Uint8Array,
      _participant?: unknown,
      _kind?: unknown,
      topic?: string
    ) => {
      try {
        const msg = JSON.parse(decoder.decode(payload));
        if (topic === 'tool_event' || msg.type === 'tool_event') {
          const evt = msg as ToolEvent;
          setEvents((prev) => {
            // A "running" event starts a new row. A terminal (success/error)
            // event resolves the most recent unresolved row for that tool,
            // so each action shows ONE row that flips from spinner to ✅.
            if (evt.status === 'running') return [...prev, evt];
            for (let i = prev.length - 1; i >= 0; i--) {
              if (prev[i].tool === evt.tool && prev[i].status === 'running') {
                const copy = [...prev];
                copy[i] = evt;
                return copy;
              }
            }
            return [...prev, evt];
          });
        } else if (topic === 'summary' || msg.type === 'summary') {
          setSummary(msg as CallSummary);
        }
      } catch {
        // Ignore non-JSON / unrelated data messages.
      }
    };

    room.on(RoomEvent.DataReceived, onData);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [room]);

  return { events, summary };
}
