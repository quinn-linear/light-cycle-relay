# Light Cycle Internet Relay

A tiny WebSocket server that lets two people play Light Cycle over the internet.
It just passes messages between the two players — no accounts, no database, no
game logic. You put this online **once**, then paste its address into the game.

You only need this for **Internet** play. "Same Wi-Fi" mode needs no server.

---

## Put it online with Render (free) — the easy way

You'll do this once. It takes about 5 minutes.

### Step 1 — Put this folder on GitHub

1. Make a free account at https://github.com if you don't have one.
2. Create a new **empty** repository (name it anything, e.g. `light-cycle-relay`).
3. Upload the **contents of this `relay-server` folder** (`server.js`,
   `package.json`, `README.md`) into that repository. The easiest way with no
   command line: on your new repo's page click **"uploading an existing file"**
   and drag those files in, then **Commit**.

### Step 2 — Deploy it on Render

1. Make a free account at https://render.com (you can sign in with GitHub).
2. Click **New +** → **Web Service**.
3. Connect your GitHub and pick the repository you just made.
4. Fill in the settings (most are auto-detected):
   - **Runtime / Language:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
5. Click **Create Web Service** and wait for it to say **Live** (1–2 min).

### Step 3 — Copy the address and paste it into the game

1. At the top of your Render service page you'll see a URL like:
   `https://light-cycle-relay-abcd.onrender.com`
2. Copy it.
3. In Light Cycle: **Multiplayer → Internet**, paste it into the
   **"Relay server address"** box. That's it — it's saved on your machine.

Now one player taps **Host Game** and reads out the 5-letter code; the other
picks **Internet**, taps **Join Game**, and types the code. 🎮

---

## Notes

- **First join after a while is slow.** Render's free plan puts the server to
  sleep when unused; the first connection wakes it (~30 seconds). After that
  it's instant. Paid plans stay awake.
- **Both players paste the same address.** Share your Render URL with whoever
  you want to play against so they can paste it too.
- Prefer another host? Any place that runs a Node app works. Just use
  **Start Command** `npm start`; the server reads the port from the `PORT`
  environment variable automatically.

## Run it on your own computer (for testing)

```bash
cd relay-server
npm install
npm start
```

It listens on port 8080. Use `ws://localhost:8080` as the relay address to test
two copies of the app on the same machine.
