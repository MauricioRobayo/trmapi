const { createResponse, showValidity, dateIsValid } = require("../helpers");
const { dbQuery } = require("../aws");

exports.getTrmDataBetween = async event => {
  if (!event.queryStringParameters) {
    return createResponse(400, {
      error: "Se deben especificar los parámetros 'start_date' y 'end_date'"
    });
  }
  const dateFrom = event.queryStringParameters.start_date;
  const dateTo = event.queryStringParameters.end_date;
  if (!dateIsValid(dateFrom)) {
    return createResponse(422, {
      error: `La fecha solicitada debe ser una fecha válida en formato 'YYYY-MM-DD'. La fecha solicitada '${dateFrom}' no es una fecha válida.`
    });
  }
  if (!dateIsValid(dateTo)) {
    return createResponse(422, {
      error: `La fecha solicitada debe ser una fecha válida en formato 'YYYY-MM-DD'. La fecha solicitada '${dateFrom}' no es una fecha válida.`
    });
  }
  const queryParams = {
    TableName: process.env.TABLE_NAME,
    KeyConditionExpression: "#p = :partition and #d between :from and :to",
    Limit: 365,
    ExpressionAttributeNames: {
      "#p": "partition",
      "#d": "date",
      "#v": "value"
    },
    ExpressionAttributeValues: {
      ":partition": 1,
      ":from": dateFrom,
      ":to": dateTo
    },
    ProjectionExpression: showValidity(event)
      ? "#d,#v,validityTo,validityFrom"
      : "#d,#v"
  };
  try {
    return createResponse(200, (await dbQuery(queryParams)).Items);
  } catch (err) {
    return createResponse(500, err);
  }
};
