import { NextPageContext } from "next";

import {
  Container,
  CircularProgress,
  Box,
  Divider,
  Typography,
  Collapse,
} from "@material-ui/core";
import { ToggleButtonGroup, ToggleButton } from "@material-ui/lab";
import SurroundSound from "@material-ui/icons/SurroundSound";
import RecordIcon from "@material-ui/icons/Mic";
import ListenIcon from "@material-ui/icons/Headset";
import { Breakpoint } from "@material-ui/core/styles/createBreakpoints";
import { IRoom } from "../../src/app-schema/IRoom";
import { IEpisode } from "../../src/app-schema/IEpisode";
import SnackbarPlayer from "../../src/components/snackbar-player";
import SubscribePanel from "../../src/components/subscribe-panel";
import PlaylistHeader from "../../src/components/playlist-header";
import PlaylistGrid from "../../src/components/playlist-grid";
import {
  RoomProvider,
  useRoomContext,
  RoomState,
} from "../../src/hooks/useRoomContext";
import EpisodeCreateForm from "../../src/components/episode-create-form";
import BottomDrawer from "../../src/components/bottom-drawer";
import useSmoothScroller from "../../src/hooks/useSmoothScroller";

import { IResponse } from "../../src/api/IResponse";
import roomFetch from "../../src/api/rpc/commands/room.fetch";

const RoomPageContainer = ({ room }: { room: IResponse<IRoom> }) => {
  const defaultState: RoomState = {
    mode: "listen",
    slug: room.ok ? room.data.slug : undefined,
    room,
    recordingEpisode: undefined,
    playingEpisode: undefined,
  };

  return (
    <RoomProvider defaultState={defaultState}>
      <RoomPage />
    </RoomProvider>
  );
};

