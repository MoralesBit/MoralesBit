const axios = require("axios");
const config = require("../config");

const notify = (signal) => {
  if (config.obsWebhookUrl) {
    axios
      .post(config.obsWebhookUrl, {
        chatname: "Crypto Bot",
        chatmessage: signal,
        chatimg: "https://publicdomainvectors.org/photos/Robot_Head.png",
      })
      .catch((error) => console.log(error));
  }
};

module.exports = notify;
