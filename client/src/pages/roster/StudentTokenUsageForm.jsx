import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import useQueryRemainingTokensPerStudent from "../../hooks/useQueryGetRemainingTokensPerStudent";
import useStoreCourse from "../../hooks/useStoreCourse";
import { useState } from "react";
import useStoreLayout from "../../hooks/useStoreLayout";
import StudentTokenUsage from "./StudentUsageToken";

function StudentTokenUsageForm(props) {
  const { isStaff, params } = props;
  const course = useStoreCourse((state) => state.course);
  // console.log(course);
  // console.log(params, initialParams);
  const {
    isLoading: isLoading,
    error: error,
    data: queriedTokens,
  } = useQueryRemainingTokensPerStudent(params.id, course.id);
  const noTokens = () => {
    return (
      <Alert data-cy="no-tokens-alert" severity="info" sx={{ mt: 2 }}>
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

  if (isLoading) {
    return <Alert severity="warning">Loading Student tokens...</Alert>;
  }

  return (
    <>
      <Typography variant="h4" sx={{ marginBottom: 2.25 }}>
        Tokens
      </Typography>
      {queriedTokens.length === 0 ? (
        noTokens()
      ) : (
        <Grid container spacing={3}>
          {queriedTokens.map((token) => {
            return (
              <Grid
                item
                xs={12}
                key={token.id}
                data-cy="token-balance-list-student"
              >
                <StudentTokenUsage token={token} />
              </Grid>
            );
          })}
        </Grid>
      )}
    </>
  );
}

export default StudentTokenUsageForm;
