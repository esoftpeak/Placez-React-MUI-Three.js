import createReducer from './helpers/createReducer';
import { ChatSession, ChatMessage } from '../api';

// Action Types
const TOGGLE_CHAT_PANEL = 'TOGGLE_CHAT_PANEL';
const SET_CHAT_PANEL_STATE = 'SET_CHAT_PANEL_STATE';
const GET_CHAT_SESSION_MESSAGES = 'GET_CHAT_SESSION_MESSAGES';
const GET_CHAT_SESSION_MESSAGES_SUCCESS = 'GET_CHAT_SESSION_MESSAGES_SUCCESS';
const GET_CHAT_SESSION_MESSAGES_FAILURE = 'GET_CHAT_SESSION_MESSAGES_FAILURE';

const CREATE_CHAT_SESSION_MESSAGE = 'CREATE_CHAT_SESSION_MESSAGE';
const CREATE_CHAT_SESSION_MESSAGE_SUCCESS =
  'CREATE_CHAT_SESSION_MESSAGE_SUCCESS';
const CREATE_CHAT_SESSION_MESSAGE_FAILURE =
  'CREATE_CHAT_SESSION_MESSAGE_FAILURE';

const GET_LATEST_CHAT_SESSION_MESSAGES = 'GET_LATEST_CHAT_SESSION_MESSAGES';
const GET_LATEST_CHAT_SESSION_MESSAGES_SUCCESS =
  'GET_LATEST_CHAT_SESSION_MESSAGES_SUCCESS';
const GET_LATEST_CHAT_SESSION_MESSAGES_FAILURE =
  'GET_LATEST_CHAT_SESSION_MESSAGES_FAILURE';

const GET_LAYOUT_CHATSESSIONS = 'GET_DESIGNER_LAYOUT_CHATSESSIONS';
const GET_LAYOUT_CHATSESSIONS_SUCCESS =
  'GET_DESIGNER_LAYOUT_CHATSESSIONS_SUCCESS';
const GET_LAYOUT_CHATSESSIONS_FAILURE =
  'GET_DESIGNER_LAYOUT_CHATSESSIONS_FAILURE';

const SELECT_CHAT_SESSION = 'SELECT_CHAT_SESSION';

export const types = {
  TOGGLE_CHAT_PANEL,
  SET_CHAT_PANEL_STATE,
  GET_CHAT_SESSION_MESSAGES,
  GET_CHAT_SESSION_MESSAGES_SUCCESS,
  GET_CHAT_SESSION_MESSAGES_FAILURE,
  CREATE_CHAT_SESSION_MESSAGE,
  CREATE_CHAT_SESSION_MESSAGE_SUCCESS,
  CREATE_CHAT_SESSION_MESSAGE_FAILURE,
  GET_LATEST_CHAT_SESSION_MESSAGES,
  GET_LATEST_CHAT_SESSION_MESSAGES_SUCCESS,
  GET_LATEST_CHAT_SESSION_MESSAGES_FAILURE,
  SELECT_CHAT_SESSION,
  GET_LAYOUT_CHATSESSIONS,
  GET_LAYOUT_CHATSESSIONS_SUCCESS,
  GET_LAYOUT_CHATSESSIONS_FAILURE,
};

type Types =
  | typeof GET_CHAT_SESSION_MESSAGES
  | typeof GET_CHAT_SESSION_MESSAGES_SUCCESS
  | typeof GET_CHAT_SESSION_MESSAGES_FAILURE
  | typeof CREATE_CHAT_SESSION_MESSAGE
  | typeof CREATE_CHAT_SESSION_MESSAGE_SUCCESS
  | typeof CREATE_CHAT_SESSION_MESSAGE_FAILURE
  | typeof GET_LATEST_CHAT_SESSION_MESSAGES
  | typeof GET_LATEST_CHAT_SESSION_MESSAGES_SUCCESS
  | typeof GET_LATEST_CHAT_SESSION_MESSAGES_FAILURE
  | typeof SELECT_CHAT_SESSION
  | typeof GET_LAYOUT_CHATSESSIONS
  | typeof GET_LAYOUT_CHATSESSIONS_SUCCESS
  | typeof GET_LAYOUT_CHATSESSIONS_FAILURE
  | typeof TOGGLE_CHAT_PANEL
  | typeof SET_CHAT_PANEL_STATE;

// State
export type State = {
  chatPanelState: boolean;
  sessionId: string;
  messages: ChatMessage[];
  lastMessagesLoading: boolean;
  chatSessions: ChatSession[];
  chatSessionsLoading: boolean;
};

const initialState: State = {
  chatPanelState: false,
  sessionId: '',
  messages: [],
  lastMessagesLoading: false,
  chatSessions: [],
  chatSessionsLoading: false,
};

