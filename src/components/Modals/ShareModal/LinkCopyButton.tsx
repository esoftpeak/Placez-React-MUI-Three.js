import copy from 'clipboard-copy';

import { useTheme } from '@mui/material';

import { FileCopyOutlined as CopyToClipboardIcon } from '@mui/icons-material';
import LargeIconButton from './LargeIconButton'

interface Props {
  link: string;
  label?: string;
}

const LinkCopyButton = (props: Props) => {
  const { link } = props;
  const theme = useTheme();

  return (
    <>
      {document.queryCommandSupported('copy') && (
        <LargeIconButton
          label={props.label}
          onClick={() => {copy(link)}}
          color={theme.palette.secondary.main}
        >
          <CopyToClipboardIcon fontSize='inherit'/>
        </LargeIconButton>
      )}
    </>
  );
};

export default LinkCopyButton;
