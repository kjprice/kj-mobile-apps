# General Instructions

We also need detailed instructions for submitting the app to the app store and play store including all metadata. We need the ability to test premium features and before we submit the app we need to ensure that premium features can be purchased.

	We need instructions for updating all assets/artifacts such as screenshots, splash-icon, etc (Chat GPT - DALLE should be used).

Use expo-haptic instead of expo-av.

Package should be com.kjprice.NAME. Subscriptions should be `com.kjprice.NAME.subscription.FREQUENCY`.

Create a list of five names ordered by which is best.

Create the store.config.json and eas.json files with everything they need.

My appleid and google account is kjprice12@gmail.com.

P8 can be found here /Users/kprice/repos/misc/kj/kj-mobile-apps/data/AuthKey_985XKZ364C.p8
Issuer ID: 867cfb5c-0609-4a7f-ba47-93ebf99a2c13                                                                                                                        
Key ID: 985XKZ364C
Google service account JSON can be found here /Users/kprice/repos/misc/kj/kj-mobile-apps/data/service-account.json 


# IAP Product Setup Instructions

How to set up in-app purchases for a React Native + Expo app using `react-native-iap`.

---

## 1. Install Dependencies

```bash
npm install react-native-iap
npx expo install expo-build-properties
```

## 2. Configure `app.json` Plugins

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

## 3. Define Product IDs

Create a constants file with your product IDs. These must exactly match what's configured in App Store Connect / Google Play Console.

```typescript
const SUBSCRIPTION_SKUS = [
  'com.yourapp.subscription.monthly',
  'com.yourapp.subscription.yearly',
];

const PRODUCT_SKUS = [
  'com.yourapp.subscription.lifetime', // non-consumable
];
```

## 4. IAP Service Implementation

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
await RNIap.requestSubscription({ sku: 'com.yourapp.subscription.monthly' });
// or
await RNIap.requestPurchase({ sku: 'com.yourapp.subscription.lifetime' });

// Step 4: Finish the transaction
await RNIap.finishTransaction({ purchase, isConsumable: false });

// Step 5: Disconnect when done
await RNIap.endConnection();
```

### Why pre-fetching is required

StoreKit needs to load and cache product information from Apple's servers before any purchase can be attempted. Without calling `getSubscriptions()`/`getProducts()` first, `requestPurchase()` will fail with **"Invalid product ID"** even if everything is configured correctly in App Store Connect.

## 5. Graceful Degradation (Expo Go / Simulator)

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

## 6. App Store Connect Setup

### Paid Applications Agreement (required first!)
1. App Store Connect → **Business** (or Agreements, Tax, and Banking)
2. Ensure **Paid Apps** agreement is **Active** (green)
3. Without this, no products will resolve — `getProducts()` returns empty arrays

### Create Subscription Group
1. Your app → **Features** → **In-App Purchases**
2. Create a **Subscription Group** (e.g., "Premium Access")
3. **Add a localization to the group itself** (not just individual products)

### Create Products
For each product:
1. Set **Product ID** (must match code exactly)
2. Add **Localization** (display name + description)
3. Set **Price**
4. For subscriptions: set **Duration**

### Product Statuses
| Status | Sandbox Testing Works? |
|--------|----------------------|
| Missing Metadata | No |
| Ready to Submit | Yes |
| Waiting for Review | Yes |
| Approved | Yes |

## 7. Sandbox Testing

### Create Sandbox Tester
1. App Store Connect → **Users and Access** → **Sandbox** tab → **Testers**
2. Create a new tester with a unique email

### On Device
1. iPhone Settings → **Developer** → **Sandbox Apple ID** (or Settings → App Store → Sandbox Account)
2. Sign in with sandbox tester credentials
3. IAP does **NOT** work on iOS Simulator or in Expo Go — use a physical device with a dev/preview build

### Build for Testing
```bash
# Physical device (ad-hoc)
eas build --platform ios --profile preview

# Simulator (development client, no real IAP)
eas build --platform ios --profile development
```

## 8. EAS Build Profiles

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

## 9. Common Pitfalls

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

## 10. Submitting IAP Products

IAP products don't have their own "Submit for Review." Instead:
1. Go to your app's **Distribution** tab → version page
2. In the **In-App Purchases and Subscriptions** section, attach your products
3. Submit the app version — products are reviewed together with the app