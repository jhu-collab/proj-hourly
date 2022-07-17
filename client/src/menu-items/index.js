import { authentication } from "./authentication";
import { course } from "./course";
import { dashboard } from "./dashboard";
import { demos } from "./demos";

export const menuItems = (currentCourse) => {
  if (currentCourse) {
    return {
      items: [dashboard, course(currentCourse), authentication, demos],
    };
  } else {
    return {
      items: [dashboard, authentication, demos],
    };
  }
};
