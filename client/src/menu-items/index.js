import { authentication } from "./authentication";
import { course } from "./course";
import { dashboard } from "./dashboard";
import { demos } from "./demos";
import courseinformation from './courseinformation';

export const menuItems = (currentCourse) => {
  if (currentCourse) {
    return {
      items: [dashboard, course(currentCourse), authentication, demos, courseinformation],
    };
  } else {
    return {
      items: [dashboard, authentication, demos],
    };
  }
};
