import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
import { styled, useTheme } from '@mui/material/styles';
import {
  Avatar,
  Box,
  CardActionArea,
  Grid,
  Menu,
  Typography,
} from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SkeletonEarningCard from 'ui-component/cards/Skeleton/EarningCard';

// assets
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Link } from 'react-router-dom';

const CardWrapper = styled(MainCard)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.dark,
  color: '#fff',
  overflow: 'hidden',
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: theme.palette.secondary[800],
    borderRadius: '50%',
    top: -85,
    right: -95,
    [theme.breakpoints.down('sm')]: {
      top: -105,
      right: -140,
    },
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: theme.palette.secondary[800],
    borderRadius: '50%',
    top: -125,
    right: -15,
    opacity: 0.5,
    [theme.breakpoints.down('sm')]: {
      top: -155,
      right: -70,
    },
  },
}));

// ===========================|| HOME - COURSE CARD ||=========================== //

/**
 * A component that represents a card to display basic details about a course. If the
 * user clicks on a course card, they will be redirected to the course's page to have
 * access to calendar, registrations, analytics (instructor only), etc.
 * @param {boolean} isLoading - whether the data has finished loading
 * @param {string} title - the course title
 * @param {string} number - the course number
 * @param {string} semester - the course semester
 * @param {string} year - the course calendar year
 * @returns A course card component.
 */
const CourseCard = ({ isLoading, title, number, semester, year }) => {
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(null);
  };

  return (
    <>
      {isLoading ? (
        <SkeletonEarningCard />
      ) : (
        <CardWrapper border={false} content={false}>
          <CardActionArea component={Link} to="/calendar">
            <Box sx={{ p: 2.25 }}>
              <Grid container direction="column">
                <Grid item>
                  <Grid container justifyContent="flex-end">
                    <Grid item>
                      <Avatar
                        variant="rounded"
                        sx={{
                          ...theme.typography.commonAvatar,
                          ...theme.typography.mediumAvatar,
                          backgroundColor: theme.palette.secondary.dark,
                          color: theme.palette.secondary[200],
                          zIndex: 1,
                        }}
                        aria-controls="menu-earning-card"
                        aria-haspopup="true"
                        onMouseDown={(event) => event.stopPropagation()}
                        onClick={handleClick}
                      >
                        <MoreHorizIcon fontSize="inherit" />
                      </Avatar>
                      <Menu
                        id="menu-earning-card"
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        variant="selectedMenu"
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                      >
                        {/* Add menu items later! */}
                        {/* <MenuItem onClick={handleClose} onMouseDown={(event) => event.stopPropagation()}>
                            <GetAppTwoToneIcon sx={{ mr: 1.75 }} /> Import Card
                          </MenuItem> */}
                      </Menu>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item>
                  <Grid container alignItems="center">
                    <Grid item>
                      <Typography
                        sx={{
                          fontSize: '2.125rem',
                          fontWeight: 500,
                          mr: 1,
                          mt: 1.75,
                          mb: 0.75,
                        }}
                      >
                        {title}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item sx={{ mb: 1.25 }}>
                  <Typography
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 500,
                    }}
                  >
                    {number}
                  </Typography>
                </Grid>
                <Grid item sx={{ mb: 1.25 }}>
                  <Typography
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 500,
                    }}
                  >
                    {semester} {year}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </CardActionArea>
        </CardWrapper>
      )}
    </>
  );
};

CourseCard.propTypes = {
  isLoading: PropTypes.bool,
};

export default CourseCard;
