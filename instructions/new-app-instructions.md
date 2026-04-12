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

> **⚠️ Guideline 1.1 — Objectionable Content:** Apple will reject apps whose metadata references suggestive or objectionable content. Avoid words like "spicy", "intimacy", "sexy", or similar in the description, keywords, and promotional text — even if the in-app content itself is within guidelines. Keep store metadata family-friendly; the content can be more mature inside the app under the appropriate age rating (17+).

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

> **⚠️ `expo-store-review` requires native modules not available in Expo Go.** Use the same dynamic require pattern as `react-native-iap` to avoid crashes during development:

```typescript
let StoreReview: typeof import('expo-store-review') | null = null;
try {
  StoreReview = require('expo-store-review');
} catch {
  console.log('StoreReview: Native module not available (running in Expo Go?)');
}

// Guard all calls:
if (!StoreReview) return;
if (await StoreReview.isAvailableAsync()) {
  await StoreReview.requestReview();
}
```

**Important:** Do NOT use a custom review dialog — Apple rejects apps that use non-native review prompts.

### 10. Google Analytics (Firebase)

Add Firebase Analytics to track user engagement and feature usage. No server required — events are sent directly from the device to Google's servers.

**Step 1: Create Firebase project and register apps:**

> **⚠️ First-time setup:** If `firebase projects:create` fails with a 403 "permission denied" error, you must create the first project manually at [console.firebase.google.com](https://console.firebase.google.com/) to accept the Firebase Terms of Service. After that, CLI creation works for subsequent projects.

> **Analytics account:** When prompted for a Google Analytics account during project creation, select an existing shared account (e.g., "KJ Mobile Apps") or create a new one. This account groups GA4 properties across apps.

```bash
# Create the Firebase project
firebase projects:create kj-APP_NAME --display-name "App Display Name"

# Register iOS app
firebase apps:create ios --project kj-APP_NAME --bundle-id com.kjprice.APP_NAME

# Register Android app
firebase apps:create android --project kj-APP_NAME --package-name com.kjprice.APP_NAME
```

> **Note:** Firebase may append a random suffix to the project ID (e.g., `kj-APP_NAME-a8aea`). Use `firebase projects:list` or `gcloud projects list` to find the actual project ID, then use that ID in all subsequent commands.

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
      ["expo-build-properties", {
        "ios": { "useFrameworks": "static" },
        "android": { "targetSdkVersion": 35 }
      }],
      ["@react-native-firebase/app", {
        "ios": { "googleServicesFile": "./GoogleService-Info.plist" },
        "android": { "googleServicesFile": "./google-services.json" }
      }]
    ]
  }
}
```

> **⚠️ `useFrameworks: "static"` is required.** Without it, `pod install` fails with: `The Swift pod 'FirebaseCoreInternal' depends upon 'GoogleUtilities', which does not define modules`. This tells CocoaPods to build Firebase as static frameworks with proper module maps.

> **⚠️ Do NOT add `@react-native-firebase/analytics` as a plugin.** It's an ES Module that causes `require()` errors with EAS CLI's config plugin resolver. Only `@react-native-firebase/app` needs to be a plugin — analytics works as a dependency import only.

**Privacy & App Store Impact:**
- No app store review issues — Firebase Analytics is used by millions of apps
- **Must update Privacy Policy** to disclose analytics data collection (device info, usage patterns, app events)
- **Must update App Store Connect "App Privacy" nutrition labels** — declare:
  - **Analytics** category: Usage Data, Device ID
  - Data is used for **Analytics** purpose
  - Data is **not linked to the user** (unless Firebase Auth is also used)
- **Must update Google Play Data Safety** section similarly

### 11. Cross-Promotion "Other Apps" Page

Display a dynamic list of your other apps, fetched from a remote JSON file. See @examples/OtherAppsScreen.tsx for a complete reference implementation.

**The JSON file already exists** at `~/repos/misc/kj/kj-mobile-apps/store-assets/other-apps.json` and is deployed via GitHub Pages. As part of building the new app, **add an entry for it** to this JSON file and commit/push so all existing apps pick it up automatically. The `ios` and `android` store URLs won't be available until the app is published — use placeholder values and leave a note in `PLAN.md` to update them after submission.

**Live URL:** `https://kjprice.github.io/kj-mobile-apps/store-assets/other-apps.json`

**Key behaviors (all demonstrated in the example):**
- Fetches JSON on mount, falls back to AsyncStorage cache if offline
- Filters out the current app by matching `package` against the Expo bundle identifier
- Opens the correct store link based on `Platform.OS`

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

### 13. CLAUDE.md

Create a `CLAUDE.md` file at the project root. This file gives Claude Code project-specific context so it can work effectively in the repo across conversations.

**Must include:**
- **Project overview** — app name, display name, what it does
- **Package info** — bundle identifier, EAS project slug, App Store / Play Store IDs
- **Tech stack** — React Native, Expo version, key libraries
- **Development commands** — install, run, build, type-check, submit
- **Expo Go note** — whether Expo Go works or requires a dev client (native modules like `react-native-iap`, MMKV, Firebase break Expo Go)
- **Node version requirement** — which Node versions are supported
- **Navigation structure** — root navigator, tab layout, modal screens
- **State management** — approach (Redux, Context, etc.), where state lives, persistence method
- **Project structure** — key directories and their purpose
- **IAP product IDs** — all subscription/product SKUs with prices
- **Freemium model** — what's free vs premium, paywall triggers
- **Store submission status** — current state of App Store / Play Store review
- **Related resources** — legal pages, store metadata, API keys (paths in `kj-mobile-apps` repo)
- **Known dependency constraints** — version pins and why (e.g., `react-native-iap` v14 requires `react-native-nitro-modules`)
- **Common pitfalls** — anything non-obvious that would trip up a future session
- **Implementation status** — what's completed, in progress, and pending
- **PLAN.md reference** — remind Claude to check PLAN.md before working on features

