![example](https://raw.githubusercontent.com/RM926/gantt/refs/heads/master/src/images/example.png)
![code](https://raw.githubusercontent.com/RM926/gantt/refs/heads/master/src/images/code.png)

## RUN

download package

```bash
npm install
```

run

```bash
npm run dev
```

## USE

```javascript
// html
// <div id="container" style={{ width: 700, height: 500 }} />

new Gantt({
  container: document.querySelector("#container"),
  dataSource,
  expandIds: ["1"],
});

const dataSource = [
  {
    id: "1",
    title: "1",
    timelines: [
      {
        id: "t_0_0",
        title: "t_0_0",
        startTime: 1727539200000,
        endTime: 1730303999059,
      },
      {
        id: "t_0_1",
        title: "t_0_1",
        startTime: 1727798400000,
        endTime: 1727884800000,
      },
    ],
    children: [
      {
        id: "1-1",
        title: "1-1",
        timelines: [
          {
            id: "t_1_1",
            title: "t_1_1",
            startTime: 1727625600000,
            endTime: 1728489600000,
          },
        ],
        children: [
          {
            id: "1-1-1",
            title: "1-1-1",
            timelines: [
              {
                id: "t_1_1_1",
                title: "t_1_1_1",
                startTime: 1727625600000,
                endTime: 1728489600000,
              },
            ],
          },
        ],
      },
      {
        id: "1-2",
        title: "1-2",
        timelines: [],
      },
    ],
  },
  {
    id: "1-3",
    title: "1-3",
    timelines: [
      {
        title: "t_1_3_0",
        startTime: 1727625600000,
        endTime: 1728489600000,
        id: "t_1_3_0",
      },
    ],
  },
];
```
