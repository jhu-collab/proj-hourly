[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
![GitHub contributors](https://img.shields.io/github/contributors/jhu-collab/proj-hourly)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md#pull-requests)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

# Hourly

Hourly is Calendly for instructors, students, and TAs. The app helps schedule,
book, and manage office hours. It allows students and teaching staff
to be productive and utilize their time more effectively.
The application includes features for scheduling office hours, managing registrations,
creating course topics and tokens, and creating a course agenda. The features are described
in more detail below.

## Features

### Office Hours

Hourly allows for Instructors and Course Staff to schedule their office hours using the calendar.
It has a click to drag feature to creating events, or can be created using a add button. Here is
an example of the create event menu:

![Office Hours Create Event Menu](./screenshots/create_event.png "Create Event")

Here you have the option for start time and end time as well as the date of the event. Three additional fields
are the recurring event, remote, and location. Recurring events repeat on a weekly basis, so when you opt to make
an event recurring, you must select the days of the week that you want it to recur on. The remote field is to flag
the event as being online, and the location is to give a location (or a meeting link if remote). Once created, the
event will populate the calendar and be viewable by students.

Once an event is created, it will appear on the calendar like this:

![Calendar with Office Hour](./screenshots/calendar_view.png "Calendar View")

Here students and staff can select their office hours in order to interact. Registrations will be covered later.
When a staff member clicks on their office hours, they will be able to view their details and have several options
for manipulation:

![Office Hour Details Staff](./screenshots/office_hour_details_staff.png "Office Hour Details Staff View")

Going from left to right, the interaction buttons are, edit, edit location, cancel, and exit. Most of these functionalities
do not need a description. However, when editing a recurrning event, its location, or cancelling, you will be
asked if you want to just edit the specific date, or all remaining recurring events in the series. This allows
you to mass edit your event calendar if necessary.

### Registrations

As a student, on the calendar page, you can select a given event. If they are not already registered, they are
prompted to select the register button. From here the registration form is displayed:

![Registration Form](./screenshots/registration_form.png "Registration Form")

Here the student is asked to select a time option. Time options are configured by the Professors for what the
duration of registrations should be. For example, two registration types could be "Quick Question" and "Problem
Walkthrough" where their respective time intervals may be 5 minutes and 15 minutes. The Professors have the option
of making whatever time intervals they want, with the requirements being there must be at least 1 time interval,
in this case the defaul of 10 minutes, and that the durations must be multiples of 5.

In addition to these time intervals, there is a registration window implemented. This defines the number of hours
before the start of an Office Hour that you can register, and the number before when you cannot register. The
default values of these are 48 hours and 2 hours, saying you can register up to 48 hours before, but no later than
2 hours before. This ensures that registrations are recent and limited to students who need help now. These values
are all customizable in the course details section.

The student can then select a time interval of the given length that starts and ends within the time window.
These time windows are exclusive to that student and will not be offered to another student. A student can also
select topics (which will be discussed later) and add any additional comments or questions they may have.

Once registered, the registration can be viewed by both Staff and Students under the registration tab:

![Registration Tab](/screenshots/registrations_tab_student.png "Registration Tab")

Here a student is able to view their upcoming, ongoing, and past registrations. A student can click on a registration
to exapnd its details, and if it is upcoming, can cancel the registration. The instructors/staff view looks very similar
with the differences being that the instructors can add registration types here. Instructors and Staff can both cancel
students office hours and can mark past ones as No Shows.

### Feedback

After a student has attented an office hour booking, they have the option to leave feedback for the course staff. This comes in the form of giving
a rating on a scale from 0-5 and a description of how it went and what might be able to be improved.
Feedback must occur within the registration constraint of finishing the session.
For example, if the registration constraints are 48 hours and 2 hours, for opening and closing registrations for an office hour, then the student will
have up to 48 hours after their registration to leave feedback.
All student feedback is anonymous and cannot be edited by the student once
submitted and cannot be associated with that student.

Course Staff can view the feedback on the registrations tab under the feedback section. Here they can see their overall star rating and specific
feedback given to them.

Course Instructors can likewise view their personal feedback as well as the feedback given to any of their course staff, ensuring that office hours
are productive, running smoothly, and improving.

### Topics

A feature implemented in Hourly is topics. This serves as a tagging mechanism for office hour registrations. Students can select a tag for what they have questions or need help with. For example, these tags could be assignments such as HW1, HW2, final project etc. or they could be more course specific such as Binary Search Trees or Proof by Induction. The goal of this is to provide course staff with an idea of the types of questions beind asked and to allow for future analytics on which topics in the course need the most help.

Course staff can view the topics under the registrations page.

### Tokens

Some college courses offer the idea of late days or late hours. Essentially, these allow students to turn in assignments after the deadline without penalty in exchange for some of their unused late days or hours. This is where the idea for tokens originates from. In courses there may be privilidges temporarily granted to students until they are used and they need some sort of tracking for them. This is where tokens come in.

Within the course details page, an instructor can opt into allowing tokens for their course.

Once enabled, a new element on the side bar will appear for tokens. Here instructors can manipulate their tokens, giving them titles, descriptions, and quantities.

Students can view their usage on the tokens tab.

Staff can use tokens on the roster page. Once the student has been found, there are two icons, a coin icon and a gear icon.

The coin icon is the place for using and unusing tokens. Here course staff will have the option to select the course token type they would like to use and add in a description of the reason for using them. Additionally this form
allows tokens to be unused, if they are mistakenly used or decided an instance was not deserving of one. To do this, staff will check the box and then select the instance they would like to do undo.

The gear icon allows for viewing token usage for a specific student. The cumulative usage can be seen per student and if
a specific token is clicked on, they can see a detailed view.

The course instructors have a special use case under the gear icon, they can provide token overrides for students. If one student needs more of a specific token for special circumstances or if one student lost tokens for not following course rules, token amounts can be overriden here. The override can be applied to any token, and just must be at least 0. The overrides can also be removed at the same spot.

### Course Calendar/Events

## Demo

## Installation

Install Node.js onto your system. The LTS distribution can be found [here](https://nodejs.org/en)

Install yarn onto your system using this command:

```
npm install --global yarn
```

Navigate to the [server](./server/) folder and run:

```
yarn install
```

This may take several minutes

Navigate to the [client](./client/) folder and run:

```
yarn install
```

This may take several minutes

For running this locally, you will need to install Docker Desktop, this can be found [here](https://www.docker.com/products/docker-desktop/)

If on windows, ensure you have WSL2 enabled

## Environment Variables

For all environment variables, put them in a .env file in their respective directories

[Server](./server/) Environment Variables:

```
DATABASE_URL=postgresql://postgres:password@127.0.0.1:5432/postgres-for-hourly
DIRECT_URL=postgresql://postgres:password@127.0.0.1:5432/postgres-for-hourly
DB_PORT=5432
JWT_SECRET="abcdef12345"
EMAIL_HOST="sandbox.smtp.mailtrap.io"
EMAIL="email-address@example.com"
EMAIL_PASSWORD="example_password"
NODE_ENV=local
HOURLY_API_KEY="api-key"
# DEBUG=hourly:*
DISABLE_EMAIL_SENDING=true
```

You can enable debugging by uncommenting the DEBUG flag.

[Client](./client/) Environment Variables:

```
VITE_LOC_BASE_URL=http://localhost:5000
VITE_DEV_BASE_URL=https://proj-hourly-dev.herokuapp.com
VITE_PROD_BASE_URL=https://proj-hourly-prod.herokuapp.com
VITE_ROSTER_SSO_JHU_URL=https://glacial-plateau-47269.herokuapp.com/jhu/login
VITE_USER_USERNAME=user-1
VITE_USER_PASSWORD=user-1
VITE_ADMIN_USERNAME=admin-1
VITE_ADMIN_PASSWORD=admin-1
VITE_RUN_MODE=local
```

## Run Locally

Before running locally, ensure you have successfully installed all applications required.

First, navigate to the [server](./server/) directory. Here you will run the following command:

```
yarn run dev
```

Sometimes this will fail initially as it can take some time to create the Docker Container. If this happens, wait a minute and try the command again

Next, navigate to the [client](./client/) directory. Here you will run the following command:

```
yarn run dev
```

Once finished, you will be able to access both the API and Client on localhost.

To investigate the Database entries, when in the server folder, run

```
yarn prisma studio
```

which wil create a locally hosted view of the database schema and entries.

To test routes without the frontend, you can import the files in [postman_files](./postman_files/) into your local postman

## Deployment

- attempt to create deployment link/script?

## Running Tests

To run the server tests, navigate to the server directory and run

```
yarn run test
```

To run client tests, start the server and client. Then in the client directory run

```
yarn run test
```

When prompted select the desired browser and then select end to end testing.

## FAQ

## Contributors

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)].
[![Contributors](https://contrib.rocks/preview?repo=jhu-collab/proj-hourly)](https://github.com/jhu-collab/proj-hourly/graphs/contributors)

## Links

**Production**

- [Client](https://jhu-collab.github.io/proj-hourly)
- [Server](https://hourly-prod-62db14654e8d.herokuapp.com/api/)

**Development**

- [Client](https://hourly-dev.caprover.madooei.com/)
- [Server](https://hourly-api-dev.caprover.madooei.com/)

**Documentation**

- [Notion](https://www.notion.so/madooei/Hourly-5d20c5d7ed074169b0bdca374b1cbbbd)

## License

[MIT](https://choosealicense.com/licenses/mit/)
