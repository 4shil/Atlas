/**
 * Atlas — Goal Date Formatting Helpers
 */

type DateInput = Date | string;

export function formatGoalDate(
    date: DateInput,
    options: Intl.DateTimeFormatOptions
): string {
    return new Intl.DateTimeFormat(undefined, options).format(new Date(date));
}
