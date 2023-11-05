import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";
import useStoreCourse from "./useStoreCourse";
import Debug from "debug";
import { toast } from "react-toastify";

const debug = new Debug(`hourly:hooks:useMutationEditCourseCalendarEvent.jsx`);

function useMutationEditRegWindow(newStart, newEnd) {
    const { token } = useStoreToken();
    const queryClient = useQueryClient();

    const course = useStoreCourse((state) => state.course);



    const editRegWindow = async (updatedRegWindow) => {
        try {
            debug("Sending updated registration window to the backend...");
            const endpoint = `${BASE_URL}/api/course/${course.id}/registrationConstraints`;
            const res = await axios.post(endpoint, updatedRegWindow, getConfig(token));
            debug("Successful! Returning result data...");
            console.log(res.data)
            return res.data;

        } catch (err) {
            throw err;
        }
    };

    const mutation = useMutation(editRegWindow, {
        onSuccess: (data) => {
            const updatedRegWindow = data.course;
            queryClient.invalidateQueries(["courses"]);
            queryClient.invalidateQueries(["courseEvents"]);
            queryClient.invalidateQueries(["officeHour"]);
            queryClient.invalidateQueries(["registrationStatus"]);
            queryClient.invalidateQueries(["allRegistrations"]);
            queryClient.invalidateQueries(["courseUsers", course.id]);
            queryClient.invalidateQueries(["myRole"]);
            queryClient.invalidateQueries(["officeHours"]);
            queryClient.invalidateQueries(["registrationTypes"]);
            queryClient.invalidateQueries(["tokens"]);
            queryClient.invalidateQueries(["tokenCounts"]);
            queryClient.invalidateQueries(["topics"]);
            queryClient.invalidateQueries(["topicCounts"]);
            queryClient.invalidateQueries(["studentRegistrationCounts"]);
            queryClient.invalidateQueries(["topicCounts"]);
            queryClient.invalidateQueries(["studentRegistrationCounts"]);
            queryClient.invalidateQueries(["courseUsers"]);
            queryClient.invalidateQueries(["remainingTokensPerStudent"]);
            queryClient.invalidateQueries(["remainingTokens"]);

            toast.success(
                `Successfully changed ${updatedRegWindow.title}'s registration constraint for start: ${updatedRegWindow.startRegConstraint} and end: ${updatedRegWindow.endRegConstraint}`
            );


        },
        onError: (error) => {
            debug({ error });
            errorToast(error);
        },
    });

    return {
        ...mutation,
    };
}

export default useMutationEditRegWindow;
