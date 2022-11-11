import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

// Custom Components & Constants
import { COLORS } from "../variables/color";
import { useStateValue } from "../StateProvider";
import { Feather, FontAwesome } from "@expo/vector-icons";
import UserIcon from "./svgComponents/UserIcon";
import SellFasterIcon from "./svgComponents/SellFasterIcon";
import HeartIcon from "./svgComponents/HeartIcon";
import CrownIcon from "./svgComponents/CrownIcon";
import ShopIcon from "./svgComponents/ShopIcon";
import TnCIcon from "./svgComponents/TnCIcon";
import DocumentIcon from "./svgComponents/DocumentIcon";

const Option = ({ title, onPress, uri, item }) => {
  const [{ config, user, rtl_support }] = useStateValue();
  const rtlText = rtl_support && {
    writingDirection: "rtl",
    paddingEnd: 10,
  };
  const rtlView = rtl_support && {
    flexDirection: "row-reverse",
  };

  if (!item) return null;
  if (!user) {
    return (
      <TouchableOpacity onPress={onPress}>
        <View style={[styles.option, rtlView]}>
          <View
            style={{
              height: 20,
              width: 20,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {uri ? (
              <Image
                source={uri}
                style={{
                  height: "100%",
                  width: "100%",
                  resizeMode: "contain",
                }}
              />
            ) : (
              <FontAwesome name={item.icon} size={20} color={COLORS.primary} />
            )}
          </View>
          <View style={styles.titleWrap}>
            <Text style={[styles.optionTitle, rtlText]}>{title}</Text>
          </View>
          <Feather
            name={rtl_support ? "chevron-left" : "chevron-right"}
            size={18}
            color={COLORS.gray}
          />
        </View>
      </TouchableOpacity>
    );
  } else {
    if (
      config?.iap_disabled &&
      ["my_store", "all_stores", "my_membership", "payments"].includes(item.id)
    ) {
      return null;
    } else {
      if (
        !config?.store_enabled &&
        ["my_store", "all_stores"].includes(item.id)
      ) {
        return null;
      } else if (!user?.store && "my_store" === item.id) {
        return null;
      } else if (!config?.membership_enabled && "my_membership" === item.id) {
        return null;
      } else if (
        !config?.membership_enabled &&
        !config?.store_enabled &&
        config?.iap_disabled &&
        "payments" === item.id
      ) {
        return null;
        // } else if (!config?.seller_verification && "my_documents" === item.id) {
        //   return null;
      } else {
        return (
          <TouchableOpacity onPress={onPress}>
            <View style={[styles.option, rtlView]}>
              {uri ? (
                <View
                  style={{
                    height: 20,
                    width: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <Image
                    source={uri}
                    style={{
                      height: "100%",
                      width: "100%",
                      resizeMode: "contain",
                    }}
                  />
                </View>
              ) : (
                <>
                  {item?.id == "my_profile" && (
                    <UserIcon fillColor={COLORS.primary} />
                  )}
                  {item?.id == "my_listings" && (
                    <SellFasterIcon fillColor={COLORS.primary} />
                  )}
                  {item?.id == "favourite" && (
                    <HeartIcon fillColor={COLORS.primary} />
                  )}
                  {item?.id == "my_membership" && (
                    <CrownIcon fillColor={COLORS.primary} />
                  )}
                  {item?.id == "all_stores" && (
                    <ShopIcon fillColor={COLORS.primary} />
                  )}
                  {item?.id == "payments" && (
                    <TnCIcon fillColor={COLORS.primary} />
                  )}
                  {item?.id == "my_documents" && (
                    <DocumentIcon fillColor={COLORS.primary} />
                  )}
                </>
              )}
              <View style={styles.titleWrap}>
                <Text style={[styles.optionTitle, rtlText]}>{title}</Text>
              </View>
              <Feather
                name={rtl_support ? "chevron-left" : "chevron-right"}
                size={18}
                color={COLORS.gray}
              />
            </View>
          </TouchableOpacity>
        );
      }
    }
  }
};

const styles = StyleSheet.create({
  option: {
    flexDirection: "row",
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    marginHorizontal: 3,
    paddingHorizontal: "3%",
    elevation: 0.5,
    borderRadius: 3,
    marginVertical: 5,
    shadowColor: COLORS.border_light,
    shadowRadius: 1,
    shadowOffset: {
      height: 1,
      width: 1,
    },
    shadowOpacity: 0.1,
    marginHorizontal: "3%",
  },
  optionTitle: {
    fontWeight: "bold",
    color: COLORS.text_gray,
    paddingHorizontal: 10,
  },
  separator: {
    width: "auto",
    backgroundColor: COLORS.bg_dark,
    height: 2,
  },
  titleWrap: {
    flex: 1,
  },
});

export default Option;
