import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Form from "../../../components/form-ui/Form";
import FormInputText from "../../../components/form-ui/FormInputText";
import { joinCourseSchema } from "../../../utils/validators";
import { useMutation, useQueryClient } from "react-query";
import { joinCourse } from "../../../utils/requests";
import Loader from "../../../components/Loader";
import { useStoreToken } from "../../../services/store";
import { errorToast } from "../../../utils/toasts";
import { decodeToken } from "react-jwt";
import useMutationJoinCourse from "../../../hooks/useMutationJoinCourse";

/**
 * Component that represents the form that is used to join a course.
 * @param {*} onClose: function that closes the popup component
 * @returns A component representing the Join Course form.
 */
function JoinCourseForm({ onClose }) {
  const token = useStoreToken((state) => state.token);
  const { id } = decodeToken(token);
  const queryClient = useQueryClient();
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
        <Stack direction="column" spacing={3}>
          <FormInputText
            name="code"
            label="Course Code"
            control={control}
          ></FormInputText>
          <Button variant="contained" fullWidth type="submit">
            Submit
          </Button>
        </Stack>
      </Form>
      {isLoading && <Loader />}
    </>
  );
}

export default JoinCourseForm;
