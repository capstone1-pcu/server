function calculateFinalStats(baseStats, upgradedStats, equipmentStats) {
  return {
    hp:
      baseStats.hp +
      upgradedStats.hp +
      equipmentStats.hp,

    attack:
      baseStats.attack +
      upgradedStats.attack +
      equipmentStats.attack,

    defense:
      baseStats.defense +
      upgradedStats.defense +
      equipmentStats.defense,

    agility:
      baseStats.agility +
      upgradedStats.agility +
      equipmentStats.agility,
  };
}

module.exports = {
  calculateFinalStats,
};