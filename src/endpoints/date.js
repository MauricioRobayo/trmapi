const debug = require("debug")("getTrmDataByDate");
const cambio = require("cambio");
const {
  formatDate,
  dateIsInRange,
  createResponse,
  showValidity,
  dateIsValid,
  filterTrmData
} = require("../helpers");
const config = require("../config");
const { dbGet, dbPut } = require("../aws");

exports.getTrmDataByDate = async event => {
  const validity = showValidity(event);
  const date =
    (event.pathParameters && event.pathParameters.date) ||
    formatDate(new Date());
  const { dynamoDBHashKeyPartition: partition } = config;
  if (!dateIsValid(date)) {
    return createResponse(422, {
      error: `La fecha solicitada debe ser una fecha válida en formato 'YYYY-MM-DD'. La fecha solicitada '${date}' no es una fecha válida.`
    });
  }
  const upperBoundDate = new Date();
  upperBoundDate.setDate(upperBoundDate.getDate() + 5);
  if (!dateIsInRange(date, config.dataStartDate, formatDate(upperBoundDate))) {
    return createResponse(404, {
      error: `La fecha solicitada debe ser mayor o igual a ${
        config.dataStartDate
      } y menor o igual a la fecha actual. La fecha solicitada '${date}' no e stá dentro del rango disponible.`
    });
  }
  const getParams = {
    TableName: process.env.TABLE_NAME || "trm",
    Key: { partition, date },
    ExpressionAttributeNames: {
      "#d": "date",
      "#v": "value"
    },
    ProjectionExpression: validity ? "#d,#v,validityTo,validityFrom" : "#d,#v"
  };
  try {
    const trmData = await dbGet(getParams);
    if (!trmData.Item) {
      debug("Obteniendo dato de la SFC...");
      const { trm } = await cambio(date);
      const item = { partition, date, ...trm };
      trmData.Item = filterTrmData(item, validity);
      if (date > trm.validityTo.substring(0, 10)) {
        return createResponse(404, {
          error: `La fecha solicitada debe ser mayor o igual a ${
            config.dataStartDate
          } y menor o igual a la fecha actual. La fecha solicitada '${date}' no e stá dentro del rango disponible.`
        });
      }
      const putParams = {
        TableName: process.env.TABLE_NAME || "trm",
        Item: item
      };
      try {
        debug("Escribiendo el dato nuevo a la base de datos...");
        await dbPut(putParams);
      } catch (err) {
        return createResponse(500, err);
      }
    }
    return createResponse(200, trmData.Item);
  } catch (err) {
    return createResponse(500, err);
  }
};
