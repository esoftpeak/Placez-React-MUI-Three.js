import { useState } from 'react';
import { Checkbox, Theme, useTheme } from '@mui/material';

import {
  Button,
  Tooltip,
  Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';

import settingStyles from '../../components/Styles/SettingStyles.css';
import PlacezTextField from '../../components/PlacezUIComponents/PlacezTextField';
import PlacezTextArea from '../../components/PlacezUIComponents/PlacezTextArea';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../reducers';
import {
  DefaultPaymentLinkSettings,
  EncodedLogoPosition,
  PaymentLinkSettings,
} from '../../api/payments/models/Payment';
import PlacezAutoComplete from '../../components/PlacezUIComponents/PlacezAutoComplete';
import { UpdateUserSetting } from '../../reducers/settings';
import ColorSelect from '../../components/Blue/components/utility/ColorSelect';
import { getUserSetting } from '../../api/placez/models/UserSetting'

interface Props {}

const PaymentSettings = (props: Props) => {
  const styles = makeStyles<Theme>(settingStyles);
  const [inEdit, setInEdit] = useState<boolean>(false);
  const classes = styles(props);
  const theme = useTheme();

  const dispatch = useDispatch();

  const paymentLinkSettings = useSelector((state: ReduxState) => getUserSetting(state.settings.userSettings, 'Payment_Link_Settings'));

  const [localPaymentLinkSettings, setLocalPaymentLinkSettings] =
    useState<PaymentLinkSettings>({
      ...DefaultPaymentLinkSettings,
      backgroundColor: theme.palette.primary.main,
      ...paymentLinkSettings?.settingValue,
    });

  const handleSetLocalPaymentLinkSettings = (
    key: keyof PaymentLinkSettings,
    value: any
  ) => {
    const updatedSettings = {
      ...localPaymentLinkSettings,
      [key]: value,
    };
    setLocalPaymentLinkSettings(updatedSettings);
    dispatch(
      UpdateUserSetting({
        ...paymentLinkSettings,
        settingValue: updatedSettings,
      })
    );
  };

  const onCancel = () => {
    setInEdit(false);
  };

  const onSubmit = () => {
    setInEdit(false);
  };

  return (
    <div className={classes.root}>
      <div className={classes.form}>
        <div className={classes.formControl}>
          <Typography variant="body1">Payment Terms Net (days)</Typography>
          <Tooltip title="Payment Terms Net">
            <div style={{ width: '200px' }}>
              <PlacezTextField
                type="number"
                id="net-terms"
                value={localPaymentLinkSettings?.paymentTermsNet}
                onChange={(e) => {
                  handleSetLocalPaymentLinkSettings(
                    'paymentTermsNet',
                    e.target.value
                  );
                }}
                inputProps={{
                  maxLength: 3,
                }}
              />
            </div>
          </Tooltip>
        </div>
        <div className={classes.formControl}>
          <Typography variant="body1">Invoice Sender Name</Typography>
          <Tooltip title="Sender Name">
            <div style={{ width: '200px' }}>
              <PlacezTextField
                type="text"
                id="Sender-Name"
                value={localPaymentLinkSettings?.senderName ?? ''}
                onChange={(e) =>
                  handleSetLocalPaymentLinkSettings(
                    'senderName',
                    e.target.value
                  )
                }
                inputProps={{
                  maxLength: 3,
                }}
              />
            </div>
          </Tooltip>
        </div>
        <div className={classes.formControl}>
          <Typography variant="body1">Invoice Reply Email</Typography>
          <Tooltip title="Reply Email">
            <div style={{ width: '200px' }}>
              <PlacezTextField
                type="email"
                id="Reply-Email"
                value={localPaymentLinkSettings?.replyEmail ?? ''}
                onChange={(e) =>
                  handleSetLocalPaymentLinkSettings(
                    'replyEmail',
                    e.target.value
                  )
                }
                inputProps={{
                  maxLength: 3,
                }}
              />
            </div>
          </Tooltip>
        </div>
        <div className={classes.formControl}>
          <Typography variant="body1">Allow Surcharge</Typography>
          <Tooltip title="Allow Tips">
            <Checkbox
              checked={localPaymentLinkSettings.showTip}
              value={localPaymentLinkSettings.showTip}
              onChange={(e) =>
                handleSetLocalPaymentLinkSettings('showTip', e.target.value)
              }
            />
          </Tooltip>
        </div>
        <div className={classes.formControl}>
          <Typography variant="body1">Exclude American Express</Typography>
          <Tooltip title="Exclude Amex">
            <Checkbox
              checked={localPaymentLinkSettings.excludeAmex}
              value={localPaymentLinkSettings.excludeAmex}
              onChange={(e) =>
                handleSetLocalPaymentLinkSettings('excludeAmex', e.target.value)
              }
            />
          </Tooltip>
        </div>
        <div className={classes.formControl}>
          <Typography variant="body1">Automatically Send Email</Typography>
          <Tooltip title="Automatically Send Email">
            <Checkbox
              checked={localPaymentLinkSettings.sendEmail}
              value={localPaymentLinkSettings.sendEmail}
              onChange={(e) =>
                handleSetLocalPaymentLinkSettings('sendEmail', e.target.checked)
              }
            />
          </Tooltip>
        </div>
        <div className={classes.formControl}>
          <Typography variant="body1">Introduction Message</Typography>
        </div>
        <Tooltip title="Invoice Introduction Message">
          <PlacezTextArea
            type="email"
            id="Reply-Email"
            value={localPaymentLinkSettings.invoiceIntroductionMessage}
            onChange={(e) =>
              handleSetLocalPaymentLinkSettings(
                'invoiceIntroductionMessage',
                e.target.value
              )
            }
            inputProps={{
              rows: 3,
            }}
          />
        </Tooltip>
        <div className={classes.formControl}>
          <Typography variant="body1">Invoice Message</Typography>
        </div>
        <Tooltip title="Invoice Message">
          <PlacezTextArea
            type="email"
            id="Reply-Email"
            value={localPaymentLinkSettings.invoiceMessage}
            onChange={(e) =>
              handleSetLocalPaymentLinkSettings(
                'invoiceMessage',
                e.target.value
              )
            }
            inputProps={{
              rows: 3,
            }}
          />
        </Tooltip>
        <div className={classes.formControl}>
          <Typography variant="body1">Invoice Background Color</Typography>
          <Tooltip title="Invoice Background Color">
            <ColorSelect
              color={localPaymentLinkSettings?.backgroundColor}
              onChange={(e) =>
                handleSetLocalPaymentLinkSettings('backgroundColor', e)
              }
            />
          </Tooltip>
        </div>
        <div className={classes.formControl}>
          <Typography variant="body1">Invoice Text Color</Typography>
          <Tooltip title="Invoice Text Color">
            <ColorSelect
              color={localPaymentLinkSettings?.textColor}
              onChange={(e) =>
                handleSetLocalPaymentLinkSettings('backgroundColor', e)
              }
            />
          </Tooltip>
        </div>
        <div className={classes.formControl}>
          <Typography variant="body1">Logo Position</Typography>
          <Tooltip title="Logo Position">
            <div style={{ width: '200px' }}>
              <PlacezAutoComplete
                options={Object.keys(EncodedLogoPosition)}
                value={localPaymentLinkSettings.encodedLogoPosition}
                onChange={(e, v) => {
                  handleSetLocalPaymentLinkSettings('encodedLogoPosition', v);
                }}
                renderInput={(params) => <PlacezTextField {...params} />}
              />
            </div>
          </Tooltip>
        </div>

        {inEdit && (
          <div className={classes.actions}>
            <Button
              onClick={onCancel}
              className={classes.actionButton}
              variant="contained"
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              className={classes.actionButton}
              variant="contained"
              color="primary"
            >
              Save
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSettings;
