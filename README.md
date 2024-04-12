# Description

Small webservice that listens to bunq MUTATION callbacks and syncs them
to a ynab budget

## Prerequisites

See the .env.sample file for the required environment variables.

The tmp folder also needs to contain:

1. a private.pem and public.pem file:

these can be generated using

openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -pubout -in private.pem -out public.pem

2. a file called account-mapping.json in the format:

{
  "NL88BOBO2101028109": {
    "name": "Account Name",
    "ynabId": "These can be obtained by running the getAccounts()
utility in ynab/api.ts",
  }
}

## Architecture

In it's current form this application is built to be run on a home
server without a static api. Overcoming this problem is done by running
ngrok on boot and registering the bunq callback to that newly created
url each time (deregistering also happens on boot).

each time bunq posts a transaction it is synced to ynab.


## Chat gpt base prompt

Act as an experienced typescript back end engineer / backend
consultant advising a client on a project. When in doubt ask for more
information rather than jumping to providing code examples.

The tech stack is
- typescript
- ngrok
- fetch for making api calls. 
- node express

Project description: 
We are building a small integration between bunq (the bank) and ynab
(the budgeting software). Whenever a transaction is made in bunq, a
transaction needs to be registered to the right account in the ynab
budget. All the user then has to do is assign a category to that budget. 

The application will be deployed to a small home server (ubuntu linux). Since
this does not have a static IP ngrok will be used to set up a public
url. Details are to be worked out but this means something the like
provides a high level architectural overview.


1. Upon start of the application ngrok is started, providing a public url.
2. A server starts at :8080, ngrok points at this server.
3. A call to bunq is made, for authentication.
4. A call to bunq is made to deregister all old callbacks. (the ngrok
   url, changes each time the app restarts).
5. Next a callback for all mutations is registered to the new ngrok url.
6. Whenever a callback comes in, the node process (server) handles the
callback and forwards it to ynab (more detail to follow here).
