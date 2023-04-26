import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useForm } from "react-hook-form";
import AnimateButton from "../../components/AnimateButton";
import ConfirmPopup, { confirmDialog } from "../../components/ConfirmPopup";
import Form from "../../components/form-ui/Form";
import FormInputText from "../../components/form-ui/FormInputText";
import MainCard from "../../components/MainCard";
import useMutationDeleteTopic from "../../hooks/useMutationDeleteTopic";
import useMutationEditTopic from "../../hooks/useMutationEditTopic";
import useStoreCourse from "../../hooks/useStoreCourse";
import useStoreLayout from "../../hooks/useStoreLayout";
import { topicSchema } from "../../utils/validators";

/**
 * Represents a single Topic card.
 * @param {*} topic topic object
 * @returns a single Topic component.
 */
function Topic({ topic }) {
  const [edit, setEdit] = useState(false);

  const { mutate } = useMutationEditTopic();
  const { mutate: mutateDelete } = useMutationDeleteTopic();

  const course = useStoreCourse((state) => state.course);
  const courseType = useStoreLayout((state) => state.courseType);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: topic.value,
    },
    resolver: yupResolver(topicSchema),
  });

  const onSubmit = (data) => {
    mutate({
      courseId: course.id,
      topicId: topic.id,
      value: data.name,
    });
    setEdit(false);
  };

  const handleOnClickCancelBtn = (e) => {
    e.preventDefault();
    setEdit(false);
  };

  const handleOnClickEditBtn = (e) => {
    e.preventDefault();
    setEdit(true);
  };

  return (
    <>
      <MainCard sx={{ padding: 2 }} content={false}>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            {edit && courseType === "Instructor" ? (
              <FormInputText
                data-cy="edit-topic-input"
                name="name"
                control={control}
                sx={{ width: 230 }}
              />
            ) : (
              <Typography variant="h5">{topic.value}</Typography>
            )}
            {edit && courseType === "Instructor" && (
              <Stack direction="row" spacing={1}>
                <AnimateButton>
                  <Button variant="contained" type="submit">
                    Submit
                  </Button>
                </AnimateButton>
                <AnimateButton>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleOnClickCancelBtn}
                  >
                    Cancel
                  </Button>
                </AnimateButton>
              </Stack>
            )}
            {!edit && courseType === "Instructor" && (
              <Stack direction="row" spacing={1}>
                <AnimateButton>
                  <Button variant="contained" onClick={handleOnClickEditBtn}>
                    Edit
                  </Button>
                </AnimateButton>
                <AnimateButton>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                      confirmDialog(
                        `Do you really want to delete the "${topic.value}" topic?`,
                        () => {
                          mutateDelete(topic.id);
                        }
                      );
                    }}
                  >
                    Delete
                  </Button>
                </AnimateButton>
              </Stack>
            )}
          </Stack>
        </Form>
      </MainCard>
      <ConfirmPopup />
    </>
  );
}

export default Topic;
