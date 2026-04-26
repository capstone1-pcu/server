const { calculateDamage } = require("../utils/balanceUtils");

function battleMonster(characterStats, monster, useAttackCount) {
  if (useAttackCount <= 0) {
    return {
      status: "lose",
      message: "사용할 공격 횟수가 부족합니다.",
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      characterRemainingHp: characterStats.hp,
      monsterRemainingHp: monster.hp,
      rewardCoin: 0,
    };
  }

  // 유저가 몬스터에게 주는 1회 데미지
  const playerDamage = calculateDamage(
    characterStats.attack,
    monster.defense
  );

  // 유저 데미지가 0 이하이면 전투 불가
  if (playerDamage <= 0) {
    return {
      status: "lose",
      message: "몬스터에게 데미지를 줄 수 없습니다.",

      playerDamage,
      monsterDamage: 0,

      useAttackCount,
      actualUsedAttackCount: 0,
      requiredAttackCount: Infinity,

      monsterAttackCount: 0,

      totalDamageDealt: 0,
      totalDamageTaken: 0,

      characterHp: characterStats.hp,
      characterRemainingHp: characterStats.hp,

      monsterHp: monster.hp,
      monsterRemainingHp: monster.hp,

      rewardCoin: 0,
    };
  }

  // 실제로 몬스터 처치에 필요한 공격 횟수
  const requiredAttackCount = Math.ceil(monster.hp / playerDamage);

  // 주어진 공격 횟수로 몬스터를 죽일 수 있는지
  const isMonsterDeadByGivenAttack = useAttackCount >= requiredAttackCount;

  // 실제 사용 공격 횟수
  const actualUsedAttackCount = isMonsterDeadByGivenAttack
    ? requiredAttackCount
    : useAttackCount;

  // 실제 유저 총 데미지
  const totalDamageDealt = playerDamage * actualUsedAttackCount;

  // 몬스터 남은 HP
  const monsterRemainingHp = Math.max(monster.hp - totalDamageDealt, 0);

  // 몬스터 처치 여부
  const isMonsterDead = monsterRemainingHp <= 0;

  // 몬스터가 공격하는 횟수
  // 유저가 3번 공격할 때마다 몬스터 1번 공격
  const monsterAttackCount = Math.floor(actualUsedAttackCount / 3);

  // 몬스터가 유저에게 주는 1회 데미지
  const monsterDamage = calculateDamage(
    monster.attack,
    characterStats.defense
  );

  // 유저가 받은 총 데미지
  const totalDamageTaken = monsterDamage * monsterAttackCount;

  // 유저 남은 HP
  const characterRemainingHp = Math.max(
    characterStats.hp - totalDamageTaken,
    0
  );

  const isCharacterDead = characterRemainingHp <= 0;

  // 최종 승패
  const isWin = isMonsterDead && !isCharacterDead;

  return {
    status: isWin ? "win" : "lose",
    message: isWin ? "몬스터 처치 성공" : "전투 실패",

    playerDamage,
    monsterDamage,

    useAttackCount,
    actualUsedAttackCount,
    requiredAttackCount,

    monsterAttackCount,

    totalDamageDealt,
    totalDamageTaken,

    characterHp: characterStats.hp,
    characterRemainingHp,

    monsterHp: monster.hp,
    monsterRemainingHp,

    rewardCoin: isWin ? monster.rewardCoin : 0,
  };
}

module.exports = {
  battleMonster,
};