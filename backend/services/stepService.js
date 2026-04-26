const { convertDistanceToAttackCount } = require("../utils/balanceUtils");

function processStepDistance(distanceM, agility) {
  if (distanceM <= 0) {
    return {
      distanceM,
      agility,
      earnedAttackCount: 0,
      message: "이동 거리가 0 이하입니다.",
    };
  }

  const earnedAttackCount = convertDistanceToAttackCount(distanceM, agility);

  return {
    distanceM,
    agility,
    earnedAttackCount,
    message: "공격 횟수 변환 완료",
  };
}

module.exports = {
  processStepDistance,
};