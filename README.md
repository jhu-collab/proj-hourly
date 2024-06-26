# Hourly

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
![GitHub contributors](https://img.shields.io/github/contributors/jhu-collab/proj-hourly)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md#pull-requests)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

Hourly is Calendly for instructors, students, and TAs. The app helps schedule, book, and manage office hours. It allows students and teaching staff to be productive and utilize their time more effectively. The application includes features for scheduling office hours, managing registrations, creating course topics and tokens, and creating a course agenda. The features are described in more detail below.

## Features

### Authentication

Hourly provides authentication for our users. A user can create a new account or login with an existing one in order to access their courses. We provide a forgot password option and the option to reset a users password within their user profile.

For local development, there are 3 easy sign in options that allow a user to sign in by clicking a button into a student, ta, or professor account. The professor account will have site admin permissions. This should only be used on local.

### Creation and Joining a Course

Once a user is authenticated, they will be displayed their courses. As a professor, you can create a course by selecting the plus in the bottom right and selecting create course. This will allow you to specificy a number of fields to make this course identifiable to your students. Once a course is created, the user will be given a course code, a 6 character code. This can be distributed to students. Students can then select the plus button and enter the course code to join the course.

### Office Hours

Hourly allows for Instructors and Course Staff to schedule their office hours using the calendar. It has a click to drag feature to creating events, or can be created using a add button. Here is an example of the create event menu:

![Office Hours Create Event Menu](./assets/screenshots/create_event.png "Create Event")

Here you have the option for start time and end time as well as the date of the event. Three additional fields are the recurring event, remote, and location. Recurring events repeat on a weekly basis, so when you opt to make an event recurring, you must select the days of the week that you want it to recur on. The remote field is to flag the event as being online, and the location is to give a location (or a meeting link if remote). Once created, the event will populate the calendar and be viewable by students.

Once an event is created, it will appear on the calendar like this:

![Calendar with Office Hour](./assets/screenshots/calendar_view.png "Calendar View")

Here students and staff can select their office hours in order to interact. Registrations will be covered later. When a staff member clicks on their office hours, they will be able to view their details and have several options for manipulation:

![Office Hour Details Staff](./assets/screenshots/office_hour_details_staff.png "Office Hour Details Staff View")

Going from left to right, the interaction buttons are, edit, edit location, cancel, and exit. Most of these functionalities do not need a description. However, when editing a recurring event, its location, or cancelling, you will be asked if you want to just edit the specific date, or all remaining recurring events in the series. This allows you to mass edit your event calendar if necessary.

### Registrations

As a student, on the calendar page, you can select a given event. If they are not already registered, they are prompted to select the register button. From here the registration form is displayed:

![Registration Form](./assets/screenshots/registration_form.png "Registration Form")

Here the student is asked to select a time option. Time options are configured by the Professors for what the duration of registrations should be. For example, two registration types could be "Quick Question" and "Problem Walkthrough" where their respective time intervals may be 5 minutes and 15 minutes. The Professors have the option of making whatever time intervals they want, with the requirements being there must be at least 1 time interval, in this case the default of 10 minutes, and that the durations must be multiples of 5.

In addition to these time intervals, there is a registration window implemented. This defines the number of hours before the start of an Office Hour that you can register, and the number before when you cannot register. The default values of these are 48 hours and 2 hours, saying you can register up to 48 hours before, but no later than 2 hours before. This ensures that registrations are recent and limited to students who need help now. These values are all customizable in the course details section.

The student can then select a time interval of the given length that starts and ends within the time window. These time windows are exclusive to that student and will not be offered to another student. A student can also select topics (which will be discussed later) and add any additional comments or questions they may have.

Once registered, the registration can be viewed by both Staff and Students under the registration tab:

![Registration Tab](./assets/screenshots/registrations_tab_student.png "Registration Tab")

Here a student is able to view their upcoming, ongoing, and past registrations. A student can click on a registration to expand its details, and if it is upcoming, can cancel the registration. The instructors/staff view looks very similar with the differences being that the instructors can add registration types here. Instructors and Staff can both cancel students office hours and can mark past ones as No Shows.

### Feedback

After a student has attended an office hour booking, they have the option to leave feedback for the course staff. This comes in the form of giving a rating on a scale from 0-5 and a description of how it went and what might be able to be improved. Feedback must occur within the registration constraint of finishing the session. For example, if the registration constraints are 48 hours and 2 hours, for opening and closing registrations for an office hour, then the student will have up to 48 hours after their registration to leave feedback. All student feedback is anonymous and cannot be edited by the student once submitted and cannot be associated with that student.

Course Staff can view the feedback on the registrations tab under the feedback section. Here they can see their overall star rating and specific feedback given to them.

Course Instructors can likewise view their personal feedback as well as the feedback given to any of their course staff, ensuring that office hours are productive, running smoothly, and improving.

### Topics

A feature implemented in Hourly is topics. This serves as a tagging mechanism for office hour registrations. Students can select a tag for what they have questions or need help with. For example, these tags could be assignments such as HW1, HW2, final project etc. or they could be more course specific such as Binary Search Trees or Proof by Induction. The goal of this is to provide course staff with an idea of the types of questions being asked and to allow for future analytics on which topics in the course need the most help.

Course staff can view the topics under the registrations page.

### Tokens

Some college courses offer the idea of late days or late hours. Essentially, these allow students to turn in assignments after the deadline without penalty in exchange for some of their unused late days or hours. This is where the idea for tokens originates from. In courses there may be privileges temporarily granted to students until they are used and they need some sort of tracking for them. This is where tokens come in.

Within the course details page, an instructor can opt into allowing tokens for their course.

Once enabled, a new element on the side bar will appear for tokens. Here instructors can manipulate their tokens, giving them titles, descriptions, and quantities.

Students can view their usage on the tokens tab.

Staff can use tokens on the roster page. Once the student has been found, there are two icons, a coin icon and a gear icon.

The coin icon is the place for using tokens (or restoring them). Here course staff will have the option to select the course token type they would like to use and add in a description of the reason for using them. Additionally this form allows tokens to be unused, if they are mistakenly used or decided an instance was not deserving of one. To do this, staff will check the box and then select the instance they would like to do undo.

The gear icon allows for viewing token usage for a specific student. The cumulative usage can be seen per student and if a specific token is clicked on, they can see a detailed view.

The course instructors have a special use case under the gear icon, they can provide token overrides for students. If one student needs more of a specific token for special circumstances or if one student lost tokens for not following course rules, token amounts can be overridden here. The override can be applied to any token, and just must be at least 0. The overrides can also be removed at the same spot.

### Course Calendar/Events

Course Calendar or Course Events are additional Calendar items that students, staff, and instructors can view. The intent of these is to serve as a course agenda/schedule for lectures/sections. These can contain information about the location of class and what contents will be covered. These are all located at the top of the calendar and are saved as all day events. These allow students to get a quick view of the topics being covered or additional review sessions being held.

![Course Events](./assets/screenshots/course_event_calendar.png "Course Events")

These events can also be viewed in a more condensed form under the agenda tab.

### Notifications

Hourly provides email notifications for our users. These emails are for registrations and cancellations of events. When deploying you can use any email address so long as you use its smtp server and your email address and password. Using an application password over your personal password is recommended as it will help prevent your account from being locked. Hourly is designed such that you could substitute nodemailer (currently in use) for another Email as a service provider. Every email that is sent calls the sendEmail function in [notificationUtil.js](./server/src/util/notificationUtil.js). Some easy substitutions would be with services such as Resend, Sendgrid, and Mailgun. For these services a custom domain is necessary in order to have a personalized email address. Additionally, AWS SES could be used with some additionally configuration.

## Installation

Install Node.js onto your system. The LTS distribution can be found [here](https://nodejs.org/en)

Install yarn onto your system using this command:

```bash
npm install --global yarn
```

Navigate to the [server](./server/) folder and run:

```bash
yarn install
```

This may take several minutes

Navigate to the [client](./client/) folder and run:

```bash
yarn install
```

This may take several minutes

For running this locally, you will need to install Docker Desktop, this can be found [here](https://www.docker.com/products/docker-desktop/)

If on windows, ensure you have WSL2 enabled

## Environment Variables

For all environment variables, put them in a .env file in their respective directories

[Server](./server/) Environment Variables:

```bash
DATABASE_URL=postgresql://postgres:password@127.0.0.1:5432/postgres-for-hourly
DIRECT_URL=postgresql://postgres:password@127.0.0.1:5432/postgres-for-hourly
DB_PORT=5432
JWT_SECRET="YOUR_JWT_SECRET" #ENTER YOUR CHOSEN JWT SECRET HERE
EMAIL_HOST="example.smtp.com" #ENTER YOUR SMTP HOST HERE
EMAIL="email-address@example.com" #ENTER YOUR EMAIL ADDRESS HERE
EMAIL_PASSWORD="example_password" #ENTER YOUR APP PASSWORD FOR YOUR EMAIL HERE
NODE_ENV=local
# DEBUG=hourly:*
DISABLE_EMAIL_SENDING=true
FRONTEND_BASE_URL=localhost:3000
```

You can enable debugging by uncommenting the DEBUG flag.

Additionally, for the database, the username, password, and database name are not important. These can be customized however you wish so long as they are consistent. The port in the Database urls needs to be the same as the `DB_PORT` environment variables. Additionally, the `DATABASE_URL` and `DIRECT_URL` can be sent to be the same url for both.

Note: for your email, it is recommended to set up an app password for use

[Client](./client/) Environment Variables:

```bash
VITE_LOC_BASE_URL=http://localhost:5000
VITE_DEV_BASE_URL=https://example_dev.com # this should be your development server, if you require one
VITE_PROD_BASE_URL=https://example_prod.com # this should be your production server for live deployment
VITE_USER_USERNAME=student-account
VITE_USER_PASSWORD=student-account
VITE_ADMIN_USERNAME=professor-account
VITE_ADMIN_PASSWORD=professor-account
VITE_TA_USERNAME=ta-account
VITE_TA_PASSWORD=ta-account
VITE_RUN_MODE=local
```

For your environment variables, you need to setup a production environment and provide the base url to the API here.

The Vite username and password fields are used to local development only and allow an easy login with the push of a button.

## Run Locally

Before running locally, ensure you have successfully installed all applications required.

First, navigate to the [server](./server/) directory. Here you will run the following command:

```bash
yarn run dev
```

Sometimes this will fail initially as it can take some time to create the Docker Container. If this happens, wait a minute and try the command again

Next, navigate to the [client](./client/) directory. Here you will run the following command:

```bash
yarn run dev
```

Once finished, you will be able to access both the API and Client on localhost.

To investigate the Database entries, when in the server folder, run

```bash
yarn prisma studio
```

which wil create a locally hosted view of the database schema and entries.

To test routes without the frontend, you can import the files in [postman_files](./assets/postman_files/) into your local postman

## Deployment

For Deploying, there are Docker files and Github Actions defined to deploy to Heroku and GitHub pages. Additionally, there are publically available docker images [here](https://github.com/orgs/jhu-collab/packages) which run the backend on port 5000 and frontend on 3000.

You can run the following commands to pull the specific images. You will need to create the postgres image from the repository as well.

```bash
docker pull ghcr.io/jhu-collab/proj-hourly-server:latest
docker pull ghcr.io/jhu-collab/proj-hourly-client:latest
```

### Joint Deployment

If you choose to deploy a joint client, server, and database container, you can run:

```bash
docker-compose build
docker-compose up -d
```

in the root directory to generate the container. This will generate a single container on docker containing the 3 separate images. Make sure to have your environment variables set for this in the root directory. You can copy them from the client and server directories.

Another option for Joint Deployment is to use the docker images that are generated by our github action. The Build and Push Hourly Container action will generate the server and client images automatically and publish them to ghcr. You will want to add your deployment pipeline to this action.

### Separate Deployment

If you wish to deploy the images to separate containers/servers, you can use the images generated from the github actions. These are currently build to deploy to Caprover and GitHub Page/Heroku but can easily be configured to deploy to any source of your choosing.

Another option for this is to get the images on the ghcr and pull them to which ever host you like. Then you can begin running them there. Again, ensure your env variables are set.

## Running Tests

To run the server tests, navigate to the server directory and run

```bash
yarn run test
```

To run client tests, start the server and client. Then in the client directory run

```bash
yarn run test
```

When prompted select the desired browser and then select end to end testing.

## Contributors

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)].

<a href="https://github.com/jhu-collab/proj-hourly/graphs/contributors">
<img src="https://contrib.rocks/image?repo=jhu-collab/proj-hourly" />
</a>


## License

[MIT](https://choosealicense.com/licenses/mit/)
