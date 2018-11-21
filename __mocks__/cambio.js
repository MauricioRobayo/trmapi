const dates = {
  "2018-10-31": {
    status: 200,
    trm: {
      date: "2018-10-31",
      validityFrom: "2018-10-31T00:00:00-05:00",
      validityTo: "2018-10-31T00:00:00-05:00",
      value: 3202.44
    }
  }
};

module.exports = date =>
  new Promise(resolve => {
    process.nextTick(() => {
      resolve(
        dates[date]
          ? dates[date]
          : {
              status: 200,
              trm: {
                date,
                validityFrom: dates["2018-10-31"].trm.validityFrom,
                validityTo: dates["2018-10-31"].trm.validityTo,
                value: dates["2018-10-31"].trm.value
              }
            }
      );
    });
  });
