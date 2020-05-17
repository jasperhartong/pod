import episodeUpdateMeta from "@/api/rpc/commands/episode.update.meta";
import { RPCClientFactory } from "@/api/rpc/rpc-client";
import { IEpisode } from "@/app-schema/IEpisode";
import { IPlaylist } from "@/app-schema/IPlaylist";
import { IRoom } from "@/app-schema/IRoom";
import useAudioRecorder from "@/hooks/useAudioRecorder";
import { useRouter } from "@/hooks/useRouter";
import useSignedMediaUploader from "@/hooks/useSignedMediaUploader";
import { useSWRRoom } from "@/hooks/useSWRRoom";
import { blobToFile } from "@/utils/audio-context";
import {
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Typography,
} from "@material-ui/core";
import IconUploadSuccess from "@material-ui/icons/CloudDone";
import IconUpload from "@material-ui/icons/CloudUpload";
import IconUploadError from "@material-ui/icons/Warning";
import { Duration } from "luxon";
import { useImmer } from "use-immer";
import { AudioRecorderVisualizer } from "../audio-recorder-hook/audio-recorder-visualizer";
import { ErrorPage } from "../error-page";
import MediaDropZone from "../media-dropzone";
import AdminDualPaneLayout from "./layout/admin-dual-pane";
import { AdminHeaderClose } from "./layout/admin-header-close";
import { AdminInstructionsLayout } from "./layout/admin-instruction-layout";
import { ImageCoverLayout } from "./layout/image-cover-layout";

interface Props {
  room: IRoom;
  playlist: IPlaylist;
  episode: IEpisode;
}

interface State {
  didTestMicrophone: boolean;
  updateError?: string;
  isSaving: boolean;
}

const initialState: State = {
  didTestMicrophone: false,
  isSaving: false,
};

