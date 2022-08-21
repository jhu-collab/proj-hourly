import DownOutlined from "@ant-design/icons/DownOutlined";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Typography from "@mui/material/Typography";
import { useState } from "react";

/**
 * Represents calendar filter menu.
 * @returns calendar filter menu
 */
function CalendarFilters() {
  const [filter, setFilter] = useState("myEvents");
  const [expanded, setExpanded] = useState(true);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
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
            value="myEvents"
            control={<Radio />}
            label="My Events"
          />
          <FormControlLabel
            value="allEvents"
            control={<Radio color="success" />}
            label="All Events"
          />
        </RadioGroup>
      </AccordionDetails>
    </Accordion>
  );
}

export default CalendarFilters;
