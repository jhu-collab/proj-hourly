import Fab from "@mui/material/Fab";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import NiceModal from "@ebay/nice-modal-react";
import Typography from "@mui/material/Typography";
import useQueryTokens from "../../hooks/useQueryTokens";
import useQueryRemainingTokens from "../../hooks/useQueryGetRemainingTokens";
import useStoreLayout from "../../hooks/useStoreLayout";
import Token from "./Token";

/**
 * Represents the Topics page.
 * @returns Topics page
 */
function CourseTokens() {
  const { isLoading, error, data } = useQueryTokens();
  const {
    isLoading: isLoadingRemaining,
    error: errorRemaining,
    data: remainingTokens,
  } = useQueryRemainingTokens();
  const courseType = useStoreLayout((state) => state.courseType);
  let filteredRemainingTokens = [];
  const noTokens = () => {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No Tokens
      </Alert>
    );
  };

  if (isLoading) {
    return <Alert severity="warning">Retrieving tokens ...</Alert>;
  }

  if (error) {
    return <Alert severity="error">Unable to retrieve tokens</Alert>;
  }

  if (isLoadingRemaining) {
    return <Alert severity="warning">Loading Student tokens...</Alert>;
  }

  if (errorRemaining) {
    return <Alert severity="error">Unable to retrieve tokens</Alert>;
  }

  if (!isLoadingRemaining && !errorRemaining) {
    filteredRemainingTokens = remainingTokens.map((issueToken) => {
      return {
        id: issueToken.CourseToken.id,
        title: issueToken.CourseToken.title,
        description: issueToken.CourseToken.description,
        tokenLimit: issueToken.CourseToken.tokenLimit,
        issueTokenId: issueToken.id,
        datesUsed: issueToken.datesUsed,
      };
    });
  }

  return (
    <>
      <Typography variant="h4" sx={{ marginBottom: 2.25 }}>
        Tokens
      </Typography>
      {data.length === 0 ? (
        noTokens()
      ) : courseType !== "Student" ? (
        <Grid container spacing={2}>
          {data.map((token) => {
            return (
              <Grid item xs={12} key={token.id}>
                <Token token={token} />
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Grid container spacing={2}>
          {filteredRemainingTokens.map((token) => {
            return (
              <Grid item xs={12} key={token.id}>
                <Token token={token} />
              </Grid>
            );
          })}
        </Grid>
      )}
      {courseType === "Instructor" && (
        <Fab
          color="primary"
          onClick={() => NiceModal.show("create-token")}
          sx={{
            position: "fixed",
            bottom: (theme) => theme.spacing(3),
            right: (theme) => theme.spacing(3),
          }}
        >
          <SpeedDialIcon />
        </Fab>
      )}
    </>
  );
}

export default CourseTokens;