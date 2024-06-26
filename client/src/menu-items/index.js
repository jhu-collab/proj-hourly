import { admin } from "./admin";
import { course } from "./course";
import { dashboard } from "./dashboard";

export const menuItems = (currentCourse, courseType, isAdmin) => {
  const myItems = [dashboard];

  Boolean(currentCourse) && myItems.push(course(currentCourse, courseType));

  isAdmin && myItems.push(admin);

  return {
    items: myItems,
  };
};
