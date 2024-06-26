import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import auth from "./routes/auth.js";
import users from "./routes/users.js";
import courses from "./routes/courses.js";
import officeHours from "./routes/officeHours.js";
import account from "./routes/accounts.js";
import courseToken from "./routes/courseToken.js";
import calendarEvents from "./routes/courseCalendar.js";
import { globalErrorHandler } from "./util/middleware.js";

const app = express();

app.use(
  cors({
    origin: "*",
  })
);
app.use(helmet());
app.use(express.json());
app.use(morgan("dev", { skip: () => process.env.NODE_ENV === "test" }));

app.get("/", (req, res) => {
  res.send("API Server!");
});

// Routing (API endpoints)
app.use("/", auth);
app.use("/api", users);
app.use("/api/course", courses);
app.use("/api/courseToken", courseToken);
app.use("/api/account", account);
app.use("/api/officeHour", officeHours);
app.use("/api/calendarEvent", calendarEvents);

app.use(globalErrorHandler);

export default app;
