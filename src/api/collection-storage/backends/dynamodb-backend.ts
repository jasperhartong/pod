/* 
https://www.alexdebrie.com/posts/dynamodb-one-to-many/#composite-primary-key--the-query-api-action

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
import { DateTime } from "luxon";
import { IBase } from "../../../app-schema/IBase";

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

const PARTITION_KEY_NAME = "DYNAMODBPK";
const SORT_KEY_NAME = "DYNAMODBSK";
const CREATED_ON_KEY = "DYNAMODBCREATED";

export const tapesDynamodbConfig: aws.DynamoDB.CreateTableInput = {
  TableName: `TAPES`,
  KeySchema: [
    { AttributeName: PARTITION_KEY_NAME, KeyType: "HASH" },
    { AttributeName: SORT_KEY_NAME, KeyType: "RANGE" },
  ],
  AttributeDefinitions: [
    { AttributeName: PARTITION_KEY_NAME, AttributeType: "S" },
    { AttributeName: SORT_KEY_NAME, AttributeType: "S" },
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
      dbConfig: config?.docClientConfig,
    });
  }

  private partitionKey = (roomId: IRoom["uid"]) => {
    return `ROOMPK#${roomId}`;
  };

  private sortKey = {
    room: (roomId: IRoom["uid"]) => {
      return `ROOM#${roomId}`;
    },
    playlist: (playlistId: IPlaylist["uid"]) => {
      return `PLAYLIST#${playlistId}`;
    },
    episode: (playlistId: IPlaylist["uid"], episodeId: IEpisode["uid"]) => {
      return `PLAYLIST#${playlistId}:EPISODE#${episodeId}`;
    },
  };

  private createdOnKey = (schema: IBase) => {
    return DateTime.fromISO(schema.created_on).toMillis().toString();
  };

  private deleteDynamoKeys = (
    item?: aws.DynamoDB.DocumentClient.AttributeMap
  ) => {
    delete item?.[PARTITION_KEY_NAME];
    delete item?.[SORT_KEY_NAME];
    delete item?.[CREATED_ON_KEY];
  };

  createRoom(room: IRoom): Promise<IResponse<IRoom>> {
    if (!room.uid) {
      return Promise.resolve(
        ERR<IRoom>(`No valid room uid passed along: ${room.uid}`)
      );
    }

    const getResultValue = this.getRoom.bind(this);

    const params: aws.DynamoDB.DocumentClient.PutItemInput = {
      TableName: this.tableConfig.TableName,
      Item: {
        ...room,
        [PARTITION_KEY_NAME]: this.partitionKey(room.uid),
        [SORT_KEY_NAME]: this.sortKey.room(room.uid),
        [CREATED_ON_KEY]: this.createdOnKey(room),
      },
      ConditionExpression: `attribute_not_exists(${PARTITION_KEY_NAME})`,
    };

    return new Promise((resolve) => {
      this.docClient.put(params, function (err, data) {
        if (err) {
          console.error("TapesDynamoBackend::create Error", err);
          return resolve(
            ERR<IRoom>(err.message, HttpStatus.INTERNAL_SERVER_ERROR)
          );
        } else {
          // As DynamoDB doesn't return the value upon creation, we get it
          return resolve(getResultValue(room.uid));
        }
      });
    });
  }

  createPlaylist(
    roomUid: IRoom["uid"],
    playlist: IPlaylist
  ): Promise<IResponse<IPlaylist>> {
    if (!roomUid) {
      return Promise.resolve(
        ERR<IPlaylist>(`No valid room uid passed along: ${roomUid}`)
      );
    }
    if (!playlist.uid) {
      return Promise.resolve(
        ERR<IPlaylist>(`No valid playlist uid passed along: ${playlist.uid}`)
      );
    }
    const getResultValue = this.getPlaylist.bind(this);

    const params = {
      TableName: this.tableConfig.TableName,
      Item: {
        ...playlist,
        [PARTITION_KEY_NAME]: this.partitionKey(roomUid),
        [SORT_KEY_NAME]: this.sortKey.playlist(playlist.uid),
        [CREATED_ON_KEY]: this.createdOnKey(playlist),
      },
    };

    return new Promise((resolve) => {
      this.docClient.put(params, function (err, data) {
        if (err) {
          console.error("TapesDynamoBackend::create Error", err);
          return resolve(
            ERR<IPlaylist>(err.message, HttpStatus.INTERNAL_SERVER_ERROR)
          );
        } else {
          // As DynamoDB doesn't return the value upon creation, we get it
          return resolve(getResultValue(roomUid, playlist.uid));
        }
      });
    });
  }

  createEpisode(
    roomUid: IRoom["uid"],
    playlistUid: IPlaylist["uid"],
    episode: IEpisode
  ): Promise<IResponse<IEpisode>> {
    if (!roomUid) {
      return Promise.resolve(
        ERR<IEpisode>(`No valid room uid passed along: ${roomUid}`)
      );
    }
    if (!playlistUid) {
      return Promise.resolve(
        ERR<IEpisode>(`No valid playlist uid passed along: ${playlistUid}`)
      );
    }
    if (!episode.uid) {
      return Promise.resolve(
        ERR<IEpisode>(`No valid episode uid passed along: ${episode.uid}`)
      );
    }
    const getResultValue = this.getEpisode.bind(this);

    const params = {
      TableName: this.tableConfig.TableName,
      Item: {
        ...episode,
        [PARTITION_KEY_NAME]: this.partitionKey(roomUid),
        [SORT_KEY_NAME]: this.sortKey.episode(playlistUid, episode.uid),
        [CREATED_ON_KEY]: this.createdOnKey(episode),
      },
    };

    return new Promise((resolve) => {
      this.docClient.put(params, function (err, data) {
        if (err) {
          console.error("TapesDynamoBackend::create Error", err);
          return resolve(
            ERR<IEpisode>(err.message, HttpStatus.INTERNAL_SERVER_ERROR)
          );
        } else {
          // As DynamoDB doesn't return the value upon creation, we get it
          return resolve(getResultValue(roomUid, playlistUid, episode.uid));
        }
      });
    });
  }

  getRoom(roomUid: IRoom["uid"]): Promise<IResponse<IRoom>> {
    /* Returns fully nested room */
    if (!roomUid) {
      return Promise.resolve(
        ERR<IRoom>(`No valid room uid passed along: ${roomUid}`)
      );
    }

    const params = {
      TableName: this.tableConfig.TableName,
      Key: {
        [PARTITION_KEY_NAME]: this.partitionKey(roomUid),
        [SORT_KEY_NAME]: this.sortKey.room(roomUid),
      },
    };

    return new Promise((resolve) => {
      this.docClient.get(params, function (err, data) {
        if (err) {
          console.error("TapesDynamoBackend::get Error", err);
          return resolve(
            ERR<IRoom>(err.message, HttpStatus.INTERNAL_SERVER_ERROR)
          );
        } else {
          // Strip dynamodb query attributes
          delete data.Item?.[PARTITION_KEY_NAME];
          delete data.Item?.[SORT_KEY_NAME];
          delete data.Item?.[CREATED_ON_KEY];

          // Encode back to IRoom (Add io-ts for validation/ decoding)
          const episode = (data.Item as unknown) as IRoom;
          episode.cover_file.data.full_url =
            episode.cover_file.data.full_url || ""; // decode `null`
          return resolve(OK<IRoom>(episode));
        }
      });
    });
  }

  getRoomWithNested(roomUid: IRoom["uid"]): Promise<IResponse<IRoom>> {
    /* Returns fully nested room */
    if (!roomUid) {
      return Promise.resolve(
        ERR<IRoom>(`No valid room uid passed along: ${roomUid}`)
      );
    }

    const params: aws.DynamoDB.DocumentClient.QueryInput = {
      TableName: this.tableConfig.TableName,
      // ScanIndexForward: true,
      KeyConditionExpression: `${PARTITION_KEY_NAME} = :PK`,
      ExpressionAttributeValues: {
        ":PK": this.partitionKey(roomUid),
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
          console.info(
            `TapesDynamodbConfig::getRoom:: data: ${JSON.stringify(
              data,
              null,
              2
            )} `
          );
          if (!data.Items) {
            return resolve(ERR<IRoom>("no items found"));
          }

          // Get roomItem
          const roomItem = data.Items.find((item) =>
            item[SORT_KEY_NAME].includes("ROOM")
          );
          if (!roomItem) {
            return resolve(ERR<IRoom>("no roomItem found"));
          }
          // Encode roomItem to IRoom (Add io-ts for validation/ decoding)
          const room = (roomItem as unknown) as IRoom;

          room.cover_file.data.full_url = room.cover_file.data.full_url || ""; // decode `null`

          // Get playlist and episodes
          const playlistItems = data.Items.filter(
            (item) =>
              item[SORT_KEY_NAME].includes("PLAYLIST") &&
              !item[SORT_KEY_NAME].includes("EPISODE")
          );
          const episodeItems = data.Items.filter((item) =>
            item[SORT_KEY_NAME].includes("EPISODE")
          );

          // Get and parse playlistItems
          let playlistMap: Record<string, IPlaylist> = {};
          playlistItems.forEach((playlistItem) => {
            const playlist = (playlistItem as unknown) as IPlaylist;
            room.playlists.push(playlist);
            playlistMap[playlistItem[SORT_KEY_NAME]] = playlist;
            delete playlistItem[PARTITION_KEY_NAME];
            delete playlistItem[SORT_KEY_NAME];
            delete playlistItem[CREATED_ON_KEY];
          });

          // Get and parse episodeItems, also push into playlist
          episodeItems.forEach((episodeItem) => {
            const playlistSK = episodeItem[SORT_KEY_NAME].split(":EPISODE#")[0];
            const episode = (episodeItem as unknown) as IEpisode;
            if (playlistMap[playlistSK]) {
              playlistMap[playlistSK].episodes.push(episode);
            }
            delete episodeItem[PARTITION_KEY_NAME];
            delete episodeItem[SORT_KEY_NAME];
            delete episodeItem[CREATED_ON_KEY];
          });

          // Remove SK of room
          delete roomItem[PARTITION_KEY_NAME];
          delete roomItem[SORT_KEY_NAME];
          delete roomItem[CREATED_ON_KEY];

          // Fill its playlist
          room.playlists = Object.values(playlistMap);

          return resolve(OK<IRoom>(room));
        }
      });
    });
  }

  getEpisode(
    roomUid: IRoom["uid"],
    playlistUid: IPlaylist["uid"],
    episodeUid: IEpisode["uid"]
  ): Promise<IResponse<IEpisode>> {
    if (!roomUid) {
      return Promise.resolve(
        ERR<IEpisode>(`No valid room uid passed along: ${roomUid}`)
      );
    }
    if (!playlistUid) {
      return Promise.resolve(
        ERR<IEpisode>(`No valid playlist uid passed along: ${playlistUid}`)
      );
    }
    if (!episodeUid) {
      return Promise.resolve(
        ERR<IEpisode>(`No valid playlist uid passed along: ${episodeUid}`)
      );
    }
    const params = {
      TableName: this.tableConfig.TableName,
      Key: {
        [PARTITION_KEY_NAME]: this.partitionKey(roomUid),
        [SORT_KEY_NAME]: this.sortKey.episode(playlistUid, episodeUid),
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
          // Strip dynamodb query attributes
          delete data.Item?.[PARTITION_KEY_NAME];
          delete data.Item?.[SORT_KEY_NAME];
          delete data.Item?.[CREATED_ON_KEY];

          // Encode back to IEpisode (Add io-ts for validation/ decoding)
          const episode = (data.Item as unknown) as IEpisode;
          episode.image_file.data.full_url =
            episode.image_file.data.full_url || ""; // decode `null`
          episode.audio_file = episode.audio_file || ""; // decode `null`
          return resolve(OK<IEpisode>(episode));
        }
      });
    });
  }

  getPlaylist(
    roomUid: IRoom["uid"],
    playlistUid: IPlaylist["uid"]
  ): Promise<IResponse<IPlaylist>> {
    if (!roomUid) {
      return Promise.resolve(
        ERR<IPlaylist>(`No valid room uid passed along: ${roomUid}`)
      );
    }
    if (!playlistUid) {
      return Promise.resolve(
        ERR<IPlaylist>(`No valid playlist uid passed along: ${playlistUid}`)
      );
    }
    const params = {
      TableName: this.tableConfig.TableName,
      Key: {
        [PARTITION_KEY_NAME]: this.partitionKey(roomUid),
        [SORT_KEY_NAME]: this.sortKey.playlist(playlistUid),
      },
    };
    return new Promise((resolve) => {
      this.docClient.get(params, function (err, data) {
        if (err) {
          console.error("TapesDynamoBackend::get Error", err);
          return resolve(
            ERR<IPlaylist>(err.message, HttpStatus.INTERNAL_SERVER_ERROR)
          );
        } else {
          // Strip mongodb query attributes
          delete data.Item?.[PARTITION_KEY_NAME];
          delete data.Item?.[SORT_KEY_NAME];
          delete data.Item?.[CREATED_ON_KEY];

          // Encode back to IPlaylist (Add io-ts for validation/ decoding)
          const playlist = (data.Item as unknown) as IPlaylist;
          playlist.cover_file.data.full_url =
            playlist.cover_file.data.full_url || ""; // decode `null`
          return resolve(OK<IPlaylist>(playlist));
        }
      });
    });
  }

  async getAllRaw() {
    const params = {
      TableName: this.tableConfig.TableName,
    };
    const items = await this.docClient.scan(params).promise();
    return items;
  }
}

export const tapesDynamoBackend = new TapesDynamoBackend();
