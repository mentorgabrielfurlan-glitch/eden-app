# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

### Configure Firebase

The signup flow depends on Firebase Authentication and Firestore. Before launching the app, provide your Firebase project values using Expo's public environment variables (they are embedded at build time):

```bash
export EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
export EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
export EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project
export EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
export EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=000000000000
export EXPO_PUBLIC_FIREBASE_APP_ID=1:000000000000:web:abcdef123456
```

Alternatively, add the same values under the `expo.extra` section of your `app.json`/`app.config.js` so they are available at runtime.

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
# eden-app
