import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";
import useStoreLayout from "../../hooks/useStoreLayout";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper"; // Import Paper component
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

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

  console.log(dataFeedback, rating);

  return (
    <>
      {registrationTab === index &&
        (dataFeedback.length === 0 ? (
          noRegistrations()
        ) : (
          <>
            <Stack
              sx={{ flexGrow: 1, pr: 2, mt: 2 }} // Adjust mt to provide space between the menu bar and the Stack
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <Paper key={-1} sx={{ p: 2, borderRadius: 1, width: "50%" }}>
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
              </Paper>

              {dataFeedback.map((feedback, index) => {
                if (feedback.feedbackComment) {
                  return (
                    <Paper
                      key={index}
                      sx={{ p: 2, borderRadius: 1, width: "100%" }}
                    >
                      <Typography fontWeight={600}>
                        {feedback.feedbackComment}
                      </Typography>
                    </Paper>
                  );
                } else {
                  return <div key={index}></div>;
                }
              })}
            </Stack>
          </>
        ))}
    </>
  );
}

export default Feedback;
