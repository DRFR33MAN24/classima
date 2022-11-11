import React from "react";
import {
  Dimensions,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
} from "react-native";

// Vector Fonts
import { FontAwesome5, FontAwesome } from "@expo/vector-icons";

// Custom Components & Constants
import { decodeString, getPrice } from "../helper/helper";
import { COLORS } from "../variables/color";
import { useStateValue } from "../StateProvider";
import Badge from "./Badge";
import { __ } from "../language/stringPicker";
import ListAdComponent from "./ListAdComponent";

const { width: screenWidth } = Dimensions.get("screen");

const listingCardFallbackImageUrl = require("../assets/100x100.png");

const ListingCardList = ({ onPress, item }) => {
  const [{ config, ios, appSettings, rtl_support }] = useStateValue();

  const rtlText = rtl_support && {
    writingDirection: "rtl",
  };
  const rtlTextA = rtl_support && {
    writingDirection: "rtl",
    textAlign: "right",
  };

  const rtlView = rtl_support && {
    flexDirection: "row-reverse",
  };
  const getTexonomy = (items) => {
    if (!items?.length) return false;
    return decodeString(items[items.length - 1].name);
  };
  const getBackgroundColor = () => {
    if (!item?.badges?.length > 0) {
      return null;
    } else {
      if (item?.badges?.includes("is-top")) {
        return COLORS.cardBg["is-top"];
      } else if (item?.badges?.includes("is-featured")) {
        return COLORS.cardBg["is-featured"];
      }
    }
  };

  return item.listAd ? (
    <ListAdComponent dummy={item.dummy} />
  ) : (
    <View
      style={{
        shadowColor: "#000",
        shadowRadius: 4,
        shadowOpacity: 0.2,
        shadowOffset: {
          height: 2,
          width: 2,
        },
      }}
    >
      <TouchableWithoutFeedback onPress={onPress}>
        <View
          style={[
            styles.featuredItemWrap,
            {
              backgroundColor: COLORS.white,
            },
            rtlView,
          ]}
        >
          {item?.badges?.includes("is-sold") && (
            <View
              style={[
                styles.soldOutBadge,
                {
                  transform: [{ rotate: rtl_support ? "-45deg" : "45deg" }],
                  top: "15%",
                  right: -30,
                  width: "35%",
                },
              ]}
            >
              <Text style={styles.soldOutBadgeMessage}>
                {__("listingCardTexts.soldOutBadgeMessage", appSettings.lng)}
              </Text>
            </View>
          )}

          <View style={styles.featuredItemImageWrap}>
            {item?.badges?.includes("is-featured") && (
              <View
                style={{
                  position: "absolute",
                  zIndex: 5,
                  top: "5%",
                  left: 0,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    height: 24,
                    justifyContent: "center",
                    backgroundColor: "#FD9E11",
                    // paddingLeft: "5%",
                  }}
                >
                  <Text
                    style={{
                      paddingHorizontal: 5,
                      fontWeight: "bold",
                      color: COLORS.white,
                    }}
                  >
                    {config.promotions.featured}
                  </Text>
                </View>
                <View
                  style={{
                    height: 0,
                    width: 0,
                    borderTopWidth: 12,
                    borderTopColor: "transparent",
                    borderBottomColor: "transparent",
                    borderBottomWidth: 12,
                    borderLeftWidth: 12,
                    borderColor: "#FD9E11",
                  }}
                />
              </View>
            )}
            {item?.badges?.includes("is-top") && (
              <View
                style={{
                  position: "absolute",
                  zIndex: 5,
                  top: item?.badges?.includes("is-featured") ? "25%" : "5%",
                  flexDirection: "row",
                  alignItems: "center",
                  left: 0,
                }}
              >
                <View
                  style={{
                    height: 24,
                    justifyContent: "center",
                    backgroundColor: "#FD9E11",
                    // paddingLeft: "5%",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: COLORS.white,
                      paddingHorizontal: 5,
                    }}
                  >
                    {config.promotions._top}
                  </Text>
                </View>
                <View
                  style={{
                    height: 0,
                    width: 0,
                    borderTopWidth: 12,
                    borderTopColor: "transparent",
                    borderBottomColor: "transparent",
                    borderBottomWidth: 12,
                    borderLeftWidth: 12,
                    borderColor: "#FD9E11",
                    left: 0,
                  }}
                />
              </View>
            )}
            {item?.badges?.includes("is-bump-up") && (
              <View
                style={{
                  position: "absolute",
                  zIndex: 5,
                  height: 20,
                  width: 20,
                  backgroundColor: "#FD9E11",
                  alignItems: "center",
                  justifyContent: "center",
                  top: 0,
                  right: 0,
                  borderBottomLeftRadius: 3,
                }}
              >
                <FontAwesome name="clock-o" size={15} color={COLORS.white} />
              </View>
            )}
            <Image
              style={styles.featuredItemImage}
              source={
                item?.images?.length
                  ? {
                      uri: item.images[0].sizes.thumbnail.src,
                    }
                  : listingCardFallbackImageUrl
              }
            />
          </View>
          <View
            style={[
              styles.featuredItemDetailWrap,
              { paddingVertical: ios ? 13 : 10, flex: 1 },
            ]}
          >
            <View
              style={{
                alignItems: rtl_support ? "flex-end" : "flex-start",
              }}
            >
              <View style={{ paddingHorizontal: 15, width: "100%" }}>
                <Text
                  style={[
                    styles.featuredItemTitle,
                    { paddingBottom: ios ? 3 : 1 },
                    rtlTextA,
                  ]}
                  numberOfLines={2}
                >
                  {decodeString(item.title)}
                </Text>

                {/* <Text
                  style={[
                    styles.featuredItemCategory,
                    { paddingVertical: ios ? 3 : 1 },
                    rtlText,
                  ]}
                  numberOfLines={1}
                >
                  {getTexonomy(item.categories)}
                </Text> */}
                <View
                  style={[
                    styles.featuredItemLocationWrap,
                    { paddingBottom: ios ? 5 : 3 },
                    rtlView,
                  ]}
                >
                  <FontAwesome name="tags" size={12} color={COLORS.text_gray} />
                  <Text
                    style={[styles.featuredItemLocation, rtlTextA]}
                    numberOfLines={1}
                  >
                    {getTexonomy(item.categories)}
                  </Text>
                </View>

                {(!!item?.contact?.locations?.length ||
                  !!item?.contact?.geo_address) && (
                  <>
                    {config.location_type === "local" ? (
                      <>
                        {!!item?.contact?.locations?.length && (
                          <View
                            style={[
                              styles.featuredItemLocationWrap,
                              { paddingBottom: ios ? 5 : 3 },
                              rtlView,
                            ]}
                          >
                            <FontAwesome5
                              name="map-marker-alt"
                              size={12}
                              color={COLORS.text_gray}
                            />
                            <Text
                              style={[styles.featuredItemLocation, rtlTextA]}
                            >
                              {getTexonomy(item.contact.locations)}
                            </Text>
                          </View>
                        )}
                      </>
                    ) : (
                      <>
                        {!!item?.contact?.geo_address && (
                          <View
                            style={[
                              styles.featuredItemLocationWrap,
                              { paddingBottom: ios ? 5 : 3 },
                              rtlView,
                            ]}
                          >
                            <FontAwesome5
                              name="map-marker-alt"
                              size={12}
                              color={COLORS.text_gray}
                            />
                            <Text
                              style={[styles.featuredItemLocation, rtlTextA]}
                              numberOfLines={1}
                            >
                              {decodeString(item.contact.geo_address)}
                            </Text>
                          </View>
                        )}
                      </>
                    )}
                  </>
                )}
              </View>
            </View>
            <View
              style={{
                alignItems: rtl_support ? "flex-end" : "flex-start",
                paddingHorizontal: 15,
              }}
            >
              <Text
                style={[styles.featuredItemPrice, rtlText]}
                numberOfLines={1}
              >
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
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};
const styles = StyleSheet.create({
  badgeSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
    margin: 2,
  },
  badgeStyle: {
    padding: 3,
    elevation: 5,
  },
  badgeTextStyle: {
    color: COLORS.white,
    fontSize: 12,
  },
  bumpUpBadge: {
    height: 20,
    width: 20,
    backgroundColor: COLORS.badges["is-bump-up"],
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
  },
  container: {},
  featuredListingTop: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: "3%",

    marginVertical: 10,
  },
  featuredItemCategory: {
    fontSize: 12,
    color: COLORS.text_gray,
  },
  featuredItemDetailWrap: {
    justifyContent: "space-between",
  },
  featuredItemImage: {
    height: "100%",
    width: "100%",
    resizeMode: "cover",
  },
  featuredItemImageWrap: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    width: screenWidth * 0.94 * 0.46,
    height: screenWidth * 0.94 * 0.4,
  },
  featuredItemLocation: {
    color: COLORS.text_gray,
    fontSize: 12,
    paddingHorizontal: 5,
  },
  featuredItemLocationWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  featuredItemPrice: {
    color: COLORS.primary,
    fontSize: 15.5,
    fontWeight: "bold",
  },
  featuredItemTitle: {
    fontSize: 14.5,
    fontWeight: "bold",
    color: COLORS.text_dark,
  },
  featuredItemWrap: {
    marginHorizontal: screenWidth * 0.015,
    overflow: "hidden",
    borderRadius: 3,
    marginBottom: screenWidth * 0.03,
    width: screenWidth * 0.94,
    elevation: 4,
    flexDirection: "row",
  },
  soldOutBadge: {
    position: "absolute",
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 3,

    flex: 1,
    elevation: 7,
    zIndex: 20,
    shadowColor: "#000",
    shadowRadius: 4,
    shadowOpacity: 0.2,
    shadowOffset: {
      height: 2,
      width: 2,
    },
  },
  soldOutBadgeMessage: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});

export default ListingCardList;
