import * as t from "io-ts";
import { NextPageContext } from "next";

import roomFetch from "../../../../../src/api/rpc/commands/room.fetch";
import { IResponse } from "../../../../../src/api/IResponse";
import { IRoom } from "../../../../../src/app-schema/IRoom";
import { IPlaylist } from "../../../../../src/app-schema/IPlaylist";
import AppContainer from "../../../../../src/components/app-container";
import { Container } from "@material-ui/core";
import { useImmer } from "use-immer";
import episodeCreateMeta from "../../../../../src/api/rpc/commands/episode.create.meta";
import { TypeOf } from "io-ts";
import { useState } from "react";
import EpisodeCreationStepTitle from "../../../../../src/components/admin/episode-creation/episode-creation-step-title";
import EpisodeCreationStepIntroAudio from "../../../../../src/components/admin/episode-creation/episode-creation-step-intro";

type EpisodeCreateRequestData = TypeOf<
  typeof episodeCreateMeta["reqValidator"]
>;

interface IEpisodeCreationState {
  partialEpisode: Partial<EpisodeCreateRequestData>;
  playlistId?: IPlaylist["id"];
}

const useEpisodeCreationState = (playlistId?: IPlaylist["id"]) => {
  const [state, dispatch] = useImmer<IEpisodeCreationState>({
    partialEpisode: {},
    playlistId,
  });
  const updateNewEpisode = (
    partialEpisode: Partial<EpisodeCreateRequestData>
  ) => {
    dispatch((state) => {
      state.partialEpisode = { ...state.partialEpisode, ...partialEpisode };
    });
  };

  return { newEpisode: state, updateNewEpisode };
};

const steps = t.keyof({
  title: 1,
  introAudio: 2,
  recordAudio: 3,
  image: 4,
});
type IStep = t.TypeOf<typeof steps>;

const useStepper = () => {
  const [currentStep, setCurrentStep] = useState<IStep>("title");

  const move = (diff: number) => {
    const moveValue = steps.keys[currentStep] + diff;
    const moveKey = Object.keys(steps.keys).find(
      (key) => steps.keys[(key as unknown) as IStep] === moveValue
    );
    if (moveKey) {
      setCurrentStep((moveKey as unknown) as IStep);
      return true;
    }
    return false;
  };

  const next = () => move(1);
  const prev = () => move(-1);

  const goTo = (step: IStep) => {
    setCurrentStep(step);
  };

  return { currentStep, next, prev, goTo };
};

const AdminEpisodeCreationPage = (props: {
  room: IResponse<IRoom>;
  playlistId: IPlaylist["id"] | null;
}) => {
  const { newEpisode, updateNewEpisode } = useEpisodeCreationState(
    props.playlistId || undefined
  );
  const { currentStep, next, prev, goTo } = useStepper();

  if (!props.room.ok || !props.playlistId) {
    return <>Error</>;
  }
  const room = props.room.data;
  const playlist = room.playlists.find((p) => p.id);

  if (!playlist) {
    return <>Error</>;
  }

  const episodeCreationStepProps = {
    room,
    playlist,
    partialEpisode: newEpisode.partialEpisode,
    onUpdate: updateNewEpisode,
    onNext: next,
    onPrev: prev,
  };

  return (
    <AppContainer maxWidth="md">
      <Container maxWidth="sm" style={{ padding: 0 }}>
        {currentStep === "title" && (
          <EpisodeCreationStepTitle {...episodeCreationStepProps} />
        )}
        {currentStep === "introAudio" && (
          <EpisodeCreationStepIntroAudio {...episodeCreationStepProps} />
        )}
        {currentStep === "recordAudio" && (
          <>
            {JSON.stringify(newEpisode.partialEpisode)}
            <audio src={newEpisode.partialEpisode.audio_url} controls></audio>
          </>
        )}
      </Container>
    </AppContainer>
  );
};

export default AdminEpisodeCreationPage;

export async function getServerSideProps(context: NextPageContext) {
  const playlistId =
    (parseInt(context.query.playlistId as string) as IPlaylist["id"]) || null;
  const roomSlug = (context.query.roomSlug as string) || null;
  const room = await roomFetch.handle({
    slug: roomSlug || undefined,
  });

  return {
    props: { room, playlistId },
  };
}
