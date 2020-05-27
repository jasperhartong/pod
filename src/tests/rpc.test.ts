import * as dynamodb from "@/api/collection-storage/backends/dynamodb";
import { DynamoTableTapes } from "@/api/collection-storage/backends/dynamodb/dynamodb-table-tapes";
import { unwrap } from "@/api/IResponse";
import roomCreate from "@/api/rpc/commands/room.create";
import testTableConfig from "../../jest-dynamodb-config";

beforeAll(() => {
  const localConfig = {
    tableConfig: testTableConfig.tables[0],
    dbConfig: {
      region: "local-env",
    },
    docClientConfig: {
      endpoint: "localhost:8000",
      sslEnabled: false,
      region: "local-env",
    },
  };
  // @ts-ignore
  dynamodb.dynamoTableTapes = new DynamoTableTapes(localConfig);
});

describe("📦 RPC Tests", () => {
  it("😊 Can create room with defaults", async () => {
    /* Create room without data */
    const roomResponse = await roomCreate.call({
      data: {},
    });

    expect(roomResponse.ok).toBe(true);
    expect(unwrap(roomResponse).title).toEqual("Untitled Room");
  });
});
