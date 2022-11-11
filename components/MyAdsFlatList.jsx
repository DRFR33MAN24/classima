import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
//  External Libraries
import moment from "moment";
// Vector Icons
import { FontAwesome5 } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
// Custom Components & Constants
import { COLORS } from "../variables/color";
import { getPrice, decodeString } from "../helper/helper";
import { useStateValue } from "../StateProvider";
import { __ } from "../language/stringPicker";
const myAdsListItemFallbackImageUrl = require("../assets/200X150.png");
const MyAdsFlatList = ({ onClick, item, onAction, onActionTouch }) => {
  const [{ config, ios, appSettings, rtl_support }] = useStateValue();
  const [badgeDim, setBadgeDim] = useState(0);

  const rtlText = rtl_support && {
    writingDirection: "rtl",
  };
  const rtlView = rtl_support && {
    flexDirection: "row-reverse",
  };

  const getImageURL = () => {
    if (item.images && !!item.images.length) {
      return item.images[0].sizes.thumbnail.src;
    }
  };
  const getTaxonomy = (data) => {
    if (data) {
      return decodeString(data);
    } else {
      return "";
    }
  };

  const handleHeaderLayout = (e) => {
    setBadgeDim(e.nativeEvent.layout);
  };
  return (
    <View style={[styles.listAd]}>
      <View
        style={[
          {
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 10,
            alignItems: "center",
            overflow: "hidden",
          },
          rtlView,
        ]}
      >
        {item?.badges?.includes("is-sold") && rtl_support && (
          <>
            {badgeDim ? (
              <View
                style={{
                  position: "absolute",
                  zIndex: 1,
                  backgroundColor: COLORS.primary,
                  paddingHorizontal: 50,
                  paddingVertical: ios ? 4 : 2,
                  right: -50,
                  top: (badgeDim.width - 100) / 2 - badgeDim.height / 2 || 0,
                  transform: [{ rotate: "-45deg" }],
                }}
              >
                <Text style={styles.soldOutText}>
                  {__("listingCardTexts.soldOutBadgeMessage", appSettings.lng)}
                </Text>
              </View>
            ) : (
              <View
                onLayout={(event) => handleHeaderLayout(event)}
                style={{
                  position: "absolute",
                  zIndex: 1,
                  backgroundColor: COLORS.primary,
                  paddingVertical: ios ? 3 : 1.5,
                  paddingHorizontal: 50,
                  right: -48,
                  top: 18,
                  transform: [{ rotate: "-45deg" }],
                }}
              >
                <Text style={styles.soldOutText}>
                  {__("listingCardTexts.soldOutBadgeMessage", appSettings.lng)}
                </Text>
              </View>
            )}
          </>
        )}
        {item?.badges?.includes("is-sold") && !rtl_support && (
          <>
            {badgeDim ? (
              <View
                style={{
                  position: "absolute",
                  zIndex: 1,
                  backgroundColor: COLORS.primary,
                  paddingHorizontal: 50,
                  paddingVertical: ios ? 4 : 2,
                  right: -50,
                  top: (badgeDim.width - 100) / 2 - badgeDim.height / 2 || 0,
                  transform: [{ rotate: "45deg" }],
                }}
              >
                <Text style={styles.soldOutText}>
                  {__("listingCardTexts.soldOutBadgeMessage", appSettings.lng)}
                </Text>
              </View>
            ) : (
              <View
                onLayout={(event) => handleHeaderLayout(event)}
                style={{
                  position: "absolute",
                  zIndex: 1,
                  backgroundColor: COLORS.primary,
                  paddingVertical: ios ? 3 : 1.5,
                  paddingHorizontal: 50,
                  right: -48,
                  top: 18,
                  transform: [{ rotate: "45deg" }],
                }}
              >
                <Text style={styles.soldOutText}>
                  {__("listingCardTexts.soldOutBadgeMessage", appSettings.lng)}
                </Text>
              </View>
            )}
          </>
        )}
        <TouchableWithoutFeedback onPress={onClick}>
          <View style={styles.imageWrap}>
            <Image
              style={styles.image}
              source={
                item.images && !!item.images.length
                  ? {
                      uri: getImageURL(),
                    }
                  : myAdsListItemFallbackImageUrl
              }
            />
          </View>
        </TouchableWithoutFeedback>
        <View style={[styles.details, rtlView]}>
          <View
            style={[
              styles.detailsLeft,
              {
                alignItems: rtl_support ? "flex-end" : "flex-start",
                paddingLeft: rtl_support ? 0 : "4%",
                paddingRight: rtl_support ? "4%" : 0,
              },
            ]}
          >
            <TouchableWithoutFeedback onPress={onClick}>
              <View
                style={{
                  flex: 1,
                  justifyContent: "flex-start",
                  alignItems: rtl_support ? "flex-end" : "flex-start",
                }}
              >
                <Text
                  style={[styles.title, { marginBottom: ios ? 3 : 2 }, rtlText]}
                  numberOfLines={2}
                >
                  {getTaxonomy(item.title)}
                </Text>

                <View style={[styles.detailsLeftRow, rtlView]}>
                  <View style={[styles.iconWrap]}>
                    <MaterialCommunityIcons
                      name="clock"
                      size={12}
                      color={COLORS.text_gray}
                    />
                  </View>
                  <Text style={[styles.detailsLeftRowText, rtlText]}>
                    {moment(item.created_at).fromNow()}
                  </Text>
                </View>
                <View style={[styles.detailsLeftRow, rtlView]}>
                  <View style={styles.iconWrap}>
                    <FontAwesome5
                      name="eye"
                      size={12}
                      color={COLORS.text_gray}
                    />
                  </View>
                  <Text style={[styles.detailsLeftRowText, rtlText]}>
                    {__("myAdsListItemTexts.viewsText", appSettings.lng)}{" "}
                    {item.view_count}
                  </Text>
                </View>
                <View style={styles.detailsLeftRow}>
                  <Text style={[styles.price, rtlText]} numberOfLines={1}>
                    {getPrice(
                      config.currency,
                      {
                        pricing_type: item.pricing_type,
                        price_type: item.price_type,
                        price: item.price,
                        max_price: item.max_price,
                      },
                      appSettings.lng
                    )}
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
          <View style={styles.detailsRight}>
            <View
              style={{
                flex: 1,
                justifyContent: "flex-end",
              }}
            >
              <View style={styles.buttonWrap}>
                <TouchableOpacity
                  style={{ zIndex: 2 }}
                  onPress={(e) => {
                    onActionTouch(e);
                    onAction();
                  }}
                >
                  <Entypo name="dots-three-vertical" size={20} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonText: {},
  buttonWrap: {},
  details: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 3,
    alignItems: "center",
  },
  detailsLeft: {
    flex: 1,
    width: "100%",
  },
  detailsLeftRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  detailsLeftRowText: {
    fontSize: 12,
    color: COLORS.text_gray,
  },
  detailsRight: {
    // justifyContent: "flex-end",
    // alignItems: "flex-end",
  },
  iconWrap: {
    width: 20,
    alignItems: "center",
  },
  image: {
    height: 80,
    width: "100%",
    resizeMode: "cover",
  },
  imageWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    height: 80,
    overflow: "hidden",
  },
  price: {
    fontWeight: "bold",
    color: COLORS.primary,
  },
  listAd: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.bg_dark,
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 5,
    elevation: 3,
    marginHorizontal: "3%",
    shadowColor: COLORS.black,
    shadowRadius: 3,
    shadowOpacity: 0.2,
    shadowOffset: {
      height: 2,
      width: 2,
    },
  },
  soldOutText: {
    fontSize: 11.5,
    color: COLORS.white,
    fontWeight: "bold",
  },
  title: {
    fontWeight: "bold",
    fontSize: 13,
  },
});

export default MyAdsFlatList;
