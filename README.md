![platelet logo](platelet.png "Platelet")

Platelet is an offline first, cloud backed, dispatch software project for couriers and coordinators. It is being developed for Blood Bikers in the UK, but can be used for any delivery tracking.

![dashboard](dashboard.png "Dashboard")

![overview](overview.png "Overview")

[Demo](https://demo.platelet.app)

[Homepage](https://platelet.app)

[Discord](https://discord.gg/tWhCM98ckB)

Some of Platelet's goals are:

- Provide a robust service for recording assignment details, synchronized across all devices

- Let volunteers coordinate cross country relays over a wide network of groups

- Focus on ease of use and a smooth user experience

- Provide more detailed tracking information for deliveries

- Allow direct requests for deliveries by external users

- Provide reports and statistics

It can be deployed to AWS using Amplify or can be used fully offline with no online synchronization.

If you're interested in developing on Platelet please take a look at [CONTRIBUTING](CONTRIBUTING.md).

## Setting up

The easiest way to install Platelet is to connect a branch on GitHub to Amplify through the AWS console.

### Cognito

Add these groups to Cognito with highest precedence for SUPER and ADMIN second:

`SUPER`
`ADMIN`
`COORDINATOR`
`RIDER`
`USER`

Under Sign-up experience, add a custom attribute: `tenantId`

### Function parameters

Set `PLATELET_WELCOME_EMAIL` and `PLATELET_DOMAIN_NAME` environment variables  using the Amplify CLI.

`PLATELET_WELCOME_EMAIL` is the email address that any registration emails will be sent from.

`PLATELET_DOMAIN_NAME` should be the URL (without "https://") where the app is hosted. This will be used to point users to the URL in registration emails.

### AWS SES

You will need to apply to AWS for unrestricted sending of emails.
