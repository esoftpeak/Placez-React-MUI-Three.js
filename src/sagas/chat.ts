import { all, takeLatest, put, call } from 'redux-saga/effects';
import {
  types,
  SelectChatSessionAction,
  GetChatSessionMessages,
  GetChatSessionMessagesAction,
  GetChatSessionMessagesSuccess,
  GetChatSessionMessagesFailure,
  CreateChatSessionMessageAction,
  CreateChatSessionMessageSuccess,
  CreateChatSessionMessageFailure,
  GetLatestChatSessionMessagesAction,
  GetLatestChatSessionMessagesSuccess,
  GetLatestChatSessionMessagesFailure,
  GetLayoutChatSessionsAction,
  GetLayoutChatSessionsSuccess,
  GetLayoutChatSessionsFailure,
} from '../reducers/chat';
import { SagaReady } from '../reducers/lifecycle';

// Api
import { placezApi, ChatMessage } from '../api';

export default function* chatSaga() {
  yield all([
    takeLatest(types.GET_CHAT_SESSION_MESSAGES, getChatSessionMessages),
    takeLatest(types.CREATE_CHAT_SESSION_MESSAGE, createChatSessionMessage),
    takeLatest(
      types.GET_LATEST_CHAT_SESSION_MESSAGES,
      getLatestChatSessionMessages
    ),
    takeLatest(types.SELECT_CHAT_SESSION, selectChatSession),
    takeLatest(types.GET_LAYOUT_CHATSESSIONS, getLayoutChatSessions),
  ]);
  yield put(SagaReady('chat'));
}

function* getChatSessionMessages(action: GetChatSessionMessagesAction) {
  try {
    const { sessionId } = action;
    const response = yield call(placezApi.getChatSession, sessionId);
    yield put(
      GetChatSessionMessagesSuccess(response.parsedBody as ChatMessage[])
    );
  } catch (error) {
    yield put(GetChatSessionMessagesFailure(error));
  }
}

function* createChatSessionMessage(action: CreateChatSessionMessageAction) {
  try {
    const { sessionId, message } = action;
    const response = yield call(
      placezApi.createChatSessionMessage,
      sessionId,
      message
    );
    yield put(CreateChatSessionMessageSuccess(response.parsedBody));
  } catch (error) {
    yield put(CreateChatSessionMessageFailure(error));
  }
}

function* getLatestChatSessionMessages(
  action: GetLatestChatSessionMessagesAction
) {
  try {
    const response = yield call(
      placezApi.getChatSession,
      action.sessionId,
      action.lastMessageId
    );
    yield put(GetLatestChatSessionMessagesSuccess(response.parsedBody));
  } catch (error) {
    yield put(GetLatestChatSessionMessagesFailure(error));
  }
}

function* selectChatSession(action: SelectChatSessionAction) {
  yield put(GetChatSessionMessages(action.sessionId));
}

function* getLayoutChatSessions(action: GetLayoutChatSessionsAction) {
  try {
    const response = yield call(
      placezApi.getLayoutChatSessions,
      action.layoutId
    );
    yield put(GetLayoutChatSessionsSuccess(response.parsedBody));
  } catch (error) {
    yield put(GetLayoutChatSessionsFailure(error));
  }
}
