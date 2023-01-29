import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import MainCard from "../../components/MainCard";
import { Typography } from "@mui/material";

function AuthCard({ children, ...other }) {
  return (
    <>
      <MainCard
        sx={{
          width: { xs: 400, lg: 634 },
          margin: 1.5,
          "& > *": {
            flexGrow: 1,
            flexBasis: "50%",
          },
        }}
        content={false}
        {...other}
        border={false}
        borderRadius="20px"
        boxShadow
        shadow={() => "inset 0px 0px 10px 3px rgba(0, 0, 0, 0.1)"}
      >
        <Box
          sx={{
            paddingX: { xs: 2, sm: 3, md: 5.5 },
            paddingY: { xs: 2, sm: 3, md: 4 },
          }}
        >
          {children}
        </Box>
      </MainCard>
    </>
  );
}

export default AuthCard;

AuthCard.propTypes = {
  children: PropTypes.node,
};
