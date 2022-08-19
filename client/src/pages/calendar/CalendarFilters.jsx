import DownOutlined from "@ant-design/icons/DownOutlined";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { useState } from "react";

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
