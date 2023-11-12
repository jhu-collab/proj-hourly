import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useForm } from "react-hook-form";
import Form from "../../components/form-ui/Form";
import Loader from "../../components/Loader";
import useStoreCourse from "../../hooks/useStoreCourse";
import useMutationPauseCourse from "../../hooks/useMutationPauseCourse";
import { useState } from "react";




/**
 * Component that represents the form that is used to create a lecture.
 * @returns A component representing the LectureEvent form.
 */

function CoursePauseForm() {

    const course = useStoreCourse((state) => state.course);
    const [isPaused, setIsPaused] = useState(course.isPaused);


    const { control, handleSubmit } = useForm({
        defaultValues: {
            isPaused: course.isPaused,
        },
    });

    const { mutate, isLoading } = useMutationPauseCourse();


    const onSubmit = () => {
        setIsPaused(!isPaused);

        mutate();

    };

    return (
        <>
            <Form onSubmit={handleSubmit(onSubmit)}>

                <Stack direction="column" alignItems="center" spacing={3}>
                    <Stack direction="row" spacing={3} alignItems="center"></Stack>
                    <Button
                        data-cy="pause-course-submit"
                        type="submit"
                        variant="contained"
                        disabled={isLoading}
                        fullWidth
                    >

                        {isPaused ? "Unpause" : "Pause"}
                    </Button>
                </Stack>
            </Form>
            {isLoading && <Loader />}
        </>
    );

}

export default CoursePauseForm;