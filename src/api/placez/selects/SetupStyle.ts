enum SetupStyle {
  Custom = 0,
  BoardRoom = 1,
  Theatre = 2,
  Classroom = 3,
  Cafeteria = 4,
  UBend = 5,
}

export const setupStyles = [
  { value: SetupStyle.Custom, label: 'Custom' },
  { value: SetupStyle.BoardRoom, label: 'Board Room' },
  { value: SetupStyle.Theatre, label: 'Theatre' },
  { value: SetupStyle.Classroom, label: 'Classroom' },
  { value: SetupStyle.Cafeteria, label: 'Cafeteria' },
  { value: SetupStyle.UBend, label: 'U-Bend' },
];

export default SetupStyle;
