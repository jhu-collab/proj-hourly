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
