import NiceModal from "@ebay/nice-modal-react";
import { GridActionsCellItem } from "@mui/x-data-grid";
import SettingOutlined from "@ant-design/icons/SettingOutlined";
import useStoreLayout from "../../hooks/useStoreLayout";
import useStoreCourse from "../../hooks/useStoreCourse";

function StudentTokenUsageIcon(props) {
  const { params, isStaff, index } = props;
  const courseType = useStoreLayout((state) => state.courseType);
  const course = useStoreCourse((state) => state.course);

  return (
    <>
      <GridActionsCellItem
        icon={<SettingOutlined />}
        onClick={() => {
          NiceModal.show("student-token-usage", {
            params: params,
            isStaff: isStaff,
          });
        }}
        disabled={courseType === "Student" || !course.usesTokens || index !== 0}
        label="Student Token Usage"
        size="large"
      />
    </>
  );
}

export default StudentTokenUsageIcon;
