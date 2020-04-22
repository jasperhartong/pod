import { TypeOf } from "io-ts";
import { IPlaylist } from "../../../app-schema/IPlaylist";
import { IRoom } from "../../../app-schema/IRoom";
import episodeCreateMeta from "../../../api/rpc/commands/episode.create.meta";

type EpisodeCreateRequestData = TypeOf<
  typeof episodeCreateMeta["reqValidator"]
>;

export interface EpisodeCreationStepProps {
  playlist: IPlaylist;
  room: IRoom;
  partialEpisode: Partial<EpisodeCreateRequestData>;
  onUpdate: (episode: Partial<EpisodeCreateRequestData>) => void;
  onPrev: () => void;
  onNext: () => void;
}
