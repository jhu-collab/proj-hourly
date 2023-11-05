import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Divider from "@mui/material/Divider";
import useStoreLayout from "../../hooks/useStoreLayout";

/**
 * Represents a MUI Tabs component that allows users to
 * select between upcoming, ongoing, or past registrations.
 * @returns Returns a tabs component to filter registrations.
 */
function RegistrationTabs() {
  const registrationTab = useStoreLayout((state) => state.registrationTab);
  const setRegistrationTab = useStoreLayout(
    (state) => state.setRegistrationTab
  );

  const courseType = useStoreLayout((state) => state.courseType);

  const handleChange = (event, newValue) => {
    setRegistrationTab(newValue);
  };
  return (
    <Tabs
      value={registrationTab}
      onChange={handleChange}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      sx={{
        "& .MuiTabScrollButton-root": {
          color: "primary.main",
        },
      }}
    >
      <Tab data-cy="upcoming-registrations-tab" label="Upcoming" />
      <Tab data-cy="ongoing-registrations-tab" label="Ongoing" />
      <Tab data-cy="past-registrations-tab" label="Past" />
      {(courseType === "Staff" || courseType === "Instructor") && (
        <Divider
          orientation="vertical"
          sx={{ height: 30, alignSelf: "center", marginX: 3 }}
        />
      )}
      {(courseType === "Staff" || courseType === "Instructor") && (
        <Tab data-cy="registration-types-tab" label="Registration Types" />
      )}
    </Tabs>
  );
}

export default RegistrationTabs;
