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
import {
  DocumentClientContructorConfig,
  DynamodbTableBase,
} from "./dynamodb-table-base";

const PARTITION_KEY_NAME = "DYNAMODBPK";
const SORT_KEY_NAME = "DYNAMODBSK";
const CREATED_ON_KEY = "DYNAMODBCREATED";

export const dynamoTableTapesConfig: aws.DynamoDB.CreateTableInput = {
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

export class DynamoTableTapes extends DynamodbTableBase {
  constructor(config?: {
    dbConfig?: aws.DynamoDB.ClientConfiguration;
    docClientConfig?: DocumentClientContructorConfig;
  }) {
    super({
      tableConfig: dynamoTableTapesConfig,
      docClientConfig: config?.docClientConfig,
      dbConfig: config?.docClientConfig,
    });
  }

  private partitionKeyValue = (roomUid: IRoom["uid"]) => {
    return `ROOMPK#${roomUid}`;
  };

  private sortKeyValue = {
    room: (roomUid: IRoom["uid"]) => {
      return `ROOM#${roomUid}`;
    },
    playlist: (playlistUid: IPlaylist["uid"]) => {
      return `PLAYLIST#${playlistUid}`;
    },
    episode: (playlistUid: IPlaylist["uid"], episodeUid: IEpisode["uid"]) => {
      return `PLAYLIST#${playlistUid}:EPISODE#${episodeUid}`;
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
    decode: (itemData: aws.DynamoDB.DocumentClient.AttributeMap) => T
  ): Promise<IResponse<T>> {
    try {
      const itemData = await this.docClient.get(params).promise();
      if (itemData.Item) {
        this.deleteDynamoKeys(itemData.Item);
        return OK<T>(decode(itemData.Item));
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
    const params: aws.DynamoDB.DocumentClient.PutItemInput = {
      TableName: this.tableConfig.TableName,
      Item: {
        ...room,
        [PARTITION_KEY_NAME]: this.partitionKeyValue(room.uid),
        [SORT_KEY_NAME]: this.sortKeyValue.room(room.uid),
        [CREATED_ON_KEY]: this.createdOnKeyValue(room),
      },
      // Don't allow creation if uid already exists
      ConditionExpression: `attribute_not_exists(${PARTITION_KEY_NAME})`,
    };
    return this.putItem<IRoom>(params, () => this.getRoom(room.uid));
  }

  async createPlaylist(
    roomUid: IRoom["uid"],
    playlist: IPlaylist
  ): Promise<IResponse<IPlaylist>> {
    if (!(await this.roomExists(roomUid))) {
      // Would expect that this check should be possible to do on put-time..
      return ERR<IPlaylist>(`Room doesn't exist`);
    }

    const params: aws.DynamoDB.DocumentClient.PutItemInput = {
      TableName: this.tableConfig.TableName,
      Item: {
        ...playlist,
        [PARTITION_KEY_NAME]: this.partitionKeyValue(roomUid),
        [SORT_KEY_NAME]: this.sortKeyValue.playlist(playlist.uid),
        [CREATED_ON_KEY]: this.createdOnKeyValue(playlist),
      },
      // Don't allow creation if uid already exists
      ConditionExpression: `attribute_not_exists(${SORT_KEY_NAME})`,
    };
    return this.putItem<IPlaylist>(params, () =>
      this.getPlaylist(roomUid, playlist.uid)
    );
  }

  async createEpisode(
    roomUid: IRoom["uid"],
    playlistUid: IPlaylist["uid"],
    episode: IEpisode
  ): Promise<IResponse<IEpisode>> {
    if (!(await this.playlistExists(roomUid, playlistUid))) {
      // Would expect that this check should be possible to do on put-time..
      return ERR<IEpisode>(`Playlist doesn't exist`);
    }

    const params = {
      TableName: this.tableConfig.TableName,
      Item: {
        ...episode,
        [PARTITION_KEY_NAME]: this.partitionKeyValue(roomUid),
        [SORT_KEY_NAME]: this.sortKeyValue.episode(playlistUid, episode.uid),
        [CREATED_ON_KEY]: this.createdOnKeyValue(episode),
      },
      // Don't allow creation if uid already exists
      ConditionExpression: `attribute_not_exists(${SORT_KEY_NAME})`,
    };
    return this.putItem<IEpisode>(params, () =>
      this.getEpisode(roomUid, playlistUid, episode.uid)
    );
  }

  async updateEpisode(
    roomUid: IRoom["uid"],
    playlistUid: IPlaylist["uid"],
    episodeUid: IEpisode["uid"],
    episode: Partial<IEpisode>
  ): Promise<IResponse<IEpisode>> {
    const keysToUpdate = Object.keys(episode);
    const params: aws.DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: this.tableConfig.TableName,
      Key: {
        [PARTITION_KEY_NAME]: this.partitionKeyValue(roomUid),
        [SORT_KEY_NAME]: this.sortKeyValue.episode(playlistUid, episodeUid),
      },
      // e.g. `set #status = :status`
      UpdateExpression: `set ${keysToUpdate.map((k) => `#${k} = :${k}`)}`,
      // e.g. {":status" : episode.status}
      ExpressionAttributeValues: keysToUpdate.reduce(
        (acc: { [key: string]: any }, key) => ({
          ...acc,
          [`:${key}`]: episode[key as keyof IEpisode],
        }),
        {}
      ),
      // e.g. {"#status" : "status"}
      ExpressionAttributeNames: keysToUpdate.reduce(
        (acc: { [key: string]: any }, key) => ({
          ...acc,
          [`#${key}`]: key,
        }),
        {}
      ),
      // Only if it already existed
      ConditionExpression: `attribute_exists(${SORT_KEY_NAME})`,
    };

    return this.updateItem<IEpisode>(params, () =>
      this.getEpisode(roomUid, playlistUid, episodeUid)
    );
  }

  async getRoom(roomUid: IRoom["uid"]): Promise<IResponse<IRoom>> {
    const params = {
      TableName: this.tableConfig.TableName,
      Key: {
        [PARTITION_KEY_NAME]: this.partitionKeyValue(roomUid),
        [SORT_KEY_NAME]: this.sortKeyValue.room(roomUid),
      },
    };
    const decode = (itemData: aws.DynamoDB.DocumentClient.AttributeMap) => {
      const room = (itemData as unknown) as IRoom;
      room.cover_file.data.full_url = room.cover_file.data.full_url || ""; // decode `null`
      return room;
    };
    return this.getItem<IRoom>(params, decode);
  }

  async getRoomWithNested(roomUid: IRoom["uid"]): Promise<IResponse<IRoom>> {
    /* Returns fully nested room, with nested playlists and episodes sorted latest to oldest */
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

        // Prepare to receive nested episodes based on SORT_KEY_NAME
        playlistMap[playlistItem[SORT_KEY_NAME]] = playlist;
        this.deleteDynamoKeys(playlist);
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
    const params = {
      TableName: this.tableConfig.TableName,
      Key: {
        [PARTITION_KEY_NAME]: this.partitionKeyValue(roomUid),
        [SORT_KEY_NAME]: this.sortKeyValue.episode(playlistUid, episodeUid),
      },
    };
    const decode = (itemData: aws.DynamoDB.DocumentClient.AttributeMap) => {
      const episode = (itemData as unknown) as IEpisode;
      episode.image_file.data.full_url = episode.image_file.data.full_url || ""; // decode `null`
      episode.audio_file = episode.audio_file || ""; // decode `null`
      return episode;
    };
    return this.getItem<IEpisode>(params, decode);
  }

  async getPlaylist(
    roomUid: IRoom["uid"],
    playlistUid: IPlaylist["uid"]
  ): Promise<IResponse<IPlaylist>> {
    const params = {
      TableName: this.tableConfig.TableName,
      Key: {
        [PARTITION_KEY_NAME]: this.partitionKeyValue(roomUid),
        [SORT_KEY_NAME]: this.sortKeyValue.playlist(playlistUid),
      },
    };
    const decode = (itemData: aws.DynamoDB.DocumentClient.AttributeMap) => {
      const playlist = (itemData as unknown) as IPlaylist;
      playlist.cover_file.data.full_url =
        playlist.cover_file.data.full_url || ""; // decode `null`
      return playlist;
    };
    return this.getItem<IPlaylist>(params, decode);
  }

  async getAllRaw() {
    const params = {
      TableName: this.tableConfig.TableName,
    };
    const items = await this.docClient.scan(params).promise();
    return items;
  }
}

export const dynamoTableTapes = new DynamoTableTapes();
