# SharedMD

A markdown document you can write with other people at the same time. Open a link, start typing, and everyone in the room sees your keystrokes and your cursor. No accounts.

Live at https://sharedmd.onrender.com. It runs on a free instance that sleeps when idle, so the first visit can take half a minute to wake up.

## Why I built it

Real time collaboration is where a lot of web engineering gets hard. Two people typing into the same paragraph at once, a laptop that loses wifi for a minute, a tab that reloads in the middle of a sentence. I wanted a small project that takes those problems seriously and shows how I'd solve them, without the weight of a full product around it.

## How conflict resolution works

Every document is a CRDT, a conflict free replicated data type, using Yjs. Each client keeps its own copy of the document and applies its own edits immediately. Changes are sent as small binary updates. When two people edit at the same time, both updates are applied on every copy, and the CRDT guarantees all copies end up identical whatever order the updates arrive in.

I picked a CRDT over Operational Transformation for three reasons.

OT needs a central server that decides the order of operations and transforms them against each other. Every client depends on that server being right and being up. With a CRDT the server is only a relay and a place to save snapshots. It never has to reason about the content.

Reconnection is trivial. A client that was offline for five minutes sends what the server is missing and receives what it missed. The merge is the same code path as normal editing, because updates commute. There is no special "catch up" mode.

Optimistic updates come for free. The local copy is the source of truth for what you see, so typing never waits for the network. Yjs also gives me undo and redo that only undoes my own changes, which is what people expect in a shared doc.

The trade offs are real. Deleted text leaves tombstones, so a document that has been edited heavily is bigger than its visible text. The CRDT preserves everyone's characters but not their intent, so two people moving the same paragraph produce two paragraphs. For a markdown editor those are the right trade offs. For a spreadsheet they might not be.

## Presence and cursors

Who is online, and where their cursor is, travels through a second channel called awareness. Each client announces a small state (name, colour, selection). The server keeps the current set so a newcomer sees everyone at once, and drops a client's state the moment its socket closes, so cursors don't linger.

## Reconnection

Socket.io reconnects on its own with backoff. Every time the connection comes back the client sends its state vector, a compact summary of what it already has, and the server replies with only the missing part. The client then sends anything it produced while offline. The status pill in the corner tells you which of the three states you are in. Synced, connecting, or offline with your changes kept locally.

## Persistence

The server holds a live Yjs document per active room in memory. Two seconds after the last edit, and when the last person leaves, it writes a snapshot to Redis. Rooms are unloaded a minute after they empty and reloaded on the next visit. Without a Redis URL everything runs in memory, which is how it works in development.

## Running it

You need Node 22 and pnpm.

```
pnpm install
pnpm dev
```

The web app is on http://localhost:5173 and proxies to the server on port 3000. Open the same document in two windows to see it work. `pnpm test` runs the unit tests.

To run with Redis locally

```
docker run -d -p 6379:6379 redis:7
REDIS_URL=redis://localhost:6379 pnpm --filter @sharedmd/server dev
```

## Deploying

One container serves the API, the sockets and the built frontend. `render.yaml` describes it as a Render web service on the free plan. In the Render dashboard pick New, then Blueprint, point it at this repo and set `REDIS_URL` when asked. Every push to main redeploys.

The free instance sleeps after fifteen minutes without traffic. In memory rooms are lost when that happens, which is fine, because every document is already in Redis and reloads on the next visit. Websockets work on the free plan.

## Stack

React, TypeScript, Vite, CodeMirror 6, Yjs, Socket.io, Node, Express, Redis, Render.

## What's missing

There are no accounts and no permissions. Anyone with the link can edit. Documents expire thirty days after the last edit. Very large documents will get slow, since each snapshot is the full state. Those are fine for what this is, a demo I'm proud of, but they are the first things I'd add if it grew.
