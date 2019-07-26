import { format } from "date-fns";
import { fr } from "date-fns/locale";

import {
  getUTCOffset,
  findTimeZone,
  populateTimeZones,
} from "timezone-support/dist/lookup-convert";

import data from "./data/europe-paris-data";

populateTimeZones(data);

/**
 * Expect a JS Date object as argument. Beware the subtilities when
 * working with "timezone aware" Date as native JS Date does not carry
 * a timezone information.
 *
 * The given Date must represent the correct "moment" in the local
 * timezone.
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
  const timeZone = findTimeZone("Europe/Paris");
  const timeZoneWOffset = getUTCOffset(date, timeZone);
  const offset = timeZoneWOffset.offset - date.getTimezoneOffset();
  const shiftedDate = new Date(date.getTime() - offset * 60 * 1000);
  return format(shiftedDate, formatString, { locale: fr });
};
