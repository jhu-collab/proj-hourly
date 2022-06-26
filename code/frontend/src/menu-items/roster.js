// assets
import PeopleIcon from '@mui/icons-material/People';
// constant
const icons = { PeopleIcon };

// ==============================|| SAMPLE PAGE & DOCUMENTATION MENU ITEMS ||============================== //

const roster = {
  id: 'roster',
  type: 'group',
  children: [
    {
      id: 'roster',
      title: 'Roster',
      type: 'item',
      url: '/roster',
      icon: icons.PeopleIcon,
      breadcrumbs: false,
    },
  ],
};

export default roster;
