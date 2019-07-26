import { parseISO } from "date-fns";

import { formatBaguette } from "../src";

describe("@ouihelp/date-fns-baguette", () => {
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
