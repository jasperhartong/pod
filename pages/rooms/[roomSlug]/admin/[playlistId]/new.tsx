import * as t from "io-ts";
import { NextPageContext } from "next";

import Link from "next/link";
import roomFetch from "../../../../../src/api/rpc/commands/room.fetch";
import { IResponse } from "../../../../../src/api/IResponse";
import { IRoom } from "../../../../../src/app-schema/IRoom";
import { IPlaylist } from "../../../../../src/app-schema/IPlaylist";
import AppContainer from "../../../../../src/components/app-container";
import {
  Container,
  Grid,
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  IconButton,
} from "@material-ui/core";
import { useImmer } from "use-immer";
import episodeCreateMeta from "../../../../../src/api/rpc/commands/episode.create.meta";
import { TypeOf } from "io-ts";
import { useState } from "react";
import IconNext from "@material-ui/icons/ChevronRight";
import IconBack from "@material-ui/icons/ChevronLeft";

type EpisodeCreateRequestData = TypeOf<
  typeof episodeCreateMeta["reqValidator"]
>;

interface INewEpisodeState {
  partialEpisode: Partial<EpisodeCreateRequestData>;
  playlistId?: IPlaylist["id"];
}

const useNewEpisodeState = (playlistId?: IPlaylist["id"]) => {
  const [state, dispatch] = useImmer<INewEpisodeState>({
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
  intro: 2,
  record: 3,
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

const AdminNewEpisodePage = (props: {
  room: IResponse<IRoom>;
  playlistId: IPlaylist["id"] | null;
}) => {
  const { newEpisode, updateNewEpisode } = useNewEpisodeState(
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

  return (
    <AppContainer maxWidth="md">
      <Container maxWidth="sm" style={{ padding: 0 }}>
        <Box pt={2} pb={2} textAlign="center" position="relative">
          <Typography component="div" variant="h6">
            {playlist.title}
          </Typography>
          <Typography component="div" variant="overline">
            Nieuwe aflevering
          </Typography>
          <Box position="absolute" top={24} left={16}>
            <Link
              href="/rooms/[roomSlug]/admin/[playlistId]"
              as={`/rooms/${room.slug}/admin/${playlist.id}`}
            >
              <IconButton>
                <IconBack />
              </IconButton>
            </Link>
          </Box>
        </Box>

        <Paper>
          <Box p={2}>
            <Grid container spacing={2}>
              <Grid item sm={6} xs={12}>
                <Box
                  width="100%"
                  height="100%"
                  minHeight={200}
                  style={{
                    backgroundImage: `url("/background.png")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                />
              </Grid>
              <Grid item sm={6}>
                <Typography variant="h6">
                  Hoe heet de aflevering vandaag?
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Bijvoorbeeld de title van een hoofdstuk of een nummer dat
                  aangeeft hoeveelste deel het is.
                </Typography>
                <Box pt={2} pb={3}>
                  <TextField
                    fullWidth
                    placeholder="Titel aflevering"
                    // inputRef={inputRef}
                    defaultValue={newEpisode.partialEpisode.title}
                  />
                </Box>
                <Button variant="contained" fullWidth onClick={next}>
                  Neem intro op <IconNext />
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </AppContainer>
  );
};

export default AdminNewEpisodePage;

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
