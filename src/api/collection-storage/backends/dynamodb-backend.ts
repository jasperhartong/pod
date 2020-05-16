/* 
https://www.alexdebrie.com/posts/dynamodb-one-to-many/#composite-primary-key--the-query-api-action

PK                      SK
ROOM#<short-unique-id>  ROOM#<short-unique-id>                                  room fields
                        PLAYLIST#<short-unique-id>                              playlist fields
                        PLAYLIST#<short-unique-id>:EPISODE#<short-unique-id>    episode fields

                        ACCESS#<email>
                        
*/
import { ERR, IResponse, OK } from "@/api/IResponse";
import { IBase } from "@/app-schema/IBase";
import { IEpisode } from "@/app-schema/IEpisode";
import { IPlaylist } from "@/app-schema/IPlaylist";
import { IRoom } from "@/app-schema/IRoom";
import aws from "aws-sdk";
import { DateTime } from "luxon";

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

  private partitionKeyValue = (roomId: IRoom["uid"]) => {
    return `ROOMPK#${roomId}`;
  };

  private sortKeyValue = {
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

  private createdOnKeyValue = (schema: IBase) => {
    return DateTime.fromISO(schema.created_on).toMillis().toString();
  };

  private deleteDynamoKeys = (
    item?: aws.DynamoDB.DocumentClient.AttributeMap
  ) => {
    delete item?.[PARTITION_KEY_NAME];
    delete item?.[SORT_KEY_NAME];
    delete item?.[CREATED_ON_KEY];
  };

  private async exists(PK: string, SK: string): Promise<boolean> {
    try {
      const itemData = await this.docClient
        .get({
          TableName: this.tableConfig.TableName,
          Key: {
            [PARTITION_KEY_NAME]: PK,
            [SORT_KEY_NAME]: SK,
          },
        })
        .promise();
      return !!itemData.Item;
    } catch (error) {
      return false;
    }
  }

  private async putItem<T extends IBase>(
    params: aws.DynamoDB.DocumentClient.PutItemInput,
    getResultValue: () => Promise<IResponse<T>>
  ): Promise<IResponse<T>> {
    try {
      await this.docClient.put(params).promise();
      // As DynamoDB doesn't return the value upon creation, we get it
      return await getResultValue();
    } catch (error) {
      return ERR<T>((error as aws.AWSError).message);
    }
  }

  private async updateItem<T extends IBase>(
    params: aws.DynamoDB.DocumentClient.UpdateItemInput,
    getResultValue: () => Promise<IResponse<T>>
  ): Promise<IResponse<T>> {
    try {
      await this.docClient.update(params).promise();
      // As DynamoDB doesn't return the value upon creation, we get it
      return await getResultValue();
    } catch (error) {
      return ERR<T>((error as aws.AWSError).message);
    }
  }

  private async getItem<T extends IBase>(
    params: aws.DynamoDB.DocumentClient.GetItemInput,
    encode: (itemData: aws.DynamoDB.DocumentClient.AttributeMap) => T
  ): Promise<IResponse<T>> {
    try {
      const itemData = await this.docClient.get(params).promise();
      if (itemData.Item) {
        this.deleteDynamoKeys(itemData.Item);
        return OK<T>(encode(itemData.Item));
      }
    } catch (error) {
      return ERR<T>((error as aws.AWSError).message);
    }
    return ERR<T>("No item found");
  }

  async roomExists(uid: IRoom["uid"]) {
    return this.exists(
      this.partitionKeyValue(uid),
      this.sortKeyValue.room(uid)
    );
  }

  async playlistExists(RoomUid: IRoom["uid"], playlistUid: IPlaylist["uid"]) {
    return this.exists(
      this.partitionKeyValue(RoomUid),
      this.sortKeyValue.playlist(playlistUid)
    );
  }

  async episodeExists(
    RoomUid: IRoom["uid"],
    playlistUid: IPlaylist["uid"],
    episodeUid: IEpisode["uid"]
  ) {
    return this.exists(
      this.partitionKeyValue(RoomUid),
      this.sortKeyValue.episode(playlistUid, episodeUid)
    );
  }

  async createRoom(room: IRoom): Promise<IResponse<IRoom>> {
    if (!room.uid) {
      return ERR<IRoom>(`No valid room uid passed along: ${room.uid}`);
    }

    const getResultValue = () => this.getRoom(room.uid);
    const params: aws.DynamoDB.DocumentClient.PutItemInput = {
      TableName: this.tableConfig.TableName,
      Item: {
        ...room,
        [PARTITION_KEY_NAME]: this.partitionKeyValue(room.uid),
        [SORT_KEY_NAME]: this.sortKeyValue.room(room.uid),
        [CREATED_ON_KEY]: this.createdOnKeyValue(room),
      },
      ConditionExpression: `attribute_not_exists(${PARTITION_KEY_NAME})`,
    };
    return this.putItem<IRoom>(params, getResultValue);
  }

  async createPlaylist(
    roomUid: IRoom["uid"],
    playlist: IPlaylist
  ): Promise<IResponse<IPlaylist>> {
    if (!roomUid) {
      return ERR<IPlaylist>(`No valid room uid passed along: ${roomUid}`);
    }
    if (!playlist.uid) {
      return ERR<IPlaylist>(
        `No valid playlist uid passed along: ${playlist.uid}`
      );
    }
    if (!(await this.roomExists(roomUid))) {
      return ERR<IPlaylist>(`Room doesn't exist`);
    }

    const getResultValue = () => this.getPlaylist(roomUid, playlist.uid);
    const params: aws.DynamoDB.DocumentClient.PutItemInput = {
      TableName: this.tableConfig.TableName,
      Item: {
        ...playlist,
        [PARTITION_KEY_NAME]: this.partitionKeyValue(roomUid),
        [SORT_KEY_NAME]: this.sortKeyValue.playlist(playlist.uid),
        [CREATED_ON_KEY]: this.createdOnKeyValue(playlist),
      },
    };
    return this.putItem<IPlaylist>(params, getResultValue);
  }

  async createEpisode(
    roomUid: IRoom["uid"],
    playlistUid: IPlaylist["uid"],
    episode: IEpisode
  ): Promise<IResponse<IEpisode>> {
    if (!roomUid) {
      return ERR<IEpisode>(`No valid room uid passed along: ${roomUid}`);
    }
    if (!playlistUid) {
      return ERR<IEpisode>(
        `No valid playlist uid passed along: ${playlistUid}`
      );
    }
    if (!episode.uid) {
      return ERR<IEpisode>(`No valid episode uid passed along: ${episode.uid}`);
    }
    if (!(await this.playlistExists(roomUid, playlistUid))) {
      return ERR<IEpisode>(`Playlist doesn't exist`);
    }

    const getResultValue = () =>
      this.getEpisode(roomUid, playlistUid, episode.uid);
    const params = {
      TableName: this.tableConfig.TableName,
      Item: {
        ...episode,
        [PARTITION_KEY_NAME]: this.partitionKeyValue(roomUid),
        [SORT_KEY_NAME]: this.sortKeyValue.episode(playlistUid, episode.uid),
        [CREATED_ON_KEY]: this.createdOnKeyValue(episode),
      },
    };
    return this.putItem<IEpisode>(params, getResultValue);
  }

  async updateEpisode(
    roomUid: IRoom["uid"],
    playlistUid: IPlaylist["uid"],
    episodeUid: IEpisode["uid"],
    episode: Partial<IEpisode>
  ): Promise<IResponse<IEpisode>> {
    if (!roomUid) {
      return ERR<IEpisode>(`No valid room uid passed along: ${roomUid}`);
    }
    if (!playlistUid) {
      return ERR<IEpisode>(
        `No valid playlist uid passed along: ${playlistUid}`
      );
    }
    if (!episodeUid) {
      return ERR<IEpisode>(`No valid episode uid passed along: ${episodeUid}`);
    }
    const keysToUpdate = Object.keys(episode);

    const getResultValue = () =>
      this.getEpisode(roomUid, playlistUid, episodeUid);

    const params: aws.DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: this.tableConfig.TableName,
      Key: {
        [PARTITION_KEY_NAME]: this.partitionKeyValue(roomUid),
        [SORT_KEY_NAME]: this.sortKeyValue.episode(playlistUid, episodeUid),
      },
      // e.g. `set title = :title`
      UpdateExpression: `set ${keysToUpdate.map((k) => `${k} = :${k}`)}`,
      // e.g. {":title" : episode.title}
      ExpressionAttributeValues: keysToUpdate.reduce(
        (acc: { [key: string]: any }, key) => ({
          ...acc,
          [`:${key}`]: episode[key as keyof IEpisode],
        }),
        {}
      ),
      // Only if it already existed
      ConditionExpression: `attribute_exists(${SORT_KEY_NAME})`,
    };

    return this.updateItem<IEpisode>(params, getResultValue);
  }

  async getRoom(roomUid: IRoom["uid"]): Promise<IResponse<IRoom>> {
    if (!roomUid) {
      return ERR<IRoom>(`No valid room uid passed along: ${roomUid}`);
    }

    const params = {
      TableName: this.tableConfig.TableName,
      Key: {
        [PARTITION_KEY_NAME]: this.partitionKeyValue(roomUid),
        [SORT_KEY_NAME]: this.sortKeyValue.room(roomUid),
      },
    };
    const encode = (itemData: aws.DynamoDB.DocumentClient.AttributeMap) => {
      const room = (itemData as unknown) as IRoom;
      room.cover_file.data.full_url = room.cover_file.data.full_url || ""; // decode `null`
      return room;
    };
    return this.getItem<IRoom>(params, encode);
  }

  async getRoomWithNested(roomUid: IRoom["uid"]): Promise<IResponse<IRoom>> {
    /* Returns fully nested room, with nested playlists and episodes sorted latest to oldest */
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
        ":PK": this.partitionKeyValue(roomUid),
      },
    };

    try {
      const queryData = await this.docClient.query(params).promise();
      if (!queryData.Items) {
        return ERR<IRoom>("no items found");
      }

      const sortedItems = queryData.Items.sort((a, b) => {
        if (a[CREATED_ON_KEY] < b[CREATED_ON_KEY]) {
          return 1;
        }
        if (a[CREATED_ON_KEY] > b[CREATED_ON_KEY]) {
          return -1;
        }
        return 0;
      });

      // Get roomItem
      const roomItem = sortedItems.find((item) =>
        item[SORT_KEY_NAME].includes("ROOM")
      );
      if (!roomItem) {
        return ERR<IRoom>("no roomItem found");
      }

      // Get playlist and episodes
      const playlistItems = sortedItems.filter(
        (item) =>
          item[SORT_KEY_NAME].includes("PLAYLIST") &&
          !item[SORT_KEY_NAME].includes("EPISODE")
      );
      const episodeItems = sortedItems.filter((item) =>
        item[SORT_KEY_NAME].includes("EPISODE")
      );

      // Encode roomItem to IRoom (Add io-ts for validation/ decoding)
      this.deleteDynamoKeys(roomItem);
      const room = (roomItem as unknown) as IRoom;
      room.cover_file.data.full_url = room.cover_file.data.full_url || ""; // decode `null`

      // Get and parse playlistItems
      let playlistMap: Record<string, IPlaylist> = {};
      playlistItems.forEach((playlistItem) => {
        // Encode playlist
        const playlist = (playlistItem as unknown) as IPlaylist;
        playlist.cover_file.data.full_url =
          playlist.cover_file.data.full_url || ""; // decode `null`
        room.playlists.push(playlist);

        // Prepate to receive nested episodes based on SORT_KEY_NAME
        playlistMap[playlistItem[SORT_KEY_NAME]] = playlist;
        this.deleteDynamoKeys(playlistMap);
      });

      // Get and parse episodeItems, also push into playlist
      episodeItems.forEach((episodeItem) => {
        // Encode episode
        const episode = (episodeItem as unknown) as IEpisode;
        episode.image_file.data.full_url =
          episode.image_file.data.full_url || ""; // decode `null`
        episode.audio_file = episode.audio_file || ""; // decode `null`

        // Nest into correct playlist
        const playlistSK = episodeItem[SORT_KEY_NAME].split(":EPISODE#")[0];
        if (playlistMap[playlistSK]) {
          playlistMap[playlistSK].episodes.push(episode);
        }
        this.deleteDynamoKeys(episodeItem);
      });

      // Fill rooms its playlist
      room.playlists = Object.values(playlistMap);

      return OK<IRoom>(room);
    } catch (error) {
      return ERR<IRoom>((error as aws.AWSError).message);
    }
  }

  async getEpisode(
    roomUid: IRoom["uid"],
    playlistUid: IPlaylist["uid"],
    episodeUid: IEpisode["uid"]
  ): Promise<IResponse<IEpisode>> {
    if (!roomUid) {
      return ERR<IEpisode>(`No valid room uid passed along: ${roomUid}`);
    }
    if (!playlistUid) {
      return ERR<IEpisode>(
        `No valid playlist uid passed along: ${playlistUid}`
      );
    }
    if (!episodeUid) {
      return ERR<IEpisode>(`No valid playlist uid passed along: ${episodeUid}`);
    }
    const params = {
      TableName: this.tableConfig.TableName,
      Key: {
        [PARTITION_KEY_NAME]: this.partitionKeyValue(roomUid),
        [SORT_KEY_NAME]: this.sortKeyValue.episode(playlistUid, episodeUid),
      },
    };
    const encode = (itemData: aws.DynamoDB.DocumentClient.AttributeMap) => {
      const episode = (itemData as unknown) as IEpisode;
      episode.image_file.data.full_url = episode.image_file.data.full_url || ""; // decode `null`
      episode.audio_file = episode.audio_file || ""; // decode `null`
      return episode;
    };
    return this.getItem<IEpisode>(params, encode);
  }

  async getPlaylist(
    roomUid: IRoom["uid"],
    playlistUid: IPlaylist["uid"]
  ): Promise<IResponse<IPlaylist>> {
    if (!roomUid) {
      return ERR<IPlaylist>(`No valid room uid passed along: ${roomUid}`);
    }
    if (!playlistUid) {
      return ERR<IPlaylist>(
        `No valid playlist uid passed along: ${playlistUid}`
      );
    }
    const params = {
      TableName: this.tableConfig.TableName,
      Key: {
        [PARTITION_KEY_NAME]: this.partitionKeyValue(roomUid),
        [SORT_KEY_NAME]: this.sortKeyValue.playlist(playlistUid),
      },
    };
    const encode = (itemData: aws.DynamoDB.DocumentClient.AttributeMap) => {
      const playlist = (itemData as unknown) as IPlaylist;
      playlist.cover_file.data.full_url =
        playlist.cover_file.data.full_url || ""; // decode `null`
      return playlist;
    };
    return this.getItem<IPlaylist>(params, encode);
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
