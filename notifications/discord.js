const axios = require("axios");
const config = require("../config");

const notify = (signal) => {
  if (config.discordWebhookUrl) {
    axios
      .post(config.discordWebhookUrl, {
        content: null,
        embeds: [
          {
            title: signal,
            color: 11491583,
          },
        ],
      })
      .catch((error) => console.log(error));
  }
};

module.exports = notify;
