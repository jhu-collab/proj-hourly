import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Grid from "@mui/material/Grid";
import MainCard from "../../components/MainCard";
import useStoreLayout from "../../hooks/useStoreLayout";
import useQueryGetRegistrationFeedbackForAccount from "../../hooks/useQueryGetRegistrationFeedbackForAccount";

function FeedbackForStaff({ accountId }) {
  let {
    isLoading: isLoadingFeedback,
    error: errorFeedback,
    data: dataFeedback,
  } = useQueryGetRegistrationFeedbackForAccount(accountId);

  let rating = -1;

  const noRegistrations = () => {
    return (
      <Alert severity="info" sx={{ mt: 4 }}>
        No Feedback
      </Alert>
    );
  };

  if (isLoadingFeedback) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Loading Feedback ...
      </Alert>
    );
  }

  if (errorFeedback) {
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

  return (
    <>
      {dataFeedback.length === 0 ? (
        noRegistrations()
      ) : (
        <>
          {
            <Grid item xs={12}>
              <MainCard sx={{ padding: 2 }} content={false}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="center"
                  alignItems="center"
                  spacing={2}
                >
                  <Typography>Average Rating: </Typography>
                  <Rating
                    name="feedback"
                    value={rating}
                    precision={0.5}
                    readOnly
                    emptyIcon={
                      <StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />
                    }
                    size="large"
                  />
                </Stack>
              </MainCard>
            </Grid>
          }

          {dataFeedback.map((feedback, index) => {
            if (feedback.feedbackComment) {
              return (
                <Grid item xs={12}>
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
          })}
          {/* </Grid> */}
        </>
      )}
    </>
  );
}

export default FeedbackForStaff;
