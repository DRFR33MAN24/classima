import React from "react";
import { View, StyleSheet, TouchableWithoutFeedback, Text } from "react-native";

// Vector Icons
import { Entypo, FontAwesome5 } from "@expo/vector-icons";

// Custom Components & Functions
import { COLORS } from "../variables/color";
import { useStateValue } from "../StateProvider";
import { __ } from "../language/stringPicker";

const NewListingButton = ({ onPress }) => {
  const [{ newListingScreen, user, appSettings }] = useStateValue();
  return (
    <View
      style={newListingScreen && user ? styles.buttonHidden : styles.button}
    >
      <TouchableWithoutFeedback onPress={onPress}>
        <View style={styles.content}>
          <View
            style={{
              alignItems: "center",
              backgroundColor: COLORS.primary,
              borderRadius: 30,
              justifyContent: "center",
              height: 45,
              width: 45,
              elevation: 15,
              shadowColor: COLORS.primary,
              shadowOpacity: 0.2,
              shadowOffset: {
                width: 15,
                height: 15,
              },
              shadowRadius: 10,
            }}
          >
            <Entypo name="plus" size={30} color="#fff" />
          </View>

          <Text
            style={{
              fontSize: 11,
              color: newListingScreen ? COLORS.primary : COLORS.text_gray,
            }}
          >
            {__("tabTitles.newListing", appSettings.lng)}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    bottom: 12,
    alignItems: "center",
  },
  buttonHidden: {
    alignItems: "center",
  },

  content: {
    alignItems: "center",
  },
});

export default NewListingButton;
