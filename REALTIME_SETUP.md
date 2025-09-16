# TownTap Real-time Setup Guide

## Overview
This guide explains how to set up real-time functionality for your TownTap application using Supabase. The implementation includes comprehensive real-time subscriptions for orders, messages, payments, and notifications.

## Prerequisites
1. Updated database schema (run `database.sql`)
2. Enhanced auth store with real-time integration
3. RealtimeService implementation

## Supabase Dashboard Configuration

### 1. Enable Real-time for Tables
Go to your Supabase Dashboard → Database → Replication and enable real-time for these tables:
- `orders`
- `order_items`
- `messages`
- `notifications`
- `payments`
- `profiles`
- `businesses`

### 2. Configure Real-time Publication
In your Supabase SQL Editor, run:
```sql
-- Enable real-time publication (if not already done by database.sql)
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE businesses;
```

### 3. Row Level Security (RLS)
Ensure RLS policies are enabled for all tables. The database.sql file includes comprehensive policies for:
- Users can only see their own data
- Business owners can see their business-related data
- Public access for business discovery

## Real-time Features Implemented

### 1. Order Tracking
- **Customer**: Real-time updates on order status changes
- **Business**: Live notifications for new orders and status updates
- **Channel**: `orders:user_id=<user_id>` and `orders:business_id=<business_id>`

### 2. Messaging System
- **Real-time chat**: Between customers and businesses
- **Message delivery**: Instant message notifications
- **Channel**: `messages:user_id=<user_id>`

### 3. Payment Updates
- **Payment status**: Real-time payment confirmations
- **Transaction updates**: Live payment processing updates
- **Channel**: `payments:user_id=<user_id>`

### 4. Push Notifications
- **In-app notifications**: Real-time notification delivery
- **Status updates**: Live notification status changes
- **Channel**: `notifications:user_id=<user_id>`

### 5. Business Updates
- **Profile changes**: Real-time business profile updates
- **Status changes**: Live business availability updates
- **Channel**: `businesses:*` (for discovery)

### 6. User Presence
- **Online status**: Track user online/offline status
- **Location sharing**: Real-time location updates for delivery
- **Channel**: `presence:general`

## Authentication Integration

The auth store automatically:
1. **Sets up subscriptions** when user signs in
2. **Cleans up subscriptions** when user signs out
3. **Handles session restoration** with real-time reconnection
4. **Manages subscription lifecycle** across app states

## Testing Real-time Features

### 1. Order Flow Test
```typescript
// Create a test order in Supabase dashboard
INSERT INTO orders (user_id, business_id, status, total_amount) 
VALUES ('user-uuid', 'business-uuid', 'pending', 25.99);

// Update order status
UPDATE orders SET status = 'confirmed' WHERE id = 'order-uuid';
```

### 2. Message Test
```typescript
// Send a test message
INSERT INTO messages (sender_id, recipient_id, content, message_type) 
VALUES ('user-uuid', 'business-uuid', 'Test message', 'text');
```

### 3. Notification Test
```typescript
// Create a test notification
INSERT INTO notifications (user_id, title, message, notification_type) 
VALUES ('user-uuid', 'Test', 'Real-time test notification', 'info');
```

## Monitoring Real-time Connections

### 1. Console Logs
The RealtimeService logs all connection events:
- Connection status
- Subscription success/failures
- Message receipts
- Error handling

### 2. Supabase Dashboard
Monitor real-time connections in:
- Dashboard → Logs → Real-time logs
- API usage statistics
- Connection count and status

## Troubleshooting

### Common Issues

1. **Subscriptions not working**
   - Check RLS policies are correct
   - Verify table is added to publication
   - Ensure user has proper permissions

2. **Connection drops**
   - Check network connectivity
   - Verify Supabase project is active
   - Review connection limits

3. **Performance issues**
   - Limit subscription scope with filters
   - Use batch updates for multiple changes
   - Implement proper cleanup on unmount

### Debug Commands
```typescript
// Check active subscriptions
console.log('Active subscriptions:', supabase.getChannels());

// Test connection
supabase.realtime.connect();

// Monitor connection status
supabase.realtime.onOpen(() => console.log('Connected'));
supabase.realtime.onClose(() => console.log('Disconnected'));
```

## Performance Optimization

### 1. Subscription Filtering
```typescript
// Filter subscriptions to reduce data
.on('postgres_changes', {
  event: 'UPDATE',
  schema: 'public',
  table: 'orders',
  filter: `user_id=eq.${userId}`
})
```

### 2. Batch Operations
```typescript
// Use batch updates for multiple changes
const updates = await supabase
  .from('orders')
  .update({ status: 'completed' })
  .in('id', orderIds);
```

### 3. Connection Management
```typescript
// Cleanup unused subscriptions
useEffect(() => {
  return () => {
    realtimeService.cleanup();
  };
}, []);
```

## Security Considerations

1. **RLS Policies**: All real-time tables have proper RLS policies
2. **User Isolation**: Users can only access their own data
3. **Business Isolation**: Business owners see only their business data
4. **Rate Limiting**: Implement client-side rate limiting for subscriptions

## Next Steps

1. Test all real-time features in development
2. Monitor performance in production
3. Implement additional real-time features as needed:
   - Real-time location tracking
   - Live order mapping
   - Customer support chat
   - Business analytics updates

## Support

For issues with real-time functionality:
1. Check Supabase documentation
2. Review console logs for errors
3. Test individual subscription channels
4. Verify database triggers are firing