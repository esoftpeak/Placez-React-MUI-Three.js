export default interface UserSetting {
  id: number;
  name: string;
  valueType: string;
  group: string;
  settingValue: any;
  defaultValue: any;
}

export enum RenderOrder {
  FloorplaneImage = -1,
  BaseEdge = -2,
  Floorplane = -3,
  PhotosphereImage = -4,
}

export const getUserSettingValue = (
  userSettings: UserSetting[],
  settingName: string
): any => {
  const userSetting = userSettings.find(
    (setting) => setting.name === settingName
  );
  return userSetting ? userSetting.settingValue : undefined;
};

export const getUserSetting = (
  userSettings: UserSetting[],
  settingName: string
): any => {
  return userSettings.find((setting) => setting.name === settingName);
};

export enum ValidUnits {
  ftIn = 'ftin ',
  ft = 'ft',
  in = 'in',
  cm = 'cm',
}
const host = import.meta.env.VITE_APP_PLACEZ_API_URL;

export enum TimeFormats {
  TwentyFourHourHourTime = '24-Hour',
  TwelveHourHourTime = '12-Hour',
}

export interface OrgTheme {
  splash: string;
  editorBackground: string;
  textLogo: string;
  defaultSceneImage: string;
  defaultPlaceImage: string;
  primaryColor: string;
  lightSecondaryColor: string;
  darkSecondaryColor: string;
  logo?: string;
  name: string;
  fontStyle: string;
  icon: string;
}
const itroi: OrgTheme = {
  splash: `${host}/Assets/d8897d73-2199-4945-89b9-4e701858b22c.png`,
  editorBackground: `${host}/Assets/14ce51f8-4109-456d-ac00-389eb9b47af7.png`, //
  textLogo: `${host}/Assets/82d5c28f-d9b8-4416-9cd1-8713c961a2a3.png`, //
  // defaultSceneImage: `${host}/Assets/5f3dc6d0-7ffa-44a2-af7c-d4d057296178.png`, //
  defaultPlaceImage: `${host}/Assets/e54b96ba-9730-4a09-8dd5-435ac7b3dc71.png`, //
  defaultSceneImage: `${host}/Assets/0102c8c8-01ce-4e17-bac8-49f32e293873.png`,
  primaryColor: '#C5B076',
  lightSecondaryColor: '#DBCEA9',
  darkSecondaryColor: '#DBCEA9',
  logo: `${host}/Assets/5e998dbf-39e1-4263-adab-488fcdb3af08.png`,
  name: 'La Bella Toscana',
  fontStyle: '20px',
  icon: `${host}/Assets/0cf1320f-c00c-42d5-a316-dd96b4f124ba.png`,
};

const partyCad: OrgTheme = {
  splash: `${host}/Assets/d8897d73-2199-4945-89b9-4e701858b22c.png`,
  editorBackground: `${host}/Assets/4fc82862-5c8f-48ea-873c-4d5c3b18246f.png`,
  textLogo: `${host}/Assets/4c8468ce-5c2d-4081-9ec9-2e8ce7f2db6a.png`,
  defaultSceneImage: `${host}/Assets/0102c8c8-01ce-4e17-bac8-49f32e293873.png`,
  defaultPlaceImage: `${host}/Assets/0102c8c8-01ce-4e17-bac8-49f32e293873.png`,
  primaryColor: '#81BD41',
  lightSecondaryColor: '#81BD41',
  darkSecondaryColor: '#81BD41',
  logo: `${host}/Assets/fa0f746c-9859-4d52-903e-93bda4758ef6.svg`,
  name: 'PartyCAD',
  icon: `${host}/Assets/73060661-8ae0-4d13-980a-9298f4c3bebc.png`,
  fontStyle: '43px',
};

const whiteLabelDemo: OrgTheme = {
  splash: `${host}/Assets/d8897d73-2199-4945-89b9-4e701858b22c.png`,
  editorBackground: `${host}/Assets/b15e5241-fde6-4a8f-8d9c-e777a92f119f.png`,
  textLogo: `${host}/Assets/e9fe9ebe-e424-408a-b1b0-a9a119acac65.png`,
  defaultSceneImage: `${host}/Assets/0102c8c8-01ce-4e17-bac8-49f32e293873.png`,
  defaultPlaceImage: `${host}/Assets/a9f2849a-d77f-46d8-9ffd-e1351bad3e21.png`,
  primaryColor: '#D28C7B',
  lightSecondaryColor: '#f6C6BA',
  darkSecondaryColor: '#f6C6BA',
  logo: `${host}/Assets/7c11fa32-689a-45da-b584-4f4045220571.svg`,
  name: 'Olive',
  fontStyle: '43px',
  icon: `${host}/Assets/60c2938d-bb03-424b-a220-606d4acd65c4.png`,
};

