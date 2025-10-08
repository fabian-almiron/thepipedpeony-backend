# 🔐 Subscription System Setup Guide

This guide will help you set up the complete subscription system with gated content for The Piped Peony Academy.

## 📋 What's Been Created

### 1. Strapi Content Types

#### Subscription Content Type
- **Location**: `/src/api/subscription/`
- **Purpose**: Define subscription products/plans
- **Fields**:
  - `name` (Text): Plan name (e.g., "Premium Monthly")
  - `description` (Rich Text): Plan description
  - `subscriptionPrice` (Decimal): Price amount
  - `subscriptionLength` (Enum): Monthly, Quarterly, Yearly
  - `freeTrialDays` (Integer): Free trial period
  - `productGallery` (Media): Plan images
  - `stripeProductId` (Text): Stripe product ID
  - `stripePriceId` (Text): Stripe price ID
  - `features` (JSON): Array of plan features
  - `active` (Boolean): Whether plan is available
  - `slug` (UID): URL-friendly identifier
  - `featured` (Boolean): Highlight as popular plan

#### User Subscription Content Type
- **Location**: `/src/api/usersubscription/`
- **Purpose**: Track individual user subscriptions
- **Fields**:
  - `user` (Relation): Link to Users & Permissions user
  - `subscription` (Relation): Link to Subscription plan
  - `stripeSubscriptionId` (Text): Stripe subscription ID
  - `stripeCustomerId` (Text): Stripe customer ID
  - `status` (Enum): active, canceled, past_due, unpaid, trialing, incomplete
  - `currentPeriodStart/End` (DateTime): Billing period
  - `cancelAtPeriodEnd` (Boolean): Scheduled cancellation
  - `trialStart/End` (DateTime): Trial period dates
  - `canceledAt/endedAt` (DateTime): Cancellation dates

### 2. Frontend Components

#### Subscription Management
- **SubscriptionPlans** (`/components/subscription-plans.tsx`): Display available plans
- **SubscriptionGate** (`/components/subscription-gate.tsx`): Content access control
- **useSubscription** (`/hooks/use-subscription.ts`): Subscription state management

#### API Routes
- **Subscription Checkout** (`/app/api/subscription-checkout/route.ts`): Create Stripe sessions
- **Stripe Webhook** (`/app/api/stripe-webhook/route.ts`): Handle subscription events
- **Subscription Status** (`/app/api/subscription-status/route.ts`): Check user access

#### Pages
- **Signup Flow** (`/app/signup/page.tsx`): Account creation + subscription selection
- **Success Page** (`/app/subscription/success/page.tsx`): Post-purchase confirmation

## 🔧 Setup Instructions

### Step 1: Restart Strapi

Stop your current Strapi instance and restart to register the new content types:

```bash
cd /Users/mac/Documents/9S/CLIENTS/The\ Piped\ Peony/strapi-first-build
# Stop with Ctrl+C, then:
npm run dev
```

### Step 2: Configure Strapi Permissions

1. Go to http://localhost:1337/admin
2. Navigate to **Settings** → **Users & Permissions** → **Roles**

#### For Public Role:
- **Subscription**: ✅ `find`, ✅ `findOne`
- **Usersubscription**: ❌ (no public access)

#### For Authenticated Role:
- **Subscription**: ✅ `find`, ✅ `findOne`
- **Usersubscription**: ✅ `find` (own records only), ✅ `findOne` (own records only)

### Step 3: Create User Roles

1. Go to **Settings** → **Users & Permissions** → **Roles**
2. Create/verify these roles exist:

#### Customer Role (Default)
- **Type**: `customer`
- **Description**: "Regular customers with basic access"
- **Permissions**: Basic content access

#### Subscriber Role
- **Type**: `subscriber` 
- **Description**: "Premium subscribers with full access"
- **Permissions**: All content access including premium features

### Step 4: Set Up Stripe Products

1. **Create Products in Stripe Dashboard**:
   - Go to https://dashboard.stripe.com/products
   - Create subscription products (e.g., "Premium Monthly", "Premium Yearly")
   - Note the Product ID and Price ID for each

