import { Box, TextField, Button, FormGroup } from "@material-ui/core";
import {
  useForm,
  Controller,
  ErrorMessage,
  FormContextValues,
} from "react-hook-form";
import { FormErrorMessageTypography } from "./form-error-message";

/*
  Currently supported Episode Values of form
*/
export interface EpisodeFormValues {
  title: string;
  imageUrl: string;
}

export const episodeFormKeys: Record<
  keyof EpisodeFormValues,
  keyof EpisodeFormValues
> = {
  title: "title",
  imageUrl: "imageUrl",
};

/*
  hook that could be imported into partent of EpisodeForm
  - return value can be used to pass in as form Context
  - not part of EpisodeForm itself in order to use formContext in parent (e.g. wit a separate dropzone)
*/
export const useEpisodeFormContext = () => {
  return {
    ...useForm<EpisodeFormValues>({
      mode: "onChange",
      reValidateMode: "onChange",
    }),
    formKeys: episodeFormKeys,
  };
};

/*
  Form visualizing EpisodeFormValues and any validation errors
*/
export const EpisodeForm = ({
  formContext,
  initialValues,
  onSubmit,
}: {
  formContext: FormContextValues<EpisodeFormValues>;
  initialValues: Partial<EpisodeFormValues>;
  onSubmit: (formData: EpisodeFormValues) => void;
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
          placeholder="Titel aflevering"
          name={episodeFormKeys.title}
          disabled={formContext.formState.isSubmitting}
        />
      </FormGroup>
      <ErrorMessage
        errors={formContext.errors}
        name={episodeFormKeys.title}
        as={<FormErrorMessageTypography />}
        message="Vul een titel in"
      />

      <input
        type="hidden"
        ref={formContext.register({ required: true })}
        name={episodeFormKeys.imageUrl}
      />
      {/* submit */}
      <Box mt={2}>
        <Button
          disabled={SubmitDisabled}
          type="submit"
          variant="contained"
          fullWidth
        >
          Naar opnemen
        </Button>
      </Box>
    </form>
  );
};
