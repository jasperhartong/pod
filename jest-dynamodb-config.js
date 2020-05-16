// TODO: Remove duplication with `src/api/collection-storage/backends/dynamodb-backend.ts`
module.exports = {
  tables: [
    {
      TableName: `TAPES`,
      KeySchema: [
        { AttributeName: "DYNAMODBPK", KeyType: "HASH" },
        { AttributeName: "DYNAMODBSK", KeyType: "RANGE" },
      ],
      AttributeDefinitions: [
        { AttributeName: "DYNAMODBPK", AttributeType: "S" },
        { AttributeName: "DYNAMODBSK", AttributeType: "S" },
      ],
      ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
    },
  ],
};
