export function getFormatedDate(date: Date): string {
  const afterMidday = date.getHours() > 12;
  const sentHour = afterMidday ? date.getHours() - 12 : date.getHours();
  const sentMinut = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
  const sentTimeFormated = `${sentHour}:${sentMinut} ${afterMidday ? 'PM' : 'AM'}`;

  return sentTimeFormated;
}
