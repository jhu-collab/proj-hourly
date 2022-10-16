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

  // TODO: For now, I am using the course type to decide whether
  // a user has access to the Registration Types tab. Later,
  // we should only permit instructors access to this tab. Or, rather,
  // TAs can view registration types but they can't perform CRUD operations.
  // TLDR: Need a route that returns role of user
  const courseType = useStoreLayout((state) => state.courseType);

  const handleChange = (event, newValue) => {
    setRegistrationTab(newValue);
  };
  return (
    <Tabs value={registrationTab} onChange={handleChange}>
      <Tab label="Upcoming" />
      <Tab label="Ongoing" />
      <Tab label="Past" />
      {courseType == "staff" && (
        <Divider
          orientation="vertical"
          sx={{ height: 30, alignSelf: "center", marginX: 3 }}
        />
      )}
      {courseType == "staff" && <Tab label="Registration Types" />}
    </Tabs>
  );
}

export default RegistrationTabs;
