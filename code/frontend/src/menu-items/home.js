// assets
import { IconHome } from '@tabler/icons';

// constant
const icons = { IconHome };

// ==============================|| HOME MENU ITEM ||============================== //

const home = {
  id: 'home',
  type: 'group',
  children: [
    {
      id: 'home',
      title: 'Home',
      type: 'item',
      url: '/',
      icon: icons.IconHome,
      breadcrumbs: false,
    },
  ],
};

export default home;
