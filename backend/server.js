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

// ============ CONSTANTS ============
const BASE_PRICE = 10;
const TOTAL_COINS = 2000;
const CAPTAIN_COINS = 200;
const AUCTION_PURSE = TOTAL_COINS - CAPTAIN_COINS;
const TARGET_SQUAD_PER_TEAM = 4;

// ============ TEAMS DATA (GT → PBKS) ============
const INITIAL_TEAMS = [
  { id: "rcb", name: "Royal Challengers Bengaluru", short: "RCB", logo: "/logos/rcb.png", color: "#DC2626", textOnColor: "#FFFFFF", totalCoins: TOTAL_COINS, captainCoins: CAPTAIN_COINS, initialAuctionPurse: AUCTION_PURSE, remainingPurse: 1730, boughtCount: 2, targetSquadSize: TARGET_SQUAD_PER_TEAM },
  { id: "csk", name: "Chennai Super Kings", short: "CSK", logo: "/logos/csk.svg", color: "#FACC15", textOnColor: "#09090B", totalCoins: TOTAL_COINS, captainCoins: CAPTAIN_COINS, initialAuctionPurse: AUCTION_PURSE, remainingPurse: 1760, boughtCount: 1, targetSquadSize: TARGET_SQUAD_PER_TEAM },
  { id: "mi", name: "Mumbai Indians", short: "MI", logo: "/logos/mi.svg", color: "#0057B8", textOnColor: "#FFFFFF", totalCoins: TOTAL_COINS, captainCoins: CAPTAIN_COINS, initialAuctionPurse: AUCTION_PURSE, remainingPurse: 1770, boughtCount: 1, targetSquadSize: TARGET_SQUAD_PER_TEAM },
  { id: "pbks", name: "Punjab Kings", short: "PBKS", logo: "/logos/pbks.svg", color: "#DD1F2D", textOnColor: "#FFFFFF", totalCoins: TOTAL_COINS, captainCoins: CAPTAIN_COINS, initialAuctionPurse: AUCTION_PURSE, remainingPurse: 1800, boughtCount: 0, targetSquadSize: TARGET_SQUAD_PER_TEAM },
  { id: "rr", name: "Rajasthan Royals", short: "RR", logo: "/logos/rr.png", color: "#DB2777", textOnColor: "#FFFFFF", totalCoins: TOTAL_COINS, captainCoins: CAPTAIN_COINS, initialAuctionPurse: AUCTION_PURSE, remainingPurse: 1780, boughtCount: 1, targetSquadSize: TARGET_SQUAD_PER_TEAM },
  { id: "srh", name: "Sunrisers Hyderabad", short: "SRH", logo: "/logos/srh.png", color: "#EA580C", textOnColor: "#FFFFFF", totalCoins: TOTAL_COINS, captainCoins: CAPTAIN_COINS, initialAuctionPurse: AUCTION_PURSE, remainingPurse: 1770, boughtCount: 1, targetSquadSize: TARGET_SQUAD_PER_TEAM },
  { id: "kkr", name: "Kolkata Knight Riders", short: "KKR", logo: "/logos/kkr.svg", color: "#6D28D9", textOnColor: "#FFFFFF", totalCoins: TOTAL_COINS, captainCoins: CAPTAIN_COINS, initialAuctionPurse: AUCTION_PURSE, remainingPurse: 1800, boughtCount: 0, targetSquadSize: TARGET_SQUAD_PER_TEAM },
  { id: "dc", name: "Delhi Capitals", short: "DC", logo: "/logos/dc.png", color: "#1D4ED8", textOnColor: "#FFFFFF", totalCoins: TOTAL_COINS, captainCoins: CAPTAIN_COINS, initialAuctionPurse: AUCTION_PURSE, remainingPurse: 1800, boughtCount: 0, targetSquadSize: TARGET_SQUAD_PER_TEAM },
];

