import { Theme } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { ChatMessage } from '../../../../../api/placez/models';
import classnames from 'classnames';
import { getFormatedDate } from '../../../../../sharing/utils/DateHelper';

interface Props {
  message: ChatMessage;
  currentUserId: string;
}

const styles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      width: '75%',
      marginBottom: theme.spacing(2),
      float: 'left',
    },
    floatRight: {
      float: 'right',
    },
    message: {
      ...theme.typography.body1,
      margin: 0,
      fontSize: 12,
      width: '100%',
      background: theme.palette.common.white,
      color: theme.palette.getContrastText('#fff'),
      padding: `${theme.spacing()}px ${theme.spacing(2)}px`,
      borderRadius: `${theme.shape.borderRadius * 4}px ${theme.shape.borderRadius * 4}px
                    ${theme.shape.borderRadius * 4}px 0px`,
      whiteSpace: 'initial',
    },
    currentMember: {
      background: theme.palette.primary.main,
      color: theme.palette.getContrastText(theme.palette.primary.main),
      borderRadius: `${theme.shape.borderRadius * 4}px ${theme.shape.borderRadius * 4}px
                    0px ${theme.shape.borderRadius * 4}px `,
    },
    messageInfo: {
      ...theme.typography.body1,
      color: theme.palette.grey[300],
      fontSize: 11,
      margin: theme.spacing(),
      marginLeft: theme.spacing(),
    },
  })
);

const Message = (props: Props) => {
  const { message, currentUserId } = props;
  const classes = styles(props);
  const messageFromMe = message.senderUserId === currentUserId;

  const root = messageFromMe
    ? classnames(classes.root, classes.floatRight)
    : classes.root;
  const messageBox = messageFromMe
    ? classnames(classes.message, classes.currentMember)
    : classes.message;

  return (
    <div className={root}>
      <div className={messageBox}>{message.message}</div>
      <div className={classes.messageInfo}>
        {message.senderDisplayName} ·{' '}
        {getFormatedDate(new Date(message.createdUtcDateTime))}
      </div>
    </div>
  );
};

export default Message;
