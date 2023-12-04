import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Grid from "@mui/material/Grid";
import MainCard from "../../components/MainCard";
import useStoreLayout from "../../hooks/useStoreLayout";
import useQueryGetRegistrationFeedback from "../../hooks/useQueryGetRegistrationFeedback";

function Feedback({ index }) {
  const registrationTab = useStoreLayout((state) => state.registrationTab);
  const {
    isLoading: isLoadingFeedback,
    error: errorFeedback,
    data: dataFeedback,
  } = useQueryGetRegistrationFeedback();
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
    rating = sum / (2 * 5);
  }

  return (
    <>
      {registrationTab === index &&
        (dataFeedback.length === 0 ? (
          noRegistrations()
        ) : (
          <>
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
                    <Typography>Average Rating: </Typography>
                    <Rating
                      name="feedback"
                      value={rating}
                      precision={0.5}
                      readOnly
                      emptyIcon={
                        <StarIcon
                          style={{ opacity: 0.55 }}
                          fontSize="inherit"
                        />
                      }
                      size="large"
                    />
                  </Stack>
                </MainCard>
              </Grid>

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
            </Grid>
          </>
        ))}
    </>
  );
}

export default Feedback;
