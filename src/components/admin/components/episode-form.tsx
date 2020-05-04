import { ReactNode } from "react";
import {
  useForm,
  Controller,
  ErrorMessage,
  FormContextValues,
} from "react-hook-form";
import {
  Box,
  TextField,
  Button,
  FormGroup,
  Typography,
} from "@material-ui/core";

export interface EpisodeFormValues {
  title: string;
  imageUrl: string;
}

export const useEpisodeFormContext = () => {
  return useForm<EpisodeFormValues>({
    mode: "onChange",
    reValidateMode: "onChange",
  });
};

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
          name="title"
          disabled={formContext.formState.isSubmitting}
        />
      </FormGroup>
      <ErrorMessage
        errors={formContext.errors}
        name="title"
        as={<ErrorMessageTypography />}
        message="Vul een titel in"
      />

      <input
        type="hidden"
        ref={formContext.register({ required: true })}
        name="imageUrl"
      />
      {/* submit */}
      <Box mt={2}>
        <Button
          disabled={SubmitDisabled}
          type="submit"
          variant="contained"
          fullWidth
        >
          Ga naar opnemen
        </Button>
      </Box>
    </form>
  );
};

const ErrorMessageTypography = ({ children }: { children?: ReactNode }) => (
  <Typography variant="subtitle2" color="error">
    {children}
  </Typography>
);
