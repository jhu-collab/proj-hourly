import CalendarOutlined from "@ant-design/icons/CalendarOutlined";
import TeamOutlined from "@ant-design/icons/TeamOutlined";
import SafetyCertificateOutlined from "@ant-design/icons/SafetyCertificateOutlined";
import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined";
import BulbOutlined from "@ant-design/icons/BulbOutlined";
import BarChartOutlined from "@ant-design/icons/BarChartOutlined";
import DollarOutlined from "@ant-design/icons/DollarOutlined";
const icons = {
  CalendarOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  InfoCircleOutlined,
  BulbOutlined,
  BarChartOutlined,
  DollarOutlined,
};

export const course = (currentCourse, courseType) => {
  const children = [];

  children.push({
    id: "calendar",
    title: "calendar",
    type: "item",
    url: "/calendar",
    icon: icons.CalendarOutlined,
    breadcrumbs: false,
  });

  children.push({
    id: "registrations",
    title: "registrations",
    type: "item",
    url: "/registrations",
    icon: icons.SafetyCertificateOutlined,
    breadcrumbs: false,
  });
  children.push({
    id: "tokens",
    title: "course tokens",
    type: "item",
    url: "/tokens",
    icon: icons.DollarOutlined,
    breadcrumbs: false,
  });

  if (courseType === "Staff" || courseType === "Instructor") {
    children.push({
      id: "roster",
      title: "roster",
      type: "item",
      url: "/roster",
      icon: icons.TeamOutlined,
      breadcrumbs: false,
    });
    children.push({
      id: "topics",
      title: "topics",
      type: "item",
      url: "/topics",
      icon: icons.BulbOutlined,
      breadcrumbs: false,
    });
  }

  children.push({
    id: "courseinformation",
    title: "course details",
    type: "item",
    url: "/courseinformation",
    icon: icons.InfoCircleOutlined,
    breadcrumbs: false,
  });

  return {
    id: "group-course",
    title: currentCourse.title,
    type: "group",
    children: children,
  };
};
