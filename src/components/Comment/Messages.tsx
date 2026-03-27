interface Props {
  messages: [];
  currentMember: {};
}

const Messages = (props: Props) => {
  const renderMessage = (message) => {
    const { text } = message;
    const { currentMember } = props;
    const messageFromMe = true; // member.id === currentMember.id;
    const className = messageFromMe
      ? 'Messages-message currentMember'
      : 'Messages-message';
    return (
      <li className={className}>
        <span className="avatar" style={{ backgroundColor: 'red' }} />
        <div className="Message-content">
          <div className="username">demont00</div>
          <div className="text">{text}</div>
        </div>
      </li>
    );
  };

  const { messages } = props;
  return (
    <ul className="Messages-list">{messages.map((m) => renderMessage(m))}</ul>
  );
};

export default Messages;
