import * as t from "io-ts";
import { TypeOf } from "io-ts";
import { NextPageContext } from "next";
import roomFetch from "../../../../src/api/rpc/commands/room.fetch";
import { IResponse } from "../../../../src/api/IResponse";
import { IRoom } from "../../../../src/app-schema/IRoom";
import {
  Button,
  List,
  Paper,
  Box,
  Typography,
  TextField,
  Breadcrumbs,
  Link,
  Divider,
  Grid,
  Container,
  ListItem,
  ListItemText,
  ListSubheader,
  ListItemAvatar,
  Avatar,
} from "@material-ui/core";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import PlaylistHeader from "../../../../src/components/playlist-header";
import AppContainer from "../../../../src/components/app-container";
import { useImmer } from "use-immer";
import { IPlaylist } from "../../../../src/app-schema/IPlaylist";
import episodeCreateMeta from "../../../../src/api/rpc/commands/episode.create.meta";
import { useRef } from "react";
import SubscribePanel from "../../../../src/components/subscribe-panel";

type EpisodeCreateRequestData = TypeOf<
  typeof episodeCreateMeta["reqValidator"]
>;

const steps = t.keyof({
  choosePlaylist: 1,
  chooseBook: 2,
  recordIntro: 3,
});
type IStep = t.TypeOf<typeof steps>;

interface IRecordingState {
  step: IStep;
  partialEpisode: Partial<EpisodeCreateRequestData>;
  playlist?: IPlaylist;
}

type ImmerDispatch = (
  f: (draft: IRecordingState) => void | IRecordingState
) => void;

interface RecordingStepProps {
  room: IRoom;
  state: IRecordingState;
  dispatch: ImmerDispatch;
  next: () => boolean;
  prev: () => boolean;
}

const ChoosePlaylistStep = ({ room, dispatch, next }: RecordingStepProps) => {
  const selectPlaylist = (playlist: IPlaylist) => {
    dispatch((state) => {
      state.playlist = playlist;
    });
    next();
  };

  return (
    <Paper>
      <Box p={1}>
        <List>
          {room.playlists.map((p) => (
            <PlaylistHeader
              key={p.id}
              playlist={p}
              onClick={() => selectPlaylist(p)}
              secondaryAction={<ChevronRightIcon />}
            />
          ))}
        </List>
      </Box>
      <Divider />
      <Box textAlign="center" p={2}>
        <Button variant="outlined" onClick={() => alert("😅 Coming soon!")}>
          Nieuwe collectie beginnen
        </Button>
      </Box>
    </Paper>
  );
};

const ChooseTitleStep = ({ state, dispatch, next }: RecordingStepProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputRef.current?.value) {
      return;
    }
    dispatch((state) => {
      state.partialEpisode.title = inputRef.current?.value;
    });
    next();
  };

  return (
    <Paper>
      <Box p={1}>
        <List>
          <ListSubheader>Nieuwe aflevering</ListSubheader>
          <ListItem>
            <form onSubmit={onSubmit} style={{ width: "100%" }}>
              <Grid
                container
                justify="space-between"
                alignContent="center"
                alignItems="center"
                spacing={2}
              >
                <Grid item xs>
                  <TextField
                    fullWidth
                    placeholder="Titel aflevering"
                    inputRef={inputRef}
                    defaultValue={state.partialEpisode.title}
                  />
                </Grid>
                <Grid item>
                  <Button variant="contained" type="submit">
                    Nieuw
                  </Button>
                </Grid>
              </Grid>
            </form>
          </ListItem>
          <ListSubheader>Laatste 5 afleveringen</ListSubheader>
          {state.playlist?.episodes.slice(0, 5).map((episode) => (
            <ListItem key={episode.id}>
              <ListItemAvatar>
                <Avatar
                  variant="square"
                  alt={episode.title}
                  src={
                    episode.image_file.data.thumbnails.find(
                      (t) => t.width > 100
                    )?.url
                  }
                />
              </ListItemAvatar>
              <ListItemText
                primary={episode.title}
                secondary={episode.created_on}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

const useRoomRecordPageState = () => {
  const [state, dispatch] = useImmer<IRecordingState>({
    step: "choosePlaylist",
    partialEpisode: {},
  });

  const move = (diff: number) => {
    const moveValue = steps.keys[state.step] + diff;
    const moveKey = Object.keys(steps.keys).find(
      (key) => steps.keys[(key as unknown) as IStep] === moveValue
    );
    if (moveKey) {
      dispatch((state) => {
        state.step = (moveKey as unknown) as IStep;
      });
      return true;
    }
    return false;
  };

  const next = () => move(1);
  const prev = () => move(-1);

  const goTo = (step: IStep) => {
    dispatch((state) => {
      state.step = step;
    });
  };

  return { state, dispatch, next, prev, goTo };
};

const RecordPage = ({ room }: { room: IResponse<IRoom> }) => {
  const { state, dispatch, next, prev, goTo } = useRoomRecordPageState();

  if (!room.ok) {
    return <>"Error"</>;
  }

  const s = state.step;
  const stepProps = {
    room: room.data,
    state,
    dispatch,
    next,
    prev,
  };

  return (
    <AppContainer maxWidth="md">
      <Container maxWidth="sm" style={{ padding: 0 }}>
        <Box pt={2} pb={2} textAlign="center">
          <Typography component="div" variant="h6">
            {room.data.title}
          </Typography>
          <Typography component="div" variant="overline">
            admin
          </Typography>
        </Box>
        {/* <Box pt={1} pb={1}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link
              href="#"
              color="inherit"
              onClick={() => goTo("choosePlaylist")}
            >
              <>Collecties</>
            </Link>

            {steps.keys["choosePlaylist"] < steps.keys[state.step] && (
              <Link
                color="inherit"
                href="#"
                onClick={() => goTo("choosePlaylist")}
              >
                <>{state.playlist?.title}</>
              </Link>
            )}
            {steps.keys["chooseBook"] < steps.keys[state.step] && (
              <Link color="inherit" href="#" onClick={() => goTo("chooseBook")}>
                {state.partialEpisode.title}
              </Link>
            )}
          </Breadcrumbs>
        </Box> */}
        <Box>
          {s === "choosePlaylist" && <ChoosePlaylistStep {...stepProps} />}
          {s === "chooseBook" && <ChooseTitleStep {...stepProps} />}
          {s === "recordIntro" && <>TODO</>}
        </Box>
        <Box pt={4}>
          <SubscribePanel slug={room.data.slug} />
        </Box>
      </Container>
    </AppContainer>
  );
};

export default RecordPage;

export async function getServerSideProps(context: NextPageContext) {
  const room = await roomFetch.handle({
    slug: context.query.roomSlug as string,
  });
  return {
    props: { room },
  };
}
