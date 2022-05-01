import { Chip, Grid } from "@mui/material";
import React from "react";
import { userRoles } from "../../../apiConsts";

function UserRolesAndSelector(props) {
    if (props.selectMode) {
        return (
            <Grid container direction="row" spacing={1}>
                {Object.values(userRoles).map((role) => {
                    return (
                        <Grid item key={role}>
                            <Chip
                                variant={
                                    props.value.includes(role)
                                        ? "default"
                                        : "outlined"
                                }
                                disabled={[userRoles.user].includes(role)}
                                color={
                                    props.value.includes(role)
                                        ? "primary"
                                        : "default"
                                }
                                key={role}
                                label={role}
                                onClick={() => props.onSelect(role)}
                            />
                        </Grid>
                    );
                })}
            </Grid>
        );
    } else {
        return (
            <Grid container direction="row" spacing={1}>
                {props.value.map((role) => (
                    <Grid item key={role}>
                        <Chip key={role} label={role} />
                    </Grid>
                ))}
            </Grid>
        );
    }
}

export default UserRolesAndSelector;
