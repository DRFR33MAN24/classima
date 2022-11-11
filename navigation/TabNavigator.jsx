/* eslint-disable react/display-name */
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Vector Icons
import { Entypo } from "@expo/vector-icons";

// Custom Components
import { useStateValue } from "../StateProvider";
import { COLORS } from "../variables/color";
import NewListingButton from "./NewListingButton";
import AccountScreen from "../screens/AccountScreen";
import ChatListScreen from "../screens/ChatListScreen";
import HomeScreen from "../screens/HomeScreen";
import HomeScreenOld from "../screens/HomeScreenOld";
import NewListingScreen from "../screens/NewListingScreen";
import SearchScreen from "../screens/SearchScreen";
import { __ } from "../language/stringPicker";
import { routes } from "./routes";
import AccountIcon from "./svgIcons/AccountIcon";
import ChatsIcon from "./svgIcons/ChatsIcon";
import SearchIcon from "./svgIcons/SearchIcon";
import { miscConfig } from "../app/services/miscConfig";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const [{ user, chat_badge, appSettings }, dispatch] = useStateValue();
  return (
    <Tab.Navigator
      initialRouteName={__("tabTitles.home", appSettings.lng)}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          marginBottom: 2,
          fontSize: 12,
        },
        tabBarStyle: {
          height: 50,
        },
      }}
    >
      <Tab.Screen
        name={__("tabTitles.home", appSettings.lng)}
        component={miscConfig?.oldHomeScreenLayout ? HomeScreenOld : HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Entypo name="home" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={__("tabTitles.search", appSettings.lng)}
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color }) => <SearchIcon fillColor={color} />,
        }}
      />
      <Tab.Screen
        // name={__("tabTitles.newListing", appSettings.lng)}
        name={routes.newListingScreen}
        component={NewListingScreen}
        options={({ navigation }) => ({
          tabBarButton: () => (
            <NewListingButton
              onPress={() => {
                navigation.navigate(routes.newListingScreen);
                dispatch({
                  type: "SET_NEW_LISTING_SCREEN",
                  newListingScreen: true,
                });
              }}
            />
          ),
          tabBarStyle: { display: user ? "none" : "flex" },
        })}
      />
      <Tab.Screen
        name={__("tabTitles.chatList", appSettings.lng)}
        component={ChatListScreen}
        options={{
          tabBarBadge: chat_badge,
          tabBarIcon: ({ color }) => <ChatsIcon fillColor={color} />,
        }}
      />
      <Tab.Screen
        name={__("tabTitles.account", appSettings.lng)}
        component={AccountScreen}
        options={{
          tabBarIcon: ({ color }) => <AccountIcon fillColor={color} />,
          title: __("screenTitles.accountScreen", appSettings.lng),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
