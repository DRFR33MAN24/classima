import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { LogBox } from "react-native";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";

// Custom Components
import Screen from "./components/Screen";
import HomeNavigator from "./navigation/HomeNavigator";
import { StateProvider } from "./StateProvider";
import reducer, { initialState } from "./reducer";

const App = () => {
  const prefix = Linking.createURL("/");
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  // TODO: This is a temporary fix for the "Componentwillreceiveprops has been renamed" development warning
  LogBox.ignoreLogs([
    "componentWillReceiveProps",
    "componentWillReceiveProps has been renamed, and is not recommended for use.",
    "AsyncStorage has been extracted from react-native core and will be removed in a future release",
    "ViewPropTypes will be removed from React Native. Migrate to ViewPropTypes exported from 'deprecated-react-native-prop-types'",
    "`new NativeEventEmitter()` was called with a non-null argument without the required",
    "EventEmitter.removeListener('url', ...): Method has been deprecated. Please instead use `remove()` on the subscription returned by `EventEmitter.addListener`",
  ]);
  return (
    <StateProvider initialState={initialState} reducer={reducer}>
      <Screen>
        <NavigationContainer
          linking={{
            prefixes: [prefix],
            config: {
              screens: {
                // Added the next line
                initialRouteName: "Tabs",
                Tabs: {
                  screens: {
                    Home: "home",
                    Chats: "chats",
                    Account: "account",
                  },
                },
                "Listing Detail": {
                  path: "listings/:listingId",
                  parse: {
                    listingId: Number,
                  },
                },
                "My Listings": "myListings",
                Chatsingle: {
                  path: "conversationsingle/:con_id/:listing_id",
                  parse: {
                    con_id: Number,
                    listing_id: Number,
                  },
                },
                Chat: {
                  path: "conversation/:con_id/:listing_id",
                  // path: "conversation/:con_id/:listing_id/:sendr_id/;recipient_id/:recipient_delete/:sender_delete",
                  parse: {
                    con_id: Number,
                    listing_id: Number,
                    // sendr_id: Number,
                    // recipient_id: Number,
                    // recipient_delete: Number,
                    // sender_delete: Number,
                  },
                },
              },
            },
            async getInitialURL() {
              // First, you may want to do the default deep link handling
              // Check if app was opened from a deep link
              const url1 = await Linking.getInitialURL();

              if (url1 != null) {
                console.log("url1", url1);
                return url1;
              }

              // Handle URL from expo push notifications
              const response =
                await Notifications.getLastNotificationResponseAsync();
              const url = response?.notification.request.content.data.url;
              console.log("url2", url);
              return url;
            },
            subscribe(listener) {
              const onReceiveURL = ({ url }) => listener(url);

              // Listen to incoming links from deep linking
              Linking.addEventListener("url", onReceiveURL);

              // Listen to expo push notifications
              const subscription =
                Notifications.addNotificationResponseReceivedListener(
                  (response) => {
                    const url = response.notification.request.content.data.url;

                    // Any custom logic to see whether the URL needs to be handled

                    // Let React Navigation handle the URL
                    console.log("url3", url);
                    listener(url);
                  }
                );

              return () => {
                // Clean up the event listeners
                Linking.removeEventListener("url", onReceiveURL);
                subscription.remove();
              };
            },
          }}
        >
          <HomeNavigator />
        </NavigationContainer>
      </Screen>
    </StateProvider>
  );
};

export default App;
