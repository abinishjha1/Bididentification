# Bid Beacon Manager

A comprehensive bid management system designed to streamline contractor bid processing, project tracking, and contract management through intelligent email and communication tools.

## Key Features

- **Automated Email Processing**: Identify and categorize bid-related emails automatically
- **Multi-Stage Bid Classification**: Track bids through various stages with custom classifications
- **Integrated Project Management**: Connect bids to projects and contractors
- **Contract Tracking**: Monitor contract statuses and deliverables
- **Dashboard Analytics**: Get insights into bid performance and project status

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bid-beacon-manager.git
cd bid-beacon-manager
```

2. Install dependencies:
```bash
npm install
```

3. Set up your database connection:
Create a `.env` file in the root directory with the following:
```
DATABASE_URL=postgresql://username:password@localhost:5432/bidbeacon
```

4. Push the database schema:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:5000

## Project Structure

- `/client` - Frontend React application
- `/server` - Express backend API
- `/shared` - Shared types and schemas used by both client and server

## Database Schema

The application uses Drizzle ORM with PostgreSQL. The schema includes:

- Users
- Email Records
- Contractors
- Projects
- Bids
- Classifications
- Bid Classifications
- Bid Documents
- Contracts

## API Endpoints

### Email Management
- `GET /api/emails` - Get all emails
- `GET /api/emails/unprocessed` - Get unprocessed emails
- `POST /api/emails` - Create new email
- `PATCH /api/emails/:id` - Update email

### Bid Management
- `GET /api/bids` - Get all bids
- `GET /api/bids/:id` - Get bid by ID
- `GET /api/bids/project/:projectId` - Get bids by project
- `GET /api/bids/contractor/:contractorId` - Get bids by contractor
- `POST /api/bids` - Create new bid
- `PATCH /api/bids/:id` - Update bid

### Project Management
- `GET /api/projects` - Get all projects
- `GET /api/projects/active` - Get active projects
- `POST /api/projects` - Create new project
- `PATCH /api/projects/:id` - Update project

### Contractor Management
- `GET /api/contractors` - Get all contractors
- `POST /api/contractors` - Create new contractor
- `PATCH /api/contractors/:id` - Update contractor

### Classification Management
- `GET /api/classifications` - Get all classifications
- `POST /api/classifications` - Create new classification
- `PATCH /api/classifications/:id` - Update classification

### Contract Management
- `GET /api/contracts` - Get all contracts
- `POST /api/contracts` - Create new contract
- `PATCH /api/contracts/:id` - Update contract

## Running in Production

For production deployment:

```bash
npm run build
npm start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.