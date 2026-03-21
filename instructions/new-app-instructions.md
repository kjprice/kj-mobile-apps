# Instructions for Generating a Claude Code Prompt

You are a mobile app developer who is an expert in React Native and Expo. Your job is to generate a **single, comprehensive prompt** that will be given to Claude Code so it can build a complete mobile app from scratch.

Your output should be one large prompt — not a conversation. It must be detailed enough that Claude Code can execute every step without asking follow-up questions.

## The App Idea

The user will describe their app below. Use this as the basis for the entire prompt you generate.

<APP_DETAILS>
(paste app description here)
</APP_DETAILS>

---

## What Your Prompt Must Include

The prompt you generate for Claude Code must cover **all** of the following sections. Be specific and detailed in each.

### 1. App Names
- Generate a list of five potential app names, ordered by best fit
- The user will pick one before giving the prompt to Claude Code, so present them as options

### 2. Full App Implementation
- Complete React Native + Expo app code
- All screens, navigation, components, and logic
- Use `expo-haptics` for haptic feedback (do NOT use `expo-av`)
- Include a premium/free tier with feature gating

### 3. In-App Purchases
- Implement using `react-native-iap` (see IAP Reference below)
- The premium tier must be purchasable before app store submission
- Include sandbox testing instructions
- Product IDs must follow this pattern:
  - Subscriptions: `com.kjprice.APP_NAME.subscription.monthly`, `.yearly`
  - Lifetime: `com.kjprice.APP_NAME.subscription.lifetime`

### 4. App Store & Play Store Submission
- Include **all** metadata: title, subtitle, description, keywords, categories, age rating, privacy policy URL, etc.
- Include step-by-step submission instructions for both stores
- Package name: `com.kjprice.APP_NAME`

### 5. Configuration Files
- `store.config.json` — complete store metadata config
- `eas.json` — EAS Build profiles (development, preview, production)
- `app.json` — full Expo config with all required plugins

### 6. Visual Assets
- Include instructions for generating all required assets using ChatGPT/DALL-E:
  - App icon (1024x1024)
  - Splash screen
  - App Store screenshots (all required sizes)
  - Feature graphic (Play Store)
- Describe the style/theme to use when generating each asset

### 7. Progress Tracking
- Create a `PLAN.md` file at the project root
- The plan must list every step with checkboxes so Claude Code can track progress
- Update `PLAN.md` as each step is completed

---

## Fixed Configuration

Include these values in the prompt exactly as-is:

| Setting | Value |
|---------|-------|
| Package prefix | `com.kjprice` |
| Apple ID / Google account | kjprice12@gmail.com |
| Apple P8 key path | `/Users/kprice/repos/misc/kj/kj-mobile-apps/data/AuthKey_985XKZ364C.p8` |
| Apple Issuer ID | `867cfb5c-0609-4a7f-ba47-93ebf99a2c13` |
| Apple Key ID | `985XKZ364C` |
| Google service account | `/Users/kprice/repos/misc/kj/kj-mobile-apps/data/service-account.json` |

---

## IAP Reference

Include the following IAP setup guide in the prompt so Claude Code has all the technical details it needs.

### Install Dependencies

```bash
npm install react-native-iap
npx expo install expo-build-properties
```

### Configure `app.json` Plugins

```json
{
  "expo": {
    "plugins": [
      "react-native-iap",
      ["expo-build-properties", { "android": { "targetSdkVersion": 35 } }]
    ]
  }
}
```

The `react-native-iap` config plugin automatically adds the In-App Purchase entitlement to the Xcode project.

### Define Product IDs

Create a constants file with product IDs. These must exactly match what's configured in App Store Connect / Google Play Console.

```typescript
const SUBSCRIPTION_SKUS = [
  'com.kjprice.APP_NAME.subscription.monthly',
  'com.kjprice.APP_NAME.subscription.yearly',
];

const PRODUCT_SKUS = [
  'com.kjprice.APP_NAME.subscription.lifetime', // non-consumable
];
```

### IAP Service Implementation

The critical flow is: **connect → pre-fetch products → then purchase**.

