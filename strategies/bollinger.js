const Binance = require("binance-api-node").default;
const boll = require("bollinger-bands");
const throttledQueue = require("throttled-queue");

const client = Binance();

const db = {};
const BOLLINGER_PERIODS = 20;

const bollinger = (klines, periods = BOLLINGER_PERIODS, times = 2) => {
  if (klines.length < periods) {
    return Infinity;
  }

  const { upper, lower } = boll(klines, periods, times);

  return {
    upperBand: upper[upper.length - 1], 
    lowerBand: lower[lower.length - 1]
  }
};

const saveKline = (symbol, close) => {
  let prevDb = db[symbol] || [];

  if (prevDb.length < BOLLINGER_PERIODS) {
    return [];
  }

  db[symbol] = [...prevDb.slice(1), close];

  return db[symbol];
};

const strategy = async (options, onSignal = (signal) => {}) => {
  const symbols = Object.keys(await client.futuresPrices());
  const { interval, percentage } = options;
  const throttle = throttledQueue(1, 1000);

  symbols.map((symbol) => {
    throttle(() => {
      client
        .futuresCandles({ symbol, interval, limit: BOLLINGER_PERIODS })
        .then((response) => {
          const closes = response.map((item) => Number(item.close));
          db[symbol] = closes;
        });
    });
  });

  client.ws.futuresCandles(symbols, interval, (candle) => {
    if (candle.isFinal) {
      const low = Number(candle.low);
      const high = Number(candle.high);
      const diff = Math.abs(high / low - 1) * 100;
      const klines = saveKline(candle.symbol, Number(candle.close));
      const { upperBand, lowerBand } = bollinger(klines);

      if (diff >= percentage && upperBand < Number(candle.close)) {
        onSignal(
          `${candle.symbol} Mov ${
            Math.round((diff + Number.EPSILON) * 100) / 100
          }% 🔴 Short`
        );
      }
      if (diff >= percentage && lowerBand > Number(candle.close)) {
        onSignal(
          `${candle.symbol} Mov ${
            Math.round((diff + Number.EPSILON) * 100) / 100
          }% 🟢 Long`
        );
      }
    }
  });
};

module.exports = strategy;
