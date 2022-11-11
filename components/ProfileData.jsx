import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, Text, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { __ } from "../language/stringPicker";
import { useStateValue } from "../StateProvider";
import { routes } from "../navigation/routes";

// Custom Components & Constants
import { COLORS } from "../variables/color";
import VerifiedIcon from "./svgComponents/VerifiedIcon";
import { firebaseConfig } from "../app/services/firebaseConfig";
import { initializeApp } from "firebase/app";

const ProfileData = ({ label, value, phone }) => {
  const [{ rtl_support, appSettings, config, user }] = useStateValue();
  const navigation = useNavigation();
  const rtlTextA = rtl_support && {
    writingDirection: "rtl",
    textAlign: "center",
  };
  const rtlText = rtl_support && {
    writingDirection: "rtl",
  };
  const rtlView = rtl_support && {
    flexDirection: "row-reverse",
  };
  return (
    <View style={[styles.container, rtlView]}>
      <View
        style={{
          flex: 0.7,
          alignItems: rtl_support ? "flex-end" : "flex-start",
        }}
      >
        <Text style={[styles.rowLabel, rtlText]}>{label}</Text>
      </View>
      <View
        style={{ flex: 1, alignItems: rtl_support ? "flex-end" : "flex-start" }}
      >
        {config?.verification && phone ? (
          <>
            {!user?.phone_verified ? (
              <View style={{ width: "100%" }}>
                <View
                  style={[
                    { flexDirection: "row", alignItems: "center" },
                    rtlView,
                  ]}
                >
                  <Text style={[styles.rowValue, rtlText]}>{value}</Text>
                </View>
                <TouchableWithoutFeedback
                  onPress={() => {
                    if (
                      config?.verification?.gateway === "firebase" &&
                      firebaseConfig?.enabled
                    ) {
                      try {
                        initializeApp(firebaseConfig.config);
                      } catch (err) {
                        // ignore app already initialized error in snack
                      }
                    }
                    navigation.navigate(routes.oTPScreen, {
                      source: "profile",
                      // phone: value,
                    });
                  }}
                >
                  <View
                    style={{
                      backgroundColor: COLORS.primary,
                      alignItems: "center",
                      marginTop: 5,
                      padding: 7,
                      borderRadius: 3,
                    }}
                  >
                    <Text style={{ color: COLORS.white, fontWeight: "bold" }}>
                      {__(
                        "myProfileScreenTexts.verifyBtnTitle",
                        appSettings.lng
                      )}
                    </Text>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            ) : (
              <View
                style={[
                  { flexDirection: "row", alignItems: "center" },
                  rtlView,
                ]}
              >
                <Text style={[styles.rowValue, rtlText]}>{value}</Text>
                <View style={{ paddingHorizontal: 5 }}>
                  <VerifiedIcon
                    fillColor={COLORS.green}
                    tickColor={COLORS.white}
                  />
                </View>
              </View>
            )}
          </>
        ) : (
          <Text style={[styles.rowValue, rtlText]}>{value}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: "4%",
  },
  rowLabel: {
    color: COLORS.text_gray,
    textTransform: "capitalize",
  },
  rowValue: {
    color: COLORS.text_dark,
    fontSize: 15,
  },
});

export default ProfileData;