// Action Creators
export const ToggleChatPanel = () => ({
  type: TOGGLE_CHAT_PANEL as typeof TOGGLE_CHAT_PANEL,
});

export const SetChatPanelState = (chatPanelState: boolean) => ({
  type: SET_CHAT_PANEL_STATE as typeof SET_CHAT_PANEL_STATE,
  chatPanelState,
});

export const GetChatSessionMessages = (sessionId: string) => ({
  type: GET_CHAT_SESSION_MESSAGES as typeof GET_CHAT_SESSION_MESSAGES,
  sessionId,
});

export const GetChatSessionMessagesSuccess = (messages: ChatMessage[]) => ({
  type: GET_CHAT_SESSION_MESSAGES_SUCCESS as typeof GET_CHAT_SESSION_MESSAGES_SUCCESS,
  messages,
});

export const GetChatSessionMessagesFailure = (error: any) => ({
  type: GET_CHAT_SESSION_MESSAGES_FAILURE as typeof GET_CHAT_SESSION_MESSAGES_FAILURE,
  error,
});

export const CreateChatSessionMessage = (
  sessionId: string,
  message: string
) => ({
  type: CREATE_CHAT_SESSION_MESSAGE as typeof CREATE_CHAT_SESSION_MESSAGE,
  sessionId,
  message,
});

export const CreateChatSessionMessageSuccess = (message: ChatMessage) => ({
  type: CREATE_CHAT_SESSION_MESSAGE_SUCCESS as typeof CREATE_CHAT_SESSION_MESSAGE_SUCCESS,
  message,
});

export const CreateChatSessionMessageFailure = (error: any) => ({
  type: CREATE_CHAT_SESSION_MESSAGE_FAILURE as typeof CREATE_CHAT_SESSION_MESSAGE_FAILURE,
  error,
});

export const GetLatestChatSessionMessages = (
  sessionId: string,
  lastMessageId: number
) => ({
  type: GET_LATEST_CHAT_SESSION_MESSAGES as typeof GET_LATEST_CHAT_SESSION_MESSAGES,
  sessionId,
  lastMessageId,
});

export const GetLatestChatSessionMessagesSuccess = (
  messages: ChatMessage[]
) => ({
  type: GET_LATEST_CHAT_SESSION_MESSAGES_SUCCESS as typeof GET_LATEST_CHAT_SESSION_MESSAGES_SUCCESS,
  messages,
});

export const GetLatestChatSessionMessagesFailure = (error: any) => ({
  type: GET_LATEST_CHAT_SESSION_MESSAGES_FAILURE as typeof GET_LATEST_CHAT_SESSION_MESSAGES_FAILURE,
  error,
});

export const SelectChatSession = (sessionId: string) => ({
  type: SELECT_CHAT_SESSION as typeof SELECT_CHAT_SESSION,
  sessionId,
});

export const GetLayoutChatSessions = (layoutId: string) => ({
  type: GET_LAYOUT_CHATSESSIONS as typeof GET_LAYOUT_CHATSESSIONS,
  layoutId,
});

export const GetLayoutChatSessionsSuccess = (chatSessions: ChatSession[]) => ({
  type: GET_LAYOUT_CHATSESSIONS_SUCCESS as typeof GET_LAYOUT_CHATSESSIONS_SUCCESS,
  chatSessions,
});

export const GetLayoutChatSessionsFailure = (error: any) => ({
  type: GET_LAYOUT_CHATSESSIONS_FAILURE as typeof GET_LAYOUT_CHATSESSIONS_FAILURE,
  error,
});

export type GetChatSessionMessagesAction = ReturnType<
  typeof GetChatSessionMessages
>;
export type GetChatSessionMessagesSuccessAction = ReturnType<
  typeof GetChatSessionMessagesSuccess
>;
export type GetChatSessionMessagesFailureAction = ReturnType<
  typeof GetChatSessionMessagesFailure
>;
export type CreateChatSessionMessageAction = ReturnType<
  typeof CreateChatSessionMessage
>;
export type CreateChatSessionMessageSuccessAction = ReturnType<
  typeof CreateChatSessionMessageSuccess
>;
export type CreateChatSessionMessageFailureAction = ReturnType<
  typeof CreateChatSessionMessageFailure
>;
export type GetLatestChatSessionMessagesAction = ReturnType<
  typeof GetLatestChatSessionMessages
>;
export type GetLatestChatSessionMessagesSuccessAction = ReturnType<
  typeof GetLatestChatSessionMessagesSuccess
>;
export type GetLatestChatSessionMessagesFailureAction = ReturnType<
  typeof GetLatestChatSessionMessagesFailure
