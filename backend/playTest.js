const { calculateFinalStats } = require("./services/statService");
const { processStepDistance } = require("./services/stepService");
const { battleMonster } = require("./services/battleService");
const {
  createBattleRecord,
  createResourceTransaction,
} = require("./services/recordService");
const { applyBattleResult } = require("./services/rewardService");const { upgradeStat } = require("./services/growthService");

// 1. 캐릭터 기본 정보
let character = {
  name: "테스트 캐릭터",
  coinBalance: 100,
  attackCountBalance: 0,
};

// 2. 기본 스탯
const baseStats = {
  hp: 100,
  attack: 10,
  defense: 5,
  agility: 5,
};

// 3. 강화 스탯
const upgradedStats = {
  hp: 20,
  attack: 3,
  defense: 2,
  agility: 1,
};

// 4. 장비 스탯
const equipmentStats = {
  hp: 50,
  attack: 5,
  defense: 4,
  agility: 3,
};

// 5. 최종 스탯 계산
const finalStats = calculateFinalStats(
  baseStats,
  upgradedStats,
  equipmentStats
);

console.log("1. 최종 스탯:", finalStats);

// 6. 걷기 처리
const stepResult = processStepDistance(1500, finalStats.agility);

character.attackCountBalance += stepResult.earnedAttackCount;

console.log("2. 걷기 처리 결과:", stepResult);
console.log("3. 현재 보유 공격 횟수:", character.attackCountBalance);

// 7. 몬스터 정보
const monster = {
  name: "초보 슬라임",
  hp: 100,
  attack: 8,
  defense: 3,
  rewardCoin: 80,
};

// 8. 전투 실행
const battleResult = battleMonster(
  finalStats,
  monster,
  character.attackCountBalance
);

console.log("4. 전투 결과:", battleResult);

// 9. 전투 결과 반영
const rewardResult = applyBattleResult(character, battleResult);

character = rewardResult.afterCharacter;

console.log("5. 전투 결과 반영:", rewardResult);
console.log("6. 전투 후 캐릭터 상태:", character);

// 10. 스탯 강화
const growthResult = upgradeStat(
  {
    hp: finalStats.hp,
    attack: finalStats.attack,
    defense: finalStats.defense,
    agility: finalStats.agility,
  },
  "attack",
  character.coinBalance
);

console.log("6. 스탯 강화 결과:", growthResult);

// 11. 강화 성공 시 코인 반영
if (growthResult.success) {
  character.coinBalance = growthResult.afterCoin;
}

console.log("7. 최종 캐릭터 상태:", character);const battleRecord = createBattleRecord(
  "character_test_id",
  "monster_test_id",
  battleResult
);

console.log("8. 전투 기록 데이터:", battleRecord);

const coinTransaction = createResourceTransaction(
  "character_test_id",
  "coin",
  "reward",
  battleResult.rewardCoin,
  character.coinBalance,
  "battle",
  "몬스터 처치 보상"
);

console.log("9. 코인 거래 기록:", coinTransaction);

const attackCountTransaction = createResourceTransaction(
  "character_test_id",
  "attack_count",
  "use",
  -battleResult.actualUsedAttackCount,
  character.attackCountBalance,
  "battle",
  "전투 공격 횟수 사용"
);

console.log("10. 공격 횟수 거래 기록:", attackCountTransaction);