import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";

// Custom Components & Functions
import { getTnC } from "../language/stringPicker";
import { COLORS } from "../variables/color";
import { useStateValue } from "../StateProvider";

const { width: screenWidth } = Dimensions.get("window");
const TnCScreen = () => {
  const [{ appSettings, rtl_support, ios }] = useStateValue();
  const [tnCData, setTnCData] = useState(getTnC(appSettings.lng));

  const rtlText = rtl_support && {
    writingDirection: "rtl",
    textAlign: ios ? "justify" : "right",
  };
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.mainWrap}>
          <View style={styles.imgWrap}>
            <Image
              source={require("../assets/tnc_bg.png")}
              style={styles.img}
            />
          </View>
          <View
            style={{
              alignItems: "center",
              paddingHorizontal: "3%",
            }}
          >
            {tnCData.map((_tnc, index) => (
              <View style={styles.tncParaWrap} key={index}>
                {!!_tnc.paraTitle && (
                  <Text style={[styles.paraTitle, rtlText]}>
                    {_tnc.paraTitle}
                  </Text>
                )}
                {!!_tnc.paraData && (
                  <Text style={[styles.paraData, rtlText]}>
                    {_tnc.paraData}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f8f8",
    flex: 1,
  },
  img: {
    height: screenWidth * 0.55,
    width: screenWidth * 0.55,
    resizeMode: "contain",
  },
  imgWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
  },
  mainWrap: {
    paddingVertical: 15,
  },
  paraTitle: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 5,
  },
  paraData: {
    textAlign: "justify",
    fontSize: 14,
    lineHeight: 22,
  },
  tncParaWrap: {
    marginBottom: 20,
    width: "100%",
  },
});

export default TnCScreen;
