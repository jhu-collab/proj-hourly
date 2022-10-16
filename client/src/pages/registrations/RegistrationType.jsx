import { Button, Stack, Typography } from "@mui/material";
import React from "react";
import MainCard from "../../components/MainCard";

function RegistrationType({ type }) {
  return (
    <MainCard sx={{ padding: 2 }} content={false}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5">{type.name}</Typography>
        <Typography variant="h5">{type.duration} minutes</Typography>

        <Stack direction="row" spacing={1}>
          <Button variant="contained" color="primary">
            Edit
          </Button>
          <Button variant="contained" color="error">
            Delete
          </Button>
        </Stack>
      </Stack>
    </MainCard>
  );
}

export default RegistrationType;
