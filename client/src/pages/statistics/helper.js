export const getStudentRegFormattedData = (data) => {
  const formattedData = [];

  for (let i = 0; i < data.length; i++) {
    formattedData.push({
      id: i + 1,
      x: data[i].firstName + " " + data[i].lastName,
      y: data[i].numRegistrations,
    });
  }

  return formattedData;
};

export const getTopicRegChartData = (data) => {
  const formattedData = {
    topicLabels: [],
    topicData: [],
  };

  for (let i = 0; i < data.length; i++) {
    formattedData.topicLabels.push(data[i].value);
    formattedData.topicData.push(data[i]._count.registrations);
  }

  return formattedData;
};

export const getTopicRegTableData = (data) => {
  const formattedData = [];

  for (let i = 0; i < data.length; i++) {
    formattedData.push({
      id: i + 1,
      topic: data[i].value,
      numRegistrations: data[i]._count.registrations,
    });
  }

  return formattedData;
};
