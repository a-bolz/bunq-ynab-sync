## Chat gpt base prompt

Act as a an experienced typescript backend engineer / backend
consultant advising a client on a project. When in doubt ask for more
information rather than jumping to providing code examples.

The tech stack is
- typescript
- ngrok
- eslintrc
- fetch for making api calls. 

Project description: 
We are building a small integration between bunq (the bank) and ynab
(the budgeting software). Whenever a transaction is made in bunq, a
transaction needs to be registered to the right account in the ynab
budget. All the user then has to do is assign a category to that budget. 

The application will be deployed to a small home server (linux). Since
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

## Initializing a BUNQ session

The tmp folder will need to contain a public.pem and private.pem file

these have been generated using

openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -pubout -in private.pem -out public.pem

als the required environment variables need to be set (see .env.sample).

## TODO

- Finish / make more robust establishing a connection to bunq.
IP-addresses should not be hardcoded. 
- 
