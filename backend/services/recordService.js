function createBattleRecord(characterId, monsterId, battleResult) {
  const now = new Date().toISOString();

  return {
    characterId,
    monsterId,
    battleType: "normal",
    status: battleResult.status,
    distanceUsedM: battleResult.distanceUsedM ?? 0,

    attackCountUsed: battleResult.actualUsedAttackCount ?? 0,
    totalDamageDealt: battleResult.totalDamageDealt ?? 0,
    totalDamageTaken: battleResult.totalDamageTaken ?? 0,

    rewardCoin: battleResult.rewardCoin ?? 0,
    characterRemainingHp: battleResult.characterRemainingHp ?? 0,
    monsterRemainingHp: battleResult.monsterRemainingHp ?? 0,

    startedAt: now,
    endedAt: now,
  };
}

function createResourceTransaction(
  characterId,
  resourceType,
  transactionType,
  amount,
  balanceAfter,
  sourceType,
  reason
) {
  return {
    characterId,
    resourceType,
    transactionType,
    amount,
    balanceAfter,
    sourceType,
    reason,
    createdAt: new Date().toISOString(),
  };
}

module.exports = {
  createBattleRecord,
  createResourceTransaction,
};