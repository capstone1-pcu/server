const {
  getAttackDistance,
  convertDistanceToAttackCount,
  calculateDamage,
  getStatUpgradeCost,
} = require("./utils/balanceUtils");

console.log("AGI 5 공격 필요 거리:", getAttackDistance(5));
console.log("1000m 이동 시 공격 횟수:", convertDistanceToAttackCount(1000, 5));
console.log("ATK 20, DEF 5 데미지:", calculateDamage(20, 5));
console.log("스탯 10 강화 비용:", getStatUpgradeCost(10));