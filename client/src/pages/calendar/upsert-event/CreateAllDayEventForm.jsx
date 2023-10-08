// new:
import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useForm } from "react-hook-form";
import AnimateButton from "../../../components/AnimateButton";
import Form from "../../../components/form-ui/Form";
import FormInputText from "../../../components/form-ui/FormInputText";
import FormCheckbox from "../../../components/form-ui/FormCheckbox";
import useStoreCourse from "../../../hooks/useStoreCourse";
import useMutationCreateCourseCalendarEvent from "../../../hooks/useMutationCreateCourseCalendarEvent";
import { createIndividualCourseEventSchema } from "../../../utils/validators";
import { DateTime } from "luxon";
import useStoreEvent from "../../../hooks/useStoreEvent";



/**
 * Component that represents the form that is used to create a
 * course calendar event.
 * @returns A component representing the Create Course Calendar Event form.
 */
// const CreateAllDayEventForm = NiceModal.create(() => {
function CreateAllDayEventForm() {
    const { mutate } = useMutationCreateCourseCalendarEvent("one");
    const course = useStoreCourse((state) => state.course);

    const start = useStoreEvent((state) => state.start);

    const { control, handleSubmit } = useForm({
        defaultValues: {
            title: course.title + " Lecture",
            date: start ? DateTime.fromJSDate(start).toFormat("yyyy-MM-dd") : "",
            location: "",
            isRemote: false,
            resources: "",
        },
        resolver: yupResolver(createIndividualCourseEventSchema),
    });

    const onSubmit = (data) => {
        const date = new Date(data.date);

        mutate({
            courseId: course.id,
            title: data.title,
            date: date.toISOString().split('T')[0],
            location: data.location,
            isRemote: data.isRemote,
            additionalInfo: data.resources,
        });
    };


    return (
        <>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Stack alignItems="center" spacing={2}>
                    <FormInputText
                        name="title"
                        control={control}
                        label="Agenda Description"
                    />

                    <FormInputText
                        name="date"
                        control={control}
                        label={"Date"}
                        type="date"
                        InputLabelProps={{ shrink: true }}
                    />
                    <FormInputText
                        name="location"
                        control={control}
                        label="Location"
                    />
                    <FormCheckbox
                        name="isRemote"
                        control={control} label="Remote"
                    />
                    <FormInputText
                        name="resources"
                        control={control}
                        label="Additional Resources"
                        multiline
                        rows={4}
                    />
                    <AnimateButton>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                        >
                            Create
                        </Button>
                    </AnimateButton>

                </Stack>

            </Form >
        </>
    );
}

export default CreateAllDayEventForm;
