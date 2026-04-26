function applyBattleResult(character, battleResult) {
  const updatedCharacter = {
    ...character,
  };

  // 공격 횟수 차감
  updatedCharacter.attackCountBalance = Math.max(
    character.attackCountBalance - battleResult.actualUsedAttackCount,
    0
  );

  // 전투 후 남은 HP 반영
  updatedCharacter.currentHp = battleResult.characterRemainingHp;

  // 승리 시 코인 보상 지급
  if (battleResult.status === "win") {
    updatedCharacter.coinBalance += battleResult.rewardCoin;
  }

  return {
    success: true,
    message: "전투 결과 반영 완료",
    beforeCharacter: character,
    afterCharacter: updatedCharacter,
  };
}

module.exports = {
  applyBattleResult,
};