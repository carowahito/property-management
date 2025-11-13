# Admin Services Documentation

This directory contains service modules for the admin portal. Each service handles specific business logic for the property management system.

## Services

### 1. Rent Payments Service (`rent-payments/service.ts`)
Handles rent payment automation and billing operations.

**Key Functions:**
- `generateMonthlyRentPayments(tenantId)` - Generate monthly rent payment records
- `applyLateFees(tenantId)` - Calculate and apply late fees to overdue payments
- `recordPayment(paymentId, amount, method, transactionId)` - Record payment transactions
- `getRentCollectionSummary(tenantId, startDate, endDate)` - Get collection statistics
- `generateLandlordPayouts(tenantId, periodStart, periodEnd)` - Process landlord payouts
- `getPaymentsRequiringReminders(tenantId, config)` - Get payments needing reminders

**Integration Points:**
- Database: Requires `rentPayment`, `lease`, `landlord` models
- Services: Works with notification service for reminders
- Pages: Used by `/admin/rent-payments`, `/admin/payouts`

### 2. Notifications Service (`notifications/service.ts`)
Handles system-wide notifications across email, SMS, and push channels.

**Key Functions:**
- `sendRentReminder(paymentId, channels)` - Send payment reminder to tenant
- `sendPaymentReceipt(paymentId, channels)` - Send payment confirmation
- `sendLeaseRenewalNotifications(tenantId, daysBeforeExpiry)` - Notify about expiring leases
- `sendMaintenanceUpdate(ticketId, channels)` - Update tenant on maintenance status
- `sendBatchRentReminders(tenantId, daysBeforeDue, daysAfterDue)` - Batch send reminders

**Notification Channels:**
```typescript
interface NotificationChannel {
  email: boolean
  sms: boolean
  push: boolean
}
```

**Email Templates Provided:**
- Rent payment reminders (standard and overdue)
- Payment receipts
- Lease renewal notices
- Maintenance status updates

**Pages:** Used by `/admin/notifications`

## Usage Examples

### Rent Payments Service
```typescript
import { generateMonthlyRentPayments, getRentCollectionSummary } from '@/app/admin/rent-payments/service'

// Generate monthly payments
const count = await generateMonthlyRentPayments('tenant-123')

// Get collection stats
const summary = await getRentCollectionSummary(
  'tenant-123',
  new Date('2024-11-01'),
  new Date('2024-11-30')
)
```

### Notifications Service
```typescript
import { sendRentReminder, sendPaymentReceipt } from '@/app/admin/notifications/service'

// Send rent reminder via email and SMS
await sendRentReminder('payment-001', { 
  email: true, 
  sms: true, 
  push: false 
})

// Send payment receipt via email
await sendPaymentReceipt('payment-001', { 
  email: true, 
  sms: false, 
  push: false 
})
```

## Mock Data Integration

Current implementation uses mock data from `/lib/mock-data.ts`:
- `mockPayments` - Payment transactions
- `mockMaintenanceRequests` - Maintenance tickets
- `mockLeases` - Lease agreements
- `mockNotifications` - Notification history

## Future Implementation

These services are prepared for database integration. To implement:

1. **Install Prisma:**
   ```bash
   npm install @prisma/client
   ```

2. **Setup Database Models:**
   - Add `RentPayment`, `Lease`, `LandlordPayout` models to schema

3. **Update Service Functions:**
   - Replace console.log stubs with actual database queries
   - Integrate with email service (SendGrid, AWS SES)
   - Integrate with SMS service (Twilio, Africa's Talking)
   - Integrate with push notification service (Firebase, OneSignal)

## Error Handling

Services include try-catch patterns and error logging for production use:
- Payment validation errors
- Missing records
- Service integration failures
- Email/SMS delivery failures

## Related Pages

- `/admin/rent-payments` - Payment dashboard
- `/admin/notifications` - Notification management
- `/admin/payouts` - Landlord payout tracking
- `/admin/leases` - Lease management
