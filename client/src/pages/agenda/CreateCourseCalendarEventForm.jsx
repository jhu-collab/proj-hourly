import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useForm } from "react-hook-form";
import AnimateButton from "../../components/AnimateButton";
import Form from "../../components/form-ui/Form";
import FormInputText from "../../components/form-ui/FormInputText";
import FormCheckbox from "../../components/form-ui/FormCheckbox";
import useStoreCourse from "../../hooks/useStoreCourse";
import useMutationCreateCourseCalendarEvent from "../../hooks/useMutationCreateCourseCalendarEvent";
import NiceModal from "@ebay/nice-modal-react";
import { useModal } from "@ebay/nice-modal-react";
import Popup from "../../components/Popup";
import { createIndividualCourseEventSchema } from "../../utils/validators";

/**
 * Component that represents the form that is used to create a
 * course calendar event.
 * @returns A component representing the Create Course Calendar Event form.
 */
const CreateCourseCalendarEventForm = NiceModal.create(() => {  
  const { mutate } = useMutationCreateCourseCalendarEvent("one");
  const course = useStoreCourse((state) => state.course);
  const modal = useModal();

  const { control, handleSubmit } = useForm({
    defaultValues: {
      title: course.title + " Lecture",
      date: "",
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
      date: date.toISOString(),
      location: data.location,
      isRemote: data.isRemote,
      additionalInfo: data.resources,
    });
  };

  return (
    <Popup 
    modal={modal}
    title="Create Course Calendar Event"
    >
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2} alignItems="center">
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
          <FormInputText name="location" control={control} label="Location" />
          <FormCheckbox name="isRemote" control={control} label="Remote" />
          <FormInputText
            name="resources"
            control={control}
            label="Additional Resources"
            multiline
            rows={4}
          />
          <AnimateButton>
            <Button type="submit" variant="contained" size="large">
              Create
            </Button>
          </AnimateButton>
        </Stack>
      </Form>
    </Popup>
  );
});

export default CreateCourseCalendarEventForm;
