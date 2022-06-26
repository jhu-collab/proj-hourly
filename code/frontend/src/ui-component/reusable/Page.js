import { Box } from '@mui/material';
import React from 'react';
import theme from '../../theme';
import PageHeader from './PageHeader';

/**
 * Given a header, returns a reusable page component.
 * This reusable component has a page title.
 * Accepts dropdown, and button to add to the page header.
 * Additionally can pass in children to fill up the component.
 * @param {*} props:
 * required: header: the header text
 * optional: dropdown: a dropdown component
 *           button: a button component
 *           children: children to fill up the component
 * @returns Reusable page component.
 */
export default function Page(props) {
  const { header, dropdown, button, children } = props;

  return (
    <>
      <Box
        bgcolor="white"
        flex={1}
        display="flex"
        position="fixed"
        zIndex={1}
        minWidth="100%"
        paddingLeft={{ xs: theme.spacing(10), sm: theme.spacing(12) }}
        paddingRight={{ xs: theme.spacing(3), sm: theme.spacing(4) }}
        minHeight="75px"
      >
        <PageHeader
          header={header}
          dropdown={dropdown}
          button={button}
        ></PageHeader>
      </Box>
      <Box
        display="flex"
        flex={1}
        minWidth="100%"
        height="90%"
        paddingLeft={{ xs: theme.spacing(10), sm: theme.spacing(12) }}
        paddingRight={{ xs: theme.spacing(3), sm: theme.spacing(4) }}
        paddingTop="75px"
        flexDirection="column"
      >
        <Box flex={1} display="flex" paddingBottom={theme.spacing(2)}>
          {children}
        </Box>
      </Box>
    </>
  );
}
