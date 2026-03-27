import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import { InvoiceLineItem } from '../../components/Invoicing/InvoiceLineItemModel';
import { useEffect, useState } from 'react';
import { placezApi } from '../../api';
import placezLogoPurple from '../../assets/images/placezLogoPurplex512.png';

/**
 * SAFE currency formatter
 * - Never throws
 * - Handles string | number | null | undefined
 * - React-PDF safe
 */
const formatCurrency = (value: unknown) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return '$0.00';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#333',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    padding: 45,
    backgroundColor: '#F6F7FC',
  },

  headerLeft: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  headerText: {
    fontSize: 10,
    marginBottom: 2,
  },
  logo: {
    marginTop: 4,
    width: 80,
    objectFit: 'contain',
    marginBottom: 6,
    paddingHorizontal: 2,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  infoBlock: {
    width: '45%',
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000',
    paddingHorizontal: 45,
  },
  infoText: {
    marginBottom: 2,
    color: '#8C8C8C',
    paddingHorizontal: 45,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#DEE0E9',
    paddingVertical: 10,
    paddingHorizontal: 45,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 2.5,
    paddingHorizontal: 45,
  },
  colDescription: {
    width: '60%',
  },
  colPrice: {
    width: '20%',
    textAlign: 'right',
  },
  colTotal: {
    width: '20%',
    textAlign: 'right',
  },
  tableHeaderText: {
    fontWeight: 'bold',
  },

  totalsWrapper: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  totalsBorder: {
    borderTop: '1px solid #D7D7D7',
    marginVertical: '5px',
    width: '42.5%',
  },
  totalsRow: {
    flexDirection: 'row',
    width: '40%',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingHorizontal: 45,
  },
  grandTotal: {
    fontWeight: 'bold',
    marginTop: 6,
  },

  footer: {
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },

  footerBlock: {
    width: '60%',
    paddingLeft: 45,
    flex: 1,
  },

  notesBlock: {
    backgroundColor: '#DEE0E9',
    padding: 10,
  },

  notesLabel: {
    fontWeight: 'bold',
  },

  infoBlockRight: {
    width: '60%',
    alignItems: 'flex-end',
    textAlign: 'right',
  },
});

interface InvoiceDocProps {
  invoiceLineItems: InvoiceLineItem[];
  companyLogo?: string;
  event?: any;
}

