import directusTapesMeBackend from "@/api/collection-storage/backends/directus-backend";
import { parseDbDate } from "@/api/collection-storage/backends/directus-utils";
import { dynamoTableTapes } from "@/api/collection-storage/backends/dynamodb";
import { generateUid } from "@/api/collection-storage/backends/dynamodb/dynamodb-utils";
import { ERR, IResponse, OK, unwrap } from "@/api/IResponse";
import signedUrlCreate from "@/api/rpc/commands/signedurl.create";
import { RPCHandlerFactory } from "@/api/rpc/rpc-server-handler";
import { IRoom } from "@/app-schema/IRoom";
import axios from "axios";
import HttpStatus from "http-status-codes";
import { DateTime } from "luxon";
import { notEmpty } from "../../../utils/typescript";
import meta from "./room.import.meta";

const uids = ["famhartong", "v6p4vd", "yjcx3c", "3jyqrn", "678cp7", "demo"];

export default RPCHandlerFactory(meta, async (reqData) => {
  if (reqData.secret !== "IGKjygsxlk") {
    return ERR("No valid secret passed along", HttpStatus.FORBIDDEN);
  }

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

  const roomResponses = await Promise.all(uids.map((uid) => importRoom(uid)));
  const rooms = roomResponses
    .map((r) => (r.ok ? r.data : undefined))
    .filter(notEmpty);

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
        full_url: unwrap(
          await reuploadUrlToS3(
            directusRoomImport.data.cover_file.data.full_url
          )
        ),
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
            directusPlaylist.created_on
          ).toJSON()}`
        );
        const playlistImport = await dynamoTableTapes.createPlaylist(roomUid, {
          uid: playlistUid,
          title: directusPlaylist.title,
          description: directusPlaylist.description,
          created_on: parseDbDate(directusPlaylist.created_on).toJSON(),
          cover_file: {
            data: {
              full_url: unwrap(
                await reuploadUrlToS3(directusPlaylist.cover_file.data.full_url)
              ),
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
                  : null,
                created_on: parseDbDate(directusEpisode.created_on).toJSON(),
                audio_file: directusEpisode.audio_file || null,
                image_file: {
                  data: {
                    full_url: unwrap(
                      await reuploadUrlToS3(
                        directusEpisode.image_file.data.full_url
                      )
                    ),
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

export const reuploadUrlToS3 = async (
  fileUrl: string
): Promise<IResponse<string>> => {
  /* 
    Downloads file and then streams it into S3 bucket with signed url upload
    - takes fileType and contentLength from downloaded fileUrl
   */
  const fileName = fileUrl.split("/")[fileUrl.split("/").length - 1];
  console.debug(`reuploadUrlToS3: ${fileName}`);

  return await new Promise<IResponse<string>>(async (resolve) => {
    try {
      await axios
        .get(fileUrl, { responseType: "stream" })
        .then(async (response) => {
          const fileType = response.headers["content-type"];
          const contentLength = response.headers["content-length"];
          const signedUrlCreation = await signedUrlCreate.call({
            fileName,
            fileType,
          });
          if (signedUrlCreation.ok) {
            const { uploadUrl, downloadUrl } = signedUrlCreation.data;

            await axios.put(uploadUrl, response.data, {
              headers: {
                "Content-Type": fileType,
                "Content-Length": contentLength,
              },
            });

            resolve(OK(downloadUrl));
          } else {
            resolve(ERR(signedUrlCreation.error, signedUrlCreation.status));
          }
        });
    } catch (error) {
      console.error(error);
      resolve(ERR("unknown error"));
    }
  });
};
