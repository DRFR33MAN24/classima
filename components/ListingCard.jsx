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
import { admobConfig } from "../app/services/adMobConfig";

const { width: screenWidth } = Dimensions.get("screen");

const listingCardFallbackImageUrl = require("../assets/100x100.png");

const ListingCard = ({ onPress, item }) => {
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

  return item?.listAd && admobConfig?.admobEnabled ? (
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
              flex: 1,
            },
          ]}
        >
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
          {item?.badges?.includes("is-sold") && (
            <View
              style={[
                styles.soldOutBadge,
                {
                  top: ios ? "8%" : "6%",
                  left: ios ? "54%" : "56%",
                  width: ios ? "60%" : "60%",
                },
              ]}
            >
              <Text style={styles.soldOutBadgeMessage}>
                {__("listingCardTexts.soldOutBadgeMessage", appSettings.lng)}
              </Text>
            </View>
          )}
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
                top: item?.badges?.includes("is-featured") ? "20%" : "5%",
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
                }}
              />
            </View>
          )}

          <View style={styles.featuredItemImageWrap}>
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
              {
                alignItems: rtl_support ? "flex-end" : "flex-start",
                paddingHorizontal: ios ? 12 : 10,
              },
            ]}
          >
            <View style={styles.view}>
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

              <View
                style={[
                  styles.featuredItemLocationWrap,
                  { paddingBottom: ios ? 5 : 3 },
                  rtlView,
                ]}
              >
                <FontAwesome name="tags" size={10} color={COLORS.text_gray} />
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
                            size={10}
                            color={COLORS.text_gray}
                          />
                          <Text style={[styles.featuredItemLocation, rtlTextA]}>
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
                            size={10}
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
            <Text style={[styles.featuredItemPrice, rtlText]} numberOfLines={1}>
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
    paddingVertical: 10,
    overflow: "hidden",
    justifyContent: "space-between",
    flex: 1,
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
    width: "100%",
    height: (screenWidth * 0.455 * 2) / 3,
  },
  featuredItemLocation: {
    color: COLORS.text_gray,
    fontSize: 12,
    paddingHorizontal: 5,
  },
  featuredItemLocationWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 2,
  },
  featuredItemPrice: {
    color: COLORS.primary,
    fontSize: 15.5,
    fontWeight: "bold",
  },
  featuredItemTitle: {
    fontSize: 13.5,
    fontWeight: "bold",
    color: COLORS.text_dark,
  },
  featuredItemWrap: {
    marginHorizontal: screenWidth * 0.015,
    overflow: "hidden",
    borderRadius: 3,
    marginBottom: screenWidth * 0.03,
    width: screenWidth * 0.455,
    elevation: 4,
  },
  soldOutBadge: {
    position: "absolute",
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 3,
    transform: [{ rotate: "45deg" }],

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

export default ListingCard;
