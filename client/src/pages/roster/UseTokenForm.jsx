import Typography from "@mui/material/Typography";
import { useState } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import FormInputDropdown from "../../components/form-ui/FormInputDropdown";
import Form from "../../components/form-ui/Form";
import { useForm } from "react-hook-form";
import useQueryRemainingTokensPerStudent from "../../hooks/useQueryGetRemainingTokensPerStudent";
import useStoreCourse from "../../hooks/useStoreCourse";

const getTokenOptions = (tokens) => {
  const tokenArr = [];
  tokens.forEach((token) => {
    tokenArr.push({
      id: token.CourseToken.id,
      value: token.CourseToken.title,
      label: token.CourseToken.title,
    });
  });
  return tokenArr;
};

function UseTokenForm(props) {
  const { params, isStaff } = props;
  const course = useStoreCourse((state) => state.course);
  const {
    isLoading: isLoading,
    error: error,
    data: queriedTokens,
  } = useQueryRemainingTokensPerStudent(params.id, course.id);

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      token: "",
    },
  });

  const tokens = getTokenOptions(queriedTokens || []);
  console.log(tokens);

  //   const { mutate } = useMutationChangeRole(params, role);
  const onSubmit = (e) => {
    e.preventDefault();
    //mutate();
  };

  // tokens with students count
  const token = watch("token");

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Stack alignItems={"center"} direction={"column"} spacing={2}>
        <Typography textAlign="center" variant="h4">
          Select which course token you would like to use:
        </Typography>
        <FormInputDropdown
          name="token"
          control={control}
          label="Token Type"
          options={tokens}
        />
        <Button color="secondary" variant="contained" type="submit">
          Submit
        </Button>
      </Stack>
    </Form>
  );
}

export default UseTokenForm;
