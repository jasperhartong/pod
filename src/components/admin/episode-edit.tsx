import Link from "next/link";
import { Box, Button, IconButton, Typography } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { IRoom } from "../../app-schema/IRoom";
import { IPlaylist } from "../../app-schema/IPlaylist";
import AdminDualPaneLayout from "./layout/admin-dual-pane";
import { EpisodeCoverLayout } from "./layout/episode-cover-layout";
import { IEpisode } from "../../app-schema/IEpisode";
import { useImmer } from "use-immer";
import useAudioRecorder from "../../hooks/useAudioRecorder";
import { useEffect, ReactNode } from "react";
import { AudioRecorderVisualizer } from "../audio-recorder-hook/audio-recorder-visualizer";

interface Props {
  room: IRoom;
  playlist: IPlaylist;
  episode: IEpisode;
}

interface State {
  didTestMicrophone: boolean;
}

const initialState: State = {
  didTestMicrophone: false,
};

const EpisodeEdit = ({ room, playlist, episode }: Props) => {
  const [state, dispatch] = useImmer<State>(initialState);
  const recorder = useAudioRecorder();

  let main = <>Unsupported state</>;

  // TODO" .. this default value of """is madness
  if (!episode.audio_file || episode.audio_file === '""') {
    if (!state.didTestMicrophone) {
      main = (
        <>
          <RecordingButtonGroup
            isRecording={recorder.isRecording}
            recording={
              recorder.dataBlobs.length > 0 ? recorder.dataBlobs[0] : undefined
            }
            buttonConfig={{
              start: {
                label: "Test Microfoon",
                action: () => recorder.startRecording(),
              },
              stop: {
                label: "stop en luister terug",
                action: () => recorder.stopRecording(),
              },
              approve: {
                label: "Klinkt goed!",
                action: () => {
                  recorder.clearData();
                  dispatch((state) => {
                    state.didTestMicrophone = true;
                  });
                },
              },
              reject: {
                label: "Test microfoon opnieuw",
                action: () => {
                  recorder.clearData();
                },
              },
            }}
          />
          <Box mt={4} mb={2}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Voordat we beginnen met voorlezen, is het goed om even de
              microfoon te testen.
            </Typography>
          </Box>
          <Box mb={2}>
            <Typography variant="body2" color="textPrimary">
              Tips voor het opnemen
            </Typography>
            <Typography variant="body2" color="textSecondary" component="div">
              <li>Spreek niet te dichtbij de microfoon</li>
              <li>
                Probeer het oppervlakte waarop de microfoon ligt niet te veel
                aan te raken
              </li>
            </Typography>
          </Box>
          <Button
            fullWidth
            onClick={() => {
              dispatch((state) => {
                state.didTestMicrophone = true;
              });
            }}
          >
            Sla microfoon testen over
          </Button>
        </>
      );
    } else {
      // RECORDING: REAL DEAL
      main = (
        <>
          <RecordingButtonGroup
            isRecording={recorder.isRecording}
            recording={
              recorder.dataBlobs.length > 0 ? recorder.dataBlobs[0] : undefined
            }
            buttonConfig={{
              start: {
                label: "Start met voorlezen",
                action: () => recorder.startRecording(),
              },
              stop: {
                label: "stop met voorlezen",
                action: () => recorder.stopRecording(),
              },
              approve: {
                label: "Klinkt goed!",
                action: () => {
                  alert("perform upload");
                },
              },
              reject: {
                label: "Neem opniew op",
                action: () => {
                  if (
                    confirm(
                      "Weet u zeker dat u opnieuw wilt opnemen? Dit kan niet ongedaan gemaakt worden"
                    ) == true
                  ) {
                    recorder.clearData();
                  }
                },
              },
            }}
          />
          <Box mt={4} mb={2}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Ga er even goed voor zitten, doe de deur dicht en begin rustig met
              voorlezen, stop pas weer als het verhaaltje uit is.
            </Typography>
          </Box>
          <Box mb={2}>
            <Typography variant="body2" color="textPrimary">
              Maak het afluisteren extra leuk!
            </Typography>
            <Typography variant="body2" color="textSecondary" component="div">
              <li>Gebruik namen uit de familie voor karakters</li>
              <li>Maak leuke geluidseffecten “moeeeeh!”</li>
              <li>Begin en eindig met wat liefs</li>
              <li>Verzin een openingstune</li>
            </Typography>
          </Box>
          {!recorder.dataBlobs && !recorder.isRecording && (
            <Button
              fullWidth
              onClick={() => {
                dispatch((state) => {
                  state.didTestMicrophone = true;
                });
              }}
            >
              Sla microfoon testen over
            </Button>
          )}
        </>
      );
    }
  } else {
    // HAS RECORDING
    main = <>Should render state to publish</>;
  }

  return (
    <AdminDualPaneLayout
      image={playlist.cover_file.data.full_url}
      title={playlist.title}
      subtitle={episode.title}
      action={
        <Link href={`/rooms/[roomSlug]/admin`} as={`/rooms/${room.slug}/admin`}>
          <IconButton>
            <CloseIcon />
          </IconButton>
        </Link>
      }
      firstItem={
        <Box p={2} pb={0} textAlign="center">
          <Box style={{ display: "inline-block" }}>
            <EpisodeCoverLayout
              imageUrl={
                episode.image_file.data.thumbnails.find((t) => t.width > 240)
                  ?.url
              }
              style={{ width: 240, height: 240 }}
              centeredChildren={
                recorder.isRecording && (
                  <Box zIndex={2}>
                    <AudioRecorderVisualizer
                      uniqueId={episode.id.toString()}
                      getFrequencyData={recorder.getFrequencyData}
                    />
                  </Box>
                )
              }
            />
          </Box>
        </Box>
      }
      secondItem={main}
    />
  );
};

export default EpisodeEdit;

interface ButtonState {
  label: string;
  action: () => void;
}

interface ButtonConfig {
  start: ButtonState;
  stop: ButtonState;
  approve: ButtonState;
  reject: ButtonState;
}

interface RecordingButtonGroupProps {
  recording?: Blob;
  isRecording: boolean;
  buttonConfig: ButtonConfig;
}

const RecordingButtonGroup = ({
  recording,
  isRecording,
  buttonConfig,
}: RecordingButtonGroupProps) => {
  return (
    <Box pt={2}>
      <Button
        variant="contained"
        fullWidth
        onClick={
          recording
            ? buttonConfig.approve.action
            : isRecording
            ? buttonConfig.stop.action
            : buttonConfig.start.action
        }
      >
        {recording
          ? buttonConfig.approve.label
          : isRecording
          ? buttonConfig.stop.label
          : buttonConfig.start.label}
      </Button>

      {recording && (
        <Box mt={2}>
          <Button fullWidth onClick={buttonConfig.reject.action}>
            {buttonConfig.reject.label}
          </Button>
        </Box>
      )}
    </Box>
  );
};
