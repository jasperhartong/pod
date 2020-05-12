import {
  Box,
  Button,
  FormGroup,
  LinearProgress,
  TextField,
} from "@material-ui/core";
import {
  Controller,
  ErrorMessage,
  FormContextValues,
  useForm,
} from "react-hook-form";
import { FormErrorMessageTypography } from "./form-error-message";

/*
  Currently supported Playlist Values of form
*/
export interface PlaylistFormValues {
  title: string;
  imageUrl: string;
  description: string;
}

export const playlistFormKeys: Record<
  keyof PlaylistFormValues,
  keyof PlaylistFormValues
> = {
  title: "title",
  imageUrl: "imageUrl",
  description: "description",
};

/*
  hook that could be imported into partent of PlaylistForm
  - return value can be used to pass in as form Context
  - not part of PlaylistForm itself in order to use formContext in parent (e.g. wit a separate dropzone)
*/
export const usePlaylistFormContext = () => {
  return {
    ...useForm<PlaylistFormValues>({
      mode: "onChange",
      reValidateMode: "onChange",
    }),
    formKeys: playlistFormKeys,
  };
};

/*
  Form visualizing PlaylistFormValues and any validation errors
*/
export const PlaylistForm = ({
  formContext,
  initialValues,
  onSubmit,
}: {
  formContext: FormContextValues<PlaylistFormValues>;
  initialValues: Partial<PlaylistFormValues>;
  onSubmit: (formData: PlaylistFormValues) => void;
}) => {
  const SubmitDisabled =
    formContext.formState.isSubmitting || !formContext.formState.isValid;

  return (
    <form onSubmit={formContext.handleSubmit(onSubmit)}>
      <FormGroup>
        {/* Title */}
        <Controller
          // set default value at least to a string to counter "uncontrolled to controlled error"
          // https://github.com/react-hook-form/react-hook-form-website/issues/133
          defaultValue={initialValues.title || ""}
          control={formContext.control}
          rules={{ required: true }}
          as={TextField}
          label="Titel"
          placeholder="Titel collectie"
          name={playlistFormKeys.title}
          disabled={formContext.formState.isSubmitting}
        />
      </FormGroup>
      <ErrorMessage
        errors={formContext.errors}
        name={playlistFormKeys.title}
        as={<FormErrorMessageTypography />}
        message="Vul een titel in"
      />
      <Box pt={2} />
      <FormGroup>
        {/* Description */}
        <Controller
          // set default value at least to a string to counter "uncontrolled to controlled error"
          // https://github.com/react-hook-form/react-hook-form-website/issues/133
          defaultValue={initialValues.description || ""}
          control={formContext.control}
          rules={{ required: true }}
          as={TextField}
          multiline={true}
          rows={2}
          label="Korte omschrijving"
          placeholder="Omschrijving collectie"
          name={playlistFormKeys.description}
          disabled={formContext.formState.isSubmitting}
        />
      </FormGroup>
      <ErrorMessage
        errors={formContext.errors}
        name={playlistFormKeys.description}
        as={<FormErrorMessageTypography />}
        message="Vul een titel in"
      />

      {/* Image Url */}
      <input
        type="hidden"
        ref={formContext.register({ required: true })}
        name={playlistFormKeys.imageUrl}
      />
      {/* submit */}
      <Box mt={2}>
        <Button
          disabled={SubmitDisabled}
          type="submit"
          variant="contained"
          fullWidth
        >
          {formContext.formState.isSubmitting ? (
            <LinearProgress
              style={{ margin: 10, width: "100%" }}
              variant="indeterminate"
            />
          ) : (
            "Bewaar nieuwe collectie"
          )}
        </Button>
      </Box>
    </form>
  );
};