**Self-updating rule — include this at the top of every CLAUDE.md:**

```markdown
> **Keep this file up to date.** Whenever you change something that invalidates
> information in this file (e.g., add/remove a dependency, change a command,
> rename a directory, update a product ID, change submission status), update
> CLAUDE.md in the same commit. This file is the source of truth for Claude Code.
```

**Template:**

```markdown
> **Keep this file up to date.** Whenever you change something that invalidates
> information in this file (e.g., add/remove a dependency, change a command,
> rename a directory, update a product ID, change submission status), update
> CLAUDE.md in the same commit. This file is the source of truth for Claude Code.

# APP_DISPLAY_NAME

Short description of the app.

- **Bundle ID**: `com.kjprice.APP_NAME`
- **EAS project slug**: `APP_SLUG` (must match EAS project ID — do not change)
- **App Store ID**: (pending)
- **Play Store**: (pending)

## ⚠️ Check PLAN.md First

Before working on any features, check `PLAN.md` for current status, implementation
details, and what's completed vs in-progress vs pending.

## Commands

```bash
# Install dependencies
npm install   # or yarn install

# Development — start Metro dev server
npx expo start

# Build (via EAS cloud)
eas build --platform ios --profile preview      # physical device testing
eas build --platform ios --profile production    # App Store submission

# Submit to stores
eas submit -p ios
eas submit -p android

# Type checking
npx tsc --noEmit
```

**Expo Go**: Does NOT work with this project — `react-native-iap` and Firebase
require native modules. Use `eas build --profile development` for a dev client,
or `eas build --profile preview` for ad-hoc testing on a physical device.

**Node version**: Requires Node v18 or v20 LTS. Node v24+ is not supported
(experimental TypeScript features conflict with Expo).

## Tech Stack

- React Native + Expo (managed workflow)
- react-native-iap v14+ (in-app purchases, requires react-native-nitro-modules)
- @react-native-firebase/analytics
- expo-store-review
- expo-haptics

## Navigation

Describe the navigation structure here:
- Root stack (onboarding → main tabs → modals)
- Tab layout (which tabs, what screens)
- Modal screens (paywall, etc.)

## State Management

Describe approach here (Redux Toolkit + MMKV, React Context + AsyncStorage, etc.):
- Where state lives
- How it's persisted
- Key slices/contexts

## Project Structure

- `src/screens/` — screen components
- `src/components/` — reusable UI components
- `src/hooks/` — custom hooks
- `src/services/` — IAP service, analytics, etc.
- `src/constants/` — product IDs, config values
- `src/utils/` — helper functions
- `src/navigation/` — navigators and route types
- `assets/` — icons, splash, images

## IAP Product IDs

- `com.kjprice.APP_NAME.subscription.monthly` ($X.XX/mo)
- `com.kjprice.APP_NAME.subscription.yearly` ($XX.XX/yr)
- `com.kjprice.APP_NAME.subscription.lifetime` ($XX.XX)

## Freemium Model

**Free tier:**
- (list free features/limits)

**Premium tier:**
- (list premium features)

**Paywall triggers:**
- (list what triggers the paywall)

## Related Resources

- **Legal pages**: `~/repos/misc/kj/kj-mobile-apps/privacy-policy/APP_NAME.html`
- **Store metadata**: `store.config.json` in project root
- **Apple API key**: `~/repos/misc/kj/kj-mobile-apps/data/AuthKey_985XKZ364C.p8`
- **Google service account**: `~/repos/misc/kj/kj-mobile-apps/data/service-account.json`

## Key Conventions

- TypeScript strict mode with path alias `@/*` → `src/*`
- Functional components with hooks throughout
- Expo manages native folders — `/ios` and `/android` are gitignored
- EAS iOS builds require `"image": "latest"` in build profiles for IAP support

## Known Dependency Constraints

- `react-native-iap` must be v14+ (v12/v13 depend on `RCT-Folly` removed in RN 0.83)
- `react-native-iap` v14 requires `react-native-nitro-modules` as a peer dependency
- (add any app-specific constraints here)

## Common Pitfalls

| Problem | Fix |
|---------|-----|
| Metro bundler errors on start | Check Node version (must be v18/v20), try `npx expo start --clear` |
| IAP "Invalid product ID" | Ensure `getSubscriptions()`/`getProducts()` called before purchase |
| Build fails with `appTransactionID` | Add `"image": "latest"` to eas.json iOS build profiles |
| (add app-specific pitfalls) | |

## Store Status

- **App Store:** Not yet submitted
- **Play Store:** Not yet submitted

## Implementation Status

**✅ Completed:**
- (list completed features)

**🚧 In Progress:**
- (list current work)

**⏳ Pending:**
- (list upcoming work)

See PLAN.md for detailed status and implementation roadmap.
```

### 14. README.md

Create a `README.md` at the project root with user-facing project documentation.

**Must include:**
- App name and description
- Screenshots or feature list
- How to set up the development environment
- How to run the app locally
- How to build for production
- Link to privacy policy
- Contact email: kjmobileapps@gmail.com