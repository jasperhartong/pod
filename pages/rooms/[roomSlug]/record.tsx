import * as t from "io-ts";
import { TypeOf } from "io-ts";
import { NextPageContext } from "next";
import roomFetch from "../../../src/api/rpc/commands/room.fetch";
import { IResponse } from "../../../src/api/IResponse";
import { IRoom } from "../../../src/app-schema/IRoom";
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
} from "@material-ui/core";
import PlaylistHeader from "../../../src/components/playlist-header";
import AppContainer from "../../../src/components/app-container";
import { useImmer } from "use-immer";
import { IPlaylist } from "../../../src/app-schema/IPlaylist";
import episodeCreateMeta from "../../../src/api/rpc/commands/episode.create.meta";
import { useRef } from "react";

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
      <Box p={2}>
        <Typography variant="h4" style={{ maxWidth: 500 }}>
          In welke collectie wilt u een opname toevoegen?
        </Typography>
      </Box>
      <Divider />
      <Box p={2}>
        <List>
          {room.playlists.map((p) => (
            <PlaylistHeader
              key={p.id}
              playlist={p}
              onClick={() => selectPlaylist(p)}
            />
          ))}
        </List>
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
      <Box p={2}>
        <Typography variant="h4" style={{ maxWidth: 500 }}>
          Welke boek titel gaat u voorlezen?
        </Typography>
      </Box>
      <Box p={2}>
        <form onSubmit={onSubmit}>
          <TextField
            placeholder="Titel"
            inputRef={inputRef}
            defaultValue={state.partialEpisode.title}
          />
          <Box pt={1}>
            <Button variant="contained" type="submit">
              Ga door
            </Button>
          </Box>
        </form>
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
      <Box p={1}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="#" onClick={() => goTo("choosePlaylist")}>
            <>{room.data.title}</>
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
      </Box>
      <Box p={1}>
        {s === "choosePlaylist" && <ChoosePlaylistStep {...stepProps} />}
        {s === "chooseBook" && <ChooseTitleStep {...stepProps} />}
        {s === "recordIntro" && <>TODO</>}
      </Box>
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