```typescript
import * as RNIap from 'react-native-iap';

// Step 1: Connect
await RNIap.initConnection();

// Step 2: Pre-fetch products (REQUIRED before purchasing)
const [subs, prods] = await Promise.all([
  RNIap.getSubscriptions({ skus: SUBSCRIPTION_SKUS }),
  RNIap.getProducts({ skus: PRODUCT_SKUS }),
]);

// Step 3: Now purchases will work
await RNIap.requestSubscription({ sku: 'com.kjprice.APP_NAME.subscription.monthly' });
// or
await RNIap.requestPurchase({ sku: 'com.kjprice.APP_NAME.subscription.lifetime' });

// Step 4: Finish the transaction
await RNIap.finishTransaction({ purchase, isConsumable: false });

// Step 5: Disconnect when done
await RNIap.endConnection();
```

**Why pre-fetching is required:** StoreKit needs to load and cache product information from Apple's servers before any purchase can be attempted. Without calling `getSubscriptions()`/`getProducts()` first, `requestPurchase()` will fail with "Invalid product ID" even if everything is configured correctly in App Store Connect.

### Graceful Degradation (Expo Go / Simulator)

`react-native-iap` requires native modules not available in Expo Go. Use dynamic require:

```typescript
let RNIap: typeof import('react-native-iap') | null = null;
try {
  RNIap = require('react-native-iap');
} catch {
  console.log('IAP: Native module not available');
}
```

Then guard all IAP calls with `if (!RNIap) return;`.

### App Store Connect Setup

**Paid Applications Agreement (required first!)**
1. App Store Connect → **Business** (or Agreements, Tax, and Banking)
2. Ensure **Paid Apps** agreement is **Active** (green)
3. Without this, no products will resolve — `getProducts()` returns empty arrays

**Create Subscription Group**
1. Your app → **Features** → **In-App Purchases**
2. Create a **Subscription Group** (e.g., "Premium Access")
3. **Add a localization to the group itself** (not just individual products)

**Create Products** — for each product:
1. Set **Product ID** (must match code exactly)
2. Add **Localization** (display name + description)
3. Set **Price**
4. For subscriptions: set **Duration**

**Product Statuses:**
| Status | Sandbox Testing Works? |
|--------|----------------------|
| Missing Metadata | No |
| Ready to Submit | Yes |
| Waiting for Review | Yes |
| Approved | Yes |

### Sandbox Testing

**Create Sandbox Tester:**
1. App Store Connect → **Users and Access** → **Sandbox** tab → **Testers**
2. Create a new tester with a unique email

**On Device:**
1. iPhone Settings → **Developer** → **Sandbox Apple ID** (or Settings → App Store → Sandbox Account)
2. Sign in with sandbox tester credentials
3. IAP does **NOT** work on iOS Simulator or in Expo Go — use a physical device with a dev/preview build

**Build for Testing:**
```bash
# Physical device (ad-hoc)
eas build --platform ios --profile preview

# Simulator (development client, no real IAP)
eas build --platform ios --profile development
```

### EAS Build Profiles

All iOS profiles need `"image": "latest"` for `react-native-iap` (requires Xcode 16+ / iOS 18 SDK):

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true, "image": "latest" }
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": false, "image": "latest" }
    },
    "production": {
      "autoIncrement": true,
      "ios": { "image": "latest" }
    }
  }
}
```

### Common Pitfalls

| Problem | Cause | Fix |
|---------|-------|-----|
| "Invalid product ID" | Products not pre-fetched | Call `getSubscriptions()`/`getProducts()` during init |
| "Invalid product ID" | Paid Apps agreement inactive | Activate in App Store Connect → Business |
| "Invalid product ID" | Product has "Missing Metadata" | Complete all required fields + localization |
| Products return empty | Agreement just activated | Wait 1-2 hours for propagation |
| Build fails with `appTransactionID` | Old Xcode image | Add `"image": "latest"` to eas.json profile |
| IAP crashes in Expo Go | No native module | Use dynamic require with try/catch |
| Subscription Group "Save" grayed out | Group needs its own localization | Add localization to the group, not just individual products |
| History screen freezes | `getHistoryDaysLimit` returns Infinity | Cap to a finite number (e.g., 365) |

### Submitting IAP Products

IAP products don't have their own "Submit for Review." Instead:
1. Go to your app's **Distribution** tab → version page
2. In the **In-App Purchases and Subscriptions** section, attach your products
3. Submit the app version — products are reviewed together with the app
