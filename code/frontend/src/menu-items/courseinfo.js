import InfoIcon from '@mui/icons-material/Info';
const icons = { InfoIcon };
const courseinfo = {
  id: 'courseingo',
  type: 'group',
  children: [
    {
      id: 'courseinfo',
      title: 'Course Information',
      type: 'item',
      url: '/courseinfo',
      icon: icons.InfoIcon,
      breadcrumbs: false,
    },
  ],
};

export default courseinfo;
