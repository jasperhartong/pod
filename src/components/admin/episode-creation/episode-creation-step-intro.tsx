import { EpisodeCreationStepProps } from "./episode-creation-step-props";
import AdminDualPaneLayout from "../layout/admin-dual-pane";
import { Box, Typography } from "@material-ui/core";
import useAudioRecorder from "../../../hooks/useAudioRecorder";
import AudioRecorderButton from "../../audio-recorder/audio-recorder-button";
import { AudioRecorderVisualizer } from "../../audio-recorder/audio-recorder-visualizer";

const EpisodeCreationStepIntroAudio = (props: EpisodeCreationStepProps) => {
  const { context, data } = useAudioRecorder();

  const onSubmit = (formData: { title: string }) => {
    props.onUpdate(formData);
    props.onNext();
  };

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
          {"recording" === context.recorderState.state && (
            <AudioRecorderVisualizer
              uniqueId={`${props.playlist.id}-new-intro`}
              getFrequencyData={context.getFrequencyData}
            />
          )}
        </>
      }
      secondItem={
        <>
          <Typography variant="h6">Neem een korte intro op</Typography>
          <Typography variant="body1" color="textSecondary">
            Zeg iets liefs, kunnen we meteen de microfoon uittesten!
          </Typography>

          <Box pt={2} pb={2} textAlign="center">
            <AudioRecorderButton context={context} />
          </Box>
        </>
      }
    />
  );
};

export default EpisodeCreationStepIntroAudio;
