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
import { registrationTypeSchema } from "../../utils/validators";

function RegistrationType({ type }) {
  const [edit, setEdit] = useState(false);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: type.name,
      duration: type.duration,
    },
    resolver: yupResolver(registrationTypeSchema),
  });

  // TODO: Need a route that allows for the editing of
  // registration types
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
          {/*TODO: Change Stack into a box to better handle spacing between children */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            {edit ? (
              <>
                <FormInputText
                  name="name"
                  control={control}
                  disabled={type.nameDisabled}
                  sx={{ width: 230 }}
                />
                <Stack direction="row" alignItems="center" spacing={1}>
                  <FormInputText
                    name="duration"
                    control={control}
                    sx={{ width: 230 }}
                  />
                  <Typography variant="h5">minutes</Typography>
                </Stack>
              </>
            ) : (
              <Stack>
                <Typography variant="h5">{type.name}</Typography>
                <Typography variant="h5">{type.duration} minutes</Typography>
              </Stack>
            )}
            <Stack direction="row" spacing={1}>
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
                  {!type.deletionDisabled && (
                    <AnimateButton>
                      {/* TODO: Need a route that allows for the deletion of registration types */}
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => {
                          confirmDialog(
                            `Do you really want to delete the ${type.name} registration type?`,
                            () => {
                              window.alert(
                                `Deleted the ${type.name} registration type!`
                              );
                            }
                          );
                        }}
                      >
                        Delete
                      </Button>
                    </AnimateButton>
                  )}
                </Stack>
              )}
            </Stack>
          </Stack>
        </Form>
      </MainCard>
      <ConfirmPopup />
    </>
  );
}

export default RegistrationType;
