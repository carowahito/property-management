# Property Management System - Setup Guide

## Prerequisites

- Node.js 20+ installed
- PostgreSQL database (local or cloud)
- npm or yarn package manager

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the following required variables:

```env
# Database (Required)
DATABASE_URL="postgresql://user:password@localhost:5432/property_management"

# NextAuth (Required)
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="generate-using: openssl rand -base64 32"

# Email Service (Optional)
SENDGRID_API_KEY="your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="noreply@yourcompany.com"

# SMS Service (Optional)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"
```

### 3. Set Up Database

```bash
# Generate Prisma Client
npm run db:generate

# Push database schema
npm run db:push

# Seed database with sample data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3001](http://localhost:3001)

## Database Management

### Prisma Commands

```bash
# Generate Prisma Client after schema changes
npm run db:generate

# Push schema changes to database (development)
npm run db:push

# Create and run migrations (production)
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio

# Seed database with sample data
npm run db:seed
```

### Database Schema

The system uses PostgreSQL with Prisma ORM. Key entities:

- **Users** - Authentication and team members
- **Properties** - Property listings
- **Landlords** - Property owners
- **Tenants** - Current renters
- **Vendors** - Service providers
- **Leads** - Potential tenants/landlords
- **Enquiries** - Support requests
- **Leases** - Rental agreements
- **Payments** - Rent and other payments
- **Payouts** - Landlord disbursements
- **Tasks** - CRM tasks and reminders
- **Messages** - Communications hub
- **Maintenance Requests** - Repair requests
- **Work Orders** - Vendor assignments
- **Inspections** - Property inspections
- **Viewings** - Property showing appointments

## Authentication

### Default Accounts (After Seeding)

| Role    | Email                   | Password    |
| ------- | ----------------------- | ----------- |
| Admin   | admin@propmanage.com    | admin123    |
| Manager | alice@propmanage.com    | password123 |
| Agent   | bob@propmanage.com      | password123 |

### Security Features

- ✅ NextAuth.js for authentication
- ✅ Bcrypt password hashing
- ✅ JWT sessions (30-day expiry)
- ✅ Protected routes via middleware
- ✅ Role-based access control

## API Routes

All API routes require authentication via NextAuth session.

### Tasks API

```
GET    /api/tasks              - List all tasks (with filters)
POST   /api/tasks              - Create new task
GET    /api/tasks/[id]         - Get task by ID
PATCH  /api/tasks/[id]         - Update task
DELETE /api/tasks/[id]         - Delete task
```

Query parameters:
- `status` - Filter by status (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- `priority` - Filter by priority (LOW, MEDIUM, HIGH, URGENT)
- `assignedTo` - Filter by assigned user ID
- `stakeholderType` - Filter by stakeholder type
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)

### Leads API

```
GET    /api/leads              - List all leads (with filters)
POST   /api/leads              - Create new lead
GET    /api/leads/[id]         - Get lead by ID
PATCH  /api/leads/[id]         - Update lead
DELETE /api/leads/[id]         - Delete lead (admin only)
```

Query parameters:
- `status` - Filter by status (NEW, CONTACTED, QUALIFIED, CONVERTED, LOST)
- `type` - Filter by type (TENANT, LANDLORD, BUYER, SELLER)
- `source` - Filter by source
- `search` - Search in name, email, phone
- `page` - Page number
- `limit` - Items per page

### Messages API

```
GET    /api/messages           - List all messages (with filters)
POST   /api/messages           - Send new message
```

Query parameters:
- `type` - Filter by type (EMAIL, SMS, IN_APP, SYSTEM)
- `category` - Filter by category
- `stakeholderType` - Filter by stakeholder type
- `search` - Search in subject and content
- `page` - Page number
- `limit` - Items per page

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Email & SMS Integration

### SendGrid (Email)

1. Sign up at [SendGrid](https://sendgrid.com)
2. Create an API key
3. Verify sender email
4. Add to `.env`:
   ```
   SENDGRID_API_KEY="your-key"
   SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
   ```

### Twilio (SMS)

1. Sign up at [Twilio](https://twilio.com)
2. Get Account SID and Auth Token
3. Purchase a phone number
4. Add to `.env`:
   ```
   TWILIO_ACCOUNT_SID="your-sid"
   TWILIO_AUTH_TOKEN="your-token"
   TWILIO_PHONE_NUMBER="+1234567890"
   ```

## File Upload (AWS S3)

1. Create S3 bucket
2. Create IAM user with S3 access
3. Add to `.env`:
   ```
   AWS_REGION="us-east-1"
   AWS_ACCESS_KEY_ID="your-key"
   AWS_SECRET_ACCESS_KEY="your-secret"
   AWS_S3_BUCKET="your-bucket"
   ```

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
pg_isready

# Verify connection string
echo $DATABASE_URL

# Reset database (CAUTION: Deletes all data)
npm run db:push -- --force-reset
npm run db:seed
```

### Authentication Issues

```bash
# Clear Next.js cache
rm -rf .next

# Regenerate NextAuth secret
openssl rand -base64 32
```

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run db:generate
npm run build
```

## Support

For issues and questions:
- Check existing GitHub issues
- Review documentation
- Contact support team

## License

Proprietary - All rights reserved
