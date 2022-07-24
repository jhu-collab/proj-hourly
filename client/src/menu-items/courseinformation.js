import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined";
const icons = { InfoCircleOutlined };
const courseinformation = {
  id: 'courseinformation',
  type: 'group',
  children: [
    {
      id: 'courseinformation',
      title: 'Course Details',
      type: 'item',
      url: '/courseinformation',
      icon: icons.InfoCircleOutlined,
      breadcrumbs: false,
    },
  ],
};

export default courseinformation;