// ============ PLAYERS DATA (with Wicketkeeper) ============
const INITIAL_PLAYERS = [
  { id: 1, name: "A.Ravi teja", age: "34", role: "All rounder", basePrice: BASE_PRICE, status: "SOLD", soldToTeamId: "rcb", soldPrice: 40, soldOrder: 1 },
  { id: 2, name: "Sathwik", age: "24", role: "All rounder", basePrice: BASE_PRICE, status: "SOLD", soldToTeamId: "csk", soldPrice: 40, soldOrder: 2 },
  { id: 3, name: "BITTU", age: "21", role: "Batsman", basePrice: BASE_PRICE, status: "SOLD", soldToTeamId: "mi", soldPrice: 30, soldOrder: 3 },
  { id: 4, name: "Sundar", age: "20", role: "All rounder", basePrice: BASE_PRICE, status: "SOLD", soldToTeamId: "srh", soldPrice: 30, soldOrder: 4 },
  { id: 5, name: "G balaji", age: "22", role: "All rounder", basePrice: BASE_PRICE, status: "SOLD", soldToTeamId: "rr", soldPrice: 20, soldOrder: 5 },
  { id: 6, name: "Zeeshan hyder", age: "26", role: "All rounder", basePrice: BASE_PRICE, status: "SOLD", soldToTeamId: "rcb", soldPrice: 30, soldOrder: 6 },
  { id: 7, name: "A.MOSHE", age: "36", role: "Batsman", basePrice: BASE_PRICE, status: "IN AUCTION" },
  { id: 8, name: "Prasanth (nani)", age: "40", role: "All rounder", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 9, name: "R.DANI", age: "38", role: "Batsman", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 10, name: "Stephen Therey", age: "Not Provided", role: "All rounder", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 11, name: "Nivesh", age: "28", role: "All rounder", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 12, name: "Karunya", age: "31", role: "All rounder", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 13, name: "Pradeep(Moni)", age: "26", role: "Batsman", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 14, name: "Bittu Rithwik", age: "17", role: "Batsman", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 15, name: "Manni", age: "27", role: "All rounder", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 16, name: "Lamechrex", age: "22", role: "All rounder", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 17, name: "Syam prasad", age: "54", role: "All rounder", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 18, name: "Kranthi Kumar", age: "23", role: "Bowler", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 19, name: "Abhilash(kevin)", age: "32", role: "All rounder", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 20, name: "Gachibowli diwakar", age: "35", role: "All rounder", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 21, name: "Vinay Devaraj", age: "56", role: "Bowler", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 22, name: "Kayala Suresh", age: "45", role: "Batsman", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 23, name: "Joseph", age: "26", role: "Batsman", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 24, name: "A Ashu", age: "27", role: "All rounder", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 25, name: "Naresh", age: "36", role: "All rounder", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 26, name: "Rony", age: "25", role: "All rounder", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 27, name: "Keerthan", age: "25", role: "All rounder", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 28, name: "Tani pushpa Kumar", age: "27", role: "Batsman", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 29, name: "Praveen", age: "35", role: "Batsman", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 30, name: "BHARGAV", age: "28", role: "All rounder", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 31, name: "Wicketkeeper 1", age: "25", role: "Wicketkeeper", basePrice: BASE_PRICE, status: "UPCOMING" },
  { id: 32, name: "Wicketkeeper 2", age: "28", role: "Wicketkeeper", basePrice: BASE_PRICE, status: "UPCOMING" },
];

