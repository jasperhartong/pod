import { EpisodeCreationStepProps } from "./episode-creation-step-props";
import AdminDualPaneLayout from "../layout/admin-dual-pane";
import { Box, Typography, TextField, Button } from "@material-ui/core";
import IconNext from "@material-ui/icons/ChevronRight";

const EpisodeCreationStepTitle = (props: EpisodeCreationStepProps) => {
  return (
    <AdminDualPaneLayout
      title={props.playlist.title}
      subtitle="Nieuwe aflevering"
      backLink={{
        href: `/rooms/[roomSlug]/admin/[playlistId]`,
        as: `/rooms/${props.room.slug}/admin/${props.playlist.id}`,
      }}
      firstItem={
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
      }
      secondItem={
        <>
          <Typography variant="h6">Hoe heet de aflevering vandaag?</Typography>
          <Typography variant="body1" color="textSecondary">
            Bijvoorbeeld de title van een hoofdstuk of een nummer dat aangeeft
            hoeveelste deel het is.
          </Typography>
          <Box pt={2} pb={3}>
            <TextField
              fullWidth
              placeholder="Titel aflevering"
              // inputRef={inputRef}
              defaultValue={props.partialEpisode.title}
            />
          </Box>
          <Button variant="contained" fullWidth onClick={props.onNext}>
            Neem intro op <IconNext />
          </Button>
        </>
      }
    />
  );
};

export default EpisodeCreationStepTitle;
