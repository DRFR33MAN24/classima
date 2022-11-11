import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { getPrice } from "../helper/helper";
import { COLORS } from "../variables/color";
import { useStateValue } from "../StateProvider";
import { __ } from "../language/stringPicker";

const { width: windowWidth } = Dimensions.get("window");
const MembershipCard = ({ memPlan, onSelect, selected }) => {
  const [{ config, appSettings, rtl_support }] = useStateValue();

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

  return (
    <TouchableWithoutFeedback style={styles.container} onPress={onSelect}>
      <View
        style={[
          styles.content,
          {
            borderColor:
              memPlan?.id === selected?.id ? COLORS.primary : COLORS.white,
            borderWidth: 1,
          },
          rtlView,
        ]}
      >
        <View style={styles.chkBoxWrap}>
          <View
            style={[
              styles.chkBxOuter,
              {
                borderWidth: 1,
                borderColor:
                  memPlan?.id === selected?.id
                    ? COLORS.white
                    : COLORS.border_light,
                backgroundColor:
                  memPlan?.id === selected?.id ? COLORS.primary : COLORS.white,
              },
            ]}
          >
            <View style={styles.chkBxInner} />
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <View style={[styles.titleWrap, rtlView]}>
            <View style={styles.priceWrapp}>
              <Text style={styles.price}>
                {getPrice(config.payment_currency, {
                  pricing_type: "price",
                  price_type: "fixed",
                  price: memPlan.price,
                  max_price: 0,
                })}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: COLORS.bg_primary,
                paddingVertical: 5,
                paddingHorizontal: 8,
                borderRadius: 3,
                marginHorizontal: 10,
              }}
            >
              <Text style={[styles.title, rtlTextA]} numberOfLines={1}>
                {memPlan.title}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.featuresWrap,
              {
                marginRight: rtl_support ? 0 : 10,
                marginLeft: rtl_support ? 10 : 0,
                marginVertical: 10,
              },
            ]}
          >
            <View>
              <View style={[styles.tableHeaderRowWrap, rtlView]}>
                <View style={{ flex: 1.5 }} />
                <View style={styles.headerContent}>
                  <Text style={[styles.headerText, rtlText]}>
                    {__("membershipCardTexts.ads", appSettings.lng)}
                  </Text>
                </View>
                <View style={styles.headerContent}>
                  <Text style={[styles.headerText, rtlText]}>
                    {__("membershipCardTexts.validityUnit", appSettings.lng)}
                  </Text>
                </View>
              </View>
              {!!memPlan?.regular_ads && (
                <View
                  style={[
                    styles.tableRowWrap,
                    {
                      borderBottomColor: COLORS.border_light,
                      borderBottomWidth: !!memPlan?.promotion?.membership
                        ? 0
                        : 0.7,
                      paddingBottom: !!memPlan?.promotion?.membership ? 5 : 10,
                    },
                    rtlView,
                  ]}
                >
                  <View
                    style={[
                      styles.tableRowContent,
                      {
                        alignItems: rtl_support ? "flex-end" : "flex-start",
                        flex: 1.5,
                      },
                    ]}
                  >
                    <Text style={[styles.contentText, rtlText]}>
                      {__("membershipCardTexts.regular", appSettings.lng)}
                    </Text>
                  </View>
                  <View style={styles.tableRowContent}>
                    <Text style={[styles.contentText, rtlText]}>
                      {memPlan.regular_ads}
                    </Text>
                  </View>
                  <View style={styles.tableRowContent}>
                    <Text style={[styles.contentText, rtlText]}>
                      {memPlan.visible}
                    </Text>
                  </View>
                </View>
              )}

              {!!memPlan?.promotion?.membership &&
                Object.keys(memPlan.promotion.membership).map(
                  (memPkg, index) => (
                    <View style={[styles.tableRowWrap, rtlView]} key={index}>
                      <View
                        style={[
                          styles.tableRowContent,
                          {
                            alignItems: rtl_support ? "flex-end" : "flex-start",
                            flex: 1.5,
                          },
                        ]}
                      >
                        <Text style={[styles.contentText, rtlText]}>
                          {config?.promotions[memPkg] || memPkg}
                        </Text>
                      </View>
                      <View style={styles.tableRowContent}>
                        <Text style={[styles.contentText, rtlText]}>
                          {memPlan?.promotion?.membership[memPkg].ads}
                        </Text>
                      </View>
                      <View style={styles.tableRowContent}>
                        <Text style={[styles.contentText, rtlText]}>
                          {memPlan?.promotion?.membership[memPkg].validate}
                        </Text>
                      </View>
                    </View>
                  )
                )}
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  bottomContentWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  chkBxInner: {
    height: 8,
    width: 8,
    borderRadius: 8 / 2,
    backgroundColor: COLORS.white,
  },
  chkBxOuter: {
    height: 20,
    width: 20,
    borderRadius: 20 / 2,

    margin: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    borderRadius: 5,
    backgroundColor: COLORS.white,
    elevation: 1,
    marginVertical: 10,
    shadowRadius: 1,
    shadowOffset: {
      height: 1,
      width: 1,
    },
    shadowOpacity: 0.2,
    shadowColor: COLORS.gray,
    marginHorizontal: windowWidth * 0.03,
    flexDirection: "row",
    // width: windowWidth * 0.94 - 2,
  },
  contentText: {
    fontSize: 13,
    fontWeight: "bold",
    color: COLORS.text_gray,
  },
  featuresWrap: {
    paddingBottom: 5,
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerText: {
    fontSize: 13,
    fontWeight: "bold",
    color: COLORS.text_dark,
  },
  iconWrap: {
    width: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  labelWrap: {
    alignItems: "center",
    paddingVertical: 15,
  },
  note: {
    color: COLORS.text_gray,
    textAlign: "justify",
  },
  noteWrap: {
    flex: 1,
  },
  price: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text_dark,
  },
  tableHeaderRowWrap: {
    flexDirection: "row",
    borderBottomColor: COLORS.border_light,
    borderBottomWidth: 1,
    paddingBottom: 10,
    marginBottom: 5,
  },
  tableRowContent: {
    flex: 1,
    alignItems: "center",
  },
  tableRowWrap: {
    flexDirection: "row",
    paddingVertical: 5,
  },
  title: {
    fontWeight: "bold",
    // fontSize: 16,
    color: COLORS.primary,
  },
  titleWrap: {
    paddingVertical: 5,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default MembershipCard;
