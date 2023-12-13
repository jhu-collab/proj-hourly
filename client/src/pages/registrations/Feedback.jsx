import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Grid from "@mui/material/Grid";
import MainCard from "../../components/MainCard";
import FormInputDropdown from "../../components/form-ui/FormInputDropdown";
import useStoreLayout from "../../hooks/useStoreLayout";
import useQueryGetRegistrationFeedback from "../../hooks/useQueryGetRegistrationFeedback";
import useQueryCourseUsers from "../../hooks/useQueryCourseUsers";
import { accountIdSchema } from "../../utils/validators";
import FeedbackForStaff from "./FeedbackForStaff";

const getStaffOptions = (staff, instructors) => {
  const staffArr = [];
  staff.forEach((user) => {
    staffArr.push({
      id: user.id,
      value: user.id,
      label: user.firstName + " " + user.lastName,
      "data-cy": user.userName,
    });
  });
  instructors.forEach((user) => {
    staffArr.push({
      id: user.id,
      value: user.id,
      label: user.firstName + " " + user.lastName,
      "data-cy": user.userName,
    });
  });
  return staffArr;
};

function Feedback({ index }) {
  const courseType = useStoreLayout((state) => state.courseType);
  const registrationTab = useStoreLayout((state) => state.registrationTab);
  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      accountId: "",
    },
    resolver: yupResolver(accountIdSchema),
  });

  const accountId = watch("accountId");
  let {
    isLoading: isLoadingFeedback,
    error: errorFeedback,
    data: dataFeedback,
  } = useQueryGetRegistrationFeedback();
  const { isLoading, error, data: courseUsers } = useQueryCourseUsers();

  const staff = getStaffOptions(
    courseUsers?.staff || [],
    courseUsers?.instructors || []
  );

  let rating = -1;

  const noRegistrations = () => {
    return (
      <Alert severity="info" sx={{ mt: 4 }}>
        No Feedback
      </Alert>
    );
  };

  if (isLoadingFeedback && registrationTab === index) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Loading Feedback ...
      </Alert>
    );
  }

  if (errorFeedback && registrationTab === index) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        <AlertTitle>Error</AlertTitle>
        {"An error has occurred: " + error.message}
      </Alert>
    );
  }

  if (dataFeedback) {
    let sum = 0;
    dataFeedback.forEach((feedback) => {
      sum += feedback.feedbackRating;
    });
    rating = sum / (2 * dataFeedback.length);
  }

  let myFeedback = dataFeedback.map((feedback, index) => {
    if (feedback.feedbackComment) {
      return (
        <Grid item xs={12} key={index}>
          <MainCard sx={{ padding: 2 }} content={false}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
            >
              <Typography fontWeight={600}>
                {feedback.feedbackComment}
              </Typography>
            </Stack>
          </MainCard>
        </Grid>
      );
    } else {
      return <div key={index}></div>;
    }
  });

  return (
    <>
      {registrationTab === index && (
        <Grid
          data-cy="registration-type-list"
          container
          spacing={2}
          marginTop={2}
        >
          <Grid item xs={12}>
            <MainCard sx={{ padding: 2 }} content={false}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="center"
                alignItems="center"
                spacing={2}
              >
                {/* <Typography>Average Rating: </Typography>
                <Rating
                  name="feedback"
                  value={rating}
                  precision={0.5}
                  readOnly
                  emptyIcon={
                    <StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />
                  }
                  size="large"
                /> */}
                {courseType === "Instructor" && (
                  <FormInputDropdown
                    data-cy="token-dropdown-type"
                    name="accountId"
                    control={control}
                    label="Course Staff"
                    options={staff || []}
                    defaultValues={[""]}
                  />
                )}
              </Stack>
            </MainCard>
          </Grid>

          {accountId == "" && <>{myFeedback}</>}

          {accountId !== "" && (
            <>
              <FeedbackForStaff key={accountId} accountId={accountId} />
              {/* Include other parts of the feedback UI here */}
            </>
          )}
        </Grid>
      )}
    </>
  );
}

export default Feedback;
