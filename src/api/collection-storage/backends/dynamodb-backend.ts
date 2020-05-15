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

  private primaryKey = (roomId: IRoom["uid"]) => {
    return `ROOM#${roomId}`;
  };

  private sortKey = {
    room: (roomId: IRoom["uid"]) => {
      return `ROOM#${roomId}`;
    },
    playlist: (playlistId: IPlaylist["uid"]) => {
      return `PLAYLIST#${playlistId}`;
    },
    episode: (playlistId: IPlaylist["uid"], episodeId: IEpisode["uid"]) => {
      return `PLAYLIST#${playlistId}EPISODE#${episodeId}`;
    },
  };

  createRoom(room: IRoom): Promise<IResponse<IRoom>> {
    if (!room.uid) {
      return Promise.resolve(
        ERR<IRoom>(`No valid room uid passed along: ${room.uid}`)
      );
    }

    const getResultValue = this.getRoom.bind(this);
    const params = {
      TableName: this.tableConfig.TableName,
      Item: {
        ...room,
        PK: this.primaryKey(room["uid"]),
        SK: this.sortKey.room(room["uid"]),
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
        PK: this.primaryKey(roomUid),
        SK: this.sortKey.playlist(playlist.uid),
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
          console.info("TapesDynamoBackend::create Success", data);
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
        PK: this.primaryKey(roomUid),
        SK: this.sortKey.episode(playlistUid, episode.uid),
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
          console.info("TapesDynamoBackend::create Success", data);
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

    const params: aws.DynamoDB.DocumentClient.QueryInput = {
      TableName: this.tableConfig.TableName,
      KeyConditionExpression: "PK = :PK",
      ExpressionAttributeValues: {
        ":PK": this.primaryKey(roomUid),
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
          // Get roomItem
          const roomItem = data.Items?.find((item) => item.PK.includes("ROOM"));
          if (!roomItem) {
            return resolve(ERR<IRoom>("no roomItem found"));
          }

          // Get and parse playlistItems
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

          // Get and parse episodeItems, also push into playlist
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

          // Encode roomItem to IRoom (Add io-ts for validation/ decoding)
          delete roomItem.PK;
          delete roomItem.SK;
          const room = (roomItem as unknown) as IRoom;

          room.cover_file.data.full_url = room.cover_file.data.full_url || ""; // decode `null`

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
        PK: this.primaryKey(roomUid),
        SK: this.sortKey.episode(playlistUid, episodeUid),
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
        PK: this.primaryKey(roomUid),
        SK: this.sortKey.playlist(playlistUid),
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
          delete data.Item?.PK;
          delete data.Item?.SK;

          // Encode back to IPlaylist (Add io-ts for validation/ decoding)
          const playlist = (data.Item as unknown) as IPlaylist;
          playlist.cover_file.data.full_url =
            playlist.cover_file.data.full_url || ""; // decode `null`
          return resolve(OK<IPlaylist>(playlist));
        }
      });
    });
  }
}

export const tapesDynamoBackend = new TapesDynamoBackend();
