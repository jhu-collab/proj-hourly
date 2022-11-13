import { useState } from "react";
import { useTheme } from "@mui/material/styles";
import ReactApexChart from "react-apexcharts";

// chart options
const polarAreaChartOptions = {
  chart: {
    type: "polarArea",
    fontFamily: "Cabin, sans-serif",
  },
  stroke: {
    colors: ["#fff"],
  },
  legend: {
    show: false,
  },
  fill: {
    type: "gradient",
    opacity: 1,
    gradient: {
      shade: "dark",
      type: "vertical",
      shadeIntensity: 0.2,
      inverseColors: true,
      opacityFrom: 1,
      opacityTo: 1,
      stops: [0, 50, 100],
    },
  },
  noData: {
    text: "There is no topic-registration data!",
    style: {
      fontSize: 15,
    },
  },
  tooltip: {
    theme: "light",
    followCursor: true,
    fillSeriesColor: false,
    onDatasetHover: {
      highlightDataSeries: true,
    },
  },
};

const TopicRegistrationsChart = () => {
  const theme = useTheme();

  const [series] = useState([14, 23, 21, 17, 15, 10, 12, 17, 21]);

  const [options] = useState({
    ...polarAreaChartOptions,
    labels: [
      "Sorting",
      "Recursion",
      "Loops",
      "Conditionals",
      "Arrays",
      "Hash Tables",
      "Linked List",
      "Binary Search",
      "Linear Search",
    ],
    colors: [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.tertiary.main,
      theme.palette.error.main,
      theme.palette.warning.main,
    ],
  });

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="polarArea"
      height="100%"
    />
  );
};

export default TopicRegistrationsChart;
