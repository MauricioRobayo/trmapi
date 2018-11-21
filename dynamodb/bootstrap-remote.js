/* eslint-disable no-console */

const AWS = require("aws-sdk");
const load = require("./load");

const tableName = process.env.TABLE_NAME || "trmapi-TrmTable-EPNZ3WCUZEZI";
// Esperamos un segundo entre cada put debido a que la WCU de la tabla es 1. Si tenemos una mayor WCU podemos disminuir este valor para hacer la escritura más rápida.
const itemInterval = 1000;

const awsConfig = {
  endpoint: "dynamodb.us-east-1.amazonaws.com",
  region: "us-east-1"
};

const dynamoDB = new AWS.DynamoDB(awsConfig);

load(tableName, awsConfig, itemInterval).then(() => {
  dynamoDB.describeTable({ TableName: tableName }, (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log({
      TableName: data.Table.TableName,
      TableStatus: data.Table.TableStatus,
      CreationDataTime: data.Table.CreationDateTime,
      TableSizeBytes: data.Table.TableSizeBytes,
      ItemCount: data.Table.ItemCount
    });
  });
});
