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
  MenuItem,
  Typography,
} from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SkeletonEarningCard from 'ui-component/cards/Skeleton/EarningCard';

// assets
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import GetAppTwoToneIcon from '@mui/icons-material/GetAppOutlined';
import FileCopyTwoToneIcon from '@mui/icons-material/FileCopyOutlined';
import PictureAsPdfTwoToneIcon from '@mui/icons-material/PictureAsPdfOutlined';
import ArchiveTwoToneIcon from '@mui/icons-material/ArchiveOutlined';

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

// ===========================|| DASHBOARD DEFAULT - EARNING CARD ||=========================== //

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
          <CardActionArea
            component="a"
            onClick={(event) => {
              window.alert('Navigating to...');
            }}>
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
                          onClick={handleClick}>
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
                          }}>
                          <MenuItem onClick={handleClose} onMouseDown={(event) => event.stopPropagation()}>
                            <GetAppTwoToneIcon sx={{ mr: 1.75 }} /> Import Card
                          </MenuItem>
                          <MenuItem onClick={handleClose} onMouseDown={(event) => event.stopPropagation()}>
                            <FileCopyTwoToneIcon sx={{ mr: 1.75 }} /> Copy Data
                          </MenuItem>
                          <MenuItem onClick={handleClose} onMouseDown={(event) => event.stopPropagation()}>
                            <PictureAsPdfTwoToneIcon sx={{ mr: 1.75 }} /> Export
                          </MenuItem>
                          <MenuItem onClick={handleClose} onMouseDown={(event) => event.stopPropagation()}>
                            <ArchiveTwoToneIcon sx={{ mr: 1.75 }} /> Archive
                            File
                          </MenuItem>
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
                        }}>
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
                    }}>
                    {number}
                  </Typography>
                </Grid>
                <Grid item sx={{ mb: 1.25 }}>
                  <Typography
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 500,
                    }}>
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
