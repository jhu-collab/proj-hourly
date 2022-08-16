import app from "./src/index.js";

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Express app listening at port: http://localhost:${port}/`);
});
