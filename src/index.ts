import { format } from "date-fns";
import { fr } from "date-fns/locale";

import {
  getUTCOffset,
  findTimeZone,
  populateTimeZones,
} from "timezone-support/dist/lookup-convert";
import { TimeZoneInfo, makeAwareTime, NaiveTime } from "./timezone-support";

import data from "./data/europe-paris-data";

populateTimeZones(data);

const EuropeParisTimeZone = findTimeZone("Europe/Paris") as TimeZoneInfo;

/**
 * Expect a JS Date object as argument. Beware the subtilities when
 * working with "timezone aware" Date as native JS Date does not carry
 * a timezone information.
 *
 * The given Date must represent the correct "moment" (meaning "in the
 * local timezone).
 *
 * If the previous sentence is hard to grasp, building a Date with
 * date-fns's `parseISO` with a string including a timezone piece is
 * fool-proof, as an example:
 *
 *   `parseISO("1990-05-27T17:00:00+00:00")`
 *                                 ^^^^^^
 *                                 The timezone part 👍
 *
 * See https://date-fns.org/v2.0.0-beta.3/docs/format for formatString.
 */
export const formatBaguette = (date: Date, formatString: string): string => {
  const timeZoneOffset = getUTCOffset(date, EuropeParisTimeZone);
  const offset = timeZoneOffset.offset - date.getTimezoneOffset();
  const shiftedDate = new Date(date.getTime() - offset * 60 * 1000);
  return format(shiftedDate, formatString, { locale: fr });
};

/**
 * Timezones, datetimes and calendar dates: an interesting cocktail.
 *
 * These three primitives help us reconstruct correct JS Date (hence
 * "in local timezone") representing the correct "moment" the calendar
 * dates in Europe/Paris timezone.
 */
const yearBaguette = (date: Date): number => parseInt(formatBaguette(date, "y"));
const monthBaguette = (date: Date): number => parseInt(formatBaguette(date, "M"));
const dayBaguette = (date: Date): number => parseInt(formatBaguette(date, "d"));

export const makeDateFromNaiveTime = (time: NaiveTime, timeZone: TimeZoneInfo): Date => {
  return new Date(makeAwareTime(time, timeZone).epoch);
};

export const startOfDayBaguette = (date: Date): Date => {
  return makeDateFromNaiveTime(
    {
      year: yearBaguette(date),
      month: monthBaguette(date),
      day: dayBaguette(date),
      hours: 0,
      minutes: 0,
    },
    EuropeParisTimeZone
  );
};

export const isSameDayBaguette = (leftDate: Date, rightDate): boolean =>
  startOfDayBaguette(leftDate).getTime() === startOfDayBaguette(rightDate).getTime();
