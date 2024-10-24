import { GanttSourceData } from "./index.d";
import { getEndTime, getStartTime, oneDayTimeStamp } from "./utils/date";

const data: GanttSourceData[] = [
  {
    id: "title_1",
    title: "title1",
    timelines: [
      {
        id: "1",
        title: "1",
        startTime: getStartTime(new Date("2024/9/29")),
        endTime: getEndTime(new Date("2024/10/3")),
      },
      {
        id: "title_3",
        title: "3",
        startTime: getStartTime(new Date("2024/10/2")),
        endTime: getStartTime(new Date("2024/10/4")),
      },
      {
        id: "title_4",
        title: "title_4",
        startTime: getStartTime(new Date("2024/9/29")),
        endTime: getStartTime(new Date("2024/10/1")),
      },
      {
        id: "title_5",
        title: "title_5",
        startTime: getStartTime(new Date("2024/10/5")),
        endTime: getStartTime(new Date("2024/10/7")),
      },
      {
        id: "title_6",
        title: "title_6",
        startTime: getStartTime(new Date("2024/10/5")),
        endTime: getStartTime(new Date("2024/10/7")),
      },
      {
        id: "title_7",
        title: "title_7",
        startTime: getStartTime(new Date("2024/10/6")),
        endTime: getEndTime(new Date("2024/10/7")),
      },
    ],
    children: [
      {
        id: "title_1_1",
        title: "title_1_1",
        timelines: [
          {
            title: "title_1_2_1",
            startTime: getStartTime(new Date("2024/9/30")),
            endTime: getStartTime(new Date("2024/10/10")),
            id: "title_10",
          },
        ],
      },
      {
        id: "title_1_2",
        title: "title_1_2",
        timelines: [
          {
            title: "title_1_2_2",
            startTime: getStartTime(new Date("2024/9/30")),
            endTime: getStartTime(new Date("2024/10/10")),
            id: "title_10",
          },
        ],
      },
    ],
  },
  {
    id: "title_2",
    title: "title2",
    timelines: [
      {
        title: "title",
        startTime: getStartTime(new Date("2024/9/30")),
        endTime: getStartTime(new Date("2024/10/10")),
        id: "title_10",
      },
    ],
  },
  {
    id: "title3",
    title: "title3",
    timelines: [
      {
        title: "title",
        startTime: getStartTime(new Date("2024/10/6")),
        endTime: getEndTime(new Date("2024/10/7")),
        id: "t5",
      },
    ],
  },
  // ...new Array(200).fill(0).map((d, i) => {
  //   const ii = i % 20;
  //   return {
  //     id: `arr_${i + 4}`,
  //     title: `arr_title${i + 3}`,
  //     timelines: [
  //       {
  //         title: "title",
  //         startTime: getStartTime(
  //           new Date("2024/9/29").getTime() + ii * oneDayTimeStamp
  //         ),
  //         endTime: getEndTime(
  //           new Date("2024/9/29").getTime() + (ii + 1) * oneDayTimeStamp
  //         ),
  //         id: `timelines_${i}`,
  //       },
  //     ],
  //   };
  // }),
];

export { data };
