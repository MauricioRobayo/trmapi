const { getTrmDataBetween } = require("./endpoints/timeseries");
const { getTrmDataByDate } = require("./endpoints/date");

exports.trm = event => {
  switch (event.path) {
    case "/timeseries":
      return getTrmDataBetween(event);
    default:
      return getTrmDataByDate(event);
  }
};