const wildFlower: OrgTheme = {
  splash: `${host}/Assets/d8897d73-2199-4945-89b9-4e701858b22c.png`,
  editorBackground: `${host}/Assets/2855574f-c188-44cd-8935-a2d125c0036c.png`,
  textLogo: `${host}/Assets/f257cb50-c94f-4d14-aef4-eac8ed0043ff.png`,
  defaultSceneImage: `${host}/Assets/0102c8c8-01ce-4e17-bac8-49f32e293873.png`,
  defaultPlaceImage: `${host}/Assets/a9f2849a-d77f-46d8-9ffd-e1351bad3e21.png`,
  primaryColor: '#5C236F',
  lightSecondaryColor: '#afa0b3',
  darkSecondaryColor: '#afa0b3',
  logo: `${host}/Assets/af2dd2f6-2b80-47fc-82ab-95a383d79c3f.svg`,
  name: 'Wildflowers',
  fontStyle: '30px',
  icon: `${host}/Assets/55829d32-938c-40da-82fc-7e1acacdbde2.png`,
};

const classicPartyRental: OrgTheme = {
  splash: `${host}/Assets/d8897d73-2199-4945-89b9-4e701858b22c.png`,
  editorBackground: `${host}/Assets/ca32d9b6-2acf-4328-9e58-f99ac602da0b.png`,
  textLogo: `${host}/Assets/1d4d61ae-09d0-45c5-af52-d640407f3f17.png`,
  defaultSceneImage: `${host}/Assets/0102c8c8-01ce-4e17-bac8-49f32e293873.png`,
  defaultPlaceImage: `${host}/Assets/a9f2849a-d77f-46d8-9ffd-e1351bad3e21.png`,
  primaryColor: '#d09e42',
  lightSecondaryColor: '#cca45a',
  darkSecondaryColor: '#cca45a',
  logo: `${host}/Assets/af2dd2f6-2b80-47fc-82ab-95a383d79c3f.svg`,
  name: 'Placez',
  fontStyle: '43px',
  icon: `${host}/Assets/55829d32-938c-40da-82fc-7e1acacdbde2.png`,
};

const defaultTheme: OrgTheme = {
  splash: `${host}/Assets/d8897d73-2199-4945-89b9-4e701858b22c.png`,
  editorBackground: `${host}/Assets/c3d9fabc-b224-4758-b9d7-cf04eb1fefb7.png`,
  textLogo: `${host}/Assets/1d4d61ae-09d0-45c5-af52-d640407f3f17.png`,
  defaultSceneImage: `${host}/Assets/0102c8c8-01ce-4e17-bac8-49f32e293873.png`,
  defaultPlaceImage: `${host}/Assets/a9f2849a-d77f-46d8-9ffd-e1351bad3e21.png`,
  primaryColor: '#5C236F',
  lightSecondaryColor: '#f0f0f0',
  darkSecondaryColor: '#4B3D54',
  // logo: `${host}/Assets/10639128-6579-4285-baf2-91703529b592.svg`,
  // logo: `${host}/Assets/af2dd2f6-2b80-47fc-82ab-95a383d79c3f.svg`,
  name: 'Placez',
  fontStyle: '43px',
  icon: `${host}/Assets/55829d32-938c-40da-82fc-7e1acacdbde2.png`,
};

const themes: { [name: string]: OrgTheme } = {
  default: defaultTheme,
  '85080aec-52d1-4adf-958b-95746e37d654': partyCad, // staging
  'a48f3dcf-69d9-4a08-9b57-be40ace43db4': partyCad, // Prod
  'd54390f4-bb44-42bd-b0d6-3d1973fc27df': itroi, // Prod
  '9d8fc631-3ba5-41ae-09fc-08d6f33f1325': itroi, // staging
  '4ce7b3ec-b7d4-4a90-86e9-fff3da085182': whiteLabelDemo,
  '18fa7b8b-3904-4532-be23-4d665c1a6775': wildFlower,
  '73b97775-18f0-45eb-ad32-619639378528': classicPartyRental,
};

export const getOrgTheme = (orgId?: string): OrgTheme => {
  return themes[orgId] ?? themes.default;
};