>;
export type SelectChatSessionAction = ReturnType<typeof SelectChatSession>;
export type GetLayoutChatSessionsAction = ReturnType<
  typeof GetLayoutChatSessions
>;
export type GetLayoutChatSessionsSuccessAction = ReturnType<
  typeof GetLayoutChatSessionsSuccess
>;
export type GetLayoutChatSessionsFailureAction = ReturnType<
  typeof GetLayoutChatSessionsFailure
>;
export type ToggleChatPanelAction = ReturnType<typeof ToggleChatPanel>;
export type SetChatPanelStateAction = ReturnType<typeof SetChatPanelState>;

export type Action =
  | GetChatSessionMessagesAction
  | GetChatSessionMessagesSuccessAction
  | GetChatSessionMessagesFailureAction
  | CreateChatSessionMessageAction
  | CreateChatSessionMessageSuccessAction
  | CreateChatSessionMessageFailureAction
  | GetLatestChatSessionMessagesAction
  | GetLatestChatSessionMessagesSuccessAction
  | GetLatestChatSessionMessagesFailureAction
  | SelectChatSessionAction
  | GetLayoutChatSessionsAction
  | GetLayoutChatSessionsFailureAction
  | GetLayoutChatSessionsSuccessAction
  | ToggleChatPanelAction
  | SetChatPanelStateAction;

// Reducer
export default createReducer<State, Types, Action>(initialState, {
  [TOGGLE_CHAT_PANEL]: (
    state: State,
    action: ToggleChatPanelAction
  ): State => ({
    ...state,
    chatPanelState: !state.chatPanelState,
  }),
  [SET_CHAT_PANEL_STATE]: (
    state: State,
    action: SetChatPanelStateAction
  ): State => ({
    ...state,
    chatPanelState: action.chatPanelState,
  }),
  [GET_CHAT_SESSION_MESSAGES]: (
    state: State,
    action: GetChatSessionMessagesAction
  ): State => state,
  [GET_CHAT_SESSION_MESSAGES_SUCCESS]: (
    state: State,
    action: GetChatSessionMessagesSuccessAction
  ): State => ({
    ...state,
    messages: [...action.messages],
  }),
  [GET_CHAT_SESSION_MESSAGES_FAILURE]: (
    state: State,
    action: GetChatSessionMessagesFailureAction
  ): State => ({
    ...state,
    messages: [...initialState.messages],
  }),
  [CREATE_CHAT_SESSION_MESSAGE]: (
    state: State,
    action: CreateChatSessionMessageAction
  ): State => state,
  [CREATE_CHAT_SESSION_MESSAGE_SUCCESS]: (
    state: State,
    action: CreateChatSessionMessageSuccessAction
  ): State => ({
    ...state,
    messages: [...state.messages, action.message],
  }),
  [CREATE_CHAT_SESSION_MESSAGE_FAILURE]: (
    state: State,
    action: CreateChatSessionMessageFailureAction
  ): State => ({
    ...state,
    messages: [...initialState.messages],
  }),
  [GET_LATEST_CHAT_SESSION_MESSAGES]: (
    state: State,
    action: GetLatestChatSessionMessagesAction
  ): State => ({
    ...state,
    lastMessagesLoading: true,
  }),
  [GET_LATEST_CHAT_SESSION_MESSAGES_SUCCESS]: (
    state: State,
    action: GetLatestChatSessionMessagesSuccessAction
  ): State => {
    if (!action.messages.length) {
      return {
        ...state,
        lastMessagesLoading: false,
      };
    }

    return {
      ...state,
      messages: [...state.messages, ...action.messages],
      lastMessagesLoading: false,
    };
  },
  [GET_LATEST_CHAT_SESSION_MESSAGES_FAILURE]: (
    state: State,
    action: GetLatestChatSessionMessagesFailureAction
  ): State => ({
    ...state,
    messages: [...initialState.messages],
    lastMessagesLoading: false,
  }),
  [SELECT_CHAT_SESSION]: (
    state: State,
    action: SelectChatSessionAction
  ): State => ({
    ...state,
    sessionId: action.sessionId,
  }),
  [GET_LAYOUT_CHATSESSIONS]: (
    state: State,
    action: GetLayoutChatSessionsAction
  ): State => ({
    ...state,
    chatSessionsLoading: true,
  }),
  [GET_LAYOUT_CHATSESSIONS_SUCCESS]: (
    state: State,
    action: GetLayoutChatSessionsSuccessAction
  ): State => ({
    ...state,
    chatSessionsLoading: false,
    chatSessions: action.chatSessions,
  }),
  [GET_LAYOUT_CHATSESSIONS_FAILURE]: (
    state: State,
    action: GetLayoutChatSessionsFailureAction
  ): State => ({
    ...state,
    chatSessionsLoading: false,
  }),
});
