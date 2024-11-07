import { GanttSourceData } from "./index.d";
import { getEndTime, getStartTime, oneDayTimeStamp } from "./utils/date";

const data: GanttSourceData[] = [
  {
    id: "1",
    title: "1",
    timelines: [
      {
        id: "timeline_0_0",
        title: "timeline_0_0",
        startTime: getStartTime(new Date("2024/9/29")),
        endTime: getEndTime(new Date("2024/10/1")),
      },
      {
        id: "timeline_0_1",
        title: "timeline_0_1",
        startTime: getStartTime(new Date("2024/10/2")),
        endTime: getStartTime(new Date("2024/10/7")) + 20000,
      },
    ],
    children: [
      {
        id: "1-1",
        title: "1-1",
        timelines: [
          {
            id: "timeline_1_1",
            title: "timeline_1_1",
            startTime: getStartTime(new Date("2024/9/30")),
            endTime: getStartTime(new Date("2024/10/10")),
          },
        ],
        children: [
          {
            id: "1-1-1",
            title: "1-1-1",
            timelines: [
              {
                id: "timeline_1_1_1",
                title: "timeline_1_1_1",
                startTime: getStartTime(new Date("2024/9/30")),
                endTime: getStartTime(new Date("2024/10/10")),
              },
            ],
          },
        ],
      },
      {
        id: "1-2",
        title: "1-2",
        timelines: [
          {
            id: "timeline_1_2",
            title: "timeline_1_2",
            startTime: getStartTime(new Date("2024/9/30")),
            endTime: getStartTime(new Date("2024/10/10")),
          },
        ],
      },
    ],
  },
  {
    id: "1-3",
    title: "1-3",
    timelines: [
      {
        title: "timeline_1_3_0",
        startTime: getStartTime(new Date("2024/9/30")),
        endTime: getStartTime(new Date("2024/10/10")),
        id: "timeline_1_3_0",
      },
    ],
  },
  {
    id: "1-4",
    title: "1-4",
    timelines: [
      {
        title: "timeline_1_4_0",
        startTime: getStartTime(new Date("2024/9/30")),
        endTime: getEndTime(new Date("2025/10/1")),
        id: "timeline_1_4_0",
      },
    ],
  },
  ...new Array(10).fill(0).map((d, i) => {
    const ii = i % 20;
    return {
      id: `arr_${i + 4}`,
      title: `arr_title${i + 3}`,
      timelines: [
        {
          title: "title",
          startTime: getStartTime(
            new Date("2024/9/29").getTime() + ii * oneDayTimeStamp
            // new Date("2024/9/29")
          ),
          endTime: getEndTime(
            new Date("2024/9/29").getTime() + (ii + 10) * oneDayTimeStamp
            // new Date("2025/10/29")
          ),
          id: `timelines_${i}`,
        },
      ],
    };
  }),
  {
    id: "last",
    title: "last",
    timelines: [
      {
        title: "last_timeline_1_4_0",
        startTime: getStartTime(new Date("2024/9/30")),
        endTime: getEndTime(new Date("2025/10/1")),
        id: "last_timeline_1_4_0",
      },
    ],
  },
];

export { data };
