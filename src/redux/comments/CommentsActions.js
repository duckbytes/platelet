export const ADD_COMMENT_REQUEST = 'ADD_COMMENT_REQUEST';
export const ADD_COMMENT_SUCCESS = 'ADD_COMMENT_SUCCESS';
export const UPDATE_COMMENT_REQUEST = 'UPDATE_COMMENT_REQUEST';
export const UPDATE_COMMENT_SUCCESS = 'UPDATE_COMMENT_SUCCESS';
export const GET_COMMENTS_REQUEST = 'GET_COMMENTS_REQUEST';
export const GET_COMMENTS_FAILURE = 'GET_COMMENTS_FAILURE';
export const GET_COMMENTS_NOTFOUND = 'GET_COMMENTS_NOTFOUND';
export const GET_COMMENTS_FORBIDDEN = 'GET_COMMENTS_FORBIDDEN';
export const GET_COMMENTS_SUCCESS = 'GET_COMMENTS_SUCCESS';
export const CLEAR_COMMENTS = 'CLEAR_COMMENTS';

export function addComment(data) {
    return { type: ADD_COMMENT_REQUEST, data }
}

export function addCommentSuccess(data) {
    return { type: ADD_COMMENT_SUCCESS, data }
}

export function clearComments() {
    return { type: CLEAR_COMMENTS }
}

export function getComments(data) {
    return { type: GET_COMMENTS_REQUEST, data }
}

export function commentsNotFound(data) {
    return { type: GET_COMMENTS_NOTFOUND, data }
}

export function getCommentsFailure(data) {
    return { type: GET_COMMENTS_FAILURE, data }
}

export function getCommentsForbidden(data) {
    return { type: GET_COMMENTS_FORBIDDEN, data }
}

export function getCommentsSuccess(data) {
    return { type: GET_COMMENTS_SUCCESS, data }
}

export function updateComment(data) {
    return { type: UPDATE_COMMENT_REQUEST, data }
}

export function updateCommentSuccess(data) {
    return { type: UPDATE_COMMENT_SUCCESS, data }
}

export const ADD_SIDEBAR_COMMENT_REQUEST = 'ADD_SIDEBAR_COMMENT_REQUEST';
export const ADD_SIDEBAR_COMMENT_SUCCESS = 'ADD_SIDEBAR_COMMENT_SUCCESS';
export const UPDATE_SIDEBAR_COMMENT_REQUEST = 'UPDATE_SIDEBAR_COMMENT_REQUEST';
export const UPDATE_SIDEBAR_COMMENT_SUCCESS = 'UPDATE_SIDEBAR_COMMENT_SUCCESS';
export const GET_SIDEBAR_COMMENTS_REQUEST = 'GET_SIDEBAR_COMMENTS_REQUEST';
export const GET_SIDEBAR_COMMENTS_SUCCESS = 'GET_SIDEBAR_COMMENTS_SUCCESS';
export const CLEAR_SIDEBAR_COMMENTS = 'CLEAR_SIDEBAR_COMMENTS';

export function addSidebarComment(data) {
    return { type: ADD_SIDEBAR_COMMENT_REQUEST, data }
}

export function addSidebarCommentSuccess(data) {
    return { type: ADD_SIDEBAR_COMMENT_SUCCESS, data }
}

export function clearSidebarComments() {
    return { type: CLEAR_SIDEBAR_COMMENTS }
}

export function getSidebarComments(data) {
    return { type: GET_SIDEBAR_COMMENTS_REQUEST, data }
}

export function getSidebarCommentsSuccess(data) {
    return { type: GET_SIDEBAR_COMMENTS_SUCCESS, data }
}

export function updateSidebarComment(data) {
    return { type: UPDATE_SIDEBAR_COMMENT_REQUEST, data }
}

export function updateSidebarCommentSuccess(data) {
    return { type: UPDATE_SIDEBAR_COMMENT_SUCCESS, data }
}
