import UserOutlined from "@ant-design/icons/UserOutlined";
const icons = {
  UserOutlined
};

export const admin = {
    id: "group-admin",
    title: "Admin",
    type: "group",
    children: [
      {
        id: "users",
        title: "Users",
        type: "item",
        url: "/admin/users",
        icon: icons.UserOutlined,
        breadcrumbs: false,
      },
    ],
};

