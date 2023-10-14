# mc-banking
A simple microservice managing transactions

## Run with docker compose

```docker compose up --build```

## Develop

Although the database runs on docker, you can develop the
microservice with the following command:

```MYSQL_DATABASE_HOST=127.0.0.1 MYSQL_DATABASE_PORT=3307 HTTP_LISTEN_PORT=3000 HTTP_LISTEN_INTERFACE=0.0.0.0 npx nodemon src/app.ts```

## Postman collection

```Bank.postman_collection.json``` contains all the routes exposed by this app

## Endpoints

### ```POST /api/auth/sign-in```

Generates a JWT token

### ```POST /api/auth/sign-up```

Creates a user account

### ```GET /api/auth/current-user```

Retrieves information about current user account

### ```GET /api/transactions```

Retrieves transactions of current authenticated user

### ```GET /api/transactions/:id```

Retrieves information about a transaction

### ```POST /api/transactions```

Creates a new transaction for current authenticated user

### ```PUT /api/transactions/:id```

Updates a transaction

### ```DELETE /api/transactions/:id```

Deletes a transaction

