const telegramNotification = require("./telegram");


const notify = (signal) => {
  telegramNotification(signal);
 
};

module.exports = notify;
