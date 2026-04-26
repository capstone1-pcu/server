const { calculateFinalStats } = require("./services/statService");

const finalStats = calculateFinalStats(
  { hp: 100, attack: 10, defense: 5, agility: 5 },
  { hp: 20, attack: 3, defense: 2, agility: 1 },
  { hp: 50, attack: 5, defense: 4, agility: 3 }
);

console.log("최종 스탯:", finalStats);