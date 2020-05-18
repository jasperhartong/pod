import directusTapesMeBackend from "@/api/collection-storage/backends/directus-backend";
import { parseDbDate } from "@/api/collection-storage/backends/directus-utils";
import { dynamoTableTapes } from "@/api/collection-storage/backends/dynamodb/dynamodb-table-tapes";
import { generateUid } from "@/api/collection-storage/backends/dynamodb/dynamodb-utils";
import { ERR, OK } from "@/api/IResponse";
import { RPCHandlerFactory } from "@/api/rpc/rpc-server-handler";
import { IRoom } from "@/app-schema/IRoom";
import HttpStatus from "http-status-codes";
import { DateTime } from "luxon";
import meta from "./room.import.meta";

export default RPCHandlerFactory(meta, async (reqData) => {
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

const importRoom = async (uid: string) => {
  console.debug(`directusTapesMeBackend.getRoomBySlug`);
  const directusRoomImport = await directusTapesMeBackend.getRoomBySlug(uid);
  if (!directusRoomImport.ok) {
    return ERR<IRoom>(directusRoomImport.error, directusRoomImport.status);
  }
  const roomUid = directusRoomImport.data.slug;
  const roomCreatedOnApproximation = DateTime.fromMillis(
    [
      /* oldest creation date of a playlist */
      ...directusRoomImport.data.playlists.map(
        (p) => parseDbDate(p.created_on).toMillis(),
        /* or now */
        DateTime.utc().toMillis()
      ),
    ].sort((a: number, b: number) => a - b)[0]
  );

  console.debug(
    `dynamoTableTapes.createRoom: ${roomUid} ${roomCreatedOnApproximation.toJSON()}`
  );

  const roomImport = await dynamoTableTapes.createRoom({
    uid: roomUid,
    created_on: roomCreatedOnApproximation.toJSON(),
    title: directusRoomImport.data.title,
    cover_file: {
      data: {
        full_url: directusRoomImport.data.cover_file.data.full_url,
      },
    },
    playlists: [],
  });
  if (!roomImport.ok) {
    return ERR<IRoom>(roomImport.error, roomImport.status);
  }

  directusRoomImport.data.playlists
    .reverse()
    .forEach(async (directusPlaylist) => {
      const playlistUid = generateUid();

      console.debug(`dynamoTableTapes.createPlaylist`);
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
        return ERR<IRoom>(playlistImport.error, playlistImport.status);
      }

      directusPlaylist.episodes.reverse().forEach(async (directusEpisode) => {
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
          return ERR<IRoom>(episodeImport.error, episodeImport.status);
        }
      });
    });

  return await dynamoTableTapes.getRoomWithNested(uid);
};
