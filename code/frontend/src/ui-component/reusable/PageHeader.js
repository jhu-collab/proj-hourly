import { Box, Typography } from '@mui/material';
import React from 'react';

/**
 * Creates the header aspect for the reusable Page component.
 * @param {*} props:
 * required: header: the header text
 * optional: dropdown: a dropdown componentn
 * @returns A page header.
 */
export default function PageHeader(props) {
  const { header, dropdown, button } = props;
  return (
    <>
      <Box flex={11} display="flex" alignItems="center">
        <Typography variant="header">{header}</Typography>
        {dropdown}
      </Box>
      <Box
        flex={1}
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
      >
        {button}
      </Box>
    </>
  );
}
