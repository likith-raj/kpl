
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const AUCTION_ID = "kpl-2026";

const teams = [
  ["rcb", "Royal Challengers Bengaluru", "RCB", "/logos/rcb.png", "#DC2626", "#FFFFFF"],
  ["csk", "Chennai Super Kings", "CSK", "/logos/csk.svg", "#FACC15", "#09090B"],
  ["mi", "Mumbai Indians", "MI", "/logos/mi.svg", "#0057B8", "#FFFFFF"],
  ["gt", "Gujarat Titans", "GT", "/logos/gt.png", "#1B2133", "#FFFFFF"],
  ["rr", "Rajasthan Royals", "RR", "/logos/rr.png", "#DB2777", "#FFFFFF"],
  ["srh", "Sunrisers Hyderabad", "SRH", "/logos/srh.png", "#EA580C", "#FFFFFF"],
  ["kkr", "Kolkata Knight Riders", "KKR", "/logos/kkr.svg", "#6D28D9", "#FFFFFF"],
  ["dc", "Delhi Capitals", "DC", "/logos/dc.png", "#1D4ED8", "#FFFFFF"],
].map(([id, name, short, logo, color, textOnColor]) => ({
  id,
  name,
  short,
  logo,
  color,
  textOnColor,
  auctionId: AUCTION_ID,
  totalCoins: 2000,
  captainCoins: 200,
  initialAuctionPurse: 1800,
  remainingPurse: 1800,
  boughtCount: 0,
  targetSquadSize: 4,
}));

const playerData = [
  ["A.Ravi teja", "34", "All rounder"],
  ["Sathwik", "24", "All rounder"],
  ["BITTU", "21", "Batsman"],
  ["Sundar", "20", "All rounder"],
  ["G balaji", "22", "All rounder"],
  ["Zeeshan hyder", "26", "All rounder"],
  ["A.MOSHE", "36", "Batsman"],
  ["Prasanth (nani)", "40", "All rounder"],
  ["R.DANI", "38", "Batsman"],
  ["Stephen Therey", "Not Provided", "All rounder"],
  ["Nivesh", "28", "All rounder"],
  ["Karunya", "31", "All rounder"],
  ["Pradeep(Moni)", "26", "Batsman"],
  ["Bittu Rithwik", "17", "Batsman"],
  ["Manni", "27", "All rounder"],
  ["Lamechrex", "22", "All rounder"],
  ["Syam prasad", "54", "All rounder"],
  ["Kranthi Kumar", "23", "Bowler"],
  ["Abhilash(kevin)", "32", "All rounder"],
  ["Gachibowli diwakar", "35", "All rounder"],
  ["Vinay Devaraj", "56", "Bowler"],
  ["Kayala Suresh", "45", "Batsman"],
  ["Joseph", "26", "Batsman"],
  ["A Ashu", "27", "All rounder"],
  ["Naresh", "36", "All rounder"],
  ["Rony", "25", "All rounder"],
  ["Keerthan", "25", "All rounder"],
  ["Tani pushpa Kumar", "27", "Batsman"],
  ["Praveen", "35", "Batsman"],
  ["BHARGAV", "28", "All rounder"],
];

const players = playerData.map(([name, age, role], index) => ({
  id: index + 1,
  auctionId: AUCTION_ID,
  name,
  age,
  role,
  basePrice: 10,
  status: "UPCOMING",
  soldToTeamId: null,
  soldPrice: null,
  soldOrder: null,
}));

async function main() {
  console.log("Starting KPL database seed...");

  await prisma.auction.upsert({
    where: { id: AUCTION_ID },
    update: {},
    create: {
      id: AUCTION_ID,
      name: "KPL Live Auction",
      status: "NOT_STARTED",
    },
  });

  console.log("Auction created/verified.");

  await prisma.team.createMany({
    data: teams,
    skipDuplicates: true,
  });

  console.log("Teams inserted/verified.");

  await prisma.player.createMany({
    data: players,
    skipDuplicates: true,
  });

  console.log("Players inserted/verified.");

  await prisma.auctionState.upsert({
    where: { auctionId: AUCTION_ID },
    update: {},
    create: {
      auctionId: AUCTION_ID,
      currentBid: 10,
      leadingTeamId: null,
      activePlayerId: null,
      secondsLeft: 15,
      timerPaused: true,
      timerEndsAt: null,
      pausedRemainingSeconds: 15,
      statusNote: "Auction not started",
    },
  });

  await prisma.$queryRaw`
    SELECT setval(
      pg_get_serial_sequence('"Player"', 'id'),
      GREATEST(COALESCE((SELECT MAX(id) FROM "Player"), 1), 1),
      true
    )
  `;

  const teamCount = await prisma.team.count({
    where: { auctionId: AUCTION_ID },
  });

  const playerCount = await prisma.player.count({
    where: { auctionId: AUCTION_ID },
  });

  const soldCount = await prisma.player.count({
    where: { auctionId: AUCTION_ID, status: "SOLD" },
  });

  const bidCount = await prisma.bid.count({
    where: { auctionId: AUCTION_ID },
  });

  const resultCount = await prisma.auctionResult.count({
    where: { auctionId: AUCTION_ID },
  });

  console.log("\nKPL DATABASE SEED COMPLETE");
  console.log("Teams:", teamCount);
  console.log("Players:", playerCount);
  console.log("SOLD players:", soldCount);
  console.log("Bids:", bidCount);
  console.log("Auction results:", resultCount);
}

main()
  .catch((error) => {
    console.error("\nSEED FAILED:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
