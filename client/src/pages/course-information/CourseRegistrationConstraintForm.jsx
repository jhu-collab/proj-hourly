import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Form from "../../components/form-ui/Form";
import FormInputNumber from "../../components/form-ui/FormInputNumber";
import useStoreCourse from "../../hooks/useStoreCourse";
import { createRegConstraint } from "../../utils/validators";
import { Typography } from "@mui/material";

import useMutationEditRegWindow from "../../hooks/useMutationEditRegWindow";
// import FormInputText from "../../components/form-ui/FormInputText";
// import { useMutation, useQueryClient } from "react-query";
import { useState } from "react";



/**
 * Component that represents the form that is used to change the registration window.
 * @returns A component representing the CourseRegistrationConstraint form.
 */

function CourseRegistrationConstraintForm() {


    const course = useStoreCourse((state) => state.course);
    const [start, setStart] = useState(course.startRegConstraint);
    const [end, setEnd] = useState(course.endRegConstraint);



    const { control, handleSubmit } = useForm({
        defaultValues: {
            start: course.startRegConstraint,
            end: course.endRegConstraint,
        },
        resolver:
            yupResolver(createRegConstraint),
    });


    const { mutate: createMutate } = useMutationEditRegWindow(start, end);

    const onSubmit = (data) => {
        setStart(parseInt(data.start));
        setEnd(parseInt(data.end));
        // course.startRegConstraint = data.start;
        // course.endRegConstraint = data.end;
        createMutate({
            start: parseInt(data.start),
            end: parseInt(data.end)
        });

    };


    return (
        <>

            <Form onSubmit={handleSubmit(onSubmit)}>
                <Stack direction="column" spacing={3}>
                    <Typography variant="h5" fontWeight={400}>
                        Change Course Registration Constraints:
                    </Typography>
                    <Stack alignItems="center" direction="row" sx={{ width: "100%" }} spacing={3}>
                        <FormInputNumber
                            data-cy="create-start-reg-constraint"
                            name="start"
                            control={control}
                            label={"Start Reg"}
                            type="number"
                            InputLabelProps={{ shrink: true }}
                        />
                        <FormInputNumber
                            data-cy="create-end-reg-constraint"
                            name="end"
                            control={control}
                            label={"End Reg"}
                            type="number"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Stack>
                    <Button
                        data-cy="edit-reg-submit"
                        type="submit"
                        variant="contained"
                        // disabled={createIsLoading}
                        fullWidth
                    >
                        Update
                    </Button>
                </Stack>
            </Form>

        </>
    );
}

export default CourseRegistrationConstraintForm;
