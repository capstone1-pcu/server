const pb = require("./pocketbaseClient");

async function testConnection() {
  try {
    const result = await pb.health.check();
    console.log("PocketBase 연결 성공:", result);
  } catch (error) {
    console.error("PocketBase 연결 실패:", error.message);
  }
}

testConnection();