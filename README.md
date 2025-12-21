# Document Editor Project

This project is divided into a `frontend` and a `backend`.

## Project Structure

- `frontend/`: React + Vite application.
- `backend/`: Node.js + Express API.

## Getting Started

### Prerequisites

- Node.js
- MongoDB

### Installation

To install dependencies for both frontend and backend, run the following command from the root directory:

```bash
npm run install:all
```

### Running the Project

You can start the frontend and backend separately:

**Frontend:**
```bash
npm run dev:frontend
```

**Backend:**
```bash
npm run dev:backend
```

## Environment Variables

### Backend
Create a `.env` file in the `backend` directory with the following variables:
- `MONGODB_URI`
- `JWT_SECRET`
- `PORT` (defaults to 5000)
- `SENDGRID_API_KEY` (for OTP)
- `EMAIL_FROM`
- `CLIENT_URL`
