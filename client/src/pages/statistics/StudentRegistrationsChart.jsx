import { useState } from "react";
import { useTheme } from "@mui/material/styles";
import ReactApexChart from "react-apexcharts";
import { getStudentRegFormattedData } from "./helper";

// chart options
const barChartOptions = {
  chart: {
    type: "bar",
    fontFamily: "Cabin, sans-serif",
    toolbar: {
      show: false,
    },
  },
  plotOptions: {
    bar: {
      borderRadius: 1,
      distributed: true,
    },
  },
  fill: {
    type: "gradient",
    gradient: {
      shade: "dark",
      type: "vertical",
      shadeIntensity: 0.2,
      inverseColors: false,
      opacityFrom: 1,
      opacityTo: 1,
      stops: [0, 50, 100],
    },
  },
  dataLabels: {
    enabled: false,
  },
  legend: {
    show: false,
  },
  tooltip: {
    theme: "light",
    followCursor: true,
    fillSeriesColor: true,
    onDatasetHover: {
      highlightDataSeries: true,
    },
  },
  xaxis: {
    type: "category",
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      show: false,
    },
  },
  noData: {
    text: "There is no student-registration data!",
    style: {
      fontSize: 15,
    },
  },
  yaxis: {
    show: true,
  },
  responsive: [
    {
      breakpoint: 600,
      options: {
        plotOptions: {
          bar: {
            horizontal: true,
          },
        },
        yaxis: {
          show: false,
        },
        xaxis: {
          show: true,
          labels: {
            show: true,
          },
        },
        grid: {
          xaxis: {
            lines: {
              show: true,
            },
          },
          yaxis: {
            lines: {
              show: false,
            },
          },
        },
      },
    },
  ],
};

const StudentRegistrationsChart = ({ data }) => {
  const theme = useTheme();

  const [series] = useState([
    {
      name: "Number of registrations",
      data: getStudentRegFormattedData(data),
    },
  ]);

  const [options] = useState({
    ...barChartOptions,
    colors: [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.tertiary.main,
      theme.palette.error.main,
      theme.palette.warning.main,
    ],
  });

  return (
    <>
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height="100%"
      />
    </>
  );
};

export default StudentRegistrationsChart;
