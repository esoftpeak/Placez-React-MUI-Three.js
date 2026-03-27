import * as React from 'react';
import { Input } from '@mui/material';

interface Props {
  messages: [];
  onSendMessage: Function;
}

const ChatInput = (props: Props) => {
  const [text, setText] = React.useState('');

  const handleChange = (event: any) => {
    setText(event.target.value);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setText('');
    props.onSendMessage(text);
  };

  return (
    <div className="Input">
      <form onSubmit={(e) => onSubmit(e)}>
        <Input onChange={handleChange} value={text} />
        <button>Send</button>
      </form>
    </div>
  );
};

export default ChatInput;
