const config = require("./config");

const createResponse = (statusCode, body) => ({
  statusCode,
  body: JSON.stringify(body)
});

const formatDate = date => date.toISOString().substring(0, 10);

const showValidity = event =>
  event.queryStringParameters &&
  event.queryStringParameters.validity === "true";

const dateIsValid = date =>
  /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date));

const dateIsInRange = (
  date,
  lowerBoundDate = config.dataStartDate,
  upperBoundDate = formatDate(new Date())
) => {
  if (
    !dateIsValid(date) ||
    !dateIsValid(lowerBoundDate) ||
    !dateIsValid(upperBoundDate)
  )
    return false;
  return date >= lowerBoundDate && date <= upperBoundDate;
};

const filterTrmData = (trmData, validity) =>
  validity
    ? {
        date: trmData.date,
        validityFrom: trmData.validityFrom,
        validityTo: trmData.validityTo,
        value: trmData.value
      }
    : { date: trmData.date, value: trmData.value };

module.exports = {
  formatDate,
  dateIsInRange,
  dateIsValid,
  createResponse,
  showValidity,
  filterTrmData
};
