# Service Orbit Backend

This is the backend server for the **Service Orbit** application, a service-sharing platform that connects service providers with customers. This server handles authentication, service management, and other backend functionalities using Node.js, Express.js, MongoDB, and JWT.

## 🚀 Project Overview

- **Framework**: Node.js
- **Database**: MongoDB
- **Authentication**: JWT with cookies
- **Environment Variables**: Managed using `.env` file

---

## 📜 Features

### 🔐 Authentication

- JWT-based authentication.
- Secure cookie storage for tokens.
- Login and logout endpoints.

### 📦 Services Management

- Add, update, delete, and fetch services.
- Search services by name.
- Fetch popular services and banner data.

### 📑 Bookings Management

- Add and fetch booked services.
- Manage booking status.

### 🔧 Middleware

- `verifyToken`: Verifies the JWT token for protected routes.

---

## 🛠 Technology Used

- **Node.js**: Backend framework.
- **Express.js**: Web server.
- **MongoDB**: Database.
- **JWT**: Authentication.
- **dotenv**: Environment variable management.
- **cors**: Cross-Origin Resource Sharing.
- **cookie-parser**: For handling cookies.

---

## 🔗 Endpoints

### Public Endpoints

- `/jwt` - Generate JWT token.
- `/logout` - Clear JWT token.
- `/banner` - Fetch banner data.
- `/popular-services` - Fetch top 4 popular services.
- `/all-services` - Fetch all services with optional search query.
- `/service-details/:id` - Fetch service details by ID.

### Protected Endpoints (Require JWT)

- `/add-service` - Add a new service.
- `/add-purchase` - Add a purchase request.
- `/manage-service` - Fetch all services for a specific provider.
- `/manage-service/:id` - Delete a specific service by ID.
- `/update-service/:id` - Update a service by ID.
- `/booked-service` - Fetch all booked services for a user.
- `/service-todo` - Fetch all tasks assigned to a service provider.
- `/service-todo-update-status/:id` - Update booking status.

---

## 🚀 Installation

### Prerequisites

- Node.js and npm installed.
- MongoDB connection string.

### Steps to Run Locally

1. Clone the client-side repository:

   ```bash
   git clone https://github.com/tariqul420/Service-Orbit-Server.git
   cd Service-Orbit-Server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server:

   ```bash
   node index.js
   ```

   --- OR ---

   ```bash
   nodemon index.js
   ```

4. Open the project in a code editor:
   ```bash
   code .
   ```
5. Add the `.env` file in the root directory and include the following environment variables:
   ```bash
   DATABASE_USERNAME=YOUR_DATABASE_USERNAME
   DATABASE_PASSWORD=YOUR_DATABASE_PASSWORD
   ACCESS_TOKEN_SECRET=YOUR_ACCESS_TOKEN_SECRET
   ```
   > **Note:** Replace the `index.js` file's `your_mongo_connection_string` and the `.env` file's `YOUR_DATABASE_USERNAME`, `YOUR_DATABASE_PASSWORD`, and `YOUR_ACCESS_TOKEN_SECRET` with actual values.

## 🔗 Useful Links

- **Frontend Repository:** [_github/tariqul420/client_](https://github.com/tariqul420/Service-Orbit.git)
- **Live Site:** [_Service-Orbit.com_](https://service-orbit.web.app)
