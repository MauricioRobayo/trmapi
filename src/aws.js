const AWS = require("aws-sdk");

if (process.env.AWS_SAM_LOCAL) {
  AWS.config.update({
    endpoint: "http://dynamodb:8000",
    region: "us-east-1"
  });
}
const documentClient = new AWS.DynamoDB.DocumentClient();

exports.dbQuery = params => documentClient.query(params).promise();
exports.dbGet = params => documentClient.get(params).promise();
exports.dbPut = params => documentClient.put(params).promise();
