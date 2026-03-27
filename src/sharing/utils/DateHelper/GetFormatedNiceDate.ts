export function getFormatedNiceDate(
  paramDate: Date,
  twentyFourHourTime?: boolean
): string {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  //
  // TODO:  Scene dates are being convert to strings for some reason, need to figure out why.
  //

  let date = paramDate;
  if (typeof date === 'string') {
    date = new Date(paramDate);
  }
  const hours = date.getHours();
  const afterMidday = hours >= 12;
  const sentHour =
    afterMidday && hours !== 12 ? hours - 12 : hours === 0 ? hours + 12 : hours;

  const sentMinut = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
  const sentMonth = date.getMonth();
  const sentDay = date.getDate();
  const sentYear = date.getFullYear();

  const sentTimeFormated = `${months[sentMonth]} ${sentDay}, ${sentYear} at ${twentyFourHourTime ? hours : sentHour}:${sentMinut} ${twentyFourHourTime ? '' : afterMidday ? 'PM' : 'AM'}`;

  return sentTimeFormated;
}
