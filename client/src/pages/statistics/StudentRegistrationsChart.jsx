import { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import ReactApexChart from "react-apexcharts";
import { sampleStudentRegistration } from "./sample-data/student-registrations";

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
      gradientToColors: undefined, // optional, if not defined - uses the shades of same color in series
      inverseColors: false,
      opacityFrom: 1,
      opacityTo: 1,
      stops: [0, 50, 100],
      colorStops: [],
    },
  },
  dataLabels: {
    enabled: false,
  },
  legend: {
    show: false,
  },
  responsive: [
    {
      breakpoint: 600,
      options: {
        chart: {
            height: 600,
        },
        plotOptions: {
          bar: {
            horizontal: true,
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
  xaxis: {
    type: "category",
    axisBorder: {
      show: false,
    },
    axisTicks: {
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

};

const StudentRegistrationsChart = () => {
  const theme = useTheme();

  const { primary, secondary } = theme.palette.text;
  const info = theme.palette.info.light;

  const [series] = useState([
    {
        name: "Number of registrations",
      data: sampleStudentRegistration,
    },
  ]);

  const [options, setOptions] = useState(barChartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.tertiary.main, theme.palette.error.main],
      xaxis: {
        labels: {
          show: false,
          style: {
            colors: [
              secondary,
              secondary,
              secondary,
              secondary,
              secondary,
              secondary,
              secondary,
            ],
          },
        },
      },
      tooltip: {
        theme: "light",
        followCursor: true,
        fillSeriesColor: true,
        onDatasetHover: {
            highlightDataSeries: true,
        },
      },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primary, info, secondary]);

  return (
    <>
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={365}
      />
    </>
  );
};

export default StudentRegistrationsChart;
