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

## Environment Variables

For all environment variables, put them in a .env file in their respective directories

[[Server](./server/)] Environment Variables:

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

## Run Locally

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
