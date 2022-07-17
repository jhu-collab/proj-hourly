import React from 'react';
import { Button as MuiButton } from '@mui/material';

/**
 * Represents a reusable component that is inspired by the Material UI Button component.
 * @param {*} props - Properties include text, size, color, variant, and onClick.
 * @returns A reusable button component.
 */
function Button(props) {
  const {
    text,
    size,
    color,
    variant,
    onClick,
    margin,
    width,
    height,
    fontSize,
    ...other
  } = props;

  const styles = {
    button: {
      margin: margin || '10px',
      width: width,
      height: height,
      fontSize: fontSize,
    },
  };

  return (
    <MuiButton
      variant={variant || 'contained'}
      size={!width ? size || 'large' : ''}
      color={color || 'primary'}
      onClick={onClick}
      style={styles.button}
      {...other}
    >
      {text}
    </MuiButton>
  );
}

export default Button;