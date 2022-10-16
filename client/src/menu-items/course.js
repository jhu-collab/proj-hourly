import CalendarOutlined from "@ant-design/icons/CalendarOutlined";
import UsergroupAddOutlined from "@ant-design/icons/UsergroupAddOutlined";
import ScheduleOutlined from "@ant-design/icons/ScheduleOutlined";
import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined";
import useStoreLayout from "../hooks/useStoreLayout";
const icons = {
  CalendarOutlined,
  UsergroupAddOutlined,
  ScheduleOutlined,
  InfoCircleOutlined,
};

export const course = (currentCourse) => {
  const courseType = useStoreLayout.getState().courseType;

  const children = [];

  children.push({
    id: "calendar",
    title: "Calendar",
    type: "item",
    url: "/calendar",
    icon: icons.CalendarOutlined,
    breadcrumbs: false,
  });

  children.push({
    id: "registrations",
    title: "Registrations",
    type: "item",
    url: "/registrations",
    icon: icons.ScheduleOutlined,
    breadcrumbs: false,
  });

  if (courseType === "staff") {
    children.push({
      id: "roster",
      title: "Roster",
      type: "item",
      url: "/roster",
      icon: icons.UsergroupAddOutlined,
      breadcrumbs: false,
    });
  }

  children.push({
    id: "courseinformation",
    title: "Course Details",
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
