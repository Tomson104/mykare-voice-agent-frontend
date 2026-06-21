'use client';

import { useToolEvents, type ToolEvent } from '@/hooks/useToolEvents';

/** Friendly labels for each tool. */
const TOOL_LABELS: Record<string, string> = {
  identify_user: 'Identify caller',
  fetch_slots: 'Fetch slots',
  book_appointment: 'Book appointment',
  retrieve_appointments: 'Retrieve appointments',
  cancel_appointment: 'Cancel appointment',
  modify_appointment: 'Modify appointment',
  end_conversation: 'End call',
};

function StatusIcon({ status }: { status: ToolEvent['status'] }) {
  if (status === 'running') {
    return (
      <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
    );
  }
  if (status === 'success') return <span>✅</span>;
  return <span>❌</span>;
}

function fmtDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function fmt12h(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h)) return hhmm;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

export function ToolEventsPanel() {
  const { events, summary } = useToolEvents();

  if (events.length === 0 && !summary) return null;

  return (
    <div className="pointer-events-auto fixed top-4 right-4 z-50 flex max-h-[90svh] w-80 flex-col gap-3 overflow-y-auto">
      {/* Live tool activity */}
      {events.length > 0 && (
        <div className="rounded-xl border border-border bg-background/90 p-4 shadow-lg backdrop-blur">
          <h3 className="mb-2 text-sm font-semibold">Agent activity</h3>
          <ul className="flex flex-col gap-1.5">
            {events.map((e, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className="w-4 shrink-0 text-center">
                  <StatusIcon status={e.status} />
                </span>
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {TOOL_LABELS[e.tool] ?? e.tool}
                  </span>
                  {e.message ? ` — ${e.message}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* End-of-call summary */}
      {summary && (
        <div className="rounded-xl border border-border bg-background/95 p-4 shadow-lg backdrop-blur">
          <h3 className="mb-2 text-sm font-semibold">Call summary</h3>
          {(summary.name || summary.phone) && (
            <p className="mb-2 text-xs text-muted-foreground">
              {summary.name ?? 'Caller'}
              {summary.phone ? ` · ${summary.phone}` : ''}
            </p>
          )}
          <p className="mb-3 text-sm whitespace-pre-line">{summary.summary}</p>

          {summary.appointments?.length > 0 && (
            <div className="mb-3">
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Appointments
              </h4>
              <ul className="flex flex-col gap-1">
                {summary.appointments.map((a, i) => (
                  <li key={i} className="text-sm">
                    📅 {fmtDate(a.date)} at {fmt12h(a.time)}
                    {a.reason ? ` — ${a.reason}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {summary.preferences && summary.preferences.length > 0 && (
            <div className="mb-3">
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Preferences
              </h4>
              <ul className="list-inside list-disc text-sm">
                {summary.preferences.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {new Date(summary.ts).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
