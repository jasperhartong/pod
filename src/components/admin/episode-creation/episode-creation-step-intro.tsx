import { EpisodeCreationStepProps } from "./episode-creation-step-props";
import AdminDualPaneLayout from "../layout/admin-dual-pane";
import { Box, Typography } from "@material-ui/core";
import useAudioRecorder from "../../../hooks/useAudioRecorder";
import AudioRecorderButton from "../../audio-recorder-hook/audio-recorder-button";
import { AudioRecorderVisualizer } from "../../audio-recorder-hook/audio-recorder-visualizer";
import useSignedMediaUploader from "../../../hooks/useSignedMediaUploader";
import { useEffect } from "react";
import { blobToFile, concatAudioBlobs } from "../../../utils/audio-context";

const EpisodeCreationStepIntroAudio = (props: EpisodeCreationStepProps) => {
  const { context, data } = useAudioRecorder();
  const {
    uploadFile,
    loading,
    error,
    data: mediaUploadData,
  } = useSignedMediaUploader();

  const uploadAudio = async () => {
    if (
      context.recorderState.state === "recording" ||
      context.recorderState.state === "listen_error"
    ) {
      return;
    }

    if (!data.audioBlobs || !context.recorderState.audioContext) {
      return;
    }

    const blob = await concatAudioBlobs(
      data.audioBlobs,
      context.recorderState.audioContext || new AudioContext()
    );
    if (blob) {
      const file = blobToFile(blob, "");
      uploadFile(file);
    }
  };

  useEffect(() => {
    if (
      data.audioBlobs &&
      data.audioBlobs.length > 0 &&
      context.recorderState.state !== "recording"
    ) {
      if (!loading) {
        uploadAudio();
      }
    }
  }, [data.audioBlobs]);

  useEffect(() => {
    if (!!mediaUploadData) {
      props.onUpdate({ audio_url: mediaUploadData.downloadUrl });
      // props.onNext();
    }
  }, [mediaUploadData]);

  return (
    <AdminDualPaneLayout
      title={props.playlist.title}
      subtitle="Nieuwe aflevering"
      backLink={{
        href: `/rooms/[roomSlug]/admin/[playlistId]`,
        as: `/rooms/${props.room.slug}/admin/${props.playlist.id}`,
      }}
      firstItem={
        <>
          {"recording" === context.recorderState.state && (
            <AudioRecorderVisualizer
              uniqueId={`${props.playlist.id}-new-intro`}
              getFrequencyData={context.getFrequencyData}
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
              fullWidth={true}
              context={context}
              timeSlice={60000}
            />
            {loading && <Box p={2}>uploading</Box>}
          </Box>
        </>
      }
    />
  );
};

export default EpisodeCreationStepIntroAudio;
