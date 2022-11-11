import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Vector Icons
import { FontAwesome } from "@expo/vector-icons";

// Custom Components
import { COLORS } from "../variables/color";
import { useStateValue } from "../StateProvider";

const dataArr = ["is-top", "is-featured", "is-bump-up", "is-popular"];
const Badge = ({ badgeName, badgeStyle, badgeTextStyle, type }) => {
  const [{ rtl_support, config }] = useStateValue();
  const rtlText = rtl_support && {
    writingDirection: "rtl",
  };
  const displayName = config.promotions[badgeName];

  if (displayName) {
    if (badgeName == "_bump_up" && type == "card") {
      return (
        <View
          style={[
            styles.container,
            {
              backgroundColor: COLORS.badges[badgeName],
              borderRadius: 3,
              padding: 5,
            },
            badgeStyle,
          ]}
        >
          <FontAwesome name="clock-o" size={16} color={COLORS.white} />
        </View>
      );
    } else {
      return (
        <View
          style={[
            styles.container,
            {
              backgroundColor: COLORS.badges[badgeName],
              borderRadius: type == "card" ? 3 : 20,
              paddingVertical: 5,
              paddingHorizontal: type == "card" ? 5 : 15,
            },
            badgeStyle,
          ]}
        >
          <Text style={[badgeTextStyle, rtlText]} numberOfLines={1}>
            {displayName}
          </Text>
        </View>
      );
    }
  } else return null;
};

const styles = StyleSheet.create({
  container: {
    marginRight: 5,
  },
});

export default Badge;
