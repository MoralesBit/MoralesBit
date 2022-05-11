const notify = require("./notifications");

require("dotenv").config();

module.exports = {
  telegramBotKey: process.env.TELEGRAM_BOT_KEY,
  telegramChannelId: process.env.TELEGRAM_CHANNEL_ID,
};

module.exports = notify;