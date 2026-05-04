# HookCatcher Backend

Express + TypeScript backend for HookCatcher, a RequestBin-style webhook capture tool.

### Prerequisites

- Node.js (v18 or later)
- npm


### Local Development
TBD: should this be changed to acommodate `docker compose up --build`?

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3000` (or whatever `PORT` is set to in `.env`). Nodemon will watch for file changes and restart automatically.

### Build and run the application
Application, Databases, and OTel Collector will run.

Not yet implemented: re-build the frontend

TBD: how to develop the frontend / backend without having to `docker compose down` and then `docker compose up --build`?
```
docker compose up --build
```

Looking for the old (manual) database setup instructions?  They are [here](./docs/db_manual_setup.md).

### Available Scripts

| Script          | Description                             |
| --------------- | --------------------------------------- |
| `npm run dev`   | Start dev server with nodemon + ts-node |
| `npm run build` | Compile TypeScript to `dist/`           |
| `npm start`     | Run the compiled JS from `dist/`        |

### Backend Structure

```
src/
├── index.ts          # Server entry point (listen)
├── app.ts            # Express app config and middleware
├── handlers/         # Route handlers (controllers)
├── services/         # Business logic
├── db_connections/   # Database queries (PostgreSQL + MongoDB)
```

**Handler → Service → Repo(db_connections)** — handlers receive HTTP requests and delegate to services, services contain business logic and delegate to repos, repos talk to the databases.

![alt text](code-architecture-diagram.png)

### Design Decisions

![Backend implementation decisions](design-decisions.png)

#### Environment Variables

1. Create a `.env` file in the `server` root of the project (listed under `.gitignore` - never commit). `.env.example` can be used as a template. Connection modules use default values when the environment variables have not been set. To copy the development content directly from `.env.example` to `.env`:

   ```bash
      cp .env.example .env
   ```

If you're not sure what username and password to use:

```bash
# get your username
psql -c "SELECT current_user;"

# set a new password (be sure to write it down!)
psql -c "ALTER USER <username> PASSWORD '<new_passowrd>';"
```
