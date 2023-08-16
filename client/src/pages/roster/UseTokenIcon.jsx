import NiceModal from "@ebay/nice-modal-react";
import { GridActionsCellItem } from "@mui/x-data-grid";
import DollarOutlined from "@ant-design/icons/DollarOutlined";
import useStoreLayout from "../../hooks/useStoreLayout";

function UseTokenIcon(props) {
  const { params, isStaff, index } = props;
  const courseType = useStoreLayout((state) => state.courseType);

  return (
    <>
      <GridActionsCellItem
        icon={<DollarOutlined />}
        onClick={() => {
          NiceModal.show("use-course-token", {
            params: params,
            isStaff: isStaff,
          });
        }}
        disabled={courseType === "Student" || index !== 0}
        label="Change Role"
        size="large"
      />
    </>
  );
}

export default UseTokenIcon;
