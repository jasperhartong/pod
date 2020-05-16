import { dynamoTableTapes } from "@/api/collection-storage/backends/dynamodb/dynamodb-table-tapes";
import { IEpisode } from "@/app-schema/IEpisode";
import { DateTime } from "luxon";
import shortid from "shortid";
import { RPCHandlerFactory } from "../rpc-server-handler";
import meta from "./episode.create.meta";

export default RPCHandlerFactory(meta, async (reqData) => {
  const uid = shortid.generate();
  const episode: IEpisode = {
    id: 42,
    uid,
    created_on: DateTime.utc().toJSON(),
    title: reqData.data.title,
    image_file: {
      data: {
        full_url: reqData.data.image_url,
      },
    },
    status: "draft",
    audio_file: reqData.data.audio_file,
    published_on: "",
  };

  return dynamoTableTapes.createEpisode(
    reqData.roomUid,
    reqData.playlistUid,
    episode
  );
});
