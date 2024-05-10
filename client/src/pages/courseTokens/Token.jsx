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
import FormInputNumber from "../../components/form-ui/FormInputNumber";
import MainCard from "../../components/MainCard";
import useStoreCourse from "../../hooks/useStoreCourse";
import useStoreLayout from "../../hooks/useStoreLayout";
import { tokenSchema } from "../../utils/validators";
import useMutationEditToken from "../../hooks/useMutationEditToken";
import useMutationDeleteToken from "../../hooks/useMutationDeleteToken";
import Grid from "@mui/material/Grid";

/**
 * Represents a single Topic card.
 * @param {*} topic topic object
 * @returns a single Topic component.
 */
function Token({ token }) {
  const [edit, setEdit] = useState(false);

  const { mutate } = useMutationEditToken();
  const { mutate: mutateDelete } = useMutationDeleteToken();

  const course = useStoreCourse((state) => state.course);
  const courseType = useStoreLayout((state) => state.courseType);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: token.title,
      quantity: token.tokenLimit,
      description: token.description,
    },
    resolver: yupResolver(tokenSchema),
  });

  const onSubmit = (data) => {
    mutate({
      courseId: course.id,
      courseTokenId: token.id,
      title: data.name,
      tokenLimit: data.quantity,
      description: data.description,
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
          {/* <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          > */}
          <Grid
            container
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            {/* Token Title */}
            <Grid item xs={0} sm={2}>
              {edit && courseType === "Instructor" ? (
                <FormInputText
                  data-cy="edit-token-name"
                  name="name"
                  control={control}
                  sx={{ width: 230 }}
                />
              ) : (
                <Typography data-cy="token-name" variant="h5">
                  {token.title}
                </Typography>
              )}
            </Grid>
            {/* Token Description */}
            <Grid item xs={0} sm={2}>
              {edit && courseType === "Instructor" ? (
                <FormInputText
                  data-cy="edit-token-description"
                  name="description"
                  control={control}
                  sx={{ width: 230 }}
                />
              ) : (
                <Typography variant="h5" data-cy="token-description">
                  {token.description}
                </Typography>
              )}
            </Grid>
            {/* Token Quantity */}
            <Grid item xs={0} sm={2}>
              {edit && courseType === "Instructor" ? (
                <FormInputNumber
                  data-cy="edit-token-quantity"
                  name="quantity"
                  control={control}
                  sx={{ width: 230 }}
                />
              ) : courseType !== "Student" ? (
                <Typography variant="h5" data-cy="token-quantity">
                  Token Limit: {token.tokenLimit}
                </Typography>
              ) : (
                <Typography variant="h5" data-cy="token-quantity-student">
                  Token Balance: {token.tokenLimit - token.datesUsed.length}/
                  {token.tokenLimit}
                </Typography>
              )}
            </Grid>
            {/* Edit -> Submit Button + Cancel Button */}
            <Grid item xs={0} sm={2}>
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
            </Grid>
            {/* Not Edit -> Edit + Delete Button */}
            <Grid item xs={0} sm={2}>
              {!edit && courseType === "Instructor" && (
                <Stack direction="row" spacing={1}>
                  <AnimateButton>
                    <Button
                      data-cy="edit-token-button"
                      variant="contained"
                      onClick={handleOnClickEditBtn}
                    >
                      Edit
                    </Button>
                  </AnimateButton>
                  <AnimateButton>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => {
                        confirmDialog(
                          `Do you really want to delete the "${token.title}" token?`,
                          () => {
                            mutateDelete({
                              courseId: course.id,
                              courseTokenId: token.id,
                            });
                          }
                        );
                      }}
                    >
                      Delete
                    </Button>
                  </AnimateButton>
                </Stack>
              )}
            </Grid>
            {/* </Stack> */}
          </Grid>
        </Form>
      </MainCard>
      <ConfirmPopup />
    </>
  );
}

export default Token;
