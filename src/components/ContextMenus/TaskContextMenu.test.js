import { render } from "../../test-utils";
import TaskContextMenu from "./TaskContextMenu";
import { DataStore } from "aws-amplify";
import * as models from "../../models";
import { tasksStatus, userRoles } from "../../apiConsts";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as utils from "../../utilities";

describe("TaskContextMenu", () => {
    const RealDate = Date;
    const isoDate = "2021-11-29T23:24:58.987Z";

    function mockDate() {
        global.Date = class extends RealDate {
            constructor() {
                super();
                return new RealDate(isoDate);
            }
        };
    }

    afterEach(async () => {
        global.Date = RealDate;
    });
    beforeEach(async () => {
        jest.restoreAllMocks();
        mockDate();
    });

    test("cancel a task", async () => {
        const task = await DataStore.save(
            new models.Task({
                status: tasksStatus.new,
            })
        );
        const saveSpy = jest.spyOn(DataStore, "save");
        render(<TaskContextMenu task={task} assignedRiders={[]} />);
        const button = screen.getByRole("button", { name: "task options" });
        userEvent.click(button);
        userEvent.click(
            screen.getByRole("menuitem", { name: "Mark cancelled" })
        );
        await waitFor(() => {
            expect(saveSpy).toHaveBeenCalledWith({
                ...task,
                timeCancelled: isoDate,
                status: tasksStatus.cancelled,
            });
        });
        await waitFor(() => {
            expect(
                screen.getByText("Task marked cancelled")
            ).toBeInTheDocument();
        });
        // undo
        userEvent.click(screen.getByRole("button", { name: "UNDO" }));
        await waitFor(() => {
            expect(saveSpy).toHaveBeenCalledWith({
                ...task,
                timeCancelled: null,
            });
        });
    });

    test("reject a task", async () => {
        const task = await DataStore.save(
            new models.Task({
                status: tasksStatus.new,
            })
        );
        const saveSpy = jest.spyOn(DataStore, "save");
        render(<TaskContextMenu task={task} assignedRiders={[]} />);
        const button = screen.getByRole("button", { name: "task options" });
        userEvent.click(button);
        userEvent.click(
            screen.getByRole("menuitem", { name: "Mark rejected" })
        );
        await waitFor(() => {
            expect(saveSpy).toHaveBeenCalledWith({
                ...task,
                timeRejected: isoDate,
                status: tasksStatus.rejected,
            });
        });
        await waitFor(() => {
            expect(
                screen.getByText("Task marked rejected")
            ).toBeInTheDocument();
        });
        // undo
        userEvent.click(screen.getByRole("button", { name: "UNDO" }));
        await waitFor(() => {
            expect(saveSpy).toHaveBeenCalledWith({
                ...task,
                timeRejected: null,
            });
        });
    });

    test("mark a task picked up", async () => {
        const task = await DataStore.save(
            new models.Task({
                status: tasksStatus.active,
            })
        );
        const fakeRider = await DataStore.save(
            new models.User({
                displayName: "Someone person",
                roles: [userRoles.user, userRoles.rider],
            })
        );
        const fakeAssignment = await DataStore.save(
            new models.TaskAssignee({
                task,
                assignee: fakeRider,
                role: userRoles.rider,
            })
        );
        const preloadedState = {
            taskAssigneesReducer: {
                items: [fakeAssignment],
                ready: true,
                isSynced: true,
            },
        };
        const saveSpy = jest.spyOn(DataStore, "save");
        render(
            <TaskContextMenu task={task} assignedRiders={[fakeAssignment]} />,
            { preloadedState }
        );
        const button = screen.getByRole("button", { name: "task options" });
        userEvent.click(button);
        userEvent.click(
            screen.getByRole("menuitem", { name: "Mark picked up" })
        );
        await waitFor(() => {
            expect(saveSpy).toHaveBeenCalledWith({
                ...task,
                timePickedUp: isoDate,
                status: tasksStatus.pickedUp,
            });
        });
        await waitFor(() => {
            expect(
                screen.getByText("Task marked picked up")
            ).toBeInTheDocument();
        });
        // undo
        userEvent.click(screen.getByRole("button", { name: "UNDO" }));
        await waitFor(() => {
            expect(saveSpy).toHaveBeenCalledWith({
                ...task,
                timePickedUp: null,
            });
        });
    });

    test("mark a task delivered", async () => {
        const task = await DataStore.save(
            new models.Task({
                status: tasksStatus.pickedUp,
                timePickedUp: new Date().toISOString(),
            })
        );
        const fakeRider = await DataStore.save(
            new models.User({
                displayName: "Someone person",
                roles: [userRoles.user, userRoles.rider],
            })
        );
        const fakeAssignment = await DataStore.save(
            new models.TaskAssignee({
                task,
                assignee: fakeRider,
                role: userRoles.rider,
            })
        );
        const preloadedState = {
            taskAssigneesReducer: {
                items: [fakeAssignment],
                ready: true,
                isSynced: true,
            },
        };
        const saveSpy = jest.spyOn(DataStore, "save");
        render(
            <TaskContextMenu task={task} assignedRiders={[fakeAssignment]} />,
            { preloadedState }
        );
        const button = screen.getByRole("button", { name: "task options" });
        userEvent.click(button);
        userEvent.click(
            screen.getByRole("menuitem", { name: "Mark delivered" })
        );
        await waitFor(() => {
            expect(saveSpy).toHaveBeenCalledWith({
                ...task,
                timeDroppedOff: isoDate,
                status: tasksStatus.droppedOff,
            });
        });
        await waitFor(() => {
            expect(
                screen.getByText("Task marked delivered")
            ).toBeInTheDocument();
        });
        // undo
        userEvent.click(screen.getByRole("button", { name: "UNDO" }));
        await waitFor(() => {
            expect(saveSpy).toHaveBeenCalledWith({
                ...task,
                timeDroppedOff: null,
            });
        });
    });
    test("mark a rider home", async () => {
        const task = await DataStore.save(
            new models.Task({
                status: tasksStatus.droppedOff,
                timePickedUp: new Date().toISOString(),
                timeDroppedOff: new Date().toISOString(),
            })
        );
        const fakeRider = await DataStore.save(
            new models.User({
                displayName: "Someone person",
                roles: [userRoles.user, userRoles.rider],
            })
        );
        const fakeAssignment = await DataStore.save(
            new models.TaskAssignee({
                task,
                assignee: fakeRider,
                role: userRoles.rider,
            })
        );
        const preloadedState = {
            taskAssigneesReducer: {
                items: [fakeAssignment],
                ready: true,
                isSynced: true,
            },
        };
        const saveSpy = jest.spyOn(DataStore, "save");
        render(
            <TaskContextMenu task={task} assignedRiders={[fakeAssignment]} />,
            { preloadedState }
        );
        const button = screen.getByRole("button", { name: "task options" });
        userEvent.click(button);
        userEvent.click(
            screen.getByRole("menuitem", { name: "Mark rider home" })
        );
        await waitFor(() => {
            expect(saveSpy).toHaveBeenCalledWith({
                ...task,
                timeRiderHome: isoDate,
                status: tasksStatus.completed,
            });
        });
        await waitFor(() => {
            expect(
                screen.getByText("Task marked rider home")
            ).toBeInTheDocument();
        });
        // undo
        userEvent.click(screen.getByRole("button", { name: "UNDO" }));
        await waitFor(() => {
            expect(saveSpy).toHaveBeenCalledWith({
                ...task,
                timeRiderHome: null,
            });
        });
    });
    test.only("copy to clipboard", async () => {
        const task = await DataStore.save(
            new models.Task({
                status: tasksStatus.new,
            })
        );
        const copySpy = jest
            .spyOn(utils, "copyTaskDataToClipboard")
            .mockResolvedValue({});
        render(<TaskContextMenu task={task} assignedRiders={[]} />);
        const button = screen.getByRole("button", { name: "task options" });
        userEvent.click(button);
        userEvent.click(
            screen.getByRole("menuitem", { name: "Copy to clipboard" })
        );
        await waitFor(() => {
            expect(copySpy).toHaveBeenCalledWith({ ...task, deliverables: [] });
        });
        await waitFor(() => {
            expect(screen.getByText("Copied to clipboard")).toBeInTheDocument();
        });
    });
});
