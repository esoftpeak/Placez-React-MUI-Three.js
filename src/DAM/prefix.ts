export default interface Prefix {
  assetPrefix: string;
  description?: string;
}

export const Prefixes = [
  { assetPrefix: 'ACC', description: 'Accessories' },
  { assetPrefix: 'APL', description: 'Appliance' },
  { assetPrefix: 'ACH', description: 'Arches' },
  { assetPrefix: 'BAR', description: 'Bars' },
  { assetPrefix: 'BED', description: 'Bed' },
  { assetPrefix: 'BEN', description: 'Bench' },
  { assetPrefix: 'CAB', description: 'Cabinets' },
  { assetPrefix: 'CHR', description: 'Chairs' },
  { assetPrefix: 'CCH', description: 'Couch' },
  { assetPrefix: 'DSH', description: 'Dish' },
  { assetPrefix: 'DOR', description: 'Doors' },
  { assetPrefix: 'AV', description: 'Electronics' },
  { assetPrefix: 'GYM', description: 'Gym Equipment' },
  { assetPrefix: 'LSC', description: 'Landscape' },
  { assetPrefix: 'LTE', description: 'Lights' },
  { assetPrefix: 'LIN', description: 'Linen' },
  { assetPrefix: 'MAM', description: 'Mammal' },
  { assetPrefix: 'BLD', description: 'Miscellaneous Building ' },
  { assetPrefix: 'PIC', description: 'Picture/Poster' },
  { assetPrefix: 'PLN', description: 'Plant' },
  { assetPrefix: 'PLM', description: 'Plumbing Supplies' },
  { assetPrefix: 'POD', description: 'Podiums' },
  { assetPrefix: 'PRP', description: 'Props' },
  { assetPrefix: 'RAC', description: 'Racks' },
  { assetPrefix: 'FLR', description: 'Rug, Mat, Dance Floor' },
  { assetPrefix: 'STG', description: 'Stages' },
  { assetPrefix: 'STL', description: 'Stools' },
  { assetPrefix: 'TBL', description: 'Table' },
  { assetPrefix: 'TNT', description: 'Tents' },
  { assetPrefix: 'TRL', description: 'Trellis' },
  { assetPrefix: 'WF', description: 'Water Feature' },
  { assetPrefix: 'WIN', description: 'Window' },
] as Prefix[];
