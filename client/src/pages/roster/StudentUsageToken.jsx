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
import useMutationAddTokenOverride from "../../hooks/useMutationAddTokenOverride";
import useMutationDeleteToken from "../../hooks/useMutationDeleteToken";
import useMutationDeleteTokenOverride from "../../hooks/useMutationDeleteTokenOverride";

/**
 * Represents a single Topic card.
 * @param {*} topic topic object
 * @returns a single Topic component.
 */
function StudentTokenUsage({ token }) {
  const [edit, setEdit] = useState(false);

  const courseType = useStoreLayout((state) => state.courseType);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      quantity: !token.overrideAmount
        ? token.CourseToken.tokenLimit
        : token.overrideAmount,
    },
  });
  const { mutate } = useMutationAddTokenOverride(
    token.CourseToken.courseId,
    token.CourseToken.id,
    token.accountId
  );

  const { mutate: mutateDelete } = useMutationDeleteTokenOverride(
    token.CourseToken.courseId,
    token.CourseToken.id,
    token.accountId
  );

  const onSubmit = (data) => {
    mutate({ overrideAmount: parseInt(data.quantity) });
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
            spacing={3}
          >
            <Typography data-cy="token-name" variant="h5">
              {token.CourseToken.title}
            </Typography>
            <Typography variant="h5" data-cy="token-balance-student">
              Balance:{" "}
              {!token.overrideAmount
                ? token.CourseToken.tokenLimit - token.datesUsed.length
                : token.overrideAmount - token.datesUsed.length}{" "}
            </Typography>
            {edit && courseType === "Instructor" ? (
              <FormInputNumber
                data-cy="edit-token-quantity"
                name="quantity"
                control={control}
                sx={{ width: 230 }}
              />
            ) : (
              <Typography variant="h5" data-cy="token-limit-student">
                Limit:{" "}
                {!token.overrideAmount
                  ? token.CourseToken.tokenLimit
                  : token.overrideAmount}
              </Typography>
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
                        `Do you really want to remove the override for "${token.CourseToken.title}" token?`,
                        () => {
                          mutateDelete();
                        }
                      );
                    }}
                  >
                    Remove Override
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

export default StudentTokenUsage;