export const EpisodeRecord = ({ room, playlist, episode }: Props) => {
  const router = useRouter();
  const { mutateEpisode } = useSWRRoom(room.uid);
  const [localState, dispatch] = useImmer<State>(initialState);
  const recorder = useAudioRecorder();
  const uploader = useSignedMediaUploader({
    onError: (message) => {
      dispatch((state) => {
        state.updateError = message;
      });
    },
    onSuccess: async ({ downloadUrl }) => {
      updateEpisodeWithAudioFile(downloadUrl);
    },
  });
  const updateEpisodeWithAudioFile = async (downloadUrl: string) => {
    const updatedEpisode = await RPCClientFactory(episodeUpdateMeta).call({
      roomUid: room.uid,
      playlistUid: playlist.uid,
      episodeUid: episode.uid,
      data: { audio_file: downloadUrl },
    });
    if (!updatedEpisode.ok) {
      dispatch((state) => {
        state.updateError = updatedEpisode.error;
      });
    } else {
      // Update local state, then move on
      mutateEpisode(
        playlist.uid,
        { ...episode, audio_file: downloadUrl },
        false
      );
      router.push(
        "/rooms/[roomUid]/admin/[playlistUid]/episode/[episodeUid]",
        `/rooms/${room.uid}/admin/${playlist.uid}/episode/${episode.uid}`
      );
    }
  };

  const mp3Recording =
    recorder.dataBlobs.length > 0 ? recorder.dataBlobs[0] : undefined;

  let main = <>Unsupported state</>;

  if (localState.updateError) {
    main = <ErrorPage error={localState.updateError} />;
  } else if (localState.isSaving) {
    main = (
      <AdminInstructionsLayout
        items={[
          {
            title: "Aan het uploaden",
            text:
              "Even wachten totdat de opname klaar is met uploaden.. Sluit dit scherm niet, het zou niet al te lang moeten duren!",
          },
        ]}
      />
    );
  } else {
    if (!localState.didTestMicrophone) {
      main = (
        <>
          <RecordingButtonGroup
            isRecording={recorder.isRecording}
            isRequestingAccess={recorder.isRequestingAccess}
            recording={mp3Recording}
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
          {!mp3Recording && !recorder.isRecording && (
            <Box mt={2}>
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
            </Box>
          )}
          <AdminInstructionsLayout
            items={[
              {
                title: "Zeker zijn dat het goed klinkt",
                text:
                  "Voordat we beginnen met voorlezen, is het goed om even de microfoon te testen.",
              },
              {
                title: "Tips voor de microfoon",
                text:
                  "Spreek niet te dichtbij de microfoon. Probeer ook het oppervlakte waarop de microfoon ligt niet te veel aan te raken",
              },
            ]}
          />
        </>
      );
    }
    if (localState.didTestMicrophone) {
      // RECORDING: REAL DEAL
      main = (
        <>
          <RecordingButtonGroup
            isRecording={recorder.isRecording}
            isRequestingAccess={recorder.isRequestingAccess}
            recording={mp3Recording}
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
                label: "Bewaar opname",
                action: () => {
                  if (mp3Recording) {
                    dispatch((state) => {
                      state.isSaving = true;
                    });
                    uploader.uploadFile(
                      blobToFile(mp3Recording, episode.title)
                    );
                  }
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

          <AdminInstructionsLayout
            items={[
              {
                title: "Ga er goed voor zitten",
                text:
                  "Vind een goede stoel in een rustige kamer, doe de deur dicht en begin rustig met voorlezen, stop pas weer als het verhaaltje uit is.",
              },
              {
                title: "Maak het afluisteren extra leuk!",
                text:
                  "Gebruik namen uit de familie voor karakters; Maak leuke geluidseffecten “moeeeeh!”; Begin en eindig met wat liefs; Verzin een openingstune; Wees vooral niet bang om fautjes te maken tijdens het voorlezen",
              },
              {
                title: "Upload een bestaande opname",
                text: "Heeft u al een opname, upload deze dan hieronder.",
              },
            ]}
          />

          <Box mt={2} mb={2}>
            <MediaDropZone
              acceptedMimeTypes={["audio/mpeg", "audio/m4a", "video/mp4"]}
              onSuccess={updateEpisodeWithAudioFile}
              initial={
                <Button fullWidth variant="outlined">
                  <IconUpload style={{ marginRight: 8 }} /> Upload opname
                </Button>
              }
              uploading={(uploadPercentCompleted) => (
                <Button fullWidth variant="outlined" disabled>
                  <LinearProgress
                    style={{ margin: 10, width: "100%" }}
                    variant={
                      [undefined, 0, 100].includes(uploadPercentCompleted)
                        ? "indeterminate"
                        : "determinate"
                    }
                    value={uploadPercentCompleted}
                  />
                </Button>
              )}
              success={
                <Button fullWidth variant="outlined" disabled>
                  <IconUploadSuccess style={{ marginRight: 8 }} /> Upload opname
                </Button>
              }
              error={
                <Button fullWidth variant="outlined">
                  <IconUploadError style={{ marginRight: 8 }} /> Probeer
                  nogmaals
                </Button>
              }
            />
          </Box>
        </>
      );
    }
  }

  return (
    <AdminDualPaneLayout
      image={playlist.cover_file.data.full_url}
      blur={40}
      title={"Opnemen"}
      subtitle={playlist.title + " • " + episode.title}
      action={
        <AdminHeaderClose
          url={`/rooms/[roomUid]/admin/[playlistUid]`}
          as={`/rooms/${room.uid}/admin/${playlist.uid}`}
        />
      }
      firstItem={
        <Box p={2} pb={0} textAlign="center">
          <Box style={{ display: "inline-block" }}>
            <ImageCoverLayout
              imageUrl={episode.image_file.data.full_url}
              style={{
                width: 240,
                height: 240,
              }}
              centeredChildren={
                <>
                  {recorder.isRecording && (
                    <>
                      <Box zIndex={2} style={{ background: "rgba(0,0,0,0.4)" }}>
                        <AudioRecorderVisualizer
                          uniqueId={episode.uid}
                          getFrequencyData={recorder.getFrequencyData}
                          width={240}
                          height={240}
                        />
                      </Box>
                      <Box
                        position="absolute"
                        zIndex={3}
                        bottom={8}
                        left={0}
                        right={0}
                        textAlign="center"
                      >
                        <Typography variant="h4" color="textPrimary">
                          {Duration.fromObject({
                            seconds: recorder.dataSeconds,
                          }).toFormat("mm:ss")}
                        </Typography>
                      </Box>
                    </>
                  )}
                  {localState.isSaving && (
                    <CircularProgress
                      value={uploader.percentCompleted}
                      variant={
                        uploader.percentCompleted === 100
                          ? "indeterminate"
                          : "determinate"
                      }
                    />
                  )}
                </>
              }
            />
          </Box>
        </Box>
      }
      secondItem={main}
    />
  );
};

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
  isRequestingAccess: boolean;
  buttonConfig: ButtonConfig;
}

const RecordingButtonGroup = ({
  recording,
  isRecording,
  buttonConfig,
  isRequestingAccess,
}: RecordingButtonGroupProps) => {
  return (
    <>
      {recording && (
        <Box pt={2}>
          <audio
            style={{ width: "100%" }}
            src={URL.createObjectURL(recording)}
            controls
          />
        </Box>
      )}

      <Box pt={2}>
        <Button
          disabled={isRequestingAccess}
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
    </>
  );
};
