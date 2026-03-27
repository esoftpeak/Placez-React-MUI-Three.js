import PlacezTextField from './PlacezTextField';
import PlacezAutoComplete from './PlacezAutoComplete';

interface Props {
  onChange: (value: string) => void;
}

const PlacezStatePicker = (props: Props) => {
  return (
    <PlacezAutoComplete
      options={StateAbbreviations}
      renderInput={(params) => (
        <PlacezTextField
          {...params}
          label="Phone Number"
          inputProps={{ maxLength: 12 }} // Max length including dashes
          onChange={(e) => console.log(e)}
        />
      )}
    />
  );
};

export default PlacezStatePicker;

export const StateAbbreviations = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'AS',
  'CA',
  'CO',
  'CT',
  'DE',
  'DC',
  'FL',
  'GA',
  'GU',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'MP',
  'OH',
  'OK',
  'OR',
  'PA',
  'PR',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'TT',
  'UT',
  'VT',
  'VA',
  'VI',
  'WA',
  'WV',
  'WI',
  'WY',
];
