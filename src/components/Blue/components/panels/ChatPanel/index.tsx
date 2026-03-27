import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  CreateChatSessionMessage,
  SelectChatSession,
  GetLatestChatSessionMessages,
  GetLayoutChatSessions,
} from '../../../../../reducers/chat';
import {
  createStyles,
  Theme,
  TextField,
  MenuItem,
  Select,
  Paper,
  Divider,
  IconButton,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Send } from '@mui/icons-material';
import Message from './Message';
import { ReduxState } from '../../../../../reducers';
import { isGuest } from '../../../../../reducers/globalState';

let messageUpdateTimer = null;

const DesignerHeaderHeight = '71px';
const blueHeader = '42px';
const headerBlockHeight = '30px';
const searchBlockHeight = '50px';
const searchBlockMargin = '8px';
const replyBlockHeight = '80px';
const titleBackground = '#2A2C32';
const blockBackgrount = '#35373B';

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      background: theme.palette.grey[900],
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid #5f5f5f',
    },

    headerBlock: {
      ...theme.typography.h5,
      color: theme.palette.grey[300],
      backgroundColor: titleBackground,
      height: headerBlockHeight,
      margin: 0,
      textAlign: 'center',
      fontSize: 20,
      fontWeight: 'bold',
      position: 'relative',
    },

    headerTitle: {
      color: '#f5f5f5',
    },

    searchBlock: {
      display: 'flex',
      flexFlow: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: searchBlockHeight,
      background: blockBackgrount,
      flexDirection: 'row',
      marginTop: searchBlockMargin,
    },
    searchRoot: {
      border: '1px solid grey',
      borderRadius: 2 * theme.shape.borderRadius,
      width: '90%',
      background: '#2A2C32',
    },
    selectMenu: {
      padding: 8,
    },
    searchRootGuest: {
      ...theme.typography.h5,
      color: theme.palette.getContrastText(theme.palette.grey[900]),
      width: '90%',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      textAlign: 'center',
    },
    searchIcon: {
      color: theme.palette.getContrastText(theme.palette.grey[900]),
    },

    messageBlock: {
      height: `calc(100vh
          - ${DesignerHeaderHeight}
          - ${blueHeader}
          - ${headerBlockHeight}
          - ${searchBlockHeight}
          - ${searchBlockMargin}
          - ${replyBlockHeight})`,
      width: '90%',
      margin: '10px auto 0',
      overflow: 'auto',
      scrollBehavior: 'smooth',
    },

    replyBlock: {
      height: replyBlockHeight,
      borderTop: '1px solid gray',
      backgroundColor: blockBackgrount,
    },
    replyControl: {
      padding: `${theme.spacing()}px ${theme.spacing()}px`,
      display: 'flex',
      alignItems: 'center',
      height: '100%',
    },
    divider: {
      width: 1,
      height: '70%',
    },
    iconButton: {
      padding: theme.spacing(),
    },
    replyTextField: {
      color: '#fff',
      width: '100%',
      padding: `${theme.spacing()}px ${theme.spacing()}px`,
    },
    cancelButton: {
      color: '#f5f5f5',
      width: '30px',
      fontSize: '30',
      borderRadius: '4px',
      padding: 0,
      verticalAlign: 'middle',
      position: 'absolute',
      top: '4px',
      right: '0',
    },
  })
);

interface Props {}

