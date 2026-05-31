import {format, differenceInMinutes, parseISO, startOfWeek, endOfWeek} from 'date-fns';

export const formatDate = (date: string | Date): string =>
  format(typeof date === 'string' ? parseISO(date) : date, 'dd MMM yyyy');

export const formatTime = (date: string | Date): string =>
  format(typeof date === 'string' ? parseISO(date) : date, 'HH:mm');

export const formatDateForApi = (date: Date): string =>
  format(date, 'yyyy-MM-dd');

export const minutesToHoursLabel = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export const getHoursWorked = (
  clockIn: string,
  clockOut?: string,
): string => {
  if (!clockOut) {
    return minutesToHoursLabel(
      differenceInMinutes(new Date(), parseISO(clockIn)),
    );
  }
  return minutesToHoursLabel(
    differenceInMinutes(parseISO(clockOut), parseISO(clockIn)),
  );
};

export const weekBounds = (
  date: Date = new Date(),
): {start: string; end: string} => ({
  start: formatDateForApi(startOfWeek(date, {weekStartsOn: 1})),
  end: formatDateForApi(endOfWeek(date, {weekStartsOn: 1})),
});
