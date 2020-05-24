import directusTapesMeBackend from "@/api/collection-storage/backends/directus-backend";
import { parseDbDate } from "@/api/collection-storage/backends/directus-utils";
import { dynamoTableTapes } from "@/api/collection-storage/backends/dynamodb/dynamodb-table-tapes";
import { generateUid } from "@/api/collection-storage/backends/dynamodb/dynamodb-utils";
import { ERR, OK } from "@/api/IResponse";
import { RPCHandlerFactory } from "@/api/rpc/rpc-server-handler";
import { IRoom } from "@/app-schema/IRoom";
import HttpStatus from "http-status-codes";
import { DateTime } from "luxon";
import { IResponse } from "../../IResponse";
import meta from "./room.import.meta";

export default RPCHandlerFactory(meta, async (reqData) => {
  console.debug(`dynamoTableTapes.initiate`);
  const tableInitiation = await dynamoTableTapes.initiate();
  if (!tableInitiation.ok) {
    console.error(tableInitiation.error);
    return ERR(tableInitiation.error);
  }

  console.debug(`dynamoTableTapes.backup`);
  const tableBackup = await dynamoTableTapes.backup();
  if (!tableBackup.ok) {
    // Might fail when the table was not there in the beginning, that's ok
    console.error(tableBackup.error);
  }

  const roomResponses = await Promise.all(
    reqData.uids.map((uid) => importRoom(uid))
  );
  const rooms = roomResponses
    .map((r) => (r.ok ? r.data : undefined))
    .filter((r) => r !== undefined) as IRoom[];

  if (!rooms.length) {
    return ERR<IRoom>("No room imported", HttpStatus.BAD_REQUEST);
  }

  return OK<IRoom[]>(rooms);
});

const importRoom = async (uid: string): Promise<IResponse<IRoom>> => {
  console.debug(`directusTapesMeBackend.getRoomBySlug`);
  const directusRoomImport = await directusTapesMeBackend.getRoomBySlug(uid);
  if (!directusRoomImport.ok) {
    return ERR(directusRoomImport.error, directusRoomImport.status);
  }

  const roomUid = directusRoomImport.data.slug;

  console.debug(`dynamoTableTapes.createRoom: ${roomUid}`);

  const roomImport = await dynamoTableTapes.createRoom({
    uid: roomUid,
    created_on: DateTime.utc().toJSON(),
    title: directusRoomImport.data.title,
    cover_file: {
      data: {
        full_url: directusRoomImport.data.cover_file.data.full_url,
      },
    },
    playlists: [],
  });
  if (!roomImport.ok) {
    console.debug(`dynamoTableTapes.createRoom failed: ${roomImport.error}`);
  }

  await Promise.all(
    directusRoomImport.data.playlists
      .reverse()
      .map(async (directusPlaylist) => {
        const playlistUid = generateUid();

        console.debug(
          `dynamoTableTapes.createPlaylist: ${parseDbDate(
            // FIXMEEEE
            directusPlaylist.created_on.replace("+00:00", "")
          ).toJSON()}`
        );
        const playlistImport = await dynamoTableTapes.createPlaylist(roomUid, {
          uid: playlistUid,
          title: directusPlaylist.title,
          description: directusPlaylist.description,
          created_on: parseDbDate(directusPlaylist.created_on).toJSON(),
          cover_file: {
            data: {
              full_url: directusPlaylist.cover_file.data.full_url,
            },
          },
          episodes: [],
        });

        if (!playlistImport.ok) {
          console.debug(
            `dynamoTableTapes.createPlaylist failed: ${playlistImport.error}`
          );
          return ERR(playlistImport.error, playlistImport.status);
        }

        await Promise.all(
          directusPlaylist.episodes.reverse().map(async (directusEpisode) => {
            console.debug(`dynamoTableTapes.createEpisode`);
            const episodeImport = await dynamoTableTapes.createEpisode(
              roomUid,
              playlistUid,
              {
                uid: generateUid(),
                title: directusEpisode.title,
                status: directusEpisode.status,
                published_on: directusEpisode.published_on
                  ? parseDbDate(directusEpisode.created_on).toJSON()
                  : undefined,
                created_on: parseDbDate(directusEpisode.created_on).toJSON(),
                audio_file: directusEpisode.audio_file,
                image_file: {
                  data: {
                    full_url: directusEpisode.image_file.data.full_url,
                  },
                },
              }
            );
            if (!episodeImport.ok) {
              return ERR(episodeImport.error, episodeImport.status);
            }
          })
        );
      })
  );

  return await dynamoTableTapes.getRoomWithNested(uid);
};
