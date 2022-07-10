import Navigation from "./Navigation";
import SimpleBar from "../../components/SimpleBar";

function DrawerContent() {
  return (
    <SimpleBar
      sx={{
        "& .simplebar-content": {
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Navigation />
    </SimpleBar>
  );
}

export default DrawerContent;
