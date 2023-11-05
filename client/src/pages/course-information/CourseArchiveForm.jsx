import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useForm } from "react-hook-form";
import Form from "../../components/form-ui/Form";
import Loader from "../../components/Loader";
import useStoreCourse from "../../hooks/useStoreCourse";
import useMutationArchiveCourse from "../../hooks/useMutationArchiveCourse";
import { useState } from "react";




/**
 * Component that represents the form that is used to create a lecture.
 * @returns A component representing the LectureEvent form.
 */

function CourseArchiveForm() {

    const course = useStoreCourse((state) => state.course);
    const [isArchived, setIsArchived] = useState(course.isArchived);


    const { control, handleSubmit } = useForm({
        defaultValues: {
            isArchived: course.isArchived,
        },
    });

    const { mutate, isLoading } = useMutationArchiveCourse();


    const onSubmit = () => {
        setIsArchived(!isArchived);

        mutate();

    };

    return (
        <>
            <Form onSubmit={handleSubmit(onSubmit)}>

                <Stack direction="column" alignItems="center" spacing={3}>
                    <Stack direction="row" spacing={3} alignItems="center"></Stack>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isLoading}
                        fullWidth
                    >

                        {isArchived ? "Unarchive" : "Archive"}
                    </Button>
                </Stack>
            </Form>
            {isLoading && <Loader />}
        </>
    );

}

export default CourseArchiveForm;