2. **Create Subscription Records in Strapi**:
   - Go to Content Manager → Subscription
   - Create entries for each Stripe product
   - Fill in all fields including `stripeProductId` and `stripePriceId`
   - Set `active` to true and optionally mark one as `featured`

### Step 5: Configure Environment Variables

Add these to your frontend `.env.local`:

```env
# Existing variables
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# New variables for subscriptions
STRIPE_WEBHOOK_SECRET=whsec_...
STRAPI_API_TOKEN=your_strapi_api_token_here
```

#### Getting the Strapi API Token:
1. Go to Strapi Admin → Settings → API Tokens
2. Create new token with "Full access" type
3. Copy the token to your `.env.local`

### Step 6: Set Up Stripe Webhooks

1. **In Stripe Dashboard**:
   - Go to Developers → Webhooks
   - Add endpoint: `http://localhost:3000/api/stripe-webhook` (or your domain)
   - Select these events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

2. **Copy Webhook Secret**:
   - Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET` in `.env.local`

### Step 7: Test the System

1. **Create a Test Subscription**:
   ```bash
   # Start both servers
   cd /Users/mac/Documents/9S/CLIENTS/The\ Piped\ Peony/strapi-first-build
   npm run dev
   
   # In another terminal
   cd /Users/mac/Documents/9S/CLIENTS/The\ Piped\ Peony/piped-peony-frontend
   pnpm dev
   ```

2. **Test Signup Flow**:
   - Go to http://localhost:3000/signup
   - Create account → Select subscription → Complete payment
   - Use Stripe test card: `4242 4242 4242 4242`

3. **Verify Access Control**:
   - Check that premium content is gated
   - Verify role changes after subscription
   - Test webhook processing

## 🎯 Usage Examples

### Protecting Content with SubscriptionGate

```tsx
import SubscriptionGate from '@/components/subscription-gate';

export default function PremiumCoursePage() {
  return (
    <SubscriptionGate requiredRole="Subscriber">
      <div>
        <h1>Premium Course Content</h1>
        <p>This content is only visible to subscribers!</p>
      </div>
    </SubscriptionGate>
  );
}
```

### Checking Subscription Status

```tsx
import { useSubscription } from '@/hooks/use-subscription';

export default function MyComponent() {
  const { isSubscriber, hasAccess, userRole } = useSubscription();
  
  return (
    <div>
      {hasAccess('Subscriber') ? (
        <p>Welcome, premium subscriber!</p>
      ) : (
        <p>Upgrade to access premium features</p>
      )}
    </div>
  );
}
```

## 🔄 Content Gating Strategy

### Logged Out Users
- See public content only
- Prompted to sign up/login for premium content
- Use "logged-out-header" menu

### Customer Role (Logged In, No Subscription)
- Access to basic content
- Gated from premium content with upgrade prompts
- Use "logged-in-header" menu (basic version)

### Subscriber Role (Active Subscription)
- Full access to all content
- Premium features unlocked
- Use "logged-in-header" menu (full version)

## 🚨 Important Notes

1. **Webhook Processing**: Stripe webhooks automatically update user roles and subscription status
2. **Role Management**: Users are automatically upgraded/downgraded based on subscription status
3. **Trial Periods**: Free trials are handled automatically by Stripe
4. **Cancellations**: Users retain access until the end of their billing period
5. **Failed Payments**: Users are automatically downgraded to Customer role

## 🔧 Troubleshooting

### Webhook Issues
- Check webhook endpoint is accessible
- Verify webhook secret matches
- Check Strapi API token permissions

### Role Issues
- Ensure Customer and Subscriber roles exist
- Check role permissions in Strapi
- Verify API token has user update permissions

### Subscription Status
- Check Stripe dashboard for subscription status
- Verify webhook events are being received
- Check user-subscription records in Strapi

## 📈 Next Steps

1. **Menu Customization**: Update menu items based on user role
2. **Content Organization**: Organize courses/content by access level
3. **Analytics**: Track subscription conversions and usage
4. **Email Integration**: Set up subscription confirmation emails
5. **Customer Portal**: Add Stripe customer portal for self-service
