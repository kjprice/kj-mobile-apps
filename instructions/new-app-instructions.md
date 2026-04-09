# Instructions for Generating a Claude Code Prompt

You are a mobile app developer who is an expert in React Native and Expo. Your job is to generate a **single, comprehensive prompt** that will be given to Claude Code so it can build a complete mobile app from scratch.

Your output should be one large prompt — not a conversation. It must be detailed enough that Claude Code can execute every step without asking follow-up questions.

## The App Idea

The user will describe their app below. Use this as the basis for the entire prompt you generate.

<APP_DETAILS>
(paste app description here)
</APP_DETAILS>

For contact information, use kjmobileapps@gmail.com.

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

### 4. Legal Pages (Required for App Store Approval)

Apps with subscriptions **will be rejected** without these. Set them up before submitting.

**Privacy Policy page:**
- Create `privacy-policy/APP_NAME.html` in the `kj-mobile-apps` repo (`~/repos/misc/kj/kj-mobile-apps`)
- Hosted at: `https://kjprice.github.io/kj-mobile-apps/privacy-policy/APP_NAME.html`
- Must cover: what data is collected (or not), local storage, IAP payment handling, third-party services, children's privacy, contact email

**Terms of Use (EULA):**
- Use Apple's standard EULA: `https://www.apple.com/legal/internet-services/itunes/dev/stdeula/`
- No custom page needed unless you have special terms

**In-app links (PaywallModal or purchase screen):**
- Add functional links to both Privacy Policy and Terms of Use in the purchase flow
- Example:
  ```tsx
  <View style={styles.legalLinks}>
    <TouchableOpacity onPress={() => Linking.openURL('https://kjprice.github.io/kj-mobile-apps/privacy-policy/APP_NAME.html')}>
      <Text style={styles.legalLink}>Privacy Policy</Text>
    </TouchableOpacity>
    <Text style={styles.legalSeparator}>•</Text>
    <TouchableOpacity onPress={() => Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}>
      <Text style={styles.legalLink}>Terms of Use</Text>
    </TouchableOpacity>
  </View>
  ```

**App Store Connect metadata:**
- Set **Privacy Policy URL** field in App Info Localizations → must point to the actual privacy policy page (NOT the support page)
- Add to the **App Description** (bottom):
  ```
  SUBSCRIPTION INFO
  • Monthly ($X.XX/month) and Yearly ($XX.XX/year) auto-renewable subscriptions available
  • Payment is charged to your Apple ID account at confirmation of purchase
  • Subscription automatically renews unless canceled at least 24 hours before the end of the current period
  • Your account will be charged for renewal within 24 hours prior to the end of the current period
  • You can manage and cancel subscriptions in your Account Settings on the App Store after purchase

  Privacy Policy: https://kjprice.github.io/kj-mobile-apps/privacy-policy/APP_NAME.html
  Terms of Use (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
  ```

**Can be set via API:**
```bash
# Set privacy policy URL
curl -X PATCH -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.appstoreconnect.apple.com/v1/appInfoLocalizations/{LOCALIZATION_ID}" \
  -d '{"data":{"type":"appInfoLocalizations","id":"{LOCALIZATION_ID}","attributes":{"privacyPolicyUrl":"https://kjprice.github.io/kj-mobile-apps/privacy-policy/APP_NAME.html"}}}'

# Update description with EULA link
curl -X PATCH -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.appstoreconnect.apple.com/v1/appStoreVersionLocalizations/{VERSION_LOCALIZATION_ID}" \
  -d '{"data":{"type":"appStoreVersionLocalizations","id":"{VERSION_LOCALIZATION_ID}","attributes":{"description":"..."}}}'
```

### 5. App Store & Play Store Submission
- Include **all** metadata: title, subtitle, description, keywords, categories, age rating, privacy policy URL, etc.
- Include step-by-step submission instructions for both stores
- Package name: `com.kjprice.APP_NAME`

### 6. Configuration Files
- `store.config.json` — complete store metadata config
- `eas.json` — EAS Build profiles (development, preview, production)
- `app.json` — full Expo config with all required plugins

### 7. Visual Assets
- Include instructions for generating all required assets using ChatGPT/DALL-E:
  - App icon (1024x1024)
  - Splash screen
  - App Store screenshots (all required sizes)
  - Feature graphic (Play Store)
- Describe the style/theme to use when generating each asset

### 8. Progress Tracking
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


### 9. App Store Review Prompt

Prompt the user to leave an App Store review after meaningful engagement — not immediately.

