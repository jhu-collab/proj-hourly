import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import IconButton from "@mui/material/IconButton";
import { confirmDialog } from "../../../components/ConfirmPopup";
import Loader from "../../../components/Loader";
import useStoreEvent from "../../../hooks/useStoreEvent";
/**
 * Represents the Trash IconButton on the EventPopover component
 * and the associated ConfirmPopup component.
 * @returns Delete action button and confirmation popup.
 */
function CourseEventDeleteAction() {
  const id = useStoreEvent((state) => state.id);
  const date = useStoreEvent((state) => state.start);

  //const { mutate, isLoading } = useMutationCancelEvent(deleteType); // TODO: CHANGE THIS

  return (
    <>
      <IconButton
        sx={{ fontSize: "20px" }}
        onClick={() => {
          confirmDialog("Do you really want to delete this lecture event?", () =>
            /*recurring && deleteType === "this"
              ? mutate({
                  officeHourId: id,
                  date: DateTime.fromJSDate(start, { zone: "utc" }).toFormat(
                    "MM-dd-yyyy"
                  ),
                })
              : mutate({ officeHourId: id })*/
              console.log(msg)
          );
        }}
      >
        <DeleteOutlined />
      </IconButton>
    </>
  );
}

// TODO: ADD IS LOADING AND LOADER

export default CourseEventDeleteAction;