import Link from "next/link";
import { ReactNode } from "react";
import { EpisodeCreationStepProps } from "./episode-creation-step-props";
import AdminDualPaneLayout from "../layout/admin-dual-pane";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormGroup,
  IconButton,
} from "@material-ui/core";
import IconNext from "@material-ui/icons/ChevronRight";
import { useForm, Controller, ErrorMessage } from "react-hook-form";
import CloseIcon from "@material-ui/icons/Close";

const EpisodeCreationStepTitle = (props: EpisodeCreationStepProps) => {
  const { handleSubmit, control, formState, errors } = useForm<{
    title: string;
  }>({
    mode: "onChange",
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
      leftAction={
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
                  // set default value at least to a string to counter "uncontrolled to controlled error"
                  // https://github.com/react-hook-form/react-hook-form-website/issues/133
                  defaultValue={props.partialEpisode.title || ""}
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
