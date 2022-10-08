import DownOutlined from "@ant-design/icons/DownOutlined";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useQueryClient } from "react-query";
import useStoreEvent from "../../../hooks/useStoreEvent";

/**
 * Represents calendar filter menu.
 * @returns calendar filter menu
 */
function CalendarFilters() {
  const filter = useStoreEvent((state) => state.filter);
  const setFilter = useStoreEvent((state) => state.setFilter);

  const [expanded, setExpanded] = useState(true);

  const queryClient = useQueryClient();

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    queryClient.invalidateQueries(["officeHours"]);
  };

  const handleExpandedChange = (event, isExpanded) => {
    setExpanded(isExpanded);
  };

  return (
    <Accordion
      elevation={0}
      expanded={expanded}
      onChange={handleExpandedChange}
    >
      <AccordionSummary expandIcon={<DownOutlined />}>
        <Typography variant="h5" fontWeight={600}>
          Filters
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <RadioGroup value={filter} onChange={handleFilterChange}>
          <FormControlLabel
            value="mine"
            control={<Radio />}
            label="My Events"
          />
          <FormControlLabel
            value="all"
            control={<Radio color="success" />}
            label="All Events"
          />
        </RadioGroup>
      </AccordionDetails>
    </Accordion>
  );
}

export default CalendarFilters;
