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
