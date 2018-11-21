const { formatDate } = require("../helpers");

exports.dbGet = params =>
  new Promise((resolve, reject) => {
    process.nextTick(() => {
      // Una fecha arbitraria que vamos a pasar en los test para verificar la lógica de cuando se obtiene un error por esta función.
      if (params.Key.date === "2013-10-10") {
        reject(new Error("Unexpected error"));
        return;
      }
      if (params.Key.date === formatDate(new Date())) {
        resolve({
          Item: {
            date: params.Key.date,
            validityFrom: `${params.Key.date}T00:00:00-05:00`,
            validityTo: `${params.Key.date}T00:00:00-05:00`,
            value: 3202.44
          }
        });
      }
      if (params.ProjectionExpression === "#d,#v,validityTo,validityFrom") {
        resolve(
          params.Key.date === "2018-01-06"
            ? {
                Item: {
                  date: "2018-01-06",
                  validityFrom: "2018-01-06T00:00:00-05:00",
                  validityTo: "2018-01-09T00:00:00-05:00",
                  value: 2898.32
                }
              }
            : {}
        );
      } else {
        resolve(
          params.Key.date === "2018-01-06"
            ? {
                Item: {
                  date: "2018-01-06",
                  value: 2898.32
                }
              }
            : {}
        );
      }
    });
  });

exports.dbQuery = params =>
  new Promise((resolve, reject) => {
    process.nextTick(() => {
      if (params.ExpressionAttributeValues[":from"] === "2013-10-10") {
        reject(new Error("Unexpected error"));
        return;
      }
      if (params.ProjectionExpression === "#d,#v,validityTo,validityFrom") {
        resolve({
          Items: [
            {
              date: "2018-10-10",
              validityFrom: "2018-10-10T00:00:00-05:00",
              validityTo: "2018-10-10T00:00:00-05:00",
              value: 3057.55
            },
            {
              date: "2018-10-11",
              validityFrom: "2018-10-11T00:00:00-05:00",
              validityTo: "2018-10-11T00:00:00-05:00",
              value: 3090.3
            },
            {
              date: "2018-10-12",
              validityFrom: "2018-10-12T00:00:00-05:00",
              validityTo: "2018-10-12T00:00:00-05:00",
              value: 3087.34
            }
          ]
        });
      }
      resolve({
        Items: [
          {
            date: "2018-10-10",
            value: 3057.55
          },
          {
            date: "2018-10-11",
            value: 3090.3
          },
          {
            date: "2018-10-12",
            value: 3087.34
          }
        ]
      });
    });
  });

// Usamos jest.fn() ya que queremos saber la cantidad de veces que es llamada esta función en los test y verificar los argumentos con que es llamada.
exports.dbPut = jest.fn(
  params =>
    new Promise((resolve, reject) => {
      process.nextTick(() => {
        if (params.Item.date === "2015-10-10") {
          reject(new Error("Unexpected error"));
          return;
        }
        resolve();
      });
    })
);
