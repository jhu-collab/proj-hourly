import { admin } from "./admin";
import { course } from "./course";
import { dashboard } from "./dashboard";

export const menuItems = (currentCourse) => {
  if (currentCourse) {
    return {
      items: [dashboard, course(currentCourse), admin],
    };
  } else {
    return {
      items: [dashboard, admin],
    };
  }
};
