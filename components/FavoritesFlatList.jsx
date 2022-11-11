import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";

// External Libraries
import moment from "moment";

// Vector Icons
import { FontAwesome5 } from "@expo/vector-icons";

// Custom Components
import { COLORS } from "../variables/color";
import { getPrice, decodeString } from "../helper/helper";
import { useStateValue } from "../StateProvider";
import { __ } from "../language/stringPicker";
import DeleteIcon from "./svgComponents/DeleteIcon";

const favouritesItemfallbackImageUrl = "../assets/200X150.png";

const FavoritesFlatList = ({ onDelete, item, onClick }) => {
  const [{ config, ios, appSettings, rtl_support }] = useStateValue();
  const [badgeDim, setBadgeDim] = useState(0);
  const getTaxonomy = (data) => {
    if (data) {
      return decodeString(data);
    } else {
      return "";
    }
  };
  const getImageURL = () => {
    if (item.images.length) {
      return item.images[0].sizes.thumbnail.src;
    }
  };

  const rtlTextA = rtl_support && {
    writingDirection: "rtl",
    textAlign: "right",
  };
  const rtlView = rtl_support && {
    flexDirection: "row-reverse",
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
            alignItems: "center",
            overflow: "hidden",
            padding: "3%",
            overflow: "hidden",
          },
          rtlView,
        ]}
      >
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
        <TouchableWithoutFeedback onPress={onClick}>
          <View style={styles.imageWrap}>
            <Image
              style={styles.image}
              source={
                item.images.length
                  ? {
                      uri: getImageURL(),
                    }
                  : require(favouritesItemfallbackImageUrl)
              }
            />
          </View>
        </TouchableWithoutFeedback>
        <View style={[styles.details, rtlView]}>
          <View
            style={[
              styles.detailsLeft,
              {
                paddingLeft: rtl_support ? 0 : 10,
                paddingRight: rtl_support ? 10 : 0,
              },
            ]}
          >
            <TouchableWithoutFeedback onPress={onClick}>
              <View style={{ flex: 1, justifyContent: "flex-start" }}>
                <View
                  style={{
                    alignItems: rtl_support ? "flex-end" : "flex-start",
                  }}
                >
                  <Text
                    style={[styles.title, { marginBottom: ios ? 3 : 2 }]}
                    numberOfLines={2}
                  >
                    {getTaxonomy(item.title)}
                  </Text>
                </View>

                <View style={[styles.detailsLeftRow, rtlView]}>
                  <View
                    style={[
                      styles.iconWrap,
                      {
                        paddingRight: rtl_support ? 0 : 5,
                        paddingLeft: rtl_support ? 5 : 0,
                      },
                    ]}
                  >
                    <FontAwesome5
                      name="clock"
                      size={12}
                      color={COLORS.text_gray}
                    />
                  </View>
                  <Text style={[styles.detailsLeftRowText, rtlTextA]}>
                    {moment(item.created_at).fromNow()}
                  </Text>
                </View>
                <View style={[styles.detailsLeftRow, rtlView]}>
                  <View
                    style={[
                      styles.iconWrap,
                      {
                        paddingRight: rtl_support ? 0 : 5,
                        paddingLeft: rtl_support ? 5 : 0,
                      },
                    ]}
                  >
                    <FontAwesome5
                      name="eye"
                      size={12}
                      color={COLORS.text_gray}
                    />
                  </View>
                  <Text style={[styles.detailsLeftRowText, rtlTextA]}>
                    {__("favouritesItemTexts.viewsText", appSettings.lng)}{" "}
                    {item.view_count}
                  </Text>
                </View>
                <View style={[styles.detailsLeftRow, rtlView]}>
                  <Text style={styles.price} numberOfLines={1}>
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
              <TouchableOpacity style={styles.iconButton} onPress={onDelete}>
                <View style={styles.dltIconWrap}>
                  <DeleteIcon fillColor={COLORS.primary} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.green,
    borderRadius: 0,
    paddingVertical: 5,
    paddingHorizontal: 20,
    width: "auto",
  },
  buttonText: {
    fontSize: 12,
  },
  buttonWrap: {
    alignItems: "center",
  },
  dltIcon: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  dltIconWrap: {
    width: 15,
    height: 15,
  },
  details: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 3,
    alignItems: "center",
  },
  detailsLeft: {
    flex: 1,
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
    justifyContent: "space-around",
    alignItems: "flex-end",
  },
  iconButton: {
    padding: 5,
    borderRadius: 3,
    backgroundColor: COLORS.bg_primary,
    zIndex: 2,
  },
  iconWrap: {
    width: 20,
    alignItems: "center",
  },
  image: {
    height: 80,
    width: 80,
    resizeMode: "cover",
  },
  imageWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    height: 80,
    width: 80,
    overflow: "hidden",
  },
  price: {
    fontWeight: "bold",
    color: COLORS.primary,
  },
  listAd: {
    // width: "100%",
    // flexDirection: "row",
    // justifyContent: "space-between",
    // alignItems: "center",
    // overflow: "hidden",
    backgroundColor: COLORS.white,
    // padding: "3%",
    borderWidth: 1,
    borderColor: COLORS.bg_dark,
    borderRadius: 5,
    marginVertical: 5,
    marginHorizontal: "3%",
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: {
      width: 2,
      height: 2,
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

export default FavoritesFlatList;
