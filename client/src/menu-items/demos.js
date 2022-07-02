import { ChromeOutlined, QuestionOutlined } from "@ant-design/icons";

const icons = {
  ChromeOutlined,
  QuestionOutlined,
};

export const demos = {
  id: "demos",
  title: "Demo Pages",
  type: "group",
  children: [
    {
      id: "sample-page",
      title: "Sample Page",
      type: "item",
      url: "/sample-page",
      icon: icons.ChromeOutlined,
    },
    {
      id: "react-query",
      title: "React Query",
      type: "item",
      url: "/react-query",
      icon: icons.ChromeOutlined,
    },
  ],
};
