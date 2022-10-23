import MainCard from "../../components/MainCard";
import Form from "../../components/form-ui/Form";
import FormInputText from "../../components/form-ui/FormInputText";
import RemoveCourseAction from "./RemoveCourseAction";
import DeleteCourseAction from "./DeleteCourseAction";
import Stack from "@mui/material/Stack";
import useStoreCourse from "../../hooks/useStoreCourse";
import useStoreLayout from "../../hooks/useStoreLayout";
import { useState } from "react";
import AnimateButton from "../../components/AnimateButton";
import { Button } from "@mui/material";
import { useForm } from "react-hook-form";

function CourseInfoPage() {
  const course = useStoreCourse((state) => state.course);
  const courseType = useStoreLayout((state) => state.courseType);
  const [edit, setEdit] = useState(false);

  // TODO: Need to add validation for course details fields and also backend routes/controllers for editing course details

  const { control, handleSubmit } = useForm({
    defaultValues: {
      courseTitle: course.title,
      courseNumber: course.courseNumber,
      courseSemester: course.semester,
      courseYear: course.year,
      courseCode: course.code,
    },
  });

  const onSubmit = (data) => {
    setEdit(false);
  };

  const handleOnClickCancelBtn = (e) => {
    e.preventDefault();
    setEdit(false);
  };

  const handleOnClickEditBtn = (e) => {
    e.preventDefault();
    setEdit(true);
  };

  return (
    <MainCard title="Course Details" sx={{ padding: 3 }} content={false}>
      <Stack spacing={4}>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={4}>
            <FormInputText
              disabled
              name="Course Title"
              control={control}
              label="Course Title"
            />
            <FormInputText
              disabled
              name="Course Number"
              control={control}
              label="Course Number"
            />
            <FormInputText
              disabled
              name="Semester"
              control={control}
              label="Semester"
            />
            <FormInputText
              disabled
              name="Year"
              control={control}
              label="Year"
            />
            <FormInputText
              disabled
              name="Course Code"
              control={control}
              label="Course Code"
            />
            <Stack direction="row" justifyContent="flex-end">
              {edit ? (
                <Stack direction="row" spacing={1}>
                  <AnimateButton>
                    <Button
                      variant="contained"
                      size="large"
                      color="error"
                      onClick={handleOnClickCancelBtn}
                    >
                      Cancel
                    </Button>
                  </AnimateButton>
                  <AnimateButton>
                    <Button variant="contained" size="large" type="submit">
                      Submit
                    </Button>
                  </AnimateButton>
                </Stack>
              ) : (
                <AnimateButton>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleOnClickEditBtn}
                  >
                    Edit
                  </Button>
                </AnimateButton>
              )}
            </Stack>
          </Stack>
        </Form>
        {courseType === "student" && (
          <RemoveCourseAction courseId={course.id} />
        )}
        {courseType === "staff" && <DeleteCourseAction courseId={course.id} />}
      </Stack>
    </MainCard>
  );
}

export default CourseInfoPage;
