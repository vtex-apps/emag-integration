export const parseDate = (created: string) => {
  const date = new Date(created);
  return !isNaN(date.getTime())
    ? `${date.toLocaleDateString()} ${date.toLocaleTimeString()}:${date.getMilliseconds()}`
    : "N/A";
};

export const compareDates = (a: string, b: string) => {
  const timeA = new Date(a).getTime();
  const timeB = new Date(b).getTime();
  return timeA - timeB;
};
