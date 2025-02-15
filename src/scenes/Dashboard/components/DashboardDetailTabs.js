import React from "react";
import * as selectionModeActions from "../../../redux/selectionMode/selectionModeActions";
import AddIcon from "@mui/icons-material/Add";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import { useDispatch, useSelector } from "react-redux";
import IconButton from "@mui/material/IconButton";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { saveDashboardRoleMode } from "../../../utilities";
import Typography from "@mui/material/Typography";
import { showHide } from "../../../styles/common";
import {
    setDashboardFilteredUser,
    setDashboardTabIndex,
    setGuidedSetupOpen,
    setRoleView,
} from "../../../redux/Actions";
import TaskFilterTextField from "../../../components/TaskFilterTextfield";
import { Chip, Fab, Hidden, Stack } from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";
import {
    dashboardFilteredUserSelector,
    dashboardFilterTermSelector,
    dashboardTabIndexSelector,
    getWhoami,
    guidedSetupOpenSelector,
} from "../../../redux/Selectors";
import { userRoles } from "../../../apiConsts";
import { clearDashboardFilter } from "../../../redux/dashboardFilter/DashboardFilterActions";

export function TabPanel(props) {
    const { children, index, ...other } = props;
    const value = parseInt(props.value);

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            data-cy={`dashboard-tab-${index}`}
            aria-labelledby={`dashboard-tab-${index}`}
            {...other}
        >
            {value === index && <Box p={1}>{children}</Box>}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

export function DashboardDetailTabs(props) {
    const dispatch = useDispatch();
    const [anchorElRoleMenu, setAnchorElRoleMenu] = React.useState(null);
    const whoami = useSelector(getWhoami);
    const dashboardFilter = useSelector(dashboardFilterTermSelector);
    const roleView = useSelector((state) => state.roleView);
    const { show, hide } = showHide();
    const dashboardFilteredUser = useSelector(dashboardFilteredUserSelector);
    const guidedSetupOpen = useSelector(guidedSetupOpenSelector);

    const theme = useTheme();
    const isSm = useMediaQuery(theme.breakpoints.down("sm"));
    const dashboardTabIndex = useSelector(dashboardTabIndexSelector);

    const handleChange = (newValue) => {
        //props.onChange(event, newValue);
        dispatch(setDashboardTabIndex(newValue));
    };
    const tabs = (
        <Stack spacing={isSm ? 1 : 2} direction="row">
            <Chip
                key="dashboard-tab-0"
                aria-label="Dashboard in Progress"
                sx={{ padding: 1 }}
                label="IN PROGRESS"
                color={dashboardTabIndex === 0 ? "primary" : "default"}
                onClick={() => handleChange(0)}
            />
            <Chip
                key="dashboard-tab-1"
                aria-label="Dashboard Completed"
                sx={{ padding: 1 }}
                onClick={() => handleChange(1)}
                color={dashboardTabIndex === 1 ? "primary" : "default"}
                label="COMPLETED"
            />
        </Stack>
    );

    const clearAllSelectedItems = () => {
        dispatch(selectionModeActions.clearItems(0));
        dispatch(selectionModeActions.clearItems(1));
    };

    const addClearButton =
        !dashboardFilter && !dashboardFilteredUser ? (
            <Fab
                key="dashboard-fab"
                color="primary"
                variant="extended"
                data-cy="create-task-button"
                disabled={
                    guidedSetupOpen ||
                    (roleView && roleView === userRoles.rider)
                }
                onClick={() => dispatch(setGuidedSetupOpen(true))}
            >
                <AddIcon sx={{ mr: 1 }} />
                Create New
            </Fab>
        ) : (
            <Fab
                key="dashboard-fab-clear"
                variant="extended"
                color="secondary"
                data-cy="clear-search-button"
                disabled={props.disableAddButton}
                onClick={() => {
                    dispatch(clearDashboardFilter());
                    dispatch(setDashboardFilteredUser(null));
                }}
            >
                Clear Search
            </Fab>
        );
    return (
        <Stack
            sx={{
                width: "100%",
            }}
            spacing={2}
            direction={"row"}
            justifyContent={"space-between"}
            alignItems={"center"}
        >
            <Box key="tabs">{tabs}</Box>
            <Hidden key="taskfilter" mdDown>
                <TaskFilterTextField
                    key="taskfiltertextfield"
                    sx={{ width: "40%" }}
                />
            </Hidden>
            <Stack
                key="morestuff"
                spacing={1}
                direction={"row"}
                justifyContent={"flex-start"}
                alignItems={"center"}
            >
                <Hidden key="roleView" mdDown>
                    <Typography
                        onClick={(event) => {
                            setAnchorElRoleMenu(event.currentTarget);
                        }}
                        sx={{ cursor: "pointer" }}
                        data-cy="role-identifier"
                    >
                        {`${roleView} view`.toUpperCase()}
                    </Typography>
                </Hidden>
                <Hidden key="roleViewMobile" mdUp>
                    <Typography
                        onClick={(event) => {
                            setAnchorElRoleMenu(event.currentTarget);
                        }}
                        sx={{ cursor: "pointer" }}
                        data-cy="role-identifier"
                    >
                        {roleView &&
                            `${roleView.substring(0, 5).toUpperCase()}`}
                    </Typography>
                </Hidden>
                <IconButton
                    key="role-menu-button"
                    data-cy="role-menu-button"
                    aria-controls="simple-menu"
                    aria-haspopup="true"
                    onClick={(event) => {
                        setAnchorElRoleMenu(event.currentTarget);
                    }}
                    size="large"
                >
                    <ArrowDropDownIcon />
                </IconButton>
                <Hidden key="addclearbutton" smDown>
                    {["ALL", userRoles.coordinator].includes(roleView) &&
                        addClearButton}
                </Hidden>
                <Menu
                    key="role-menu"
                    data-cy="role-menu"
                    anchorEl={anchorElRoleMenu}
                    keepMounted
                    open={Boolean(anchorElRoleMenu)}
                    onClose={() => {
                        setAnchorElRoleMenu(null);
                    }}
                >
                    <MenuItem
                        key="menu-item-all"
                        className={
                            whoami.roles.includes(userRoles.coordinator)
                                ? show
                                : hide
                        }
                        onClick={() => {
                            setAnchorElRoleMenu(null);
                            if (roleView !== "ALL") {
                                dispatch(setRoleView("ALL"));
                                saveDashboardRoleMode("ALL");
                                clearAllSelectedItems();
                            }
                        }}
                    >
                        All Tasks
                    </MenuItem>
                    <MenuItem
                        key="menu-item-coordinator"
                        className={
                            whoami.roles.includes(userRoles.coordinator)
                                ? show
                                : hide
                        }
                        onClick={() => {
                            setAnchorElRoleMenu(null);
                            if (roleView !== userRoles.coordinator) {
                                dispatch(setRoleView(userRoles.coordinator));
                                saveDashboardRoleMode(userRoles.coordinator);
                                clearAllSelectedItems();
                            }
                        }}
                    >
                        Coordinator
                    </MenuItem>
                    <MenuItem
                        key="menu-item-rider"
                        className={
                            whoami.roles.includes(userRoles.rider) ? show : hide
                        }
                        onClick={() => {
                            setAnchorElRoleMenu(null);
                            if (roleView !== userRoles.rider) {
                                dispatch(setRoleView(userRoles.rider));
                                dispatch(setDashboardFilteredUser(null));
                                saveDashboardRoleMode(userRoles.rider);
                                clearAllSelectedItems();
                            }
                        }}
                    >
                        Rider
                    </MenuItem>
                </Menu>
            </Stack>
        </Stack>
    );
}
