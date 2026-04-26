const { getStatUpgradeCost } = require("../utils/balanceUtils");

function upgradeStat(currentStats, statType, coinBalance) {
  if (!currentStats.hasOwnProperty(statType)) {
    return {
      success: false,
      message: "존재하지 않는 스탯입니다.",
      currentStats,
      coinBalance,
    };
  }

  const currentStatValue = currentStats[statType];
  const cost = getStatUpgradeCost(currentStatValue);

  if (coinBalance < cost) {
    return {
      success: false,
      message: "코인이 부족합니다.",
      requiredCoin: cost,
      coinBalance,
      currentStats,
    };
  }

  const updatedStats = {
    ...currentStats,
    [statType]: currentStatValue + 1,
  };

  return {
    success: true,
    message: "스탯 강화 성공",
    statType,
    beforeValue: currentStatValue,
    afterValue: currentStatValue + 1,
    costCoin: cost,
    beforeCoin: coinBalance,
    afterCoin: coinBalance - cost,
    updatedStats,
  };
}

module.exports = {
  upgradeStat,
};