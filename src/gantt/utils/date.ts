import { offsetArray } from "./arr";

export const oneDayTimeStamp = 1000 * 60 * 60 * 24;

export const formatDate = (d: Date | number, fmt = "yyyy-MM-dd"): string => {
  const date = new Date(d);
  if (/(y+)/.test(fmt)) {
    // eslint-disable-next-line no-param-reassign
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
    const o: Record<string,number> = {
      "M+": date.getMonth() + 1,
      "d+": date.getDate(),
      "h+": date.getHours(),
      "m+": date.getMinutes(),
      "s+": date.getSeconds(),
    };
    for (const k in o) {
      if (new RegExp(`(${k})`).test(fmt)) {
        const str = o[k] + "";
        // eslint-disable-next-line no-param-reassign
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length === 1 ? str : ("00" + str).substr(str.length)
        );
      }
    }
  }
  return fmt;
};

export enum MonthType {
  LAST_MONTH = -1,
  THIS_MOUTH = 0,
  NEXT_MOUTH = 1,
}

export type TCalendarItem = {
  day: string;
  monthType: MonthType;
  timestamp: number;
};

export const judgeMonth = (y: number, m: number) => {
  if (m < 1) return [y - 1, 12];
  if (m > 12) return [y + 1, 1];

  return [y, m];
};

// 获取当天0点的时间戳
export function getStartTime(time: Date | number | string) {
  const nowTimeDate = new Date(time);
  return nowTimeDate.setHours(0, 0, 0, 0);
}

// 获取当天最后一秒的时间戳
export function getEndTime(time: Date | number | string) {
  const nowTimeDate = new Date(time);
  return nowTimeDate.setHours(23, 59, 59, 59);
}

/**
 * @description 默认的日历数组是从星期天开始，使用offsetDateList偏移起始星期
 * @param array
 * @param offset 偏移位置
 * @returns
 */
export const offsetDateList = (array: TCalendarItem[], offset: number) => {
  const oneDayTimestamp = 1000 * 60 * 60 * 24;
  if (offset > 0 && offset <= 7) {
    let startDate = array[0];
    const currentArray = array.slice(0, -offset);
    for (let i = offset; i > 0; i--) {
      const lastStamptime = startDate.timestamp - oneDayTimestamp;
      const calendarItem = {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        day: formatDate(lastStamptime, "yyyy/MM/dd"),
        monthType: MonthType.LAST_MONTH,
        timestamp: lastStamptime,
      };
      currentArray.unshift(calendarItem);
      startDate = calendarItem;
    }
    return currentArray;
  } else if (offset < 0 && offset >= -7) {
    let endDate = array.slice(-1)[0];
    const currentArray = array.slice(-offset);
    for (let j = Math.abs(offset); j > 0; j--) {
      const nextStamptime = endDate.timestamp + oneDayTimestamp;
      const calendarItem = {
        day: formatDate(nextStamptime, "yyyy/MM/dd"),
        monthType: MonthType.NEXT_MOUTH,
        timestamp: nextStamptime,
      };
      currentArray.push(calendarItem);
      endDate = calendarItem;
    }
    return currentArray;
  }

  return array;
};

/**
 * 获取日历展示日期列表
 *
 * @export
 * @param {Number} y
 * @param {Number} m
 * @returns
 */
export function getDateList(y: number, m: number, offset = 0) {
  const year = y;
  const month = m - 1;
  const list = [] as TCalendarItem[];
  const now = new Date(year, month);
  const monthEnd = new Date(year, month + 1, 0); // 当月最后一天
  const lastMonthEnd = new Date(year, month, 0); // 上月最后一天
  const firstDay = now.getDay(); // 当月第一天
  const mEDate = monthEnd.getDate();
  const lMEDate = lastMonthEnd.getDate();

  // 计算上月出现的日期
  for (let i = 0; i < firstDay; i++) {
    const tempM = month > 0 ? month : 12;
    const tempY = month > 0 ? year : year - 1;
    const strMonth = tempM < 10 ? `0${tempM}` : tempM;
    list.unshift({
      day: `${tempY}/${strMonth}/${lMEDate - i}`,
      monthType: MonthType.LAST_MONTH,
      timestamp: getStartTime(`${tempY}/${strMonth}/${lMEDate - i}`),
    });
  }

  // 当月
  for (let i = 1; i < mEDate + 1; i++) {
    const strI = i < 10 ? "0" + i : i;
    const tempM = month + 1;
    const strMonth = tempM < 10 ? `0${tempM}` : tempM;
    list.push({
      day: `${year}/${strMonth}/${strI}`,
      monthType: MonthType.THIS_MOUTH,
      timestamp: getStartTime(`${year}/${strMonth}/${strI}`),
    });
  }

  const tempLen = 42 - list.length;

  // 下月
  for (let i = 1; i < tempLen + 1; i++) {
    const strI = i < 10 ? "0" + i : i;
    const tempM = month + 2 < 13 ? month + 2 : 1;
    const tempY = month + 2 < 13 ? year : year + 1;
    const strMonth = tempM < 10 ? `0${tempM}` : `${tempM}`;
    list.push({
      day: `${tempY}/${strMonth}/${strI}`,
      monthType: MonthType.NEXT_MOUTH,
      timestamp: getStartTime(`${tempY}/${strMonth}/${strI}`),
    });
  }

  return offsetDateList(list, offset);
}

