import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import TabNavigator from "./TabNavigator";
import TabNavigatorOld from "./TabNavigatorOld";
import { routes } from "./routes";
import DrawerScreen from "../screens/DrawerScreen";
import { miscConfig } from "../app/services/miscConfig";

const Drawer = createDrawerNavigator();

const DrawerNavigator = (props) => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerScreen {...props} />}
      screenOptions={{
        drawerStyle: {
          width: "85%",
        },
        headerShown: false,
      }}
    >
      <Drawer.Screen
        name={routes.tabNavigator}
        component={miscConfig?.oldBottomTabBar ? TabNavigatorOld : TabNavigator}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
