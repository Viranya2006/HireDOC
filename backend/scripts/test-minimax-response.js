require("dotenv").config();
const axios = require("axios");

const key = process.env.MINIMAX_API_KEY;
const gid = process.env.MINIMAX_GROUP_ID;

async function tryUrl(base) {
  const url = `${base}/text/chatcompletion_v2?GroupId=${gid}`;
  console.log("Trying", url);
  const r = await axios.post(
    url,
    {
      model: "MiniMax-M2.7",
      messages: [{ role: "user", content: "Say hello in one word" }],
      max_tokens: 20,
    },
    {
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    },
  );
  console.log(JSON.stringify(r.data, null, 2).slice(0, 1500));
}

tryUrl("https://api.minimax.io/v1")
  .then(() => tryUrl("https://api.minimax.chat/v1"))
  .catch((e) => {
    console.log("ERR", e.response?.status, JSON.stringify(e.response?.data));
  });
