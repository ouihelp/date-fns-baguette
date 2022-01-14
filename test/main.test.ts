import { intervalToDuration, parseISO } from "date-fns";
import { findTimeZone, populateTimeZones } from "timezone-support/dist/lookup-convert";

import data from "../src/data/europe-paris-data";
import {
  formatBaguette,
  startOfDayBaguette,
  isSameDayBaguette,
  formatDurationBaguette,
} from "../src";
import { makeAwareTime, TimeZoneInfo } from "../src/timezone-support";

const EuropeParisTimeZone = findTimeZone("Europe/Paris") as TimeZoneInfo;
populateTimeZones(data);

describe("formatBaguette", () => {
  test("Returned string is in French", () => {
    const theDate = parseISO("2019-07-01T17:00:00+00:00");
    expect(formatBaguette(theDate, "LLLL")).toBe("juillet");
  });

  test("Returned string matches Europe/Paris timezone", () => {
    const theDate = parseISO("2019-07-01T17:00:00+00:00");
    expect(formatBaguette(theDate, "HH")).toBe("19");
  });

  test("Returned string matches Europe/Paris timezone in the past and future", () => {
    const theDate = parseISO("1990-05-27T17:00:00+00:00");
    expect(formatBaguette(theDate, "HH")).toBe("19");

    const theSecondDate = parseISO("2040-12-27T17:00:00+00:00");
    expect(formatBaguette(theSecondDate, "HH")).toBe("18");
  });
});

describe("startOfDayBaguette", () => {
  test("First DST of 2019 works", () => {
    const startOfdayOfDSTString = "2019-03-31T00:00:00+01:00";
    const startOfdayOfDST = parseISO(startOfdayOfDSTString);

    const justAfterOfdayOfDSTString = "2019-03-31T00:01:00+01:00";
    expect(startOfDayBaguette(parseISO(justAfterOfdayOfDSTString))).toStrictEqual(startOfdayOfDST);

    const duringOfdayOfDSTString = "2019-03-31T10:00:00+01:00";
    expect(startOfDayBaguette(parseISO(duringOfdayOfDSTString))).toStrictEqual(startOfdayOfDST);

    const endOfdayOfDSTString = "2019-03-31T23:59:00+02:00";
    expect(startOfDayBaguette(parseISO(endOfdayOfDSTString))).toStrictEqual(startOfdayOfDST);
  });

  test("Second DST of 2019 works", () => {
    const startOfdayOfDSTString = "2019-10-27T00:00:00+02:00";
    const startOfdayOfDST = parseISO(startOfdayOfDSTString);

    const justAfterOfdayOfDSTString = "2019-10-27T00:01:00+02:00";
    expect(startOfDayBaguette(parseISO(justAfterOfdayOfDSTString))).toStrictEqual(startOfdayOfDST);

    const duringOfdayOfDSTString = "2019-10-27T10:00:00+01:00";
    expect(startOfDayBaguette(parseISO(duringOfdayOfDSTString))).toStrictEqual(startOfdayOfDST);

    const endOfdayOfDSTString = "2019-10-27T23:59:00+01:00";
    expect(startOfDayBaguette(parseISO(endOfdayOfDSTString))).toStrictEqual(startOfdayOfDST);
  });
});

describe("makeAwareTime", () => {
  test("Ambiguous time", () => {
    const atBeforeFold = makeAwareTime(
      {
        year: 2019,
        month: 10,
        day: 27,
        hours: 2,
        minutes: 30,
      },
      EuropeParisTimeZone
    );
    expect(new Date(atBeforeFold.epoch)).toStrictEqual(parseISO("2019-10-27T02:30:00+02:00"));

    const atAfterFold = makeAwareTime(
      {
        year: 2019,
        month: 10,
        day: 27,
        hours: 2,
        minutes: 30,
        fold: true,
      },
      EuropeParisTimeZone
    );
    expect(new Date(atAfterFold.epoch)).toStrictEqual(parseISO("2019-10-27T02:30:00+01:00"));
  });

  test("Ambiguous time", () => {
    expect(() => {
      makeAwareTime(
        {
          year: 2019,
          month: 3,
          day: 31,
          hours: 2,
          minutes: 30,
        },
        EuropeParisTimeZone
      );
    }).toThrow();
  });
});

describe("isSameDayBaguette", () => {
  test("Normal stuff works", () => {
    const day1 = parseISO("2019-03-21T00:00:00+01:00");
    const day1bis = parseISO("2019-03-21T00:04:00+01:00");

    expect(isSameDayBaguette(day1, day1bis)).toBeTruthy();

    const day2 = parseISO("2019-03-22T00:00:00+01:00");

    expect(isSameDayBaguette(day1, day2)).toBeFalsy();
  });
});

describe("formatDurationBaguette", () => {
  test("duration between january 15, 1929 and april 4, 1968 is in French a correctly formated", () => {
    // Get the duration between January 15, 1929 and April 4, 1968.
    const interval = intervalToDuration({
      start: new Date(1929, 0, 15, 12, 0, 0),
      end: new Date(1968, 3, 4, 19, 5, 0),
    });
    // => { years: 39, months: 2, days: 20, hours: 7, minutes: 5, seconds: 0 }
    expect(interval).toStrictEqual({
      years: 39,
      months: 2,
      days: 20,
      hours: 7,
      minutes: 5,
      seconds: 0,
    });
    const formatedDuration = formatDurationBaguette(interval);
    expect(formatedDuration).toStrictEqual("39 ans 2 mois 20 jours 7 heures 5 minutes");
  });
});
