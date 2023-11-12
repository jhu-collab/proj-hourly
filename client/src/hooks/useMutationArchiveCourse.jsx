import axios from "axios";
import { useMutation, useQueryClient } from "react-query";
import { errorToast } from "../utils/toasts";
import { getConfig } from "./helper";
import { toast } from "react-toastify";
import { BASE_URL } from "../services/common";
import useStoreToken from "./useStoreToken";
import useStoreCourse from "./useStoreCourse";
import Debug from "debug";
import NiceModal from "@ebay/nice-modal-react";

const debug = new Debug(`hourly:hooks:useMutationArchiveCourse.jsx`);

function useMutationArchiveCourse() {

    const { token } = useStoreToken();
    const queryClient = useQueryClient();

    const course = useStoreCourse((state) => state.course);
    const setCourse = useStoreCourse((state) => state.setCourse);


    const changeIsArchived = async (data) => {
        try {
            debug("Sending archiveCourse to the backend...");
            const endpoint = `${BASE_URL}/api/course/${course.id}/archiveCourse`;
            const res = await axios.post(
                endpoint,
                {},
                getConfig(token)
            );
            debug("Successful! Returning result data...");
            return res.data;
        } catch (err) {
            throw err;
        }
    };


    const mutation = useMutation(changeIsArchived, {
        onSuccess: (data) => {
            const updatedCourse = data.courseUpdate;
            queryClient.invalidateQueries(["courses"]);
            queryClient.invalidateQueries(["courseEvents"]);
            queryClient.invalidateQueries(["officeHour"]);
            setCourse(updatedCourse);
            toast.success(
                `Successfully changed ${course.title}'s isArchived to ${updatedCourse.isArchived} `
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

export default useMutationArchiveCourse;