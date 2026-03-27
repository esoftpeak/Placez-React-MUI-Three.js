import { useEffect, useState } from 'react';
import { Box, FormLabel, Grid } from '@mui/material';
import PlacezTextField from '../../components/PlacezUIComponents/PlacezTextField';
import { placezApi } from '../../api';

const BusinessInfoSettings = (props) => {
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
    const fetchData = async () => {
      try {
        const response = await placezApi.getBusinessInformationSettings();
        setBusinessInfo(response.parsedBody.businessInformationValue);
      } catch (error) {
        console.error('Error fetching business information:', error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (field) => (event) => {
    setBusinessInfo((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  useEffect(() => {
    if (!businessInfo) return null;

    const timeoutId = setTimeout(() => {
      placezApi.createBusinessInformationSettings(businessInfo);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [businessInfo]);

  return (
    <Box textAlign="left">
      <Box>Business Information</Box>
      <Box sx={{ mt: 2 }}>
        <FormLabel>Name</FormLabel>
        <PlacezTextField
          id="businessName"
          value={businessInfo?.businessName || ''}
          onChange={handleChange('businessName')}
          autoFocus
          inputProps={{
            maxLength: 200,
          }}
          type="text"
        />
      </Box>
      <Box sx={{ mt: 2 }}>
        <FormLabel>Street Address</FormLabel>
        <PlacezTextField
          id="businessStreetAddress"
          value={businessInfo?.businessStreetAddress || ''}
          onChange={handleChange('businessStreetAddress')}
          autoFocus
          inputProps={{
            maxLength: 200,
          }}
          type="text"
        />
      </Box>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={6}>
          <FormLabel>City</FormLabel>
          <PlacezTextField
            id="businessCity"
            value={businessInfo?.businessCity || ''}
            onChange={handleChange('businessCity')}
            autoFocus
            inputProps={{
              maxLength: 200,
            }}
            type="text"
          />
        </Grid>
        <Grid item xs={6}>
          <FormLabel>State</FormLabel>
          <PlacezTextField
            id="businessState"
            value={businessInfo?.businessState || ''}
            onChange={handleChange('businessState')}
            autoFocus
            inputProps={{
              maxLength: 200,
            }}
            type="text"
          />
        </Grid>
        <Grid item xs={6}>
          <FormLabel>Zip Code</FormLabel>
          <PlacezTextField
            id="businessZipCode"
            value={businessInfo?.businessZipCode || ''}
            onChange={handleChange('businessZipCode')}
            autoFocus
            inputProps={{
              maxLength: 200,
            }}
            type="text"
          />
        </Grid>
        <Grid item xs={6}>
          <FormLabel>Email</FormLabel>
          <PlacezTextField
            id="businessContactEmail"
            value={businessInfo?.businessContactEmail || ''}
            onChange={handleChange('businessContactEmail')}
            autoFocus
            inputProps={{
              maxLength: 200,
            }}
            type="text"
          />
        </Grid>
        <Grid item xs={12}>
          <FormLabel>Phone</FormLabel>
          <PlacezTextField
            id="businessPhone"
            value={businessInfo?.businessPhone || ''}
            onChange={handleChange('businessPhone')}
            autoFocus
            inputProps={{
              maxLength: 200,
            }}
            type="text"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default BusinessInfoSettings;