const ChatPanel = (props: Props) => {
  const classes = styles(props);
  const dispatch = useDispatch();

  const selectedSessionId = useSelector(
    (state: ReduxState) => state.chat.sessionId
  );
  const chatMessages = useSelector((state: ReduxState) => state.chat.messages);
  const lastMessagesLoading = useSelector(
    (state: ReduxState) => state.chat.lastMessagesLoading
  );
  const currentUserId = useSelector(
    (state: ReduxState) => state.oidc.user.profile.sub
  );
  const currentUser = useSelector(
    (state: ReduxState) => state.oidc.user.profile
  );
  const layoutId = useSelector((state: ReduxState) => state.designer.layout.id);
  const chatSessions = useSelector(
    (state: ReduxState) => state.chat.chatSessions
  );
  const isAGuest = useSelector((state: ReduxState) => isGuest(state));

  const [newMessage, setNewMessage] = useState<string>('');

  useEffect(() => {
    dispatch(GetLayoutChatSessions(layoutId));
    messageUpdateTimer = setInterval(updateSessionMessages, 5000);
    return () => {
      clearInterval(messageUpdateTimer);
    };
  }, []);

  // shouldComponentUpdate(nextProps, nextState) {
  //   const { chatMessages, selectedSessionId, chatSessions } = this.props;
  //   const { newMessage } = this.state;
  //   const needRerender =
  //     chatMessages !== nextProps.chatMessages ||
  //     selectedSessionId !== nextProps.selectedSessionId ||
  //     newMessage !== nextState.newMessage ||
  //     chatSessions !== nextState.chatSessions;

  //   return needRerender;
  // }

  useEffect(() => {
    if (chatSessions && chatSessions.length > 0) {
      dispatch(SelectChatSession(chatSessions[0].id));
    }
  }, [chatSessions]);

  useEffect(() => {
    scrollMessageBlockDown();
  }, [chatMessages]);

  const updateSessionMessages = () => {
    if (!selectedSessionId || lastMessagesLoading) {
      return;
    }

    const lastMessageId = chatMessages.length
      ? chatMessages[chatMessages.length - 1].id
      : null;
    dispatch(GetLatestChatSessionMessages(selectedSessionId, lastMessageId));
  };

  const sessionOnChange = (e) => {
    const {
      target: { value },
    } = e;
    dispatch(SelectChatSession(value));
  };

  const textFieldOnChange = (e) => {
    setNewMessage(e.target.value);
  };

  const textFieldOnKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendNewMessage();
    }
  };

  const sendNewMessage = () => {
    if (!newMessage) {
      return;
    }
    dispatch(CreateChatSessionMessage(selectedSessionId, newMessage));
    setNewMessage('');
  };

  const scrollMessageBlockDown = () => {
    const messageBlock = document.getElementById('message-block');
    if (!messageBlock) {
      return;
    }

    messageBlock.scrollTop = messageBlock.scrollHeight;
  };

  if (!chatSessions || chatSessions.length < 1) {
    return (
      <div className={classes.root}>
        <h1 className={classes.headerBlock}>Share the layout</h1>
        <h1 className={classes.headerBlock}>to start conversation</h1>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <div className={classes.headerBlock}>
        <span className={classes.headerTitle}>Conversation</span>
      </div>
      <div className={classes.searchBlock}>
        {isAGuest ? (
          <p className={classes.searchRootGuest}>
            {chatSessions.length > 0 ? chatSessions[0].name : ''}
          </p>
        ) : (
          <Select
            disableUnderline
            id="sessions"
            value={selectedSessionId}
            className={classes.searchRoot}
            classes={{
              icon: classes.searchIcon,
              select: classes.selectMenu,
            }}
            onChange={sessionOnChange}
          >
            {chatSessions.map((session, index) => (
              <MenuItem key={index} value={session.id}>
                {session.name}
              </MenuItem>
            ))}
          </Select>
        )}
      </div>
      <div id="message-block" className={classes.messageBlock}>
        {chatMessages.map((message, index) => (
          <Message
            key={`message-${message.id}`}
            message={message}
            currentUserId={currentUserId}
          />
        ))}
      </div>
      <div className={classes.replyBlock}>
        <Paper className={classes.replyControl} elevation={1}>
          <TextField
            id="reply"
            placeholder="Reply"
            autoComplete="off"
            multiline
            rows="4"
            InputProps={{
              disableUnderline: true,
            }}
            className={classes.replyTextField}
            value={newMessage}
            onChange={textFieldOnChange}
            onKeyPress={textFieldOnKeyPress}
          />
          <Divider className={classes.divider} />
          <IconButton
            disabled={!newMessage}
            className={classes.iconButton}
            aria-label="Send message"
            onClick={sendNewMessage}
          >
            <Send />
          </IconButton>
        </Paper>
      </div>
    </div>
  );
};

export default ChatPanel;