export const InvoiceDoc = ({
  invoiceLineItems,
  companyLogo,
  event,
}: InvoiceDocProps) => {
  const [invoiceFormatSettings, setInvoiceFormatSettings] = useState<any>({});
  const [businessInfo, setBusinessInfo] = useState({
    businessStreetAddress: '',
    businessCity: '',
    businessState: '',
    businessZipCode: '',
    businessContactEmail: '',
    businessPhone: '',
    businessName: '',
  });

  useEffect(() => {
    const getInvoiceSettings = async () => {
      const response = await placezApi.getInvoiceFormatSettings();
      setInvoiceFormatSettings(response?.parsedBody);
    };
    getInvoiceSettings();
  }, []);

  useEffect(() => {
    const getBusinessSettings = async () => {
      try {
        const response = await placezApi.getBusinessInformationSettings();
        setBusinessInfo(response.parsedBody.businessInformationValue);
      } catch (error) {
        console.error('Error fetching business information:', error);
      }
    };
    getBusinessSettings();
  }, []);

  const subtotal = invoiceLineItems.reduce(
    (sum, item) => sum + (Number(item.price * (item.quantity || 1)) || 0),
    0
  );

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const shipping = 30;
  const grandTotal = subtotal + shipping;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>INVOICE</Text>
            <View>
              <Text style={styles.headerText}>
                Date: {new Date().toLocaleDateString()}
              </Text>
            </View>
            <View>
              <Text style={styles.headerText}>
                Event Number: {event?.id || ''}
              </Text>
            </View>
          </View>
          <View style={{ paddingHorizontal: 2 }}>
            <Image style={styles.logo} src={companyLogo || placezLogoPurple} />
            {/* Event Details */}
            <View>
              {invoiceFormatSettings?.eventName && (
                <Text style={styles.headerText}>
                  Event Name: {event?.name || ''}
                </Text>
              )}
            </View>
            <View>
              {event.estimatedGuestCount !== null &&
                invoiceFormatSettings.guestCount === true && (
                  <Text style={styles.headerText}>
                    Event Guest Count: {event?.estimatedGuestCount}
                  </Text>
                )}
            </View>
          </View>
        </View>

        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          {/* Payable / Bill From */}
          <View style={styles.infoRow}>
            {/* Payable To */}
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>PAYABLE TO</Text>
              <Text style={styles.infoText}>{businessInfo.businessName}</Text>
              <Text style={styles.infoText}>
                {businessInfo.businessStreetAddress}
                {businessInfo.businessCity
                  ? ', ' + businessInfo.businessCity
                  : ''}
                {businessInfo.businessState
                  ? ', ' + businessInfo.businessState
                  : ''}{' '}
                {businessInfo.businessZipCode || ''}
              </Text>
            </View>
            <View>
              {invoiceFormatSettings.eventAddress && event?.address && (
                <Text style={styles.infoLabel}>EVENT ADDRESS</Text>
              )}
              {event?.address && invoiceFormatSettings.eventAddress && (
                <Text style={styles.infoText}>
                  {[event.address.line1, event.address.line2]
                    .filter(Boolean)
                    .join(', ')}
                  {event.address.city ? ', ' + event.address.city : ''}
                  {event.address.stateProvince
                    ? ', ' + event.address.stateProvince
                    : ''}{' '}
                  {event.address.postalCode
                    ? ' ' + event.address.postalCode
                    : ''}
                  {event.address.country ? ', ' + event.address.country : ''}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.colDescription, styles.tableHeaderText]}>
            Item Description
          </Text>
          <Text style={[styles.colPrice, styles.tableHeaderText]}>Price</Text>
          <Text style={[styles.colTotal, styles.tableHeaderText]}>Total</Text>
        </View>

        {invoiceLineItems
          .filter((item) => !item.notes?.startsWith('Total'))
          .filter((item) => !item.isHeader)
          .map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.colDescription}>
                {item.description || item.name || '-'}
              </Text>
              <Text style={styles.colPrice}>
                {!item.isHeader ? formatCurrency(item.price) : ''}
              </Text>
              <Text style={styles.colTotal}>
                {!item.isHeader
                  ? formatCurrency(item.price * (item.quantity || 1)) // if quantity is not provided, default to 1
                  : ''}
              </Text>
            </View>
          ))}

        {/* Totals */}
        <View style={styles.totalsWrapper}>
          <View style={styles.totalsBorder} />
          <View style={styles.totalsRow}>
            <Text>Sub Total</Text>
            <Text>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text>Shipping</Text>
            <Text>{formatCurrency(shipping)}</Text>
          </View>
          <View style={[styles.totalsRow, styles.grandTotal]}>
            <Text>Grand Total</Text>
            <Text>{formatCurrency(grandTotal)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View
            style={[
              styles.footerBlock,
              {
                justifyContent: 'flex-end',
              },
            ]}
          >
            {invoiceFormatSettings?.businessPhone && (
              <Text style={{ marginBottom: '3px' }}>
                <Text style={{ fontWeight: 'bold' }}>PHONE</Text> •{' '}
                {businessInfo.businessPhone}
              </Text>
            )}
            {invoiceFormatSettings?.businessEmail && (
              <Text style={{ marginBottom: '3px' }}>
                <Text style={{ fontWeight: 'bold' }}>EMAIL</Text> •{' '}
                {businessInfo.businessContactEmail}
              </Text>
            )}
            {invoiceFormatSettings?.venueAddress && (
              <Text style={{ marginBottom: '-2px' }}>
                <Text style={{ fontWeight: 'bold' }}>ADDRESS</Text> •{' '}
                {businessInfo.businessStreetAddress}
                {businessInfo.businessCity
                  ? ', ' + businessInfo.businessCity
                  : ''}
                {businessInfo.businessState
                  ? ', ' + businessInfo.businessState
                  : ''}{' '}
                {businessInfo.businessZipCode || ''}
              </Text>
            )}
          </View>
          {invoiceFormatSettings?.bottomNotes && (
            <View style={styles.footerBlock}>
              <View style={styles.notesBlock}>
                <Text style={styles.notesLabel}>NOTES:</Text>
                <Text>{invoiceFormatSettings.bottomNotes || ''}</Text>
              </View>
            </View>
          )}
        </View>
        <View style={{ alignSelf: 'center', color: 'gray' }}>
          {invoiceFormatSettings.footer}
        </View>
      </Page>
    </Document>
  );
};
