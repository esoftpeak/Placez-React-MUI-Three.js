export enum HelpOptions {
  BatchPanel = 'BatchPanel',
}

interface HelpDetails {
  text: string;
  url: string;
  imageUrl: string;
  title: string;
}

export const HELP_DETAILS: Record<HelpOptions, HelpDetails> = {
  [HelpOptions.BatchPanel]: {
    title: 'Batch Panel',
    text: 'Click and drag to create a batch area.',
    url: 'http://support.getplacez.com/helpmenu/content/Creating%20Layouts/Designing%20a%20New%20Layout.htm',
    imageUrl: 'HelpImages/BatchHelp.png',
  },
};
