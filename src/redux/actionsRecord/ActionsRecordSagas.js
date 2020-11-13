import {call, put, takeEvery, select} from 'redux-saga/effects'
import {getApiControl} from "../Api";
import {
    actionRecordsNotFound,
    GET_ACTIONS_RECORD_REQUEST, GET_TASKS_ACTIONS_RECORD_REQUEST,
    getActionsRecordFailure,
    getActionsRecordForbidden,
    getActionsRecordSuccess,
    getTasksActionsRecordFailure,
    getTasksActionsRecordForbidden,
    getTasksActionsRecordSuccess,
    tasksActionsRecordsNotFound
} from "./ActionsRecordActions";

function* getActionsRecord(action) {
    try {
        const api = yield select(getApiControl);
        const result = yield call([api, api.log.getRecords], action.data, "newest");
        yield put(getActionsRecordSuccess(result))
    } catch (error) {
        if (error.name === "HttpError") {
            if (error.response.status === 404) {
                yield put(actionRecordsNotFound())
            }
        } else if (error.response.status === 403) {
            yield put(getActionsRecordForbidden(error))
        } else {
            yield put(getActionsRecordFailure(error))

        }
    }
}

export function* watchGetActionsRecord() {
    yield takeEvery(GET_ACTIONS_RECORD_REQUEST, getActionsRecord)
}

function* getTasksActionsRecord(action) {
    try {
        const api = yield select(getApiControl);
        const result = yield call([api, api.log.getTasksRecords], action.data, "newest");
        yield put(getTasksActionsRecordSuccess(result))
    } catch (error) {
        if (error.name === "HttpError") {
            if (error.response.status === 404) {
                yield put(tasksActionsRecordsNotFound())
            }
        } else if (error.response.status === 403) {
            yield put(getTasksActionsRecordForbidden(error))
        } else {
            yield put(getTasksActionsRecordFailure(error))

        }
    }
}

export function* watchGetTasksActionsRecord() {
    yield takeEvery(GET_TASKS_ACTIONS_RECORD_REQUEST, getTasksActionsRecord)
}