//时间转换(js将 “2021-07-06T06:23:57.000+00:00” 转换为年月日时分秒)
export const transformTimestamp = (timestamp: string | number | Date) => {
  const a = new Date(timestamp).getTime();
  const date = new Date(a);
  const Y = date.getFullYear() + "-";
  const M =
    (date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1) + "-";
  const D =
    (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + "  ";
  const h =
    (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ":";
  const m =
    (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) +
    ":";
  const s =
    date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds(); // 秒
  const dateString = Y + M + D + h + m + s;
  return dateString;
};

/**
 *
 * @param date
 * @param offset
 * @returns
 */
export function getWeekList(date = new Date(), offset = -1) {
  /**
   * [0,1,2,3,4,5,6] ---> [1,2,3,4,5,6,0]
   * 今天的星期几 --> 定位数组位置，计算
   */
  const oneDayTimeStamp = 1000 * 60 * 60 * 24;
  const DefaultWeekIdxs = [0, 1, 2, 3, 4, 5, 6];
  const DefaultWeekName = [
    "星期日",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
  ];

  const weekIdxs = offsetArray(DefaultWeekIdxs, offset);

  const week = [] as {
    name: string;
    date: string;
    timeStamp: number;
  }[];

  const today_timestamp = getStartTime(Number(date)); // 当天时间戳
  const today_week = date.getDay(); // 当天星期几

  const targetIdx = weekIdxs.findIndex((idx: any) => idx === today_week);

  week.push({
    name: DefaultWeekName[weekIdxs[targetIdx]],
    date: formatDate(today_timestamp, "yyyy/MM/dd"),
    timeStamp: today_timestamp,
  });

  for (let i = targetIdx - 1; i >= 0; i--) {
    const weekValueIdx = targetIdx - i;
    const timeStamp = today_timestamp - oneDayTimeStamp * weekValueIdx;
    week.unshift({
      name: DefaultWeekName[weekIdxs[i]],
      date: formatDate(timeStamp, "yyyy/MM/dd"),
      timeStamp: timeStamp,
    });
  }

  for (let j = targetIdx + 1; j < DefaultWeekIdxs.length; j++) {
    const weekValueIdx = j - targetIdx;
    const timeStamp = today_timestamp + oneDayTimeStamp * weekValueIdx;
    week.push({
      name: DefaultWeekName[weekIdxs[j]],
      date: formatDate(timeStamp, "yyyy/MM/dd"),
      timeStamp: timeStamp,
    });
  }

  return week;
}

export function getWeeksList(weekNumber = 1, date = new Date()) {
  const result = [] as any;
  for (let i = 0; i < weekNumber; i++) {
    if (result.length > 0) {
      const startDate = new Date(
        result.slice(-1)[0]?.timeStamp + 1000 * 60 * 60 * 24
      );
      result.push(...getWeekList(startDate));
    } else {
      result.push(...getWeekList(date));
    }
  }
  return result;
}

export function getNotPassDay(weekNumber = 1, date = new Date()) {
  const weeksList = getWeeksList(weekNumber, date);
  const dateStartTime = getStartTime(Number(date));
  return weeksList.filter(({ timeStamp }: any) => timeStamp >= dateStartTime);
}

// 00:01 -> 60000
export const transToTimestampFormat = (timeFormat: string | number): number => {
  if (typeof timeFormat === "string" && timeFormat.indexOf(":") !== -1) {
    const timeArr = timeFormat.split(":").map((item) => +item);
    const timestamp = (timeArr[0] * 60 + timeArr[1]) * 60 * 1000;
    return timestamp;
  }
  return +timeFormat;
};

// 60000 -> 00:01
export const transToTimeFormat = (timeStampFormat: string | number): string => {
  if (
    typeof timeStampFormat === "string" &&
    timeStampFormat.indexOf(":") !== -1
  ) {
    return timeStampFormat;
  }
  const hour = ~~(+timeStampFormat / 1000 / 3600);
  const min = ~~(+timeStampFormat - hour * 1000 * 3600) / 60000;
  return `${hour > 9 ? hour : "0" + hour}:${min > 9 ? min : "0" + min}`;
};
