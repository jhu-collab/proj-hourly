import { Typography } from '@mui/material';
import React from 'react';

/**
 * Represents a reusable header component that makes use of the Material UI
 * component Typography.
 * @param {*} props - Properties.
 * @returns An reusable header component.
 */
function Header(props) {
  const { text, fontSize, fontWeight, margin, textAlign } = props; // Add more properties here!

  const styles = {
    header: {
      fontSize: fontSize,
      fontWeight: fontWeight,
      margin: margin,
      textAlign: textAlign || 'left',
    },
  };

  return <Typography style={styles.header}>{text}</Typography>;
}

export default Header;
