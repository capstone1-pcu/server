function getAttackDistance(agi) {
  return 100 - 50 * (agi / (agi + 100));
}

function convertDistanceToAttackCount(distanceM, agi) {
  const attackDistance = getAttackDistance(agi);
  return Math.floor(distanceM / attackDistance);
}

function calculateDamage(atk, def) {
  return Math.max(atk - def, 1);
}

function getStatUpgradeCost(stat) {
  return Math.floor(15 + (stat * stat) / 5 + (stat * 2));
}

module.exports = {
  getAttackDistance,
  convertDistanceToAttackCount,
  calculateDamage,
  getStatUpgradeCost,
};