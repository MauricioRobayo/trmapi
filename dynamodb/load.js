/* eslint-disable no-param-reassign */

const fs = require("fs");
const parse = require("csv-parse/lib/sync");
const AWS = require("aws-sdk");
const { join } = require("path");

function putItem(item, tableName, awsConfig) {
  const documentClient = new AWS.DynamoDB.DocumentClient(awsConfig);
  const putParams = {
    TableName: tableName,
    Item: Object.keys(item).reduce((accu, key) => {
      accu.partition = 1;
      accu[key.trim()] = key === "value" ? Number(item[key]) : item[key];
      return accu;
    }, {})
  };
  return documentClient.put(putParams).promise();
}

module.exports = async function load(tableName, awsConfig, itemInterval) {
  const contents = fs.readFileSync(join(__dirname, "data.csv"), "utf-8");
  const csvData = parse(contents, { columns: true });
  for (let i = 0; i < csvData.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await putItem(csvData[i], tableName, awsConfig);
    // eslint-disable-next-line no-await-in-loop
    await new Promise(res => setTimeout(res, itemInterval));
  }
};