// ============ STATE ============
let auctionState = {
  currentBid: 10,
  leadingTeamId: "rcb",
  activePlayerId: 7,
  soldBanner: null,
  statusNote: "Base price ₹10 · RCB leading at ₹10",
  teams: INITIAL_TEAMS,
  players: INITIAL_PLAYERS,
  bidCount: 0,
  nextIncrement: 10,
  threshold: 4,
  incrementStep: 10,
  auctionStarted: false,
  selectedCategory: "All",
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

// ============ HELPERS ============
function broadcastState() {
  io.emit("auction:update", auctionState);
}

function getActivePlayer() {
  return auctionState.players.find((p) => p.status === "IN AUCTION") ||
    auctionState.players.find((p) => p.status === "UPCOMING");
}

function calculateNextIncrement(bidCount, threshold, step) {
  if (bidCount >= threshold * 3) return step * 4;
  if (bidCount >= threshold * 2) return step * 3;
  if (bidCount >= threshold) return step * 2;
  return step;
}

function getRandomPlayerByCategory(category) {
  const available = auctionState.players.filter((p) => {
    if (p.status !== "UPCOMING") return false;
    if (category === "All") return true;
    return p.role === category;
  });
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

// ============ SOCKET.IO ============
io.on("connection", (socket) => {
  connectedUsers++;
  console.log(`✅ User connected: ${socket.id} | Total: ${connectedUsers}`);

  socket.emit("auction:state", auctionState);
  io.emit("users:count", connectedUsers);

  // ============ ADMIN LOGIN ============
  socket.on("admin:login", (credentials) => {
    const { email, password } = credentials || {};
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      adminSocketId = socket.id;
      socket.isAdmin = true;
      const token = "ksl-admin-token-" + Date.now();
      socket.emit("admin:login:success", { email, token });
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

  // ============ SETTINGS UPDATE (ADMIN ONLY) ============
  socket.on("settings:update", (settings) => {
    requireAdmin(() => {
      if (settings.threshold !== undefined) auctionState.threshold = settings.threshold;
      if (settings.incrementStep !== undefined) auctionState.incrementStep = settings.incrementStep;
      auctionState.statusNote = `Settings updated: Threshold ${auctionState.threshold} · Increment ₹${auctionState.incrementStep}`;
      broadcastState();
    });
  });

  // ============ START AUCTION (ADMIN ONLY) ============
  socket.on("auction:start", (data) => {
    requireAdmin(() => {
      const category = data?.category || "All";
      auctionState.selectedCategory = category;
      auctionState.auctionStarted = true;

      const randomPlayer = getRandomPlayerByCategory(category);
      if (!randomPlayer) {
        socket.emit("error", `No available players in category: ${category}`);
        return;
      }

      auctionState.players = auctionState.players.map((p) => {
        if (p.id === randomPlayer.id) {
          return { ...p, status: "IN AUCTION" };
        }
        return p;
      });

      auctionState.activePlayerId = randomPlayer.id;
      auctionState.currentBid = randomPlayer.basePrice;
      auctionState.leadingTeamId = "rcb";
      auctionState.bidCount = 0;
      auctionState.nextIncrement = auctionState.incrementStep;
      auctionState.statusNote = `Auction started · ${randomPlayer.name} (${randomPlayer.role}) · Base ₹${randomPlayer.basePrice}`;

      io.emit("auction:started", { player: randomPlayer, category });
      broadcastState();
    });
  });

  // ============ RANDOM PLAYER (ADMIN ONLY) ============
  socket.on("player:random", (data) => {
    requireAdmin(() => {
      const category = data?.category || "All";
      auctionState.selectedCategory = category;

      const randomPlayer = getRandomPlayerByCategory(category);
      if (!randomPlayer) {
        socket.emit("error", `No available players in category: ${category}`);
        return;
      }

      const currentActive = auctionState.players.find((p) => p.status === "IN AUCTION");
      if (currentActive) {
        auctionState.players = auctionState.players.map((p) => {
          if (p.id === currentActive.id) {
            return { ...p, status: "UPCOMING" };
          }
          return p;
        });
      }

      auctionState.players = auctionState.players.map((p) => {
        if (p.id === randomPlayer.id) {
          return { ...p, status: "IN AUCTION" };
        }
        return p;
      });

      auctionState.activePlayerId = randomPlayer.id;
      auctionState.currentBid = randomPlayer.basePrice;
      auctionState.leadingTeamId = "rcb";
      auctionState.bidCount = 0;
      auctionState.nextIncrement = auctionState.incrementStep;
      auctionState.statusNote = `Random pick: ${randomPlayer.name} (${randomPlayer.role}) · Category: ${category}`;

      io.emit("player:random", { player: randomPlayer, category });
      broadcastState();
    });
  });

  // ============ BID (ADMIN ONLY) ============
  socket.on("bid:place", (data) => {
    requireAdmin(() => {
      console.log("Bid placed by admin:", data);
      auctionState.currentBid = data.amount;
      auctionState.leadingTeamId = data.teamId;
      auctionState.bidCount += 1;
      auctionState.nextIncrement = calculateNextIncrement(
        auctionState.bidCount,
        auctionState.threshold,
        auctionState.incrementStep
      );
      auctionState.statusNote = `${data.teamShort} leading bid at ₹${data.amount} · Next: +₹${auctionState.nextIncrement}`;
      broadcastState();
    });
  });

  // ============ SOLD (ADMIN ONLY) ============
  socket.on("player:sold", (data) => {
    requireAdmin(() => {
      console.log("Player SOLD:", data);

      const activePlayer = getActivePlayer();
      if (!activePlayer) return;

      const team = auctionState.teams.find((t) => t.id === data.teamId);
      if (!team) return;

      const finalAmount = auctionState.currentBid;

      auctionState.players = auctionState.players.map((p) => {
        if (p.id === activePlayer.id) {
          const soldCount = auctionState.players.filter((pl) => pl.status === "SOLD").length;
          return {
            ...p,
            status: "SOLD",
            soldToTeamId: team.id,
            soldPrice: finalAmount,
            soldOrder: soldCount + 1,
          };
        }
        return p;
      });

      auctionState.teams = auctionState.teams.map((t) => {
        if (t.id === team.id) {
          return {
            ...t,
            remainingPurse: t.remainingPurse - finalAmount,
            boughtCount: t.boughtCount + 1,
          };
        }
        return t;
      });

      const nextUpcoming = auctionState.players.find((p) => p.status === "UPCOMING");
      if (nextUpcoming) {
        auctionState.players = auctionState.players.map((p) => {
          if (p.id === nextUpcoming.id) {
            return { ...p, status: "IN AUCTION" };
          }
          return p;
        });
        auctionState.activePlayerId = nextUpcoming.id;
        auctionState.currentBid = nextUpcoming.basePrice;
        auctionState.bidCount = 0;
        auctionState.nextIncrement = auctionState.incrementStep;
      } else {
        auctionState.activePlayerId = null;
      }

      auctionState.soldBanner = {
        playerName: activePlayer.name,
        teamShort: team.short,
        teamId: team.id,
        amount: finalAmount,
        timestamp: Date.now(),
      };
      auctionState.statusNote = `${activePlayer.name} SOLD to ${team.short} for ₹${finalAmount}`;

      io.emit("player:sold", {
        playerName: activePlayer.name,
        teamShort: team.short,
        teamId: team.id,
        amount: finalAmount,
      });

      broadcastState();

      setTimeout(() => {
        auctionState.soldBanner = null;
        broadcastState();
      }, 3000);
    });
  });

  // ============ UNSOLD (ADMIN ONLY) ============
  socket.on("player:unsold", (data) => {
    requireAdmin(() => {
      console.log("Player UNSOLD:", data);

      const activePlayer = getActivePlayer();
      if (!activePlayer) return;

      auctionState.players = auctionState.players.map((p) => {
        if (p.id === activePlayer.id) {
          return { ...p, status: "UNSOLD" };
        }
        return p;
      });

      const nextUpcoming = auctionState.players.find((p) => p.status === "UPCOMING");
      if (nextUpcoming) {
        auctionState.players = auctionState.players.map((p) => {
          if (p.id === nextUpcoming.id) {
            return { ...p, status: "IN AUCTION" };
          }
          return p;
        });
        auctionState.activePlayerId = nextUpcoming.id;
        auctionState.currentBid = nextUpcoming.basePrice;
        auctionState.bidCount = 0;
        auctionState.nextIncrement = auctionState.incrementStep;
      } else {
        auctionState.activePlayerId = null;
      }

      auctionState.statusNote = `${activePlayer.name} UNSOLD — swapped to next player`;

      io.emit("player:unsold", {
        playerName: activePlayer.name,
      });

      broadcastState();
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