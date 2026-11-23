const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ============ ADMIN CREDENTIALS ============
const ADMIN_EMAIL = "snkth123@gmail.com";
const ADMIN_PASSWORD = "Shalom@143";

// ============ AUCTION STATE ============
let auctionState = {
  currentBid: 10,
  leadingTeamId: "rcb",
  secondsLeft: 15,
  activePlayerId: 7,
  timerPaused: false,
  soldBanner: null,
  statusNote: "15s swap timer active · Base price ₹10 · RCB leading at ₹10",
};

let connectedUsers = 0;
let adminSocketId = null;

// ============ REST ENDPOINTS ============
app.get("/", (req, res) => {
  res.json({
    status: "KSL Auction Backend is running",
    connectedUsers,
    adminConnected: adminSocketId !== null,
    auctionState,
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", connectedUsers, timestamp: Date.now() });
});

// ============ SOCKET.IO ============
io.on("connection", (socket) => {
  connectedUsers++;
  console.log(`✅ User connected: ${socket.id} | Total: ${connectedUsers}`);

  socket.emit("auction:state", auctionState);
  io.emit("users:count", connectedUsers);

  // ============ ADMIN LOGIN (EMAIL + PASSWORD) ============
  socket.on("admin:login", (credentials) => {
    const { email, password } = credentials || {};
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      adminSocketId = socket.id;
      socket.isAdmin = true;
      socket.emit("admin:login:success", { email });
      io.emit("admin:status", { connected: true });
      console.log(`👑 Admin logged in: ${socket.id} (${email})`);
    } else {
      socket.emit("admin:login:error", "Invalid email or password");
      console.log(`❌ Invalid admin login attempt: ${socket.id}`);
    }
  });

  const requireAdmin = (callback) => {
    if (socket.isAdmin && adminSocketId === socket.id) {
      callback();
    } else {
      socket.emit("error", "Only admin can perform this action");
    }
  };

  // ============ BID (ADMIN ONLY) ============
  socket.on("bid:place", (data) => {
    requireAdmin(() => {
      console.log("Bid placed by admin:", data);
      auctionState.currentBid = data.amount;
      auctionState.leadingTeamId = data.teamId;
      auctionState.statusNote = `${data.teamShort} leading bid at ₹${data.amount}`;
      io.emit("auction:update", auctionState);
    });
  });

  // ============ TIMER (ADMIN ONLY) ============
  socket.on("timer:tick", (secondsLeft) => {
    requireAdmin(() => {
      auctionState.secondsLeft = secondsLeft;
      io.emit("timer:update", { secondsLeft });
    });
  });

  socket.on("timer:toggle", (paused) => {
    requireAdmin(() => {
      auctionState.timerPaused = paused;
      io.emit("timer:toggle", { paused });
    });
  });

  socket.on("timer:reset", (seconds) => {
    requireAdmin(() => {
      auctionState.secondsLeft = seconds;
      auctionState.timerPaused = false;
      io.emit("timer:reset", { seconds });
      io.emit("auction:update", auctionState);
    });
  });

  // ============ SOLD (ADMIN ONLY) ============
  socket.on("player:sold", (data) => {
    requireAdmin(() => {
      console.log("Player SOLD:", data);
      auctionState.soldBanner = data;
      auctionState.statusNote = `${data.playerName} SOLD to ${data.teamShort} for ₹${data.amount}`;
      io.emit("player:sold", data);
      io.emit("auction:update", auctionState);
      setTimeout(() => {
        auctionState.soldBanner = null;
        io.emit("auction:update", auctionState);
      }, 3000);
    });
  });

  // ============ UNSOLD (ADMIN ONLY) ============
  socket.on("player:unsold", (data) => {
    requireAdmin(() => {
      console.log("Player UNSOLD:", data);
      auctionState.statusNote = `${data.playerName} UNSOLD`;
      io.emit("player:unsold", data);
      io.emit("auction:update", auctionState);
    });
  });

  // ============ NEXT PLAYER (ADMIN ONLY) ============
  socket.on("player:next", (data) => {
    requireAdmin(() => {
      console.log("Next player:", data);
      auctionState.activePlayerId = data.playerId;
      auctionState.currentBid = data.basePrice || 10;
      auctionState.leadingTeamId = "";
      auctionState.secondsLeft = 15;
      auctionState.timerPaused = false;
      auctionState.statusNote = `Now auctioning: ${data.playerName}`;
      io.emit("player:next", data);
      io.emit("auction:update", auctionState);
    });
  });

  // ============ DISCONNECT ============
  socket.on("disconnect", () => {
    connectedUsers--;
    if (adminSocketId === socket.id) {
      adminSocketId = null;
      io.emit("admin:status", { connected: false });
      console.log(`👑 Admin disconnected: ${socket.id}`);
    }
    console.log(`❌ User disconnected: ${socket.id} | Total: ${connectedUsers}`);
    io.emit("users:count", connectedUsers);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 KSL Auction Backend running on http://localhost:${PORT}`);
  console.log(`👑 Admin Email: ${ADMIN_EMAIL}`);
});