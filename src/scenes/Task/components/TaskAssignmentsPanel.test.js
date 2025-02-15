import React from "react";
import TaskAssignmentsPanel from "./TaskAssignmentsPanel";
import { render } from "../../../test-utils";
import { v4 as uuidv4 } from "uuid";
import * as amplify from "aws-amplify";
import * as models from "../../../models/index";
import _ from "lodash";
import { tasksStatus, userRoles } from "../../../apiConsts";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataStore } from "aws-amplify";
import { useDispatch } from "react-redux";
import * as initActions from "../../../redux/taskAssignees/taskAssigneesActions";

const FakeDispatchComponent = () => {
    const dispatch = useDispatch();
    React.useEffect(() => {
        dispatch(initActions.initTaskAssignees());
    }, [dispatch]);
    return null;
};

const errorMessage = "Sorry, something went wrong";

const tenantId = uuidv4();

const fakeUsers = _.range(0, 3).map(() => {
    const riderResponsibility = new models.RiderResponsibility({
        tenantId,
        label: uuidv4(),
    });
    return new models.User({
        displayName: uuidv4(),
        riderResponsibility: riderResponsibility.label,
        tenantId,
        roles: [userRoles.coordinator, userRoles.rider, userRoles.user],
    });
});

const fakeTask1 = new models.Task({
    tenantId,
    status: tasksStatus.new,
});
const fakeTask2 = new models.Task({
    tenantId,
    status: tasksStatus.new,
});

let count = 0;
const fakeAssignments = fakeUsers.map((user) => {
    count++;
    return new models.TaskAssignee({
        assignee: user,
        task: count <= 2 ? fakeTask1 : fakeTask2,
        role: count % 2 === 0 ? userRoles.coordinator : userRoles.rider,
    });
});

const preloadedState = {
    tenantId,
    whoami: {
        user: new models.User({
            displayName: "some name",
            tenantId,
        }),
    },
};

async function saveAssignments() {
    await Promise.all(
        fakeAssignments.map((assignment) => DataStore.save(assignment))
    );
}

async function saveCoordAssignments() {
    await Promise.all(
        fakeAssignments
            .filter((assignment) => assignment.role === userRoles.coordinator)
            .map((assignment) => DataStore.save(assignment))
    );
}

