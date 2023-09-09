import Typography from "@mui/material/Typography";
import { useState, useEffect } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import FormInputDropdown from "../../components/form-ui/FormInputDropdown";
import Form from "../../components/form-ui/Form";
import { useForm } from "react-hook-form";
import useQueryRemainingTokensPerStudent from "../../hooks/useQueryGetRemainingTokensPerStudent";
import useMutationUseToken from "../../hooks/useMutationUseToken";
import useStoreCourse from "../../hooks/useStoreCourse";
import FormCheckbox from "../../components/form-ui/FormCheckbox";
import FormInputText from "../../components/form-ui/FormInputText";
import useMutationUndoUseToken from "../../hooks/useMutationUndoUseToken";

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
  const [usedDates, setUsedDates] = useState([]);
  const course = useStoreCourse((state) => state.course);
  const {
    isLoading: isLoading,
    error: error,
    data: queriedTokens,
  } = useQueryRemainingTokensPerStudent(params.id, course.id);

  const { mutate } = useMutationUseToken(params.id, course.id);

  const { mutate: undoMutate } = useMutationUndoUseToken(params.id, course.id);

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      token: "",
      undoToken: false,
      date: "",
    },
  });

  const tokens = getTokenOptions(queriedTokens || []);

  const onSubmit = (e) => {
    //e.preventDefault();
    let selectedToken = undefined;
    queriedTokens.forEach((token) => {
      if (token.CourseToken.title === e.token) {
        selectedToken = token.CourseToken.id;
      }
    });
    if (!e.undoToken) {
      mutate(selectedToken);
    } else {
      undoMutate({ token: selectedToken, date: e.date });
    }
  };

  // tokens with students count
  const token = watch("token");
  const undo = watch("undoToken");

  function onTokenChange() {
    let usedDatesSelected = [];
    queriedTokens.forEach((queriedToken) => {
      if (queriedToken.CourseToken.title === token) {
        usedDatesSelected = queriedToken.datesUsed;
      }
    });
    let useDatesWithId = [];
    let i = 0;
    usedDatesSelected.forEach((date) => {
      useDatesWithId.push({ id: i, value: date, label: date.split("T")[0] });
      i += 1;
    });
    setUsedDates(useDatesWithId);
  }

  useEffect(() => {
    if (token) {
      onTokenChange();
    }
  }, [token]);
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
        <FormCheckbox
          name="undoToken"
          control={control}
          label="Undo Student Token Usage?"
        />
        {undo && token && (
          <FormInputDropdown
            name="date"
            control={control}
            label="Date"
            options={usedDates}
          />
        )}
        <Button
          color="secondary"
          variant="contained"
          type="submit"
          disabled={undo && token && usedDates.length === 0}
        >
          Submit
        </Button>
      </Stack>
    </Form>
  );
}

export default UseTokenForm;
