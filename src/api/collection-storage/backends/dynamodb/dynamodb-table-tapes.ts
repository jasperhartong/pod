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
import { IEpisode, TEpisode } from "@/app-schema/IEpisode";
import { IPlaylist, TPlaylist } from "@/app-schema/IPlaylist";
import { IRoom, TRoom } from "@/app-schema/IRoom";
import { formatErrors } from "@/utils/io-ts";
import { notEmpty } from "@/utils/typescript";
import aws from "aws-sdk";
import { isLeft, isRight } from "fp-ts/lib/Either";
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
    tableConfig?: aws.DynamoDB.CreateTableInput;
    dbConfig?: aws.DynamoDB.ClientConfiguration;
    docClientConfig?: DocumentClientContructorConfig;
  }) {
    super({
      // Default to tapes table config
      tableConfig: config?.tableConfig || dynamoTableTapesConfig,
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

  private sortLatestFirst = (
    a: aws.DynamoDB.DocumentClient.AttributeMap,
    b: aws.DynamoDB.DocumentClient.AttributeMap
  ) => {
    if (a[CREATED_ON_KEY] < b[CREATED_ON_KEY]) {
      return 1;
    }
    if (a[CREATED_ON_KEY] > b[CREATED_ON_KEY]) {
      return -1;
    }
    return 0;
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
    decode: (itemData: aws.DynamoDB.DocumentClient.AttributeMap) => T | false
  ): Promise<IResponse<T>> {
    try {
      const itemData = await this.docClient.get(params).promise();
      if (itemData.Item) {
        this.deleteDynamoKeys(itemData.Item);
        const decoded = decode(itemData.Item);
        if (decoded) {
          return OK<T>(decoded);
        } else {
          return ERR<T>("decoding failed");
        }
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
    const decoded = TRoom.decode(room);
    if (isLeft(decoded)) {
      return ERR(`Invalid room: ${formatErrors(decoded.left)}`);
    }
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
    const decoded = TPlaylist.decode(playlist);
    if (isLeft(decoded)) {
      return ERR(`Invalid playlist: ${formatErrors(decoded.left)}`);
    }
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
    const decoded = TEpisode.decode(episode);
    if (isLeft(decoded)) {
      return ERR(`Invalid episode: ${formatErrors(decoded.left)}`);
    }
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

  async deleteEpisode(
    roomUid: IRoom["uid"],
    playlistUid: IPlaylist["uid"],
    episodeUid: IEpisode["uid"]
  ): Promise<IResponse<undefined>> {
    const params: aws.DynamoDB.DocumentClient.DeleteItemInput = {
      TableName: this.tableConfig.TableName,
      Key: {
        [PARTITION_KEY_NAME]: this.partitionKeyValue(roomUid),
        [SORT_KEY_NAME]: this.sortKeyValue.episode(playlistUid, episodeUid),
      },
    };
    try {
      await this.docClient.delete(params).promise();
      return OK(undefined);
    } catch (error) {
      return ERR((error as aws.AWSError).message);
    }
  }

  async getRooms(): Promise<IResponse<IRoom[]>> {
    /* Needs to use scan: tends to be slower */
    const params: aws.DynamoDB.DocumentClient.ScanInput = {
      TableName: this.tableConfig.TableName,
      FilterExpression: `begins_with(${SORT_KEY_NAME}, :ROOM_SK_PREFIX)`,
      ExpressionAttributeValues: {
        ":ROOM_SK_PREFIX": this.sortKeyValue.room(""),
      },
    };

    try {
      console.time(`DynamoTableTapes::getRooms::scanData`);
      const scanData = await this.docClient.scan(params).promise();
      console.timeEnd(`DynamoTableTapes::getRooms::scanData`);

      if (!scanData.Items) {
        return OK([]);
      }
      return OK(
        scanData.Items.sort(this.sortLatestFirst)
          .map((roomItem) => {
            // Encode roomItem to IRoom
            this.deleteDynamoKeys(roomItem);
            const maybeRoom = TRoom.decode(roomItem);
            if (isRight(maybeRoom)) {
              return maybeRoom.right;
            }
            return undefined;
          })
          .filter(notEmpty)
      );
    } catch (error) {
      return ERR((error as aws.AWSError).message);
    }
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
      const decoded = TRoom.decode(itemData);
      return isRight(decoded) && decoded.right;
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
      console.time(`DynamoTableTapes::getRoomWithNested::queryData`);
      const queryData = await this.docClient.query(params).promise();
      console.timeEnd(`DynamoTableTapes::getRoomWithNested::queryData`);

      if (!queryData.Items) {
        return ERR<IRoom>("no items found");
      }

      // Sort from latest to oldest
      const sortedItems = queryData.Items.sort(this.sortLatestFirst);

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

      // Encode roomItem to IRoom
      this.deleteDynamoKeys(roomItem);
      const maybeRoom = TRoom.decode(roomItem);
      if (isLeft(maybeRoom)) {
        return ERR<IRoom>("room decoding error");
      }
      const room = maybeRoom.right;

      // Get and parse playlistItems
      let playlistMap: Record<string, IPlaylist> = {};
      playlistItems.forEach((playlistItem) => {
        const playlistSK = playlistItem[SORT_KEY_NAME];

        // Encode playlist
        this.deleteDynamoKeys(playlistItem);
        const maybePlaylist = TPlaylist.decode(playlistItem);
        if (isLeft(maybePlaylist)) {
          return ERR<IRoom>("playlist decoding error");
        }

        // Prepare to receive nested episodes based on SORT_KEY_NAME
        playlistMap[playlistSK] = maybePlaylist.right;
      });

      // Get and parse episodeItems, also push into playlist
      episodeItems.forEach((episodeItem) => {
        const playlistSKfromEpisodeSK = episodeItem[SORT_KEY_NAME].split(
          ":EPISODE#"
        )[0];

        // Encode episode
        this.deleteDynamoKeys(episodeItem);
        const maybeEpisode = TEpisode.decode(episodeItem);
        if (isLeft(maybeEpisode)) {
          return ERR<IRoom>("episode decoding error");
        }

        const episode = maybeEpisode.right;

        // Nest into correct playlist
        if (playlistMap[playlistSKfromEpisodeSK]) {
          playlistMap[playlistSKfromEpisodeSK].episodes.push(episode);
        }
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
      const decoded = TEpisode.decode(itemData);
      return isRight(decoded) && decoded.right;
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
      const decoded = TPlaylist.decode(itemData);
      return isRight(decoded) && decoded.right;
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
