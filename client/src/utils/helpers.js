/**
 * Converts military time to standard time.
 * @param {string} time - a string representing a hh:mm:ss military time
 * @returns a short localized time string.
 */
export function getLocaleTime(time) {
  const [hour, min] = time.split(":");
  const timeObj = new Date();
  timeObj.setHours(hour);
  timeObj.setMinutes(min);
  return timeObj.toLocaleTimeString([], { timeStyle: "short" });
}

/**
 * Javascript Date object will often be one day off if you provide
 * it with the format of yyyy-mm-dd. However, if you pass in
 * yyyy/mm/dd into a the Date constructor, you will get the
 * date in which you expected.
 * @param {*} dateStr - A string in the format of yyyy-mm-dd
 * @returns A string in the format of yyyy/mm/dd
 */
export const getExpectedDate = (dateStr) => {
  return dateStr.replace(/-/g, "/");
};

/**
 * Retrives only the date portion of the Date.toIsoString method.
 * @param {*} dateObj - Java string date object
 * @returns A string in the format of yyyy-mm-dd
 */
export const getIsoDate = (dateObj) => {
  return dateObj.toISOString().split("T")[0];
};
