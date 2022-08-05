import { course } from "./course";
import { dashboard } from "./dashboard";

export const menuItems = (currentCourse) => {
  if (currentCourse) {
    return {
      items: [dashboard, course(currentCourse)],
    };
  } else {
    return {
      items: [dashboard],
    };
  }
};
