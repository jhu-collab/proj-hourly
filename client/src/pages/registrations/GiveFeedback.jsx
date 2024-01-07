import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useForm, Controller } from "react-hook-form";
import AnimateButton from "../../components/AnimateButton";
import Form from "../../components/form-ui/Form";
import FormInputText from "../../components/form-ui/FormInputText";
import useMutationGiveFeedback from "../../hooks/useMutationGiveFeedback";
import { feedbackTypeSchema } from "../../utils/validators";
import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";
import Box from "@mui/material/Box";


function GiveFeedback({ registrationId }) {
  const { mutate } = useMutationGiveFeedback();
  const { control, handleSubmit } = useForm({
    defaultValues: {
      feedbackRating: 0,
      feedbackComment: "",
    },
    resolver: yupResolver(feedbackTypeSchema),
  });

  function getLabelText(value) {
    return `${value} Star${value !== 1 ? "s" : ""}, ${labels[value]}`;
  }
  const onSubmit = (data) => {
    mutate({
      feedbackRating: data.feedbackRating * 2,
      feedbackComment: data.feedbackComment,
      registrationId,
    });
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2} alignItems="center">
        <Controller
          name="feedbackRating"
          control={control}
          defaultValue={0} // Provide an initial value here
          rules={{ required: true }}
          render={(props) => (
            <Rating
              name="feedbackRating"
              value={props.field.value} // Use the controlled value from react-hook-form
              onChange={(e, value) => props.field.onChange(value)}
              precision={0.5}
            />
          )}
        />
        <FormInputText
          data-cy="registration-feedback-comment-input"
          name="feedbackComment"
          control={control}
          label="Comment"
        />
        <AnimateButton>
          <Button
            data-cy="create-registration-type-button"
            type="submit"
            variant="contained"
            size="large"
          >
            Create
          </Button>
        </AnimateButton>
      </Stack>
    </Form>
  );
}

export default GiveFeedback;
