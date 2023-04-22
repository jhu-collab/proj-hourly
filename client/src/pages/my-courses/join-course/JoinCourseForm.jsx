import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { useForm } from "react-hook-form";
import Form from "../../../components/form-ui/Form";
import FormInputText from "../../../components/form-ui/FormInputText";
import { joinCourseSchema } from "../../../utils/validators";
import Loader from "../../../components/Loader";
import { decodeToken } from "react-jwt";
import useMutationJoinCourse from "../../../hooks/useMutationJoinCourse";
import useStoreToken from "../../../hooks/useStoreToken";
import AnimateButton from "../../../components/AnimateButton";
import NiceModal from "@ebay/nice-modal-react";

/**
 * Component that represents the form that is used to join a course.
 * @returns A component representing the Join Course form.
 */
function JoinCourseForm() {
  const token = useStoreToken((state) => state.token);
  const { id } = decodeToken(token);
  const { control, handleSubmit } = useForm({
    defaultValues: {
      code: "",
    },
    resolver: yupResolver(joinCourseSchema),
  });

  const { mutate, isLoading } = useMutationJoinCourse();

  const onSubmit = (data) => {
    mutate({ ...data, id: id });
  };
  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Typography fontWeight={400} fontSize="30px" marginBottom={1}>
          Join a new course
        </Typography>
        <Stack direction="column" spacing={0.5}>
          <FormInputText
            name="code"
            label="Course Code"
            control={control}
          ></FormInputText>
          <AnimateButton>
            <Button
              variant="contained"
              fullWidth
              type="submit"
              sx={{ marginTop: 1 }}
              data-cy="join-course-button"
            >
              Join Course
            </Button>
          </AnimateButton>
          <Divider
            sx={{
              fontSize: "17px",
              padding: "-100px",
              color: "rgba(30, 62, 102, 1)",
              "::before": { borderTop: "1px dashed rgba(30, 62, 102, 0.42)" },
              "::after": { borderTop: "1px dashed rgba(30, 62, 102, 0.42)" },
            }}
          >
            OR
          </Divider>
          <AnimateButton>
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                NiceModal.hide("join-course");
                NiceModal.show("create-course");
              }}
              data-cy="create-course-button"
            >
              Create a new course
            </Button>
          </AnimateButton>
        </Stack>
      </Form>
      {isLoading && <Loader />}
    </>
  );
}

export default JoinCourseForm;
