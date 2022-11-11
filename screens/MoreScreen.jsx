import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";

// Custom Components
import MoreOptions from "../components/MoreOptions";
import { COLORS } from "../variables/color";
import { useStateValue } from "../StateProvider";
import { getMoreOptionsData } from "../language/stringPicker";

const MoreScreen = () => {
  const [{ appSettings }] = useStateValue();
  const [data, setData] = useState(getMoreOptionsData(appSettings.lng));
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.mainWrap}>
          {data.map((item, index) => (
            <MoreOptions
              key={`${index}`}
              title={item.title}
              detail={item.detail}
              routeName={item.routeName}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    flex: 1,
  },
  mainWrap: {
    paddingTop: 10,
  },
});

export default MoreScreen;
