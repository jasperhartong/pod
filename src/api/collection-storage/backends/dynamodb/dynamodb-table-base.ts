import aws from "aws-sdk";
import { GlobalTableStatus } from "aws-sdk/clients/dynamodb";

const AWSvars = [
  process.env.MY_AWS_ACCESS_REGION,
  process.env.MY_AWS_ACCESS_KEY_ID,
  process.env.MY_AWS_SECRET_KEY,
];

if (AWSvars.includes(undefined)) {
  throw Error(
    `a process.env.AWS was not set: ${AWSvars.map((v) => Boolean(v))}`
  );
}

aws.config.update({
  region: process.env.MY_AWS_ACCESS_REGION,
  accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.MY_AWS_SECRET_KEY,
});

export type DocumentClientContructorConfig = ConstructorParameters<
  typeof aws.DynamoDB.DocumentClient
>[0];

export class DynamodbTableBase {
  private apiVersion = "2012-08-10";
  protected dynamodb: aws.DynamoDB;
  protected docClient: aws.DynamoDB.DocumentClient;
  protected tableConfig: aws.DynamoDB.CreateTableInput;
  public status?: GlobalTableStatus = undefined;
  constructor({
    dbConfig,
    tableConfig,
    docClientConfig,
  }: {
    tableConfig: aws.DynamoDB.CreateTableInput;
    dbConfig?: aws.DynamoDB.ClientConfiguration;
    docClientConfig?: DocumentClientContructorConfig;
  }) {
    this.tableConfig = tableConfig;
    this.dynamodb = new aws.DynamoDB({
      apiVersion: this.apiVersion,
      ...(dbConfig || {}),
    });
    this.docClient = new aws.DynamoDB.DocumentClient({
      apiVersion: this.apiVersion,
      convertEmptyValues: true,
      ...(docClientConfig || {}),
    });
  }
  public async initiate() {
    this.status = await this.create();
    if (this.status === "CREATING") {
      this.status = await this.awaitCreation();
    }
    return this.status;
  }

  private awaitCreationCount = 0;
  private maxAwaitCreationCount = 30;
  private async awaitCreation(): Promise<GlobalTableStatus | undefined> {
    const params: aws.DynamoDB.Types.DescribeTableInput = {
      TableName: this.tableConfig.TableName,
    };

    await new Promise((resolve) => setTimeout(resolve, 1000));
    try {
      console.debug(
        `DynamodbTableBase::awaitCreation: ${this.awaitCreationCount}`
      );
      const tableStatus = await this.dynamodb.describeTable(params).promise();
      if (tableStatus.Table?.TableStatus === "ACTIVE") {
        return "ACTIVE";
      }
    } catch (error) {
      console.error("Failed getting table status");
    }
    this.awaitCreationCount += 1;
    if (this.awaitCreationCount > this.maxAwaitCreationCount) {
      return undefined;
    }
    return this.awaitCreation();
  }

  private async create(): Promise<GlobalTableStatus> {
    const tableConfig = this.tableConfig;
    return new Promise((resolve) => {
      this.dynamodb.createTable(tableConfig, function (err, data) {
        if (err) {
          if (err.code === "ResourceInUseException") {
            console.info(
              `Table "${tableConfig.TableName}" was already created`
            );
            resolve("ACTIVE");
          } else {
            console.error("Unable to create table. Error JSON:", err);
            resolve(undefined);
          }
        } else {
          console.info(
            `Created "${tableConfig.TableName}" table. Table description JSON:`,
            data
          );
          resolve(data.TableDescription?.TableStatus);
        }
      });
    });
  }
}
