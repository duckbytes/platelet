import React, { useEffect, useRef, useState } from "react";
import Typography from "@mui/material/Typography";
import LabelItemPair from "../../../components/LabelItemPair";
import PrioritySelect from "./PrioritySelect";
import PropTypes from "prop-types";
import makeStyles from "@mui/styles/makeStyles";
import TimePicker from "./TimePicker";
import { Divider, Paper, Skeleton, Stack } from "@mui/material";
import { dialogCardStyles } from "../styles/DialogCompactStyles";
import { DataStore } from "aws-amplify";
import * as models from "../../../models";
import { useDispatch, useSelector } from "react-redux";
import { displayErrorNotification } from "../../../redux/notifications/NotificationsActions";
import { dataStoreModelSyncedStatusSelector } from "../../../redux/Selectors";
import GetError from "../../../ErrorComponents/GetError";
import { saveTaskTimeWithKey } from "../utilities";
import RequesterContact from "./RequesterContact";

const useStyles = makeStyles({
    requesterContact: {
        paddingLeft: "20px",
    },
    priority: {
        paddingLeft: "20px",
    },
});

function TaskDetailsPanel(props) {
    const cardClasses = dialogCardStyles();
    const [state, setState] = useState({
        reference: null,
        timeOfCall: null,
        timePickedUp: null,
        timeDroppedOff: null,
        priority: null,
        riderResponsibility: null,
        id: null,
        requesterContact: {
            name: null,
            telephoneNumber: null,
        },
    });
    const [isFetching, setIsFetching] = useState(true);
    const [errorState, setErrorState] = useState(null);
    const taskObserver = useRef({ unsubscribe: () => {} });
    const dispatch = useDispatch();
    const classes = useStyles();

    const taskModelsSynced = useSelector(
        dataStoreModelSyncedStatusSelector
    ).Task;

    const errorMessage = "Sorry, something went wrong";

    async function getTask() {
        try {
            const task = await DataStore.query(models.Task, props.taskId);
            if (!task) throw new Error("Task not found");
            setState(task);
            setIsFetching(false);
            taskObserver.current.unsubscribe();
            taskObserver.current = DataStore.observe(
                models.Task,
                props.taskId
            ).subscribe(async (observeResult) => {
                const taskData = observeResult.element;
                if (["INSERT", "UPDATE"].includes(observeResult.opType)) {
                    setState(taskData);
                } else if (observeResult.opType === "DELETE") {
                    setErrorState(new Error("Task was deleted"));
                }
            });
        } catch (error) {
            console.log(error);
            setErrorState(error);
            setIsFetching(false);
        }
    }
    useEffect(() => getTask(), [props.taskId, taskModelsSynced]);
    useEffect(() => () => taskObserver.current.unsubscribe(), []);

    async function setTimeWithKey(key, value) {
        try {
            saveTaskTimeWithKey(key, value, props.taskId);
            setState((prevState) => ({
                ...prevState,
                [key]: value.toISOString(),
            }));
        } catch (error) {
            console.log(error);
            dispatch(displayErrorNotification(errorMessage));
        }
    }

    function onChangeTimeOfCall(value) {
        //check value is a Date object
        if (value && value instanceof Date) {
            setTimeWithKey("timeOfCall", value);
        }
    }

    function onSelectPriority(priority) {
        props.onSelectPriority(priority);
    }

    if (errorState) {
        return <GetError />;
    } else if (isFetching) {
        return (
            <Paper className={cardClasses.root}>
                <Skeleton variant="rectangular" width="100%" height={200} />
            </Paper>
        );
    } else {
        return (
            <Paper className={cardClasses.root}>
                <Stack direction={"column"} spacing={1}>
                    {state.reference && (
                        <LabelItemPair label={"Reference"}>
                            <Typography>{state.reference}</Typography>
                        </LabelItemPair>
                    )}
                    <LabelItemPair label={"Time of call"}>
                        <TimePicker
                            onChange={onChangeTimeOfCall}
                            disableClear={true}
                            time={state.timeOfCall}
                        />
                    </LabelItemPair>
                    <Divider />
                    <RequesterContact
                        onChange={(value) =>
                            props.onChangeRequesterContact(value)
                        }
                        telephoneNumber={
                            state.requesterContact
                                ? state.requesterContact.telephoneNumber
                                : null
                        }
                        name={
                            state.requesterContact
                                ? state.requesterContact.name
                                : null
                        }
                    />
                    <Divider />
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Typography>Priority:</Typography>
                        <PrioritySelect
                            onSelect={onSelectPriority}
                            priority={state.priority}
                        />
                    </Stack>
                    {state.riderResponsibility && (
                        <>
                            <Divider />
                            <LabelItemPair label={"Responsibility"}>
                                <Typography>
                                    {state.riderResponsibility}
                                </Typography>
                            </LabelItemPair>
                        </>
                    )}
                </Stack>
            </Paper>
        );
    }
}

TaskDetailsPanel.propTypes = {
    taskId: PropTypes.string.isRequired,
};

export default TaskDetailsPanel;
