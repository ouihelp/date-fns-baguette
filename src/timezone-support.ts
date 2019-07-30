export interface TimeZoneInfo {
  name: string;
  offsets: number[];
  untils: number[];
  abbreviations: string[];
}

interface TimeZoneTransition {
  from: number;
  until: number;
  offset: number;
  abbreviation: string;
}

interface TimeZoneOffset {
  abbreviation?: string;
  offset: number;
}

export interface NaiveTime {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds?: number;
  milliseconds?: number;
  fold?: boolean;
}

interface AwareTime extends NaiveTime {
  epoch: number;
  zone: TimeZoneOffset;
}

const unixTimeToWannabeUnixTime = (unixTime: number, offset: number) =>
  unixTime - offset * 60 * 1000;
const wannabeUnixTimeToUnixTime = (wannabeUnixTime: number, offset: number) =>
  wannabeUnixTime + offset * 60 * 1000;

const getWannabeUnixTime = ({
  year,
  month,
  day,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
}: NaiveTime): number => {
  return Date.UTC(year, month - 1, day, hours, minutes, seconds, milliseconds);
};

const findTransitionIndex = (unixTime: number, timeZone: TimeZoneInfo): number => {
  const { untils } = timeZone;
  for (let i = 0, length = untils.length; i < length; ++i) {
    if (unixTime < untils[i]) {
      return i;
    }
  }
};

const findTransitionsAround = (unixTime: number, timeZone: TimeZoneInfo): TimeZoneTransition[] => {
  const firstIndex = findTransitionIndex(unixTime - 3 * 24 * 60 * 60 * 1000, timeZone);
  const lastIndex = findTransitionIndex(unixTime + 3 * 24 * 60 * 60 * 1000, timeZone);
  let rv = [];
  for (var i = firstIndex; i <= lastIndex; i++) {
    rv.push({
      from: timeZone.untils[i - 1] || -Infinity,
      until: timeZone.untils[i],
      offset: timeZone.offsets[i],
      abbreviation: timeZone.abbreviations[i],
    });
  }
  return rv;
};

const getTransitionFromTime = (
  time: NaiveTime,
  timeZone: TimeZoneInfo
): [TimeZoneOffset, boolean] => {
  const wannabeUnixTime = getWannabeUnixTime(time);
  const possibleTransitions = findTransitionsAround(wannabeUnixTime, timeZone);
  const correctTransitions = possibleTransitions.filter(
    t =>
      unixTimeToWannabeUnixTime(t.from, t.offset) <= wannabeUnixTime &&
      wannabeUnixTime < unixTimeToWannabeUnixTime(t.until, t.offset)
  );
  if (correctTransitions.length === 0) {
    throw new Error("No transition found for this time: this time might have never existed.");
  } else if (correctTransitions.length === 1) {
    return [correctTransitions[0], false];
  } else if (correctTransitions.length === 2) {
    return time.fold === undefined || !time.fold
      ? [correctTransitions[0], false]
      : [correctTransitions[1], true];
  }
  throw new Error("Too many transitions possible");
};

export const makeAwareTime = (time: NaiveTime, timeZone: TimeZoneInfo): AwareTime => {
  const [transition, fold] = getTransitionFromTime(time, timeZone);
  return {
    ...time,
    fold,
    zone: {
      offset: transition.offset,
      abbreviation: transition.abbreviation,
    },
    epoch: wannabeUnixTimeToUnixTime(getWannabeUnixTime(time), transition.offset),
  };
};
