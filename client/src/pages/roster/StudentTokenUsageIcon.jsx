import NiceModal from "@ebay/nice-modal-react";
import { GridActionsCellItem } from "@mui/x-data-grid";
import DollarOutlined from "@ant-design/icons/DollarOutlined";
import useStoreLayout from "../../hooks/useStoreLayout";
import useStoreCourse from "../../hooks/useStoreCourse";
import { Button } from "@mui/material";

function StudentTokenUsageIcon(props) {
  const { params, isStaff, index } = props;
  const courseType = useStoreLayout((state) => state.courseType);
  const course = useStoreCourse((state) => state.course);

  return (
    <>
      <Button
        onClick={() => {
          NiceModal.show("student-token-usage", {
            params: params,
            isStaff: isStaff,
          });
        }}
      >
        <DollarOutlined />
        Student Token Usage
      </Button>
    </>
  );
}

export default StudentTokenUsageIcon;
