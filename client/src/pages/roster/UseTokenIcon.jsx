import NiceModal from "@ebay/nice-modal-react";
import { GridActionsCellItem } from "@mui/x-data-grid";
import DollarOutlined from "@ant-design/icons/DollarOutlined";
import useStoreLayout from "../../hooks/useStoreLayout";
import useStoreCourse from "../../hooks/useStoreCourse";

function UseTokenIcon(props) {
  const { params, isStaff, index } = props;
  const courseType = useStoreLayout((state) => state.courseType);
  const course = useStoreCourse((state) => state.course);
  console.log(course)

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
        disabled={courseType === "Student" || !course.usesTokens || index !== 0}
        label="Change Role"
        size="large"
      />
    </>
  );
}

export default UseTokenIcon;
