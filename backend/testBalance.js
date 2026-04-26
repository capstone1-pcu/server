const { calculateFinalStats } = require("./services/statService");

const finalStats = calculateFinalStats(
  { hp: 100, attack: 10, defense: 5, agility: 5 },
  { hp: 20, attack: 3, defense: 2, agility: 1 },
  { hp: 50, attack: 5, defense: 4, agility: 3 }
);

console.log("최종 스탯:", finalStats);const { processStepDistance } = require("./services/stepService");

const stepResult = processStepDistance(1500, 5);

console.log("걷기 처리 결과:", stepResult);const { battleMonster } = require("./services/battleService");

const battleResult = battleMonster(
  {
    hp: 170,
    attack: 18,
    defense: 11,
    agility: 9,
  },
  {
    name: "초보 슬라임",
    hp: 100,
    attack: 8,
    defense: 3,
    rewardCoin: 80,
  },
  7
);

console.log("전투 결과:", battleResult);
const { upgradeStat } = require("./services/growthService");

const growthResult = upgradeStat(
  {
    hp: 100,
    attack: 10,
    defense: 5,
    agility: 5,
  },
  "attack",
  200
);

console.log("스탯 강화 결과:", growthResult);