// material-ui
import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';

// assets
import { IconArrowBarToRight, IconPlus } from '@tabler/icons';
import { useTheme } from '@emotion/react';

// project imports
import { useStore } from 'store/appStore';

// ==============================|| HOME - EXPANDFAB ||============================== //

/**
 * A component that expandable floating action button that is used to create or join
 * a course.
 * @returns A MUI SpeedDial component.
 */
const ExpandFab = () => {
  const createPopupOpen = useStore((state) => state.createPopupOpen);
  const theme = useTheme();

  const actions = [
    { icon: <IconPlus />, name: 'Create', onClick: createPopupOpen },
    //TODO: May need to change the icon for the Join Button
    { icon: <IconArrowBarToRight />, name: 'Join' },
  ];

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: theme.spacing(2),
        right: theme.spacing(2),
        transform: 'translateZ(0px)',
        zIndex: useTheme().zIndex.speedDial,
        flexGrow: 1,
      }}>
      <SpeedDial
        ariaLabel="SpeedDial basic example"
        sx={{ position: 'absolute', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
        FabProps={{
          style: { backgroundColor: '#ff0000' },
        }}>
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.onClick}
          />
        ))}
      </SpeedDial>
    </Box>
  );
};

export default ExpandFab;
