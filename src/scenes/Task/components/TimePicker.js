import React from "react";
import {useState} from "react";
import PropTypes from "prop-types"
import Typography from "@material-ui/core/Typography";
import Moment from "react-moment";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import CancelIcon from '@material-ui/icons/Cancel';
import IconButton from "@material-ui/core/IconButton";
import {Tooltip} from "@material-ui/core";
import EditIcon from '@material-ui/icons/Edit';
import {DateTimePicker} from "@material-ui/pickers";
import {showHide} from "../../../styles/common";

function TimePicker(props) {
    const [editMode, setEditMode] = useState(false);
    const {show, hide} = showHide();

    function onButtonClick() {
        const timeNow = new Date().toISOString();
        props.onChange(timeNow);
    }
    function onClear() {
        props.onChange(null);
    }
    function toggleEditMode() {
        setEditMode(!editMode);
    }
    function onChange(value) {
        props.onChange(value.toISOString());
        setEditMode(false);
    }

    if (props.time) {
        if (editMode) {
            return (
                <Grid container direction={"row"} justify={"flex-end"} alignItems={"center"}>
                    <Grid item>
                <DateTimePicker
                    value={props.time}
                    onChange={onChange}
                    helperText="Set the date and time"
                />
                <Grid item>
                    <Tooltip title={"Cancel"}>
                        <IconButton
                            disabled={props.disabled} onClick={toggleEditMode}>
                            <CancelIcon/>
                        </IconButton>
                    </Tooltip>
                </Grid>
                    </Grid>
                </Grid>
            )
        } else {
            return (
                <Grid container direction={"row"} justify={"flex-end"} alignItems={"center"}>
                    <Grid item>
                        <Typography>
                            <Moment calendar>{props.time}</Moment>
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Tooltip title={"Edit"}>
                            <IconButton
                                edge={"end"}
                                disabled={props.disabled}
                                onClick={toggleEditMode}>
                                <EditIcon/>
                            </IconButton>
                        </Tooltip>
                    </Grid>
                    <Grid className={props.disableClear ? hide : show} item>
                        <Tooltip title={"Clear"}>
                            <IconButton
                                edge={"end"}
                                disabled={props.disabled}
                                onClick={onClear}>
                                <CancelIcon/>
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Grid>
            )
        }
    } else {
        return (
            <Button disabled={props.disabled} onClick={onButtonClick}>
                {props.label}
            </Button>
        )
    }
}

TimePicker.propTypes = {
    time: PropTypes.string,
    onChange: PropTypes.func,
    label: PropTypes.string,
    disabled: PropTypes.bool,
    disableClear: PropTypes.bool
};
TimePicker.defaultProps = {
    time: "",
    onChange: () => {
    },
    label: "Set time",
    disabled: false,
    disableClear: false
};

export default TimePicker;