describe("TaskAssignmentsPanel", () => {
    beforeEach(async () => {
        await DataStore.save(fakeTask1);
        await DataStore.save(fakeTask2);
        for (const user of fakeUsers) {
            await DataStore.save(user);
        }
        jest.restoreAllMocks();
    });
    afterEach(async () => {
        jest.restoreAllMocks();
        const assignments = await DataStore.query(models.TaskAssignee);
        await Promise.all(
            assignments.map((assignment) => DataStore.delete(assignment))
        );
        const tasks = await DataStore.query(models.Task);
        await Promise.all(tasks.map((task) => DataStore.delete(task)));
        const users = await DataStore.query(models.User);
        await Promise.all(users.map((user) => DataStore.delete(user)));
    });
    it("renders", async () => {
        render(<TaskAssignmentsPanel taskId={fakeTask1.id} />, {
            preloadedState,
        });
    });

    it.only("displays chips of the assigned users", async () => {
        await saveAssignments();
        const querySpy = jest.spyOn(DataStore, "query");
        render(
            <>
                <FakeDispatchComponent />
                <TaskAssignmentsPanel taskId={fakeTask1.id} />
            </>,
            { preloadedState }
        );
        await waitFor(() => expect(querySpy).toHaveBeenCalledTimes(2));
        // TODO: mock amplify Storage to test avatars
        //const avatarGroup = screen.queryAllByRole("img");
        // expect to have the correct number of avatars
        // and correct names
        //expect(avatarGroup).toHaveLength(2);
        for (const user of fakeAssignments
            .filter((a) => a.task.id === fakeTask1.id)
            .map((a) => a.assignee)) {
            expect(screen.getByText(user.displayName)).toBeInTheDocument();
        }
    });

    it("displays cards for the assigned users when expanded", async () => {
        await saveAssignments();
        const querySpy = jest.spyOn(DataStore, "query");
        render(
            <>
                <FakeDispatchComponent />
                <TaskAssignmentsPanel taskId={fakeTask1.id} />
            </>,
            { preloadedState }
        );
        await waitFor(() => expect(querySpy).toHaveBeenCalledTimes(1));
        // click the expand button
        userEvent.click(screen.getByRole("button", { name: "Edit Assignees" }));
        await waitFor(() => expect(querySpy).toHaveBeenCalledTimes(3));
        for (const user of fakeAssignments
            .filter((a) => a.task.id === fakeTask1.id)
            .map((a) => a.assignee)) {
            expect(
                screen.getByText(new RegExp(user.displayName))
            ).toBeInTheDocument();
        }
    });

    it("is collapsed by default when there are assignees for both roles", async () => {
        const querySpy = jest.spyOn(DataStore, "query");
        render(<TaskAssignmentsPanel taskId={fakeTask1.id} />, {
            preloadedState: {
                ...preloadedState,
                taskAssigneesReducer: {
                    ready: true,
                    isSynced: true,
                    items: [
                        new models.TaskAssignee({
                            assignee: fakeUsers[0],
                            task: fakeTask1,
                            role: userRoles.coordinator,
                        }),
                        new models.TaskAssignee({
                            assignee: fakeUsers[1],
                            task: fakeTask1,
                            role: userRoles.rider,
                        }),
                    ],
                },
            },
        });
        await waitFor(() => expect(querySpy).toHaveBeenCalledTimes(1));
        expect(screen.queryByRole("combobox")).toBeNull();
        expect(screen.queryByText("No one assigned")).toBeNull();
    });

    it("is expanded by default when there are no assignees", async () => {
        const querySpy = jest.spyOn(DataStore, "query");
        render(<TaskAssignmentsPanel taskId={fakeTask1.id} />, {
            preloadedState: {
                ...preloadedState,
                taskAssigneesReducer: {
                    ready: true,
                    isSynced: true,
                    items: [],
                },
            },
        });
        await waitFor(() => expect(querySpy).toHaveBeenCalledTimes(1));
        expect(screen.getByRole("combobox")).toBeInTheDocument();
        expect(screen.getAllByText("No one assigned")).toHaveLength(2);
    });

    it.each`
        role
        ${userRoles.rider} | ${userRoles.coordinator}
    `(
        "is expanded by default when there are no coordinators or riders",
        async ({ role }) => {
            const querySpy = jest.spyOn(DataStore, "query");
            render(<TaskAssignmentsPanel taskId={fakeTask1.id} />, {
                preloadedState: {
                    ...preloadedState,
                    taskAssigneesReducer: {
                        ready: true,
                        isSynced: true,
                        items: [
                            new models.TaskAssignee({
                                task: fakeTask1,
                                role: role,
                                assignee: fakeUsers[0],
                            }),
                        ],
                    },
                },
            });
            await waitFor(() => expect(querySpy).toHaveBeenCalledTimes(1));
            expect(screen.getByRole("combobox")).toBeInTheDocument();
            expect(screen.getAllByText("No one assigned")).toHaveLength(1);
        }
    );

    test("select and assign a rider", async () => {
        const mockUser = await DataStore.save(
            new models.User({
                displayName: uuidv4(),
                roles: [userRoles.rider],
                riderResponsibility: uuidv4(),
            })
        );
        const mockTask = fakeTask1;
        const mockAssignment = new models.TaskAssignee({
            assignee: mockUser,
            task: mockTask,
            role: userRoles.rider,
        });
        const querySpy = jest.spyOn(DataStore, "query");
        const saveSpy = jest.spyOn(DataStore, "save");
        render(
            <>
                <FakeDispatchComponent />
                <TaskAssignmentsPanel taskId={mockTask.id} />
            </>,
            { preloadedState }
        );
        await waitFor(() =>
            expect(querySpy).toHaveBeenNthCalledWith(
                1,
                models.TaskAssignee,
                expect.any(Function),
                { sort: expect.any(Function) }
            )
        );
        await waitFor(() =>
            expect(querySpy).toHaveBeenNthCalledWith(
                2,
                models.User,
                expect.any(Function)
            )
        );
        expect(screen.getByText("RIDER")).toBeInTheDocument();
        const textBox = screen.getByRole("textbox");
        userEvent.type(textBox, mockUser.displayName);
        const option = screen.getByText(mockUser.displayName);
        expect(option).toBeInTheDocument();
        userEvent.click(option);
        await waitFor(() =>
            expect(querySpy).toHaveBeenNthCalledWith(
                3,
                models.User,
                mockUser.id
            )
        );
        await waitFor(() =>
            expect(querySpy).toHaveBeenNthCalledWith(
                4,
                models.Task,
                fakeTask1.id
            )
        );
        await waitFor(() => expect(saveSpy).toHaveBeenCalledTimes(2));
        expect(
            screen.getByText(
                `${mockUser.displayName} (${mockUser.riderResponsibility})`
            )
        ).toBeInTheDocument();
        expect(saveSpy).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                ..._.omit(mockAssignment, "id"),
                assignee: expect.objectContaining(_.omit(mockUser, "id")),
                task: expect.objectContaining(_.omit(mockTask, "id")),
            })
        );
        expect(saveSpy).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                ..._.omit(mockTask, "id"),
                status: tasksStatus.active,
            })
        );
        expect(
            await screen.findByText("Task moved to ACTIVE")
        ).toBeInTheDocument();
    });

    test("select and assign a coordinator", async () => {
        const mockTask = fakeTask1;
        const mockUser = fakeUsers[0];
        const mockAssignment = new models.TaskAssignee({
            assignee: mockUser,
            task: mockTask,
            role: userRoles.coordinator,
        });
        const querySpy = jest.spyOn(DataStore, "query");
        const saveSpy = jest.spyOn(DataStore, "save");
        render(
            <>
                <FakeDispatchComponent />
                <TaskAssignmentsPanel taskId={mockTask.id} />
            </>,
            { preloadedState }
        );
        await waitFor(() =>
            expect(querySpy).toHaveBeenNthCalledWith(
                1,
                models.TaskAssignee,
                expect.any(Function),
                { sort: expect.any(Function) }
            )
        );
        await waitFor(() =>
            expect(querySpy).toHaveBeenNthCalledWith(
                2,
                models.User,
                expect.any(Function)
            )
        );
        const roleOption = screen.getByText("COORDINATOR");
        userEvent.click(roleOption);
        await waitFor(() =>
            expect(querySpy).toHaveBeenNthCalledWith(
                3,
                models.User,
                expect.any(Function)
            )
        );
        const textBox = screen.getByRole("textbox");
        userEvent.type(textBox, mockUser.displayName);
        const option = screen.getByText(mockUser.displayName);
        expect(option).toBeInTheDocument();
        userEvent.click(option);
        await waitFor(() => expect(saveSpy).toHaveBeenCalledTimes(1));
        expect(screen.getByText(mockUser.displayName)).toBeInTheDocument();
        expect(saveSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                ..._.omit(mockAssignment, "id"),
                assignee: expect.objectContaining(_.omit(mockUser, "id")),
                task: expect.objectContaining(_.omit(mockTask, "id")),
            })
        );
    });

    test("failure on assigning a user", async () => {
        const mockUser = fakeUsers[0];
        const querySpy = jest.spyOn(DataStore, "query");
        const saveSpy = jest
            .spyOn(amplify.DataStore, "save")
            .mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    reject(new Error("test"));
                });
            });
        render(
            <>
                <FakeDispatchComponent />
                <TaskAssignmentsPanel taskId={fakeTask1.id} />
            </>,
            { preloadedState }
        );
        await waitFor(() => expect(querySpy).toHaveBeenCalledTimes(2));
        expect(screen.getByText("RIDER")).toBeInTheDocument();
        const textBox = screen.getByRole("textbox");
        userEvent.type(textBox, mockUser.displayName);
        const option = screen.getByText(mockUser.displayName);
        expect(option).toBeInTheDocument();
        userEvent.click(option);
        await waitFor(() => expect(saveSpy).toHaveBeenCalledTimes(1));
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it("deletes a coordinator assignment", async () => {
        const mockAssignment = fakeAssignments[1];
        await saveCoordAssignments();
        const querySpy = jest.spyOn(DataStore, "query");
        const deleteSpy = jest.spyOn(DataStore, "delete");
        render(
            <>
                <FakeDispatchComponent />
                <TaskAssignmentsPanel taskId={fakeTask1.id} />
            </>,
            { preloadedState }
        );
        await waitFor(() => expect(querySpy).toHaveBeenCalledTimes(2));
        userEvent.click(screen.getByTestId("CancelIcon"));
        await waitFor(() =>
            expect(deleteSpy).toHaveBeenCalledWith(
                expect.objectContaining(_.omit(mockAssignment, "id"))
            )
        );
    });

    it("deletes a rider assignment", async () => {
        const mockAssignment = new models.TaskAssignee(fakeAssignments[0]);
        await DataStore.save(mockAssignment);
        const mockTask = fakeTask1;
        const querySpy = jest.spyOn(DataStore, "query");
        const saveSpy = jest.spyOn(DataStore, "save");
        const deleteSpy = jest.spyOn(DataStore, "delete");
        render(
            <>
                <FakeDispatchComponent />
                <TaskAssignmentsPanel taskId={fakeTask1.id} />
            </>,
            { preloadedState }
        );
        await waitFor(() => expect(querySpy).toHaveBeenCalledTimes(2));
        userEvent.click(screen.getByTestId("CancelIcon"));
        await waitFor(() =>
            expect(deleteSpy).toHaveBeenCalledWith(mockAssignment)
        );
        await waitFor(() => {
            expect(saveSpy).toHaveBeenNthCalledWith(1, {
                ...mockTask,
                riderResponsibility: null,
                status: tasksStatus.new,
            });
        });
    });

    it("deletes a rider assignment with multiple riders", async () => {
        const mockTask = new models.Task({
            status: tasksStatus.active,
            riderResponsibility: "nope",
        });
        await DataStore.save(mockTask);
        const firstUser = new models.User({ riderResponsibility: "nope" });
        const anotherUser = new models.User({
            riderResponsibility: "test",
        });
        await DataStore.save(firstUser);
        await DataStore.save(anotherUser);
        const mockAssignment = await DataStore.save(
            new models.TaskAssignee({
                task: mockTask,
                assignee: firstUser,
                role: userRoles.rider,
            })
        );
        await DataStore.save(
            new models.TaskAssignee({
                task: mockTask,
                assignee: anotherUser,
                role: userRoles.rider,
            })
        );
        const querySpy = jest.spyOn(DataStore, "query");
        const saveSpy = jest.spyOn(DataStore, "save");
        const deleteSpy = jest.spyOn(DataStore, "delete");
        render(
            <>
                <FakeDispatchComponent />
                <TaskAssignmentsPanel taskId={mockTask.id} />
            </>,
            { preloadedState }
        );
        await waitFor(() => expect(querySpy).toHaveBeenCalledTimes(2));
        const deleteButtons = await screen.findAllByTestId("CancelIcon");
        expect(deleteButtons).toHaveLength(2);
        userEvent.click(deleteButtons[0]);
        await waitFor(() => {
            expect(deleteSpy).toHaveBeenCalledWith(mockAssignment);
        });
        await waitFor(() => {
            expect(saveSpy).toHaveBeenNthCalledWith(1, {
                ...mockTask,
                riderResponsibility: "test",
            });
        });
    });

    test("delete assignment error", async () => {
        await saveAssignments();
        const querySpy = jest.spyOn(DataStore, "query");
        const deleteSpy = jest
            .spyOn(amplify.DataStore, "delete")
            .mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    reject(new Error("test"));
                });
            });
        render(
            <>
                <FakeDispatchComponent />
                <TaskAssignmentsPanel taskId={fakeTask1.id} />
            </>,
            { preloadedState }
        );
        await waitFor(() => expect(querySpy).toHaveBeenCalledTimes(2));
        userEvent.click(screen.getByRole("button", { name: "Edit Assignees" }));
        const deleteButtons = await screen.findAllByTestId("CancelIcon");
        expect(deleteButtons).toHaveLength(2);
        userEvent.click(deleteButtons[0]);
        await waitFor(() => expect(deleteSpy).toHaveBeenCalledTimes(1));
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
});
