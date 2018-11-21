/* eslint-disable no-console */

const AWS = require("aws-sdk");
const load = require("./load");

const awsConfig = {
  endpoint: "http://localhost:8000",
  region: "us-east-1"
};

const tableName = "trm";

const dynamoDB = new AWS.DynamoDB(awsConfig);

const params = {
  TableName: "trm",
  KeySchema: [
    {
      AttributeName: "partition",
      KeyType: "HASH"
    },
    {
      AttributeName: "date",
      KeyType: "RANGE"
    }
  ],
  AttributeDefinitions: [
    {
      AttributeName: "partition",
      AttributeType: "N"
    },
    {
      AttributeName: "date",
      AttributeType: "S"
    }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  }
};

dynamoDB.createTable(params, async err => {
  if (err) {
    console.log("Error", err);
    return;
  }
  console.log(
    `Loading data into '${tableName}' table. This might take a while...`
  );
  await load(tableName, awsConfig, 0);
  // eslint-disable-next-line no-shadow
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
