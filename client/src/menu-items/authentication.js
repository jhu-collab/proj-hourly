import LoginOutlined from "@ant-design/icons/LoginOutlined";
import ProfileOutlined from "@ant-design/icons/ProfileOutlined";

const icons = {
  LoginOutlined,
  ProfileOutlined,
};

export const authentication = {
  id: "authentication",
  title: "Authentication",
  type: "group",
  children: [
    {
      id: "login",
      title: "Login",
      type: "item",
      url: "/login",
      icon: icons.LoginOutlined,
      target: true,
    },
    {
      id: "register",
      title: "Register",
      type: "item",
      url: "/register",
      icon: icons.ProfileOutlined,
      target: true,
    },
  ],
};
