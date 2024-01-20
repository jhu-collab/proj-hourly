[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
![GitHub contributors](https://img.shields.io/github/contributors/jhu-collab/proj-hourly)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md#pull-requests)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

# Hourly

Hourly is Calendly for instructors, students, and TAs. The app helps schedule,
book, and manage office hours. It allows students and teaching staff
to be productive and utilize their time more effectively.

## Features

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
JWT_SECRET="abcdef12345"
EMAIL_HOST="sandbox.smtp.mailtrap.io"
EMAIL="email-address@example.com"
EMAIL_PASSWORD="example_password"
NODE_ENV=local
HOURLY_API_KEY="api-key"
DB_PORT=5432
# DEBUG=hourly:*
DISABLE_EMAIL_SENDING=true
```

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
