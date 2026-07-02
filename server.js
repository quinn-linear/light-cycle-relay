/* eslint-disable no-undef -- Node.js server that deploys separately (see README.md);
   it uses Node globals (process, console, URL) and isn't part of the app's own build. */
/**
 * Light Cycle internet relay — a tiny, plain WebSocket server (no PartyKit,
 * no Cloudflare). Deploy it once (see README.md) and paste its address into
 * the game's Multiplayer → Internet screen.
 *
 * It's a thin, game-agnostic relay: each "room" (named by the 5-letter join
 * code) allows at most two players and forwards every message from one to the
 * other verbatim. It contains NO game logic — it mirrors the LAN transport in
 * main/services/mp-transport.ts.
 */

import http from "http";
import { WebSocketServer } from "ws";

const PORT = process.env.PORT || 8080;
const MAX_PEERS = 2;

// Plain HTTP server: answers health checks (Render/Railway ping the root URL)
// and is what the WebSocket server upgrades connections from.
const httpServer = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Light Cycle relay is running.\n");
});

const wss = new WebSocketServer({ server: httpServer });

// room code -> Set of open sockets
const rooms = new Map();

function roomCodeFrom(url) {
  // Accept both "/?room=ABCDE" and "/ABCDE" so it's forgiving about the URL shape.
  try {
    const parsed = new URL(url, "http://localhost");
    const q = parsed.searchParams.get("room");
    if (q) return q.trim().toUpperCase();
    const fromPath = parsed.pathname.replace(/^\/+/, "").trim().toUpperCase();
    return fromPath || "DEFAULT";
  } catch {
    return "DEFAULT";
  }
}

function peersExcept(room, self) {
  return [...room].filter((s) => s !== self);
}

wss.on("connection", (socket, req) => {
  const code = roomCodeFrom(req.url);
  let room = rooms.get(code);
  if (!room) {
    room = new Set();
    rooms.set(code, room);
  }

  if (room.size >= MAX_PEERS) {
    socket.close(4000, "Room full");
    return;
  }

  room.add(socket);

  // Second player just arrived — tell both sides the match can start.
  if (room.size === MAX_PEERS) {
    for (const s of room) {
      try {
        s.send(JSON.stringify({ __sys: "peer-joined" }));
      } catch {
        /* ignore */
      }
    }
  }

  socket.on("message", (data, isBinary) => {
    // Forward verbatim to the other player in the room.
    for (const other of peersExcept(room, socket)) {
      try {
        other.send(data, { binary: isBinary });
      } catch {
        /* ignore */
      }
    }
  });

  socket.on("close", () => {
    room.delete(socket);
    for (const other of room) {
      try {
        other.send(JSON.stringify({ __sys: "peer-left" }));
      } catch {
        /* ignore */
      }
    }
    if (room.size === 0) rooms.delete(code);
  });

  socket.on("error", () => {
    room.delete(socket);
    if (room.size === 0) rooms.delete(code);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Light Cycle relay listening on port ${PORT}`);
});
