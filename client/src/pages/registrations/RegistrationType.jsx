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
import useMutationDeleteRegType from "../../hooks/useMutationDeleteRegType";
import useMutationEditRegType from "../../hooks/useMutationEditRegType";
import useStoreLayout from "../../hooks/useStoreLayout";
import { registrationTypeSchema } from "../../utils/validators";

/**
 * Represents a single Registration Type card.
 * @param {*} type type object
 * @returns a single Registration Type component.
 */
function RegistrationType({ type }) {
  const [edit, setEdit] = useState(false);

  const courseType = useStoreLayout((state) => state.courseType);

  const { mutate } = useMutationEditRegType(type.id);
  const { mutate: mutateDelete } = useMutationDeleteRegType();

  const { control, handleSubmit } = useForm({
    defaultValues: {
      title: type.title,
      length: type.duration,
    },
    resolver: yupResolver(registrationTypeSchema),
  });

  const onSubmit = (data) => {
    mutate(data);
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
              <>
                <FormInputText
                  name="title"
                  control={control}
                  sx={{ width: 230 }}
                />
                <Stack direction="row" alignItems="center" spacing={1}>
                  <FormInputText
                    name="length"
                    control={control}
                    type="number"
                    sx={{ width: 230 }}
                  />
                  <Typography variant="h5">minutes</Typography>
                </Stack>
              </>
            ) : (
              <Stack>
                <Typography variant="h5">{type.title}</Typography>
                <Typography variant="h5">{type.duration} minutes</Typography>
              </Stack>
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
                        `Do you really want to delete the ${type.title} registration type?`,
                        () => {
                          mutateDelete(type.id);
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

export default RegistrationType;
