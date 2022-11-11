import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

// Custom Components & Functions
import { getFAQ } from "../language/stringPicker";
import FAQ from "../components/FAQ";
import { useStateValue } from "../StateProvider";
import { COLORS } from "../variables/color";

const FAQScreen = () => {
  const [{ appSettings }] = useStateValue();
  const [faqData, setFaqData] = useState(getFAQ(appSettings.lng));
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.mainWrap}>
          <View style={styles.contentWrap}>
            {faqData.map((item, index) => (
              <FAQ
                key={`${index}`}
                isLast={index < faqData.length - 1 ? false : true}
                item={item}
              />
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
  contentWrap: {
    paddingVertical: 15,
  },
  mainWrap: {
    paddingHorizontal: "3%",
    paddingVertical: 20,
    width: "100%",
  },
});

export default FAQScreen;
