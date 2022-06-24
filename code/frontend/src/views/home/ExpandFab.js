// material-ui
import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';

// project imports

// assets
import { IconArrowBarToRight, IconPlus } from '@tabler/icons';
import { useTheme } from '@emotion/react';

// ==============================|| HOME ||============================== //
const actions = [
  { icon: <IconPlus />, name: 'Create' },
  //TODO: May need to change the icon for the Join Button
  { icon: <IconArrowBarToRight />, name: 'Join' },
];

export default function ExpandFab() {
  const theme = useTheme();

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
          />
        ))}
      </SpeedDial>
    </Box>
  );
}
