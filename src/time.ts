interface RoundedTimeDiff {
    days: number,
    hours: number,
    minutes: number,
    seconds: number,
    milliseconds: number
}
interface TimeObject {
    date: Date,
    dateTime: string,
    comapredTo: Date,
    diff: {
        days: number,
        hours: number,
        minutes: number,
        seconds: number,
        milliseconds: number
    },
    diffRounded: {
        days: RoundedTimeDiff,
        hours: RoundedTimeDiff,
        minutes: RoundedTimeDiff,
        seconds: RoundedTimeDiff,
    }
}
export function makeTimeObject(dateTime: string, currentTime: Date): TimeObject {
    const date = new Date(dateTime);
    const diffMs = Math.abs(currentTime.valueOf() - date.valueOf());
    const diff = {
        milliseconds: diffMs,
        seconds: Math.floor(diffMs / 1000),
        minutes: Math.floor(diffMs / 1000 / 60),
        hours: Math.floor(diffMs / 1000 / 60 / 60),
        days: Math.floor(diffMs / 1000 / 60 / 60 / 24),
    }
    const diffRounded = {
        days: makeDetailedTimeDiffDays(diffMs),
        hours: makeDetailedTimeDiffHours(diffMs),
        minutes: makeDetailedTimeDiffMinutes(diffMs),
        seconds: makeDetailedTimeDiffSeconds(diffMs)
    }
    return {
        date,
        dateTime,
        comapredTo: currentTime,
        diff,
        diffRounded
    }
}
const msToDaysMulti = 1000 * 60 * 60 * 24;
const msToHoursMulti = 1000 * 60 * 60;
const msToMinutesMulti = 1000 * 60;
const msToSecondsMulti = 1000;
const msToMillisecondsMulti = 1;
function msToDays(diffMs) {
    return {
        days: Math.floor(diffMs / msToDaysMulti),
        msLeft: diffMs % msToDaysMulti
    };
}
function msToHours(diffMs) {
    return {
        hours: Math.floor(diffMs / msToHoursMulti),
        msLeft: diffMs % msToHoursMulti
    };
}
function msToMinutes(diffMs) {
    return {
        minutes: Math.floor(diffMs / msToMinutesMulti),
        msLeft: diffMs % msToMinutesMulti
    };
}
function msToSeconds(diffMs) {
    return {
        seconds: Math.floor(diffMs / msToSecondsMulti),
        msLeft: diffMs % msToSecondsMulti
    };
}
function msToMilliseconds(diffMs) {
    return {
        milliseconds: Math.floor(diffMs / msToMillisecondsMulti),
        msLeft: diffMs % msToMillisecondsMulti
    };
}
function makeDetailedTimeDiffDays(diffMs: number): RoundedTimeDiff {
    let msLeft = diffMs;
    let days,
        hours,
        minutes,
        seconds,
        milliseconds;
    ({ days, msLeft } = msToDays(msLeft));
    ({ hours, msLeft } = msToHours(msLeft));
    ({ minutes, msLeft } = msToMinutes(msLeft));
    ({ seconds, msLeft } = msToSeconds(msLeft));
    ({ milliseconds, msLeft } = msToMilliseconds(msLeft));
    return {
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
    }
}
function makeDetailedTimeDiffHours(diffMs: number): RoundedTimeDiff {
    let msLeft = diffMs;
    let days = 0,
        hours,
        minutes,
        seconds,
        milliseconds;
    ({ hours, msLeft } = msToHours(msLeft));
    ({ minutes, msLeft } = msToMinutes(msLeft));
    ({ seconds, msLeft } = msToSeconds(msLeft));
    ({ milliseconds, msLeft } = msToMilliseconds(msLeft));
    return {
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
    }

}
function makeDetailedTimeDiffMinutes(diffMs: number): RoundedTimeDiff {
    let msLeft = diffMs;
    let days = 0,
        hours = 0,
        minutes,
        seconds,
        milliseconds;
    ({ minutes, msLeft } = msToMinutes(msLeft));
    ({ seconds, msLeft } = msToSeconds(msLeft));
    ({ milliseconds, msLeft } = msToMilliseconds(msLeft));
    return {
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
    }

}
function makeDetailedTimeDiffSeconds(diffMs: number): RoundedTimeDiff {
    let msLeft = diffMs;
    let days = 0,
        hours = 0,
        minutes = 0,
        seconds,
        milliseconds;
    ({ seconds, msLeft } = msToSeconds(msLeft));
    ({ milliseconds, msLeft } = msToMilliseconds(msLeft));
    return {
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
    }

}
