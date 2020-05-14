/* 
https://www.alexdebrie.com/posts/dynamodb-one-to-many/#composite-primary-key--the-query-api-action
https://www.npmjs.com/package/short-unique-id

PK                      SK
ROOM#<short-unique-id>  ROOM#<short-unique-id>                                  room fields
                        PLAYLIST#<short-unique-id>                              playlist fields
                        PLAYLIST#<short-unique-id>EPISODE#<short-unique-id>     episode fields

                        ACCESS#<email>
                        
*/
import { ERR, IResponse, OK } from "@/api/IResponse";
import { IEpisode } from "@/app-schema/IEpisode";
import { IPlaylist } from "@/app-schema/IPlaylist";
import { IRoom } from "@/app-schema/IRoom";
import aws from "aws-sdk";
import HttpStatus from "http-status-codes";

type DocumentClientContructorConfig = ConstructorParameters<
  typeof aws.DynamoDB.DocumentClient
>[0];

export class DynamodbBackend {
  private apiVersion = "2012-08-10";
  protected dynamodb: aws.DynamoDB;
  protected docClient: aws.DynamoDB.DocumentClient;
  protected tableConfig: aws.DynamoDB.CreateTableInput;
  protected initiated: boolean = false;

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
      convertEmptyValues: true, // converts empty strings to null
      ...(docClientConfig || {}),
    });
  }

  public async initiate() {
    this.initiated = await this.createTable();
    return this.initiated;
  }

  protected async createTable(): Promise<boolean> {
    const tableConfig = this.tableConfig;
    return new Promise((resolve) => {
      this.dynamodb.createTable(tableConfig, function (err, data) {
        if (err) {
          if (err.code === "ResourceInUseException") {
            console.info(
              `Table "${tableConfig.TableName}" was already created`
            );
          } else {
            console.error("Unable to create table. Error JSON:", err);
          }
          resolve(false);
        } else {
          console.info(
            `Created "${tableConfig.TableName}" table. Table description JSON:`,
            data
          );
          resolve(true);
        }
      });
    });
  }
}

export const tapesDynamodbConfig: aws.DynamoDB.CreateTableInput = {
  TableName: `TAPES`,
  KeySchema: [
    { AttributeName: "PK", KeyType: "HASH" }, //Partition key
    { AttributeName: "SK", KeyType: "RANGE" }, //Sort key
  ],
  AttributeDefinitions: [
    { AttributeName: "PK", AttributeType: "S" },
    { AttributeName: "SK", AttributeType: "S" },
  ],
  ProvisionedThroughput: { ReadCapacityUnits: 10, WriteCapacityUnits: 10 },
};

export class TapesDynamoBackend extends DynamodbBackend {
  constructor(config?: {
    dbConfig?: aws.DynamoDB.ClientConfiguration;
    docClientConfig?: DocumentClientContructorConfig;
  }) {
    super({
      tableConfig: tapesDynamodbConfig,
      docClientConfig: config?.docClientConfig,
      dbConfig: { region: "eu-west", ...(config?.docClientConfig || {}) },
    });
  }

  private primaryKey = (roomId: IRoom["slug"]) => {
    return `ROOM#${roomId}`;
  };

  private sortKey = {
    room: (roomId: IRoom["slug"]) => {
      return `ROOM#${roomId}`;
    },
    playlist: (playlistId: IPlaylist["id"]) => {
      return `PLAYLIST#${playlistId}`;
    },
    episode: (playlistId: IPlaylist["id"], episodeId: IEpisode["id"]) => {
      return `PLAYLIST#${playlistId}EPISODE#${episodeId}`;
    },
  };

