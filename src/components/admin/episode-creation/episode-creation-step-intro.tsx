import Link from "next/link";
import { useEffect } from "react";
import { EpisodeCreationStepProps } from "./episode-creation-step-props";
import AdminDualPaneLayout from "../layout/admin-dual-pane";
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  IconButton,
} from "@material-ui/core";
import useAudioRecorder from "../../../hooks/useAudioRecorder";
import AudioRecorderButton from "../../audio-recorder-hook/audio-recorder-button";
import { AudioRecorderVisualizer } from "../../audio-recorder-hook/audio-recorder-visualizer";
import useSignedMediaUploader from "../../../hooks/useSignedMediaUploader";
import CloseIcon from "@material-ui/icons/Close";
import { blobToFile } from "../../../utils/audio-context";

const EpisodeCreationStepIntroAudio = (props: EpisodeCreationStepProps) => {
  // Move to shared hook:
  const {
    uploadFile,
    isValidating: isUploading,
    data: mediaUploadData,
    percentCompleted,
  } = useSignedMediaUploader();

  const {
    isListening,
    isRecording,
    startListening,
    stopListening,
    startRecording,
    stopRecording,
    extractBlobs,
    getFrequencyData,
    dataSize: audioRecorderHasData,
    error: audioRecorderError,
  } = useAudioRecorder();

  const saveRecording = async () => {
    // goNext: 1) extract and upload file
    const blobs = await extractBlobs();
    if (blobs) {
      uploadFile(blobToFile(blobs[0], "intro"));
    }
    // TODO: add error case
  };

  useEffect(() => {
    // goNext: 2) Move on when done uploading
    if (!!mediaUploadData) {
      props.onUpdate({ audio_url: mediaUploadData.downloadUrl });
      props.onNext();
    }
  }, [mediaUploadData]);

  return (
    <>
      <AdminDualPaneLayout
        image={props.playlist.cover_file.data.full_url}
        title={props.playlist.title}
        subtitle="Nieuwe aflevering"
        action={
          <Link
            href={`/rooms/[roomSlug]/admin`}
            as={`/rooms/${props.room.slug}/admin`}
          >
            <IconButton>
              <CloseIcon />
            </IconButton>
          </Link>
        }
        firstItem={
          <>
            {isRecording && (
              <AudioRecorderVisualizer
                uniqueId={`${props.playlist.id}-new-intro`}
                getFrequencyData={getFrequencyData}
              />
            )}
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
          </>
        }
        secondItem={
          <>
            <Typography variant="h6">Neem een korte intro op</Typography>
            <Typography variant="body1" color="textSecondary">
              Zeg iets liefs, kunnen we meteen de microfoon uittesten!
            </Typography>

            <Box pt={2} pb={2} textAlign="center">
              <AudioRecorderButton
                isListening={isListening}
                isRecording={isRecording}
                error={audioRecorderError}
                startListening={startListening}
                startRecording={() => startRecording(60000)}
                stopRecording={stopRecording}
                fullWidth={true}
              />

              <Button
                disabled={!audioRecorderHasData || isRecording || isUploading}
                onClick={saveRecording}
              >
                Upload & volgende
              </Button>

              {isUploading && (
                <Box p={2}>
                  <LinearProgress
                    variant="determinate"
                    value={percentCompleted || 0}
                  />
                </Box>
              )}
            </Box>
          </>
        }
      />
    </>
  );
};

export default EpisodeCreationStepIntroAudio;
