import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import AnimateButton from "../../components/AnimateButton";
import ConfirmPopup, { confirmDialog } from "../../components/ConfirmPopup";
import Form from "../../components/form-ui/Form";
import FormInputText from "../../components/form-ui/FormInputText";
import MainCard from "../../components/MainCard";
import { topicSchema } from "../../utils/validators";

function Topic({ topic }) {
  const [edit, setEdit] = useState(false);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: topic.value,
    },
    resolver: yupResolver(topicSchema),
  });

  // TODO: Need a route that allows for the editing of
  // topics
  const onSubmit = (data) => {
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
            {edit ? (
              <FormInputText
                name="name"
                control={control}
                sx={{ width: 230 }}
              />
            ) : (
              <Typography variant="h5">{topic.value}</Typography>
            )}
            <Stack direction="row" spacing={1}></Stack>
            {edit ? (
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
            ) : (
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
                          // Need route that allows for deletion of topics
                          window.alert(`Deleted the "${topic.value}" topic!`);
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
