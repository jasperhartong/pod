import { ReactNode } from "react";
import { EpisodeCreationStepProps } from "./episode-creation-step-props";
import AdminDualPaneLayout from "../layout/admin-dual-pane";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormGroup,
} from "@material-ui/core";
import IconNext from "@material-ui/icons/ChevronRight";
import { useForm, Controller, ErrorMessage } from "react-hook-form";

const EpisodeCreationStepTitle = (props: EpisodeCreationStepProps) => {
  const defaultValues = { title: props.partialEpisode.title };
  const { handleSubmit, control, formState, errors } = useForm<{
    title: string;
  }>({
    mode: "onChange",
    defaultValues,
  });

  const disabled = formState.isSubmitting;

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

          <form onSubmit={handleSubmit(onSubmit)}>
            <Box pt={2} pb={2}>
              <FormGroup>
                {/* Title */}
                <Controller
                  control={control}
                  rules={{ required: true }}
                  as={TextField}
                  label="Titel"
                  placeholder="Titel aflevering"
                  name="title"
                  disabled={disabled}
                />
              </FormGroup>
              <ErrorMessage
                errors={errors}
                name="title"
                as={<ErrorMessageTypography />}
                message="Vul een titel in"
              />
            </Box>
            {/* submit */}
            <Button
              disabled={disabled}
              type="submit"
              variant="contained"
              fullWidth
            >
              Neem intro op <IconNext />
            </Button>
          </form>
        </>
      }
    />
  );
};

export default EpisodeCreationStepTitle;

const ErrorMessageTypography = ({ children }: { children?: ReactNode }) => (
  <Typography variant="subtitle2" color="error">
    {children}
  </Typography>
);
