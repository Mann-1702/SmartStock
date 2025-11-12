# Smartstock - Automated Inventory & Ordering System

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.2.5.

## Development server

Run:

```bash
ng serve
```

for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run:

```bash
ng generate component component-name
```

to generate a new component. You can also use:

```bash
ng generate directive|pipe|service|class|guard|interface|enum|module
```

## Build

Run:

```bash
ng build
```

to build the project. The build artifacts will be stored in the `dist/` directory.

## Testing

This project includes both **frontend** and **backend** tests.

### Frontend Tests

Run unit tests using [Karma](https://karma-runner.github.io):

```bash
ng test
```

Run end-to-end tests:

```bash
ng e2e
```

> To use end-to-end testing, you need a platform-specific testing package installed.

### Backend Tests

The backend uses **Jest** and **Supertest** to test API endpoints.

#### Prerequisites

* Node.js >= 18
* MongoDB running locally or via a connection string in `.env`
* Dependencies installed:

```bash
npm install
```

#### Environment Variables

Create a `.env` file at the project root with the following variables:

```env
MONGO_URI=mongodb://127.0.0.1:27017/smartstock
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

> For running tests, you may use a separate test database to avoid modifying production data.

#### Running Backend Tests

Run all tests:

```bash
npm test
```

Run a specific `singleProduct.test.js` file:

```bash
npm test -- tests/singleProduct.test.js
```

Run a specific `listProduct.test.js` file:

```bash
npm test -- tests/listProduct.test.js
```

Run tests sequentially (useful for database operations):

```bash
npm test -- --runInBand
```

#### Backend Test Files and Cases

* **`singleProduct.test.js`** – Single product tests:

  1. Return a single product by ID
  2. Return 404 if product is not found
  3. Return 400 for invalid product ID

* **`listProduct.test.js`** – Multiple product tests:

  1. Return an empty array when no products exist
  2. Return all products when they exist
  3. Handle server errors gracefully

> ⚠️ Ensure MongoDB is running locally or that `MONGO_URI` points to a valid database before running backend tests.

## Further Help

To get more help on the Angular CLI use:

```bash
ng help
```

or check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
