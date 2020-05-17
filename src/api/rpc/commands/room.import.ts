import directusTapesMeBackend from "@/api/collection-storage/backends/directus-backend";
import { parseDbDate } from "@/api/collection-storage/backends/directus-utils";
import { dynamoTableTapes } from "@/api/collection-storage/backends/dynamodb/dynamodb-table-tapes";
import { ERR } from "@/api/IResponse";
import { RPCHandlerFactory } from "@/api/rpc/rpc-server-handler";
import { IRoom } from "@/app-schema/IRoom";
import { DateTime } from "luxon";
import shortid from "shortid";
import meta from "./room.import.meta";

export default RPCHandlerFactory(meta, async (reqData) => {
  console.debug(`directusTapesMeBackend.getRoomBySlug`);
  const directusRoomImport = await directusTapesMeBackend.getRoomBySlug(
    reqData.uid
  );
  if (!directusRoomImport.ok) {
    return ERR<IRoom>(directusRoomImport.error);
  }
  const roomUid = directusRoomImport.data.slug;

  console.debug(`dynamoTableTapes.createRoom`);
  await dynamoTableTapes.createRoom({
    uid: roomUid,
    created_on: DateTime.utc().toJSON(), // TODO: get better approximation
    title: directusRoomImport.data.title,
    cover_file: {
      data: {
        full_url: directusRoomImport.data.cover_file.data.full_url,
      },
    },
    playlists: [],
  });

  directusRoomImport.data.playlists
    .reverse()
    .forEach(async (directusPlaylist) => {
      const playlistUid = shortid.generate();

      console.debug(`dynamoTableTapes.createPlaylist`);
      const playlistImport = await dynamoTableTapes.createPlaylist(roomUid, {
        uid: playlistUid,
        title: directusPlaylist.title,
        description: directusPlaylist.description,
        created_on: directusPlaylist.created_on,
        cover_file: {
          data: {
            full_url: directusPlaylist.cover_file.data.full_url,
          },
        },
        episodes: [],
      });

      if (!playlistImport.ok) {
        return ERR<IRoom>(playlistImport.error);
      }

      directusPlaylist.episodes.reverse().forEach(async (directusEpisode) => {
        console.debug(`dynamoTableTapes.createEpisode`);
        const episodeImport = await dynamoTableTapes.createEpisode(
          roomUid,
          playlistUid,
          {
            uid: shortid.generate(),
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
          return ERR<IRoom>(episodeImport.error);
        }
      });
    });

  return await dynamoTableTapes.getRoomWithNested(reqData.uid);
});