  createRoom(room: IRoom): Promise<IResponse<IRoom>> {
    const getResultValue = this.getRoomBySlug.bind(this);
    const params = {
      TableName: this.tableConfig.TableName,
      Item: {
        ...room,
        PK: this.primaryKey(room["slug"]),
        SK: this.sortKey.room(room["slug"]),
      },
    };

    return new Promise((resolve) => {
      this.docClient.put(params, function (err, data) {
        if (err) {
          console.error("TapesDynamoBackend::create Error", err);
          return resolve(
            ERR<IRoom>(err.message, HttpStatus.INTERNAL_SERVER_ERROR)
          );
        } else {
          console.info("TapesDynamoBackend::create Success", data);
          // As DynamoDB doesn't return the value upon creation, we get it
          return resolve(getResultValue(room.slug));
        }
      });
    });
  }

  getRoomBySlug(roomSlug: IRoom["slug"]): Promise<IResponse<IRoom>> {
    /* Returns fully nested room */

    const params: aws.DynamoDB.DocumentClient.QueryInput = {
      TableName: this.tableConfig.TableName,
      KeyConditionExpression: "PK = :PK",
      ExpressionAttributeValues: {
        ":PK": this.primaryKey(roomSlug),
      },
    };

    return new Promise((resolve) => {
      this.docClient.query(params, function (err, data) {
        if (err) {
          console.error("TapesDynamoBackend::get Error", err);
          return resolve(
            ERR<IRoom>(err.message, HttpStatus.INTERNAL_SERVER_ERROR)
          );
        } else {
          const roomItem = data.Items?.find((item) => item.PK.includes("ROOM"));
          if (!roomItem) {
            return resolve(ERR<IRoom>("no roomItem found"));
          }

          let playlistMap: Record<string, IPlaylist> = {};
          data.Items?.filter(
            (item) =>
              item.PK.includes("PLAYLIST") && !item.PK.includes("EPISODE")
          ).forEach((item) => {
            delete item.PK;
            delete item.SK;
            const playlist = (item as unknown) as IPlaylist;
            playlistMap[item.PK] = playlist;
          });
          data.Items?.filter((item) => item.PK.includes("EPISODE")).forEach(
            (episodeItem) => {
              const playlistPK = episodeItem.PK.split("EPISODE#")[0];
              delete episodeItem.PK;
              delete episodeItem.SK;
              const episode = (episodeItem as unknown) as IEpisode;
              if (playlistMap[playlistPK]) {
                playlistMap[playlistPK].episodes.push(episode);
              }
            }
          );

          // Encode back to IRoom (Add io-ts for validation/ decoding)
          delete roomItem.PK;
          delete roomItem.SK;
          const room = (roomItem as unknown) as IRoom;

          room.cover_file.data.full_url = room.cover_file.data.full_url || ""; // decode `null`
          room.playlists = Object.values(playlistMap);

          return resolve(OK<IRoom>(room));
        }
      });
    });
  }

  getEpisode(
    roomSlug: IRoom["slug"],
    playlistId: IPlaylist["id"],
    episodeId: IEpisode["id"]
  ): Promise<IResponse<IEpisode>> {
    const params = {
      TableName: this.tableConfig.TableName,
      Key: {
        PK: this.primaryKey(roomSlug),
        SK: this.sortKey.episode(playlistId, episodeId),
      },
    };
    return new Promise((resolve) => {
      this.docClient.get(params, function (err, data) {
        if (err) {
          console.error("TapesDynamoBackend::get Error", err);
          return resolve(
            ERR<IEpisode>(err.message, HttpStatus.INTERNAL_SERVER_ERROR)
          );
        } else {
          // Strip mongodb query attributes
          delete data.Item?.PK;
          delete data.Item?.SK;

          // Encode back to IEpisode (Add io-ts for validation/ decoding)
          const episode = (data.Item as unknown) as IEpisode;
          episode.image_file.data.full_url =
            episode.image_file.data.full_url || ""; // decode `null`
          return resolve(OK<IEpisode>(episode));
        }
      });
    });
  }
}

export const tapesDynamoBackend = new TapesDynamoBackend();