const RoomPage = () => {
  const { state, actions } = useRoomContext();

  // derived state
  const { room, mode, slug } = state;
  const maxWidth: Breakpoint = mode === "listen" ? "sm" : "lg";

  if (!slug || !room) {
    return (
      <Container maxWidth={maxWidth}>
        <Box textAlign="center" pt={8}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!room.ok) {
    return (
      <Container maxWidth={maxWidth}>
        <Box textAlign="center" pt={8}>
          <Typography variant="overline" color="textSecondary">
            Error
          </Typography>
          <Divider />
          <Typography
            variant="overline"
            color="textSecondary"
            style={{ opacity: 0.2 }}
          >
            {room.error}
          </Typography>
        </Box>
      </Container>
    );
  }

  const playingItem: IEpisode | undefined = findEpisodeById(
    room.data,
    state.playingEpisode?.episodeId
  );

  return (
    <Container
      maxWidth={maxWidth}
      style={{ transition: "all 500ms", width: "auto" }}
    >
      <Collapse in={mode === "record"}>
        <Box pt={4} pb={2}>
          <Typography variant="h4">Tapes voor {room.data.slug}</Typography>
        </Box>
      </Collapse>

      {room.data.playlists.map((playlist) => (
        <Box pb={4} key={playlist.id}>
          <PlaylistHeader playlist={playlist} />
          <PlaylistGrid
            playlist={playlist}
            playingId={state.playingEpisode?.episodeId}
            setPlayingId={actions.playingEpisode.initiate}
            isPaused={Boolean(state.playingEpisode?.isPaused)}
            setIsPaused={actions.playingEpisode.pause}
            maxWidth={maxWidth}
          />
        </Box>
      ))}

      <Collapse in={mode === "listen"}>
        <div>
          <SubscribePanel slug={slug} />
        </div>
      </Collapse>

      <Box p={3} pt={6}>
        <Divider />
      </Box>

      <RoomModeSwitcher />

      <TapesFooter />

      <SnackbarPlayer
        playingItem={playingItem}
        isPaused={Boolean(state.playingEpisode?.isPaused)}
        onPlayPause={actions.playingEpisode.pause}
        onClose={actions.playingEpisode.stop}
      />

      <BottomDrawer
        open={Boolean(state.recordingEpisode)}
        onClose={actions.recordingEpisode.cancel}
      >
        <Box p={2}>
          <EpisodeCreateForm
            playlist={state.recordingEpisode?.playlist}
            onFormChange={actions.recordingEpisode.updateRecording}
            onFormSuccess={actions.recordingEpisode.finish}
          />
        </Box>
      </BottomDrawer>
    </Container>
  );
};

export default RoomPageContainer;

const findEpisodeById = (room: IRoom, episodeId?: number) => {
  return ([] as IEpisode[])
    .concat(...[...room.playlists].map((playlist) => playlist.episodes))
    .find((episode) => episode.id === episodeId);
};

const TapesFooter = () => (
  <Box p={4} textAlign="center">
    <SurroundSound fontSize="large" color="disabled" />
    <Typography component="div" variant="overline">
      Tapes.me ©2020
    </Typography>
  </Box>
);

const RoomModeSwitcher = () => {
  const { scrollToTop } = useSmoothScroller();
  const { state, actions } = useRoomContext();

  if (!state.room?.ok) {
    return null;
  }

  return (
    <Box p={4} textAlign="center">
      <Typography component="div" variant="overline">
        {state.room.data.slug || ""}
      </Typography>
      <ToggleButtonGroup
        value={state.mode}
        size="small"
        exclusive
        onChange={(_, value) => {
          if (value) {
            actions.mode.change(value);
            scrollToTop(500);
          }
        }}
        aria-label="text alignment"
      >
        <ToggleButton value="listen" aria-label="listen">
          <ListenIcon fontSize="inherit" style={{ marginRight: 4 }} />
          Luisteren
        </ToggleButton>
        <ToggleButton value="record" aria-label="record">
          <RecordIcon fontSize="inherit" style={{ marginRight: 4 }} />
          Opnemen
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  // const room = await roomFetch.handleReqData({
  //   slug: context.query.roomSlug as string,
  // });
  const room = {
    ok: true,
    data: {
      id: 3,
      created_on: "2020-04-03 18:31:19",
      slug: "famhartong",
      playlists: [
        {
          id: 1,
          created_on: "2020-03-27 09:49:46",
          cover_file: {
            data: {
              full_url:
                "https://directus.media/dcMJTq1b80lIY4CT/1c14505d-bd26-47fb-805d-6384a4a4fe9c.png",
              url:
                "https://directus.media/dcMJTq1b80lIY4CT/1c14505d-bd26-47fb-805d-6384a4a4fe9c.png",
              thumbnails: [
                {
                  url:
                    "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/g4kn0x2rp14wccg8?key=directus-small-crop",
                  relative_url:
                    "/dcMJTq1b80lIY4CT/assets/g4kn0x2rp14wccg8?key=directus-small-crop",
                  dimension: "64x64",
                  width: 64,
                  height: 64,
                },
                {
                  url:
                    "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/g4kn0x2rp14wccg8?key=directus-small-contain",
                  relative_url:
                    "/dcMJTq1b80lIY4CT/assets/g4kn0x2rp14wccg8?key=directus-small-contain",
                  dimension: "64x64",
                  width: 64,
                  height: 64,
                },
                {
                  url:
                    "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/g4kn0x2rp14wccg8?key=directus-medium-crop",
                  relative_url:
                    "/dcMJTq1b80lIY4CT/assets/g4kn0x2rp14wccg8?key=directus-medium-crop",
                  dimension: "300x300",
                  width: 300,
                  height: 300,
                },
                {
                  url:
                    "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/g4kn0x2rp14wccg8?key=directus-medium-contain",
                  relative_url:
                    "/dcMJTq1b80lIY4CT/assets/g4kn0x2rp14wccg8?key=directus-medium-contain",
                  dimension: "300x300",
                  width: 300,
                  height: 300,
                },
                {
                  url:
                    "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/g4kn0x2rp14wccg8?key=directus-large-crop",
                  relative_url:
                    "/dcMJTq1b80lIY4CT/assets/g4kn0x2rp14wccg8?key=directus-large-crop",
                  dimension: "800x600",
                  width: 800,
                  height: 600,
                },
                {
                  url:
                    "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/g4kn0x2rp14wccg8?key=directus-large-contain",
                  relative_url:
                    "/dcMJTq1b80lIY4CT/assets/g4kn0x2rp14wccg8?key=directus-large-contain",
                  dimension: "800x600",
                  width: 800,
                  height: 600,
                },
                {
                  url:
                    "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/g4kn0x2rp14wccg8?key=thumbnail",
                  relative_url:
                    "/dcMJTq1b80lIY4CT/assets/g4kn0x2rp14wccg8?key=thumbnail",
                  dimension: "200x200",
                  width: 200,
                  height: 200,
                },
              ],
              embed: null,
            },
          },
          room: {
            id: 3,
          },
          title: "Pinkeltje",
          description: "Door Oma Els",
          episodes: [
            {
              id: 38,
              status: "published",
              created_on: "2020-04-09 08:56:11",
              title: "Pinkeltje en Wiebelstaartje",
              image_file: {
                data: {
                  full_url:
                    "https://directus.media/dcMJTq1b80lIY4CT/3f5732bf-74b0-4062-b212-5d2a8504d965.jpeg",
                  url:
                    "https://directus.media/dcMJTq1b80lIY4CT/3f5732bf-74b0-4062-b212-5d2a8504d965.jpeg",
                  thumbnails: [
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/rr5x6urwmysg0488?key=directus-small-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/rr5x6urwmysg0488?key=directus-small-crop",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/rr5x6urwmysg0488?key=directus-small-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/rr5x6urwmysg0488?key=directus-small-contain",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/rr5x6urwmysg0488?key=directus-medium-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/rr5x6urwmysg0488?key=directus-medium-crop",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/rr5x6urwmysg0488?key=directus-medium-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/rr5x6urwmysg0488?key=directus-medium-contain",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/rr5x6urwmysg0488?key=directus-large-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/rr5x6urwmysg0488?key=directus-large-crop",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/rr5x6urwmysg0488?key=directus-large-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/rr5x6urwmysg0488?key=directus-large-contain",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/rr5x6urwmysg0488?key=thumbnail",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/rr5x6urwmysg0488?key=thumbnail",
                      dimension: "200x200",
                      width: 200,
                      height: 200,
                    },
                  ],
                  embed: null,
                },
              },
              playlist: {
                id: 1,
              },
              audio_file:
                "https://tapesme.s3.amazonaws.com/08af0843-20e8-445a-a8cc-6e70d70da163.mp4",
            },
            {
              id: 37,
              status: "published",
              created_on: "2020-04-08 20:34:05",
              title: "Pinkeltje en Stekebeen",
              image_file: {
                data: {
                  full_url:
                    "https://directus.media/dcMJTq1b80lIY4CT/354a41bd-c369-4392-be1c-edeea7860e61.jpeg",
                  url:
                    "https://directus.media/dcMJTq1b80lIY4CT/354a41bd-c369-4392-be1c-edeea7860e61.jpeg",
                  thumbnails: [
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/dfehh6x1lz404ck8?key=directus-small-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/dfehh6x1lz404ck8?key=directus-small-crop",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/dfehh6x1lz404ck8?key=directus-small-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/dfehh6x1lz404ck8?key=directus-small-contain",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/dfehh6x1lz404ck8?key=directus-medium-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/dfehh6x1lz404ck8?key=directus-medium-crop",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/dfehh6x1lz404ck8?key=directus-medium-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/dfehh6x1lz404ck8?key=directus-medium-contain",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/dfehh6x1lz404ck8?key=directus-large-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/dfehh6x1lz404ck8?key=directus-large-crop",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/dfehh6x1lz404ck8?key=directus-large-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/dfehh6x1lz404ck8?key=directus-large-contain",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/dfehh6x1lz404ck8?key=thumbnail",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/dfehh6x1lz404ck8?key=thumbnail",
                      dimension: "200x200",
                      width: 200,
                      height: 200,
                    },
                  ],
                  embed: null,
                },
              },
              playlist: {
                id: 1,
              },
              audio_file:
                "https://tapesme.s3.amazonaws.com/4bf5b82b-3df1-40c3-85fe-7d4829391e97.mp4",
            },
            {
              id: 36,
              status: "published",
              created_on: "2020-04-08 20:33:06",
              title: "Pinkeltje en de trompet",
              image_file: {
                data: {
                  full_url:
                    "https://directus.media/dcMJTq1b80lIY4CT/354a34e6-3494-4ba2-8cd5-7338fa08b5be.jpeg",
                  url:
                    "https://directus.media/dcMJTq1b80lIY4CT/354a34e6-3494-4ba2-8cd5-7338fa08b5be.jpeg",
                  thumbnails: [
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/399wn2uur7swwswg?key=directus-small-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/399wn2uur7swwswg?key=directus-small-crop",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/399wn2uur7swwswg?key=directus-small-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/399wn2uur7swwswg?key=directus-small-contain",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/399wn2uur7swwswg?key=directus-medium-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/399wn2uur7swwswg?key=directus-medium-crop",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/399wn2uur7swwswg?key=directus-medium-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/399wn2uur7swwswg?key=directus-medium-contain",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/399wn2uur7swwswg?key=directus-large-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/399wn2uur7swwswg?key=directus-large-crop",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/399wn2uur7swwswg?key=directus-large-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/399wn2uur7swwswg?key=directus-large-contain",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/399wn2uur7swwswg?key=thumbnail",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/399wn2uur7swwswg?key=thumbnail",
                      dimension: "200x200",
                      width: 200,
                      height: 200,
                    },
                  ],
                  embed: null,
                },
              },
              playlist: {
                id: 1,
              },
              audio_file:
                "https://tapesme.s3.amazonaws.com/f11522d5-2814-4e83-a40f-f2d0217f65e7.mp4",
            },
            {
              id: 35,
              status: "published",
              created_on: "2020-04-08 20:32:27",
              title: "Pinkeltje en de luchtballon",
              image_file: {
                data: {
                  full_url:
                    "https://directus.media/dcMJTq1b80lIY4CT/4486d98f-ebc9-4171-9f00-b0a9621fae65.jpeg",
                  url:
                    "https://directus.media/dcMJTq1b80lIY4CT/4486d98f-ebc9-4171-9f00-b0a9621fae65.jpeg",
                  thumbnails: [
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/g2wnwjlf8740ko8s?key=directus-small-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/g2wnwjlf8740ko8s?key=directus-small-crop",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/g2wnwjlf8740ko8s?key=directus-small-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/g2wnwjlf8740ko8s?key=directus-small-contain",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/g2wnwjlf8740ko8s?key=directus-medium-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/g2wnwjlf8740ko8s?key=directus-medium-crop",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/g2wnwjlf8740ko8s?key=directus-medium-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/g2wnwjlf8740ko8s?key=directus-medium-contain",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/g2wnwjlf8740ko8s?key=directus-large-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/g2wnwjlf8740ko8s?key=directus-large-crop",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/g2wnwjlf8740ko8s?key=directus-large-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/g2wnwjlf8740ko8s?key=directus-large-contain",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/g2wnwjlf8740ko8s?key=thumbnail",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/g2wnwjlf8740ko8s?key=thumbnail",
                      dimension: "200x200",
                      width: 200,
                      height: 200,
                    },
                  ],
                  embed: null,
                },
              },
              playlist: {
                id: 1,
              },
              audio_file:
                "https://tapesme.s3.amazonaws.com/5ef562a9-c51d-4381-9396-2553036f4676.mp4",
            },
            {
              id: 34,
              status: "published",
              created_on: "2020-04-08 20:32:03",
              title: "Pinkeltje en de wipplank",
              image_file: {
                data: {
                  full_url:
                    "https://directus.media/dcMJTq1b80lIY4CT/a265decf-e271-43aa-9b73-2bff7d1d3e95.jpeg",
                  url:
                    "https://directus.media/dcMJTq1b80lIY4CT/a265decf-e271-43aa-9b73-2bff7d1d3e95.jpeg",
                  thumbnails: [
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/4o5qysc96aecgo08?key=directus-small-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/4o5qysc96aecgo08?key=directus-small-crop",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/4o5qysc96aecgo08?key=directus-small-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/4o5qysc96aecgo08?key=directus-small-contain",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/4o5qysc96aecgo08?key=directus-medium-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/4o5qysc96aecgo08?key=directus-medium-crop",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/4o5qysc96aecgo08?key=directus-medium-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/4o5qysc96aecgo08?key=directus-medium-contain",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/4o5qysc96aecgo08?key=directus-large-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/4o5qysc96aecgo08?key=directus-large-crop",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/4o5qysc96aecgo08?key=directus-large-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/4o5qysc96aecgo08?key=directus-large-contain",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/4o5qysc96aecgo08?key=thumbnail",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/4o5qysc96aecgo08?key=thumbnail",
                      dimension: "200x200",
                      width: 200,
                      height: 200,
                    },
                  ],
                  embed: null,
                },
              },
              playlist: {
                id: 1,
              },
              audio_file:
                "https://tapesme.s3.amazonaws.com/256fc4fb-4d7e-4cc4-85c2-b0f109c9067f.mp4",
            },
            {
              id: 33,
              status: "published",
              created_on: "2020-04-08 20:31:38",
              title: "Pinkeltje en de badkuip",
              image_file: {
                data: {
                  full_url:
                    "https://directus.media/dcMJTq1b80lIY4CT/29d0cdd7-26cb-4ebb-aa36-c3caf4acca72.jpeg",
                  url:
                    "https://directus.media/dcMJTq1b80lIY4CT/29d0cdd7-26cb-4ebb-aa36-c3caf4acca72.jpeg",
                  thumbnails: [
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/qmk5djoeuyo4o0wk?key=directus-small-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/qmk5djoeuyo4o0wk?key=directus-small-crop",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/qmk5djoeuyo4o0wk?key=directus-small-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/qmk5djoeuyo4o0wk?key=directus-small-contain",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/qmk5djoeuyo4o0wk?key=directus-medium-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/qmk5djoeuyo4o0wk?key=directus-medium-crop",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/qmk5djoeuyo4o0wk?key=directus-medium-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/qmk5djoeuyo4o0wk?key=directus-medium-contain",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/qmk5djoeuyo4o0wk?key=directus-large-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/qmk5djoeuyo4o0wk?key=directus-large-crop",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/qmk5djoeuyo4o0wk?key=directus-large-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/qmk5djoeuyo4o0wk?key=directus-large-contain",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/qmk5djoeuyo4o0wk?key=thumbnail",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/qmk5djoeuyo4o0wk?key=thumbnail",
                      dimension: "200x200",
                      width: 200,
                      height: 200,
                    },
                  ],
                  embed: null,
                },
              },
              playlist: {
                id: 1,
              },
              audio_file:
                "https://tapesme.s3.amazonaws.com/ea59ae37-04e4-4d2a-8184-814b059034db.mp4",
            },
            {
              id: 32,
              status: "published",
              created_on: "2020-04-08 20:31:15",
              title: "Pinkeltje en de wolbal",
              image_file: {
                data: {
                  full_url:
                    "https://directus.media/dcMJTq1b80lIY4CT/0dc30625-ddd5-4a44-bd05-14331e2a4c71.jpeg",
                  url:
                    "https://directus.media/dcMJTq1b80lIY4CT/0dc30625-ddd5-4a44-bd05-14331e2a4c71.jpeg",
                  thumbnails: [
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/c1acac35azw404k0?key=directus-small-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/c1acac35azw404k0?key=directus-small-crop",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/c1acac35azw404k0?key=directus-small-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/c1acac35azw404k0?key=directus-small-contain",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/c1acac35azw404k0?key=directus-medium-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/c1acac35azw404k0?key=directus-medium-crop",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/c1acac35azw404k0?key=directus-medium-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/c1acac35azw404k0?key=directus-medium-contain",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/c1acac35azw404k0?key=directus-large-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/c1acac35azw404k0?key=directus-large-crop",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/c1acac35azw404k0?key=directus-large-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/c1acac35azw404k0?key=directus-large-contain",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/c1acac35azw404k0?key=thumbnail",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/c1acac35azw404k0?key=thumbnail",
                      dimension: "200x200",
                      width: 200,
                      height: 200,
                    },
                  ],
                  embed: null,
                },
              },
              playlist: {
                id: 1,
              },
              audio_file:
                "https://tapesme.s3.amazonaws.com/454721d1-1146-45c7-8443-c7c20847b129.mp4",
            },
            {
              id: 31,
              status: "published",
              created_on: "2020-04-08 20:30:49",
              title: "Hoe Goudhuidje Pinkeltje redde",
              image_file: {
                data: {
                  full_url:
                    "https://directus.media/dcMJTq1b80lIY4CT/63f4007e-986f-4681-89c3-d20e1e78949d.jpeg",
                  url:
                    "https://directus.media/dcMJTq1b80lIY4CT/63f4007e-986f-4681-89c3-d20e1e78949d.jpeg",
                  thumbnails: [
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/3tldfnj5w8mcs8kk?key=directus-small-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/3tldfnj5w8mcs8kk?key=directus-small-crop",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/3tldfnj5w8mcs8kk?key=directus-small-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/3tldfnj5w8mcs8kk?key=directus-small-contain",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/3tldfnj5w8mcs8kk?key=directus-medium-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/3tldfnj5w8mcs8kk?key=directus-medium-crop",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/3tldfnj5w8mcs8kk?key=directus-medium-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/3tldfnj5w8mcs8kk?key=directus-medium-contain",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/3tldfnj5w8mcs8kk?key=directus-large-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/3tldfnj5w8mcs8kk?key=directus-large-crop",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/3tldfnj5w8mcs8kk?key=directus-large-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/3tldfnj5w8mcs8kk?key=directus-large-contain",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/3tldfnj5w8mcs8kk?key=thumbnail",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/3tldfnj5w8mcs8kk?key=thumbnail",
                      dimension: "200x200",
                      width: 200,
                      height: 200,
                    },
                  ],
                  embed: null,
                },
              },
              playlist: {
                id: 1,
              },
              audio_file:
                "https://tapesme.s3.amazonaws.com/29fcf7e3-2046-4308-a447-68a3c4445457.mp4",
            },
            {
              id: 30,
              status: "published",
              created_on: "2020-04-08 20:30:22",
              title: "Pinkeltje en de rode speelgoedauto",
              image_file: {
                data: {
                  full_url:
                    "https://directus.media/dcMJTq1b80lIY4CT/65c75c36-2314-4e29-b904-d4e59dea447e.jpeg",
                  url:
                    "https://directus.media/dcMJTq1b80lIY4CT/65c75c36-2314-4e29-b904-d4e59dea447e.jpeg",
                  thumbnails: [
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/828sylgboi8sccss?key=directus-small-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/828sylgboi8sccss?key=directus-small-crop",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/828sylgboi8sccss?key=directus-small-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/828sylgboi8sccss?key=directus-small-contain",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/828sylgboi8sccss?key=directus-medium-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/828sylgboi8sccss?key=directus-medium-crop",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/828sylgboi8sccss?key=directus-medium-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/828sylgboi8sccss?key=directus-medium-contain",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/828sylgboi8sccss?key=directus-large-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/828sylgboi8sccss?key=directus-large-crop",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/828sylgboi8sccss?key=directus-large-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/828sylgboi8sccss?key=directus-large-contain",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/828sylgboi8sccss?key=thumbnail",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/828sylgboi8sccss?key=thumbnail",
                      dimension: "200x200",
                      width: 200,
                      height: 200,
                    },
                  ],
                  embed: null,
                },
              },
              playlist: {
                id: 1,
              },
              audio_file:
                "https://tapesme.s3.amazonaws.com/64257d84-f9e8-4805-b80c-b0b504892c29.mp4",
            },
            {
              id: 29,
              status: "published",
              created_on: "2020-04-08 20:29:56",
              title: "Pinkeltje en het jongetje dat snoepen wilde",
              image_file: {
                data: {
                  full_url:
                    "https://directus.media/dcMJTq1b80lIY4CT/12b3220e-450e-469a-996f-1bfe16c631e0.jpeg",
                  url:
                    "https://directus.media/dcMJTq1b80lIY4CT/12b3220e-450e-469a-996f-1bfe16c631e0.jpeg",
                  thumbnails: [
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/kkdyrsxtx3kc404o?key=directus-small-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/kkdyrsxtx3kc404o?key=directus-small-crop",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/kkdyrsxtx3kc404o?key=directus-small-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/kkdyrsxtx3kc404o?key=directus-small-contain",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/kkdyrsxtx3kc404o?key=directus-medium-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/kkdyrsxtx3kc404o?key=directus-medium-crop",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/kkdyrsxtx3kc404o?key=directus-medium-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/kkdyrsxtx3kc404o?key=directus-medium-contain",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/kkdyrsxtx3kc404o?key=directus-large-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/kkdyrsxtx3kc404o?key=directus-large-crop",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/kkdyrsxtx3kc404o?key=directus-large-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/kkdyrsxtx3kc404o?key=directus-large-contain",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/kkdyrsxtx3kc404o?key=thumbnail",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/kkdyrsxtx3kc404o?key=thumbnail",
                      dimension: "200x200",
                      width: 200,
                      height: 200,
                    },
                  ],
                  embed: null,
                },
              },
              playlist: {
                id: 1,
              },
              audio_file:
                "https://tapesme.s3.amazonaws.com/c9b5f777-dde2-4d6b-a873-b26ec69604be.mp4",
            },
            {
              id: 28,
              status: "published",
              created_on: "2020-04-08 20:29:28",
              title: "Pinkeltje en Wipstaart",
              image_file: {
                data: {
                  full_url:
                    "https://directus.media/dcMJTq1b80lIY4CT/c79706ac-5adf-4d08-90c9-72d2b7189d68.jpeg",
                  url:
                    "https://directus.media/dcMJTq1b80lIY4CT/c79706ac-5adf-4d08-90c9-72d2b7189d68.jpeg",
                  thumbnails: [
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/3l0qh25xxm0wo8go?key=directus-small-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/3l0qh25xxm0wo8go?key=directus-small-crop",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/3l0qh25xxm0wo8go?key=directus-small-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/3l0qh25xxm0wo8go?key=directus-small-contain",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/3l0qh25xxm0wo8go?key=directus-medium-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/3l0qh25xxm0wo8go?key=directus-medium-crop",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/3l0qh25xxm0wo8go?key=directus-medium-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/3l0qh25xxm0wo8go?key=directus-medium-contain",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/3l0qh25xxm0wo8go?key=directus-large-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/3l0qh25xxm0wo8go?key=directus-large-crop",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/3l0qh25xxm0wo8go?key=directus-large-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/3l0qh25xxm0wo8go?key=directus-large-contain",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/3l0qh25xxm0wo8go?key=thumbnail",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/3l0qh25xxm0wo8go?key=thumbnail",
                      dimension: "200x200",
                      width: 200,
                      height: 200,
                    },
                  ],
                  embed: null,
                },
              },
              playlist: {
                id: 1,
              },
              audio_file:
                "https://tapesme.s3.amazonaws.com/2141028e-5e34-4ee9-8559-7c98ec896f91.mp4",
            },
            {
              id: 27,
              status: "published",
              created_on: "2020-04-08 20:29:02",
              title: "Pinkeltje en de houten beestjes",
              image_file: {
                data: {
                  full_url:
                    "https://directus.media/dcMJTq1b80lIY4CT/6f206ec3-c1e3-4f5c-b611-213f0f463c36.jpeg",
                  url:
                    "https://directus.media/dcMJTq1b80lIY4CT/6f206ec3-c1e3-4f5c-b611-213f0f463c36.jpeg",
                  thumbnails: [
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/11i9lvkesx1cwkw4?key=directus-small-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/11i9lvkesx1cwkw4?key=directus-small-crop",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/11i9lvkesx1cwkw4?key=directus-small-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/11i9lvkesx1cwkw4?key=directus-small-contain",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/11i9lvkesx1cwkw4?key=directus-medium-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/11i9lvkesx1cwkw4?key=directus-medium-crop",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/11i9lvkesx1cwkw4?key=directus-medium-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/11i9lvkesx1cwkw4?key=directus-medium-contain",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/11i9lvkesx1cwkw4?key=directus-large-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/11i9lvkesx1cwkw4?key=directus-large-crop",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/11i9lvkesx1cwkw4?key=directus-large-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/11i9lvkesx1cwkw4?key=directus-large-contain",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/11i9lvkesx1cwkw4?key=thumbnail",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/11i9lvkesx1cwkw4?key=thumbnail",
                      dimension: "200x200",
                      width: 200,
                      height: 200,
                    },
                  ],
                  embed: null,
                },
              },
              playlist: {
                id: 1,
              },
              audio_file:
                "https://tapesme.s3.amazonaws.com/545d33c2-3f9b-4fcb-944c-87bd1ad8ad41.mp4",
            },
            {
              id: 26,
              status: "published",
              created_on: "2020-04-08 20:28:37",
              title: "Hoe Pinkeltje in ht grote huis kwam",
              image_file: {
                data: {
                  full_url:
                    "https://directus.media/dcMJTq1b80lIY4CT/1de1f7d2-eaf5-4611-aba4-68dca4c010db.jpeg",
                  url:
                    "https://directus.media/dcMJTq1b80lIY4CT/1de1f7d2-eaf5-4611-aba4-68dca4c010db.jpeg",
                  thumbnails: [
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/4luu8v1m4bk0cso8?key=directus-small-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/4luu8v1m4bk0cso8?key=directus-small-crop",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/4luu8v1m4bk0cso8?key=directus-small-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/4luu8v1m4bk0cso8?key=directus-small-contain",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/4luu8v1m4bk0cso8?key=directus-medium-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/4luu8v1m4bk0cso8?key=directus-medium-crop",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/4luu8v1m4bk0cso8?key=directus-medium-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/4luu8v1m4bk0cso8?key=directus-medium-contain",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/4luu8v1m4bk0cso8?key=directus-large-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/4luu8v1m4bk0cso8?key=directus-large-crop",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/4luu8v1m4bk0cso8?key=directus-large-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/4luu8v1m4bk0cso8?key=directus-large-contain",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/4luu8v1m4bk0cso8?key=thumbnail",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/4luu8v1m4bk0cso8?key=thumbnail",
                      dimension: "200x200",
                      width: 200,
                      height: 200,
                    },
                  ],
                  embed: null,
                },
              },
              playlist: {
                id: 1,
              },
              audio_file:
                "https://tapesme.s3.amazonaws.com/f73a7c2d-0425-4b4c-bd7f-35d1dc8948cf.mp4",
            },
            {
              id: 25,
              status: "published",
              created_on: "2020-04-08 20:27:51",
              title: "Pinkeltje en het huisje",
              image_file: {
                data: {
                  full_url:
                    "https://directus.media/dcMJTq1b80lIY4CT/813a68e5-72d7-452a-a30f-81b2fa6aaa70.jpeg",
                  url:
                    "https://directus.media/dcMJTq1b80lIY4CT/813a68e5-72d7-452a-a30f-81b2fa6aaa70.jpeg",
                  thumbnails: [
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/s5aooj22i8048c4w?key=directus-small-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/s5aooj22i8048c4w?key=directus-small-crop",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/s5aooj22i8048c4w?key=directus-small-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/s5aooj22i8048c4w?key=directus-small-contain",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/s5aooj22i8048c4w?key=directus-medium-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/s5aooj22i8048c4w?key=directus-medium-crop",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/s5aooj22i8048c4w?key=directus-medium-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/s5aooj22i8048c4w?key=directus-medium-contain",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/s5aooj22i8048c4w?key=directus-large-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/s5aooj22i8048c4w?key=directus-large-crop",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/s5aooj22i8048c4w?key=directus-large-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/s5aooj22i8048c4w?key=directus-large-contain",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/s5aooj22i8048c4w?key=thumbnail",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/s5aooj22i8048c4w?key=thumbnail",
                      dimension: "200x200",
                      width: 200,
                      height: 200,
                    },
                  ],
                  embed: null,
                },
              },
              playlist: {
                id: 1,
              },
              audio_file:
                "https://tapesme.s3.amazonaws.com/b928816f-d11b-47f6-ac4d-7fc0a617ede3.mp4",
            },
            {
              id: 24,
              status: "published",
              created_on: "2020-04-08 20:26:49",
              title: "Pinkeltje speelt piano (2)",
              image_file: {
                data: {
                  full_url:
                    "https://directus.media/dcMJTq1b80lIY4CT/61e3da6e-a4b0-4410-80d6-6793e2c305bc.jpeg",
                  url:
                    "https://directus.media/dcMJTq1b80lIY4CT/61e3da6e-a4b0-4410-80d6-6793e2c305bc.jpeg",
                  thumbnails: [
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/93pmmrc9aw4k4cco?key=directus-small-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/93pmmrc9aw4k4cco?key=directus-small-crop",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/93pmmrc9aw4k4cco?key=directus-small-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/93pmmrc9aw4k4cco?key=directus-small-contain",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/93pmmrc9aw4k4cco?key=directus-medium-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/93pmmrc9aw4k4cco?key=directus-medium-crop",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/93pmmrc9aw4k4cco?key=directus-medium-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/93pmmrc9aw4k4cco?key=directus-medium-contain",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/93pmmrc9aw4k4cco?key=directus-large-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/93pmmrc9aw4k4cco?key=directus-large-crop",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/93pmmrc9aw4k4cco?key=directus-large-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/93pmmrc9aw4k4cco?key=directus-large-contain",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/93pmmrc9aw4k4cco?key=thumbnail",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/93pmmrc9aw4k4cco?key=thumbnail",
                      dimension: "200x200",
                      width: 200,
                      height: 200,
                    },
                  ],
                  embed: null,
                },
              },
              playlist: {
                id: 1,
              },
              audio_file:
                "https://tapesme.s3.amazonaws.com/c02a5b59-f8b7-4afb-b2db-bad5c9972225.mp4",
            },
            {
              id: 23,
              status: "published",
              created_on: "2020-04-08 20:25:24",
              title: "Pinkeltje speelt piano (1)",
              image_file: {
                data: {
                  full_url:
                    "https://directus.media/dcMJTq1b80lIY4CT/55036d5b-f76f-4219-b14d-7d4de6c316ec.jpeg",
                  url:
                    "https://directus.media/dcMJTq1b80lIY4CT/55036d5b-f76f-4219-b14d-7d4de6c316ec.jpeg",
                  thumbnails: [
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/sq2psopluiow40gk?key=directus-small-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/sq2psopluiow40gk?key=directus-small-crop",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/sq2psopluiow40gk?key=directus-small-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/sq2psopluiow40gk?key=directus-small-contain",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/sq2psopluiow40gk?key=directus-medium-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/sq2psopluiow40gk?key=directus-medium-crop",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/sq2psopluiow40gk?key=directus-medium-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/sq2psopluiow40gk?key=directus-medium-contain",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/sq2psopluiow40gk?key=directus-large-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/sq2psopluiow40gk?key=directus-large-crop",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/sq2psopluiow40gk?key=directus-large-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/sq2psopluiow40gk?key=directus-large-contain",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/sq2psopluiow40gk?key=thumbnail",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/sq2psopluiow40gk?key=thumbnail",
                      dimension: "200x200",
                      width: 200,
                      height: 200,
                    },
                  ],
                  embed: null,
                },
              },
              playlist: {
                id: 1,
              },
              audio_file:
                "https://tapesme.s3.amazonaws.com/d4b8ff9f-94a0-458a-bf5a-c3046cdcf5dd.mp4",
            },
            {
              id: 22,
              status: "published",
              created_on: "2020-04-08 20:23:26",
              title: "Pinkeltje is een jokkebrok-papa",
              image_file: {
                data: {
                  full_url:
                    "https://directus.media/dcMJTq1b80lIY4CT/660892f4-ebe0-45f4-bb1a-86cedb644e68.jpeg",
                  url:
                    "https://directus.media/dcMJTq1b80lIY4CT/660892f4-ebe0-45f4-bb1a-86cedb644e68.jpeg",
                  thumbnails: [
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/ha4ipkrw6w0k8g4o?key=directus-small-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/ha4ipkrw6w0k8g4o?key=directus-small-crop",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/ha4ipkrw6w0k8g4o?key=directus-small-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/ha4ipkrw6w0k8g4o?key=directus-small-contain",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/ha4ipkrw6w0k8g4o?key=directus-medium-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/ha4ipkrw6w0k8g4o?key=directus-medium-crop",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/ha4ipkrw6w0k8g4o?key=directus-medium-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/ha4ipkrw6w0k8g4o?key=directus-medium-contain",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/ha4ipkrw6w0k8g4o?key=directus-large-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/ha4ipkrw6w0k8g4o?key=directus-large-crop",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/ha4ipkrw6w0k8g4o?key=directus-large-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/ha4ipkrw6w0k8g4o?key=directus-large-contain",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/ha4ipkrw6w0k8g4o?key=thumbnail",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/ha4ipkrw6w0k8g4o?key=thumbnail",
                      dimension: "200x200",
                      width: 200,
                      height: 200,
                    },
                  ],
                  embed: null,
                },
              },
              playlist: {
                id: 1,
              },
              audio_file:
                "https://tapesme.s3.amazonaws.com/a364e9ea-132e-4243-8cbb-6726a3a6f906.mp4",
            },
            {
              id: 21,
              status: "published",
              created_on: "2020-04-08 20:20:37",
              title: "Pinkeltje en de zilveren knoop",
              image_file: {
                data: {
                  full_url:
                    "https://directus.media/dcMJTq1b80lIY4CT/a2721088-40b4-47f3-9f0a-40121c8919b9.jpeg",
                  url:
                    "https://directus.media/dcMJTq1b80lIY4CT/a2721088-40b4-47f3-9f0a-40121c8919b9.jpeg",
                  thumbnails: [
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/oq09wj5y0v4k808s?key=directus-small-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/oq09wj5y0v4k808s?key=directus-small-crop",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/oq09wj5y0v4k808s?key=directus-small-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/oq09wj5y0v4k808s?key=directus-small-contain",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/oq09wj5y0v4k808s?key=directus-medium-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/oq09wj5y0v4k808s?key=directus-medium-crop",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/oq09wj5y0v4k808s?key=directus-medium-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/oq09wj5y0v4k808s?key=directus-medium-contain",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/oq09wj5y0v4k808s?key=directus-large-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/oq09wj5y0v4k808s?key=directus-large-crop",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/oq09wj5y0v4k808s?key=directus-large-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/oq09wj5y0v4k808s?key=directus-large-contain",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/oq09wj5y0v4k808s?key=thumbnail",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/oq09wj5y0v4k808s?key=thumbnail",
                      dimension: "200x200",
                      width: 200,
                      height: 200,
                    },
                  ],
                  embed: null,
                },
              },
              playlist: {
                id: 1,
              },
              audio_file:
                "https://tapesme.s3.amazonaws.com/9070060b-44f4-496c-96b5-c6447aab32b5.mp4",
            },
            {
              id: 20,
              status: "published",
              created_on: "2020-04-08 20:19:39",
              title: "Pinkeltje en het winkeltje",
              image_file: {
                data: {
                  full_url:
                    "https://directus.media/dcMJTq1b80lIY4CT/08bc6354-9ee4-4f67-a9fe-466721216a8c.jpeg",
                  url:
                    "https://directus.media/dcMJTq1b80lIY4CT/08bc6354-9ee4-4f67-a9fe-466721216a8c.jpeg",
                  thumbnails: [
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/b9zuapmjn808o88g?key=directus-small-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/b9zuapmjn808o88g?key=directus-small-crop",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/b9zuapmjn808o88g?key=directus-small-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/b9zuapmjn808o88g?key=directus-small-contain",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/b9zuapmjn808o88g?key=directus-medium-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/b9zuapmjn808o88g?key=directus-medium-crop",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/b9zuapmjn808o88g?key=directus-medium-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/b9zuapmjn808o88g?key=directus-medium-contain",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/b9zuapmjn808o88g?key=directus-large-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/b9zuapmjn808o88g?key=directus-large-crop",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/b9zuapmjn808o88g?key=directus-large-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/b9zuapmjn808o88g?key=directus-large-contain",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/b9zuapmjn808o88g?key=thumbnail",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/b9zuapmjn808o88g?key=thumbnail",
                      dimension: "200x200",
                      width: 200,
                      height: 200,
                    },
                  ],
                  embed: null,
                },
              },
              playlist: {
                id: 1,
              },
              audio_file:
                "https://tapesme.s3.amazonaws.com/89241219-b103-4cf3-aca5-0a2254e14a2f.mp4",
            },
            {
              id: 19,
              status: "published",
              created_on: "2020-04-08 20:17:42",
              title: "Pinkeltje en de zweefmolen",
              image_file: {
                data: {
                  full_url:
                    "https://directus.media/dcMJTq1b80lIY4CT/4bd7ae80-b23e-434e-a79a-4a8342b752da.jpeg",
                  url:
                    "https://directus.media/dcMJTq1b80lIY4CT/4bd7ae80-b23e-434e-a79a-4a8342b752da.jpeg",
                  thumbnails: [
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/s7q2x80ugxwggw4c?key=directus-small-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/s7q2x80ugxwggw4c?key=directus-small-crop",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/s7q2x80ugxwggw4c?key=directus-small-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/s7q2x80ugxwggw4c?key=directus-small-contain",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/s7q2x80ugxwggw4c?key=directus-medium-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/s7q2x80ugxwggw4c?key=directus-medium-crop",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/s7q2x80ugxwggw4c?key=directus-medium-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/s7q2x80ugxwggw4c?key=directus-medium-contain",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/s7q2x80ugxwggw4c?key=directus-large-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/s7q2x80ugxwggw4c?key=directus-large-crop",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/s7q2x80ugxwggw4c?key=directus-large-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/s7q2x80ugxwggw4c?key=directus-large-contain",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/s7q2x80ugxwggw4c?key=thumbnail",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/s7q2x80ugxwggw4c?key=thumbnail",
                      dimension: "200x200",
                      width: 200,
                      height: 200,
                    },
                  ],
                  embed: null,
                },
              },
              playlist: {
                id: 1,
              },
              audio_file:
                "https://tapesme.s3.amazonaws.com/3f52eabf-933f-4f5a-83df-c7fa834e12a4.mp4",
            },
            {
              id: 18,
              status: "published",
              created_on: "2020-04-08 20:16:12",
              title: "Pinkeltje leert zwemmen",
              image_file: {
                data: {
                  full_url:
                    "https://directus.media/dcMJTq1b80lIY4CT/d71749a9-f681-4499-bc82-a73160a7adfd.jpeg",
                  url:
                    "https://directus.media/dcMJTq1b80lIY4CT/d71749a9-f681-4499-bc82-a73160a7adfd.jpeg",
                  thumbnails: [
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/ny0qtvi9ojk0oo4w?key=directus-small-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/ny0qtvi9ojk0oo4w?key=directus-small-crop",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/ny0qtvi9ojk0oo4w?key=directus-small-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/ny0qtvi9ojk0oo4w?key=directus-small-contain",
                      dimension: "64x64",
                      width: 64,
                      height: 64,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/ny0qtvi9ojk0oo4w?key=directus-medium-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/ny0qtvi9ojk0oo4w?key=directus-medium-crop",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/ny0qtvi9ojk0oo4w?key=directus-medium-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/ny0qtvi9ojk0oo4w?key=directus-medium-contain",
                      dimension: "300x300",
                      width: 300,
                      height: 300,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/ny0qtvi9ojk0oo4w?key=directus-large-crop",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/ny0qtvi9ojk0oo4w?key=directus-large-crop",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/ny0qtvi9ojk0oo4w?key=directus-large-contain",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/ny0qtvi9ojk0oo4w?key=directus-large-contain",
                      dimension: "800x600",
                      width: 800,
                      height: 600,
                    },
                    {
                      url:
                        "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/ny0qtvi9ojk0oo4w?key=thumbnail",
                      relative_url:
                        "/dcMJTq1b80lIY4CT/assets/ny0qtvi9ojk0oo4w?key=thumbnail",
                      dimension: "200x200",
                      width: 200,
                      height: 200,
                    },
                  ],
                  embed: null,
                },
              },
              playlist: {
                id: 1,
              },
              audio_file:
                "https://tapesme.s3.amazonaws.com/cb16bec1-c069-45de-9502-81a53ec7fd6f.mp4",
            },
          ],
        },
      ],
    },
    warning: null,
  };
  return {
    props: { room },
  };
}
