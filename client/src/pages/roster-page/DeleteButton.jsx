import { useState, useCallback } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import * as React from 'react';
import Popup from '../../components/Popup';
import Button from '../../components/control/Button';
import Box from '@mui/material/Box';

function DeleteButton(props) {
    const {courseId, setRows, token, params, isButtonDisabled} = props;

    const [open, setOpen] = useState(false);

    const handleOpen = () => {
       setOpen(true);
       console.log(open);
    };
    
    const handleClose = () => {
    //need to fetch users here
        setOpen(false);
      };

    const deleteUser = useCallback(
        (id) => () => {
          setRows((prevRows) => prevRows.filter((row) => row.id !== id));
        },
        [courseId, token],
    );

      function JoinCourse({ open, handlePopupToggle, id }) {
        return (
            <Popup open={open} onClose={handlePopupToggle} title="Do you want to delete the user?">
                <Box  textAlign="center">
                    <Button
                    text="Delete User"
                    margin="0px"
                    fontSize="17px"
                    onClick={deleteUser(id)}
                    />
                </Box>
          </Popup>
        );
      }

    return (
        <>
            <GridActionsCellItem
            icon={<DeleteIcon />}
            onClick={handleOpen}
            disabled={isButtonDisabled(params.id)}
            label="Delete"
            />  
            <JoinCourse open = {open} onClose = {handleClose} id = {params.id}/>
        </>
);
}

export default DeleteButton;