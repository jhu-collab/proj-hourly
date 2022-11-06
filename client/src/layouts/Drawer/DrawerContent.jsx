import Navigation from "./Navigation";
import SimpleBar from "../../components/SimpleBar";

function DrawerContent() {
  return (
    <SimpleBar
      sx={{
        padding: 1,
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
