import * as React from "react";
import Rating from "@mui/material/Rating";
import Box from "@mui/material/Box";
import StarIcon from "@mui/icons-material/Star";
import useStoreLayout from "../../hooks/useStoreLayout";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Divider from "@mui/material/Divider";

const labels = {
  0.5: "Useless",
  1: "Useless+",
  1.5: "Poor",
  2: "Poor+",
  2.5: "Ok",
  3: "Ok+",
  3.5: "Good",
  4: "Good+",
  4.5: "Excellent",
  5: "Excellent+",
};

function getLabelText(value) {
  return `${value} Star${value !== 1 ? "s" : ""}, ${labels[value]}`;
}

function Feedback({ index }) {
  const registrationTab = useStoreLayout((state) => state.registrationTab);

  const [value, setValue] = React.useState(null);
  const [hover, setHover] = React.useState(-1);

  const noRegistrations = () => {
    return (
      <Alert severity="info" sx={{ mt: 4 }}>
        No Feedback
      </Alert>
    );
  };

  //   if (isLoading && registrationTab === index) {
  //     return (
  //       <Alert severity="warning" sx={{ mt: 2 }}>
  //         Loading Feedback ...
  //       </Alert>
  //     );
  //   }

  //   if (error && registrationTab === index) {
  //     return (
  //       <Alert severity="error" sx={{ mt: 2 }}>
  //         <AlertTitle>Error</AlertTitle>
  //         {"An error has occurred: " + error.message}
  //       </Alert>
  //     );
  //   }

  return (
    <>
      {registrationTab === index && (
        <>
          <Rating
            name="hover-feedback"
            value={value}
            precision={0.5}
            getLabelText={getLabelText}
            onChange={(event, newValue) => {
              setValue(newValue);
            }}
            onChangeActive={(event, newHover) => {
              setHover(newHover);
            }}
            emptyIcon={
              <StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />
            }
            size="large"
          />
          {value !== null && (
            <Box sx={{ ml: 2 }}>{labels[hover !== -1 ? hover : value]}</Box>
          )}
        </>
      )}
    </>
  );
}

export default Feedback;
