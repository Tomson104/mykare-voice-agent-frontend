# Mykare Voice AI Front Desk — Frontend (Web)

The web call interface for the [Mykare Voice AI Front Desk](../my-agent). Built with
[Next.js](https://nextjs.org/) and the [LiveKit React SDK](https://github.com/livekit/components-js).

It connects to a LiveKit room and provides:

- 🎙️ A **call screen** — start/end call, mic control, live audio
- 👤 **Talking avatar video**, lip-synced to the agent's voice
- ⚙️ **Live tool-call indicators** — e.g. "Booking appointment…" → "Booked ✅"
- 📝 A **call summary panel** at the end (recap, appointments, preferences, timestamp)

> This is the **frontend only**. It needs the [backend agent](../my-agent) running
> (locally or deployed) to talk to.

---

## Prerequisites

- **Node.js** 18+ and **pnpm** (`npm install -g pnpm`)
- A **[LiveKit Cloud](https://cloud.livekit.io/)** project (same one the agent uses)

## Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env.local
```

Fill in `.env.local`:

```ini
LIVEKIT_URL=wss://<your-project>.livekit.cloud
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...

# Must match the agent's name so the right agent is dispatched
AGENT_NAME=my-agent
```

Use the **same** LiveKit credentials as the backend agent.

## Running

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and click **Call the front desk**.
Make sure the [backend agent](../my-agent) is running too (`uv run python src/agent.py dev`).

## How it works

The agent publishes data messages to the room that this app listens for:

- [`hooks/useToolEvents.ts`](hooks/useToolEvents.ts) — subscribes to the room data
  channel for `tool_event` and `summary` messages
- [`components/app/tool-events-panel.tsx`](components/app/tool-events-panel.tsx) —
  renders the live tool-call activity and the final call summary
- Avatar video is rendered automatically by the session view when the agent
  publishes a video track

## Deployment

Deploy to [Vercel](https://vercel.com/) (or any Next.js host):

1. Push this folder to a GitHub repo.
2. Import it in Vercel.
3. Set the env vars: `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `AGENT_NAME=my-agent`.

## License

MIT
