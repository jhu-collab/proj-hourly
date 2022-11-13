import CalendarOutlined from "@ant-design/icons/CalendarOutlined";
import TeamOutlined from "@ant-design/icons/TeamOutlined";
import SafetyCertificateOutlined from "@ant-design/icons/SafetyCertificateOutlined";
import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined";
import BulbOutlined from "@ant-design/icons/BulbOutlined";
import BarChartOutlined from "@ant-design/icons/BarChartOutlined";
import useStoreLayout from "../hooks/useStoreLayout";
const icons = {
  CalendarOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  InfoCircleOutlined,
  BulbOutlined,
  BarChartOutlined,
};

export const course = (currentCourse) => {
  const courseType = useStoreLayout.getState().courseType;

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

  if (courseType === "staff") {
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
    children.push({
      id: "statistics",
      title: "statistics",
      type: "item",
      url: "/statistics",
      icon: icons.BarChartOutlined,
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
