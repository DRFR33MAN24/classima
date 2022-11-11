import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";

//  Custom Components & Variables
import { COLORS } from "../variables/color";
import { useStateValue } from "../StateProvider";
import { __ } from "../language/stringPicker";
import CallIcon from "./svgComponents/CallIcon";
import MessageIcon from "./svgComponents/MessageIcon";
import ChatIcon from "./svgComponents/ChatIcon";

const iconSize = 18;
const SellerContact = ({ onCall, onChat, onEmail, phone, email }) => {
  const [{ appSettings, rtl_support }] = useStateValue();
  const rtlText = rtl_support && {
    writingDirection: "rtl",
  };
  return (
    <View style={styles.container}>
      {phone && (
        <TouchableOpacity style={styles.btn} onPress={onCall}>
          <CallIcon fillColor={COLORS.white} />
          <Text style={[styles.btnText, rtlText]}>
            {__("sellerContactTexts.call", appSettings.lng)}
          </Text>
        </TouchableOpacity>
      )}
      {email && (
        <TouchableOpacity style={styles.btn} onPress={onEmail}>
          <MessageIcon fillColor={COLORS.white} />
          <Text style={[styles.btnText, rtlText]}>
            {__("sellerContactTexts.email", appSettings.lng)}
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.btn} onPress={onChat}>
        <ChatIcon fillColor={COLORS.white} />
        <Text style={[styles.btnText, rtlText]}>
          {__("sellerContactTexts.chat", appSettings.lng)}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    marginHorizontal: "1%",
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  btnText: {
    fontSize: iconSize,
    paddingLeft: 5,
    fontWeight: "bold",
    color: COLORS.white,
  },
  container: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: "2%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    height: 60,
  },
});

export default SellerContact;
