import FormatColorFillOutlinedIcon from '@mui/icons-material/FormatColorFillOutlined';
import { ChromePicker } from 'react-color';
import { Theme, Box } from '@mui/material';
import { makeStyles } from '@mui/styles';

interface ColorPickerToolBarProps {
    pickerRef: React.RefObject<HTMLDivElement>,
    style: string,
    value: Boolean,
    onShow: () => void,
    onChange: (color: any) => void
}

const useStyles = makeStyles<Theme>((theme: Theme) => ({
    colorPickerPanel: {
        position: 'absolute',
        top: '35px',
        right: '-20px',
        zIndex: 9999,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        borderRadius: '8px',
        opacity: 0,
        transform: 'scale(0.92)',
        transformOrigin: 'top right',
        pointerEvents: 'none',
        transition: 'all 160ms cubic-bezier(0.2, 0, 0, 1)',
    },
    invoiceHeaderColorPicker: {
        position: 'absolute',
        top: '0.8rem',
        right: '0.8rem',
        fontSize: '28px',
        color: '#5C5C5C',
        pointerEvents: 'auto',
        cursor: 'pointer'
    },
    colorPickerPanelOpen: {
        opacity: 1,
        transform: 'scale(1)',
        pointerEvents: 'auto',
    }
}))

const ColorPickerToolBar = ({ pickerRef, style, value, onShow, onChange }: ColorPickerToolBarProps) => {
    const componentStyles = useStyles();
    return (
        <>
            <FormatColorFillOutlinedIcon
                name="Color picker"
                className={componentStyles.invoiceHeaderColorPicker}
                onClick={onShow}
            />
            <Box ref={pickerRef} className={`${componentStyles.colorPickerPanel} ${value && componentStyles.colorPickerPanelOpen}`}>
                <ChromePicker
                    color={style}
                    onChange={onChange}
                    disableAlpha={true}
                />
            </Box>
        </>
    )
}

export default ColorPickerToolBar;