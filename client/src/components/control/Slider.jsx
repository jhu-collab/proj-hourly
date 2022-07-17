import React from 'react';
import { Slider as MuiSlider } from '@mui/material';
import { FormControl, FormHelperText, InputLabel } from '@mui/material';
import { Box } from '@mui/material';
import { Grid } from '@mui/material';

/**
 * Represents a reusable component that is inspired by the Material UI Slider component.
 * @param {*} props - Properties include name, label, value, error, onChange, and marks.
 * @returns A reusable slider component.
 */
function Slider(props) {
  const {
    name,
    label,
    value,
    error = null,
    onChange,
    width,
    margin,
    marks,
    defaultValue,
    min,
    max,
    step,
    ...other
  } = props;

  const styles = {
    slider: {
      margin: margin || '20px',
      width: width || '700px',
    },
  };

  return (
    <FormControl style={styles.slider} {...(error && { error: true })}>
      <Grid container direction="column" alignItems="center" spacing={4}>
        <Grid item>
          <InputLabel style={{ fontSize: '13px' }}>{label}</InputLabel>
        </Grid>
        <Grid item>
          <Box sx={{ width: width }}>
            <MuiSlider
              name={name}
              value={value}
              onChange={onChange}
              defaultValue={defaultValue}
              min={min}
              max={max}
              step={step}
              marks={marks}
              {...other}
            />
          </Box>
        </Grid>
      </Grid>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
}

export default Slider;