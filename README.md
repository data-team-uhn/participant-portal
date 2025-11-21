## Requirements

Download and install the docker community edition.

## Environment Configuration

### .env file

If not using CAPTCHA and MS Graph, there is no need to modify the `.env` file. However, the following variables may be
updated for convenience if desired:

- `API_PORT` (used to access the backend API), `APP_PORT` (used to access the web app), and `TEST_PORT` (used to run a
  server for unit tests).
- [MailHog](https://github.com/mailhog/MailHog) is used to capture all outgoing emails by default. Alternatively,
  setting `MAIL_SERVICE=console.log` will print all emails to the api docker logs.

### CAPTCHA

By default, CAPTCHA is disabled.

If using CAPTCHA, generate the keys for localhost
using [Google's documentation](https://developers.google.com/recaptcha/docs/display) and configure the environment
variables described below.

In the root `.env` file, set:

- `GOOGLE_CAPTCHA_ENABLED=true`
- `GOOGLE_CAPTCHA_URL=https://recaptchaenterprise.googleapis.com/v1/projects/<projectName>/assessments`
- `GOOGLE_CAPTCHA_SITE_KEY=<sitekey value generated from Google>`

Create a new file with the path ```api/secrets/GOOGLE_API_KEY``` that has the api key associated with the Google
project.

```
GOOGLE_API_KEY=<api key associated with the Google project>
```

### MS Graph

The production site will be using MS Graph to send emails. There are several fields that will need to be configured to
test emails in development and to properly send emails in production.

#### Development and Demo

Update the `.env` variables below.

The combination of `MS_TEST_MODE=true` and `MS_TEST_MODE_EMAIL=<your email>` will ensure that all emails sent through MS
Graph are directed to <your email>. This is important when testing in development and will also be useful to set on any
demo sites.

`MS_CLIENT_ID=CHANGEME` and `MS_AUTHORITY=CHANGEME` can be found in Vault under `CLIENT_ID` and `AUTHORITY`,
respectively.

```dotenv
MAIL_SERVICE=msgraph
ADMIN_CONTACT=CHANGEME

MS_TEST_MODE=true
MS_TEST_MODE_EMAIL=<your email>

MS_CLIENT_ID=CHANGEME
MS_AUTHORITY=CHANGEME
```

Next, add the following secrets files under the `api/secrets` directory.

- `MS_CERTIFICATE_THUMBPRINT` (found in vault under `CERTIFICATE_THUMBPRINT`)
- `MS_CERTIFICATE_PRIVATE_KEY` (found in vault under `PRIVATE_KEY`)

Rebuild the container.

#### Production

Update the `.env` variables below.

`MS_TEST_MODE=false` will ensure all emails are sent to the appropriate email addresses.

`MS_CLIENT_ID=CHANGEME` and `MS_AUTHORITY=CHANGEME` can be found in Vault. The variables in Vault do not include the
`MS` prefix.

```dotenv
MAIL_SERVICE=msgraph
ADMIN_CONTACT=CHANGEME

MS_CLIENT_ID=CHANGEME
MS_AUTHORITY=CHANGEME
```

Next, add the following secrets files under the `api/secrets` directory.

- `MS_CERTIFICATE_THUMBPRINT` (found in vault under `CERTIFICATE_THUMBPRINT`)
- `MS_CERTIFICATE_PRIVATE_KEY` (found in vault under `PRIVATE_KEY`)

## Running the Application

Bring up the database first:

```shell
docker-compose -f docker-compose.dev.yml up -d --build postgres
```

Bring up the backend (API), front-end (APP), and mailhog services:

_*Note: The mailhog container will automatically start when the api container does, so it is optional in the command
below._

```shell
docker-compose -f docker-compose.dev.yml up -d --build api app mailhog
```

Reset the database and seed it with the test data using Docker:

```shell
npm run db:test-data
```

Open up the browser to [localhost:4002](http://localhost:4002/)

Open up the browser to [localhost:8025](http://localhost:8025/) to view MailHog emails.

Access the api directly at [localhost:4001/](http://localhost:4001/)

View logs:

```shell
docker-compose -f docker-compose.dev.yml logs --follow participant-api participant-app participant-postgres
```

Open postgres database:

```shell
npm run psql
```

OR

```shell
docker-compose -f docker-compose.dev.yml exec postgres psql -U portal portal
```

To run tests:

```shell
npm run test:setup
npm run test:run
```

## Test users

All initial test users can be authenticated using the password `password`.

### Participants

p0001@test.com up to p0012@test.com

### Coordinators

c0001@test.com up to c0010@test.com

### Admin

admin@test.com
