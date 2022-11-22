import { useState } from "react";
import { useTheme } from "@mui/material/styles";
import ReactApexChart from "react-apexcharts";
import { getTopicRegChartData } from "./helper";

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
  plotOptions: {
    polarArea: {
      rings: {
        strokeWidth: 0,
      },
      spokes: {
        strokeWidth: 0,
      },
    },
  },
  yaxis: {
    show: false,
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

/**
 * A polar area chart that illustrates the number of registrations that
 * were made for each topic in a course.
 * @param {*} data topic-registration data
 * @returns Topic-registration chart
 */
const TopicRegistrationsChart = ({ data }) => {
  const theme = useTheme();

  const [formattedData] = useState(getTopicRegChartData(data));
  const [series] = useState(formattedData.topicData);

  const [options] = useState({
    ...polarAreaChartOptions,
    labels: formattedData.topicLabels,
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