**Implementation:**
- Use `expo-store-review` (wraps Apple's native `SKStoreReviewController`)
- Track two values in AsyncStorage: `firstLaunchDate` and `appOpenCount`
- On each app open, increment `appOpenCount`
- Trigger `StoreReview.requestReview()` when **both** conditions are met:
  - At least **3 days** since first launch
  - At least **5 app opens**
- Set a `hasPromptedReview` flag in AsyncStorage to avoid re-triggering
- Apple limits the native review dialog to **3 appearances per 365-day period** — the system silently ignores extra calls

```bash
npx expo install expo-store-review
```

```typescript
import * as StoreReview from 'expo-store-review';

// After checking conditions:
if (await StoreReview.isAvailableAsync()) {
  await StoreReview.requestReview();
}
```

**Important:** Do NOT use a custom review dialog — Apple rejects apps that use non-native review prompts.

### 10. Google Analytics (Firebase)

Add Firebase Analytics to track user engagement and feature usage. No server required — events are sent directly from the device to Google's servers.

**Step 1: Create Firebase project and register apps (CLI — fully automated):**

```bash
# Create the Firebase project (--analytics-region links a GA4 property automatically)
firebase projects:create kj-APP_NAME --display-name "App Display Name" --analytics-region us

# Register iOS app
firebase apps:create ios --project kj-APP_NAME --bundle-id com.kjprice.APP_NAME --app-nickname "APP_NAME iOS"

# Register Android app
firebase apps:create android --project kj-APP_NAME --package-name com.kjprice.APP_NAME --app-nickname "APP_NAME Android"
```

**Step 2: Download config files into the Expo project root:**

```bash
# Download iOS config
firebase apps:sdkconfig ios --project kj-APP_NAME -o ./GoogleService-Info.plist

# Download Android config
firebase apps:sdkconfig android --project kj-APP_NAME -o ./google-services.json
```

**Step 3: Install dependencies:**

```bash
npx expo install @react-native-firebase/app @react-native-firebase/analytics
```

**Step 4: Configure `app.json` plugins:**

```json
{
  "expo": {
    "plugins": [
      ["@react-native-firebase/app", {
        "ios": { "googleServicesFile": "./GoogleService-Info.plist" },
        "android": { "googleServicesFile": "./google-services.json" }
      }],
      "@react-native-firebase/analytics"
    ]
  }
}
```

**Privacy & App Store Impact:**
- No app store review issues — Firebase Analytics is used by millions of apps
- **Must update Privacy Policy** to disclose analytics data collection (device info, usage patterns, app events)
- **Must update App Store Connect "App Privacy" nutrition labels** — declare:
  - **Analytics** category: Usage Data, Device ID
  - Data is used for **Analytics** purpose
  - Data is **not linked to the user** (unless Firebase Auth is also used)
- **Must update Google Play Data Safety** section similarly

### 11. Cross-Promotion "Other Apps" Page

Display a dynamic list of your other apps, fetched from a remote JSON file.

**The JSON file already exists** at `~/repos/misc/kj/kj-mobile-apps/data/other-apps.json` and is deployed via GitHub Pages. When a new app is published, add an entry to this file and push — all existing apps will pick it up automatically.

**Live URL:** `https://kjprice.github.io/kj-mobile-apps/data/other-apps.json`

**Implementation:**
- Fetch the JSON on app launch from the URL above
- Cache the JSON locally so the page works offline
- Display as a list screen accessible from Settings or an "Other Apps" menu item
- Each entry includes: app name, icon URL, short description, and App Store/Play Store link
- Links must use App Store URLs (`https://apps.apple.com/app/idXXXXXXXXX`)
- Tapping an entry opens the store listing via `Linking.openURL()`
- **Exclude the current app** from the list (filter by package name)

**JSON format:**
```json
[
  {
    "name": "App Name",
    "package": "com.kjprice.appname",
    "icon": "https://kjprice.github.io/kj-mobile-apps/store-assets/appname/icon.png",
    "description": "A short description of the app",
    "ios": "https://apps.apple.com/app/id1234567890",
    "android": "https://play.google.com/store/apps/details?id=com.kjprice.appname"
  }
]
```

**App Store Review:** No issues — cross-promoting your own apps is common and explicitly allowed. Just ensure:
- Links go to official store listings (not sideloading)
- No executable code is loaded from the remote JSON
- The page is clearly labeled as "More Apps" or "Our Apps"

### 12. App Icon

After generating the app icon (1024x1024) using DALL-E, save it to the shared `kj-mobile-apps` repo so it's available for the "Other Apps" cross-promotion and store listings:

- Save to: `~/repos/misc/kj/kj-mobile-apps/store-assets/APP_NAME/icon.png`
- Also place it in the Expo project as `assets/icon.png` (referenced by `app.json`)
- The icon at the `store-assets` path is served via GitHub Pages and used by `other-apps.json`