import React from "react";
import { View, Text, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { COLORS } from "../variables/color";
import { useStateValue } from "../StateProvider";
import { getPrice } from "../helper/helper";
import { __ } from "../language/stringPicker";
import moment from "moment";

const PaymentHistoryCard = ({ item, onCardPress }) => {
  const [{ appSettings, config, rtl_support }] = useStateValue();
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
  const getStatusColor = () => {
    if (item.status === "Refunded") {
      return COLORS.text_gray;
    } else if (["Cancelled", "Failed"].includes(item.status)) {
      return COLORS.red;
    } else if (item.status === "Completed") {
      return COLORS.primary;
    } else if (["Pending", "On hold"].includes(item.status)) {
      return COLORS.yellow_dark;
    } else if (["Created", "Processing"].includes(item.status)) {
      return COLORS.dodgerblue;
    } else {
      return COLORS.text_dark;
    }
  };
  const getStatusBgColor = () => {
    if (item.status === "Refunded") {
      return COLORS.bg_light;
    } else if (["Cancelled", "Failed"].includes(item.status)) {
      return "#f2bfbf";
    } else if (item.status === "Completed") {
      return COLORS.bg_primary;
    } else if (["Pending", "On hold"].includes(item.status)) {
      return "FFF9EC";
    } else if (["Created", "Processing"].includes(item.status)) {
      return "#d4e4ff";
    } else {
      return COLORS.white;
    }
  };
  return (
    <TouchableWithoutFeedback onPress={onCardPress}>
      <View style={styles.container}>
        <View style={[styles.contentWrap, rtlView]}>
          <View style={styles.cardLeftWrap}>
            <View style={styles.methodWrap}>
              <Text style={[styles.method, rtlTextA]}>
                {__("paymentsScreenTexts.paymentMethodPrefix", appSettings.lng)}{" "}
                {item.method}
              </Text>
            </View>
            <View style={styles.dateWrap}>
              <Text style={[styles.date, rtlTextA]}>
                {moment(
                  item?.paid_date || item?.created_date,
                  "YYYY-MM-DD H-mm-ss"
                ).format("Do MMM YYYY | h:mm a")}
              </Text>
            </View>
          </View>
          <View style={styles.cardRightWrap}>
            <View
              style={[
                styles.priceWrap,
                { alignItems: rtl_support ? "flex-start" : "flex-end" },
              ]}
            >
              <Text
                style={[
                  styles.price,
                  {
                    textDecorationLine: "line-through",
                    color:
                      config?.coupon && item?.coupon?.discount
                        ? COLORS.red
                        : COLORS.text_dark,
                  },
                  rtlText,
                ]}
              >
                {getPrice(config.payment_currency, {
                  pricing_type: "price",
                  price_type: "fixed",
                  price:
                    config?.coupon && item?.coupon?.discount
                      ? item?.coupon?.original
                      : item.price,
                  max_price: 0,
                })}
              </Text>
            </View>
            {config?.coupon && item?.coupon?.discount && (
              <View
                style={[
                  styles.priceWrap,
                  { alignItems: rtl_support ? "flex-start" : "flex-end" },
                ]}
              >
                <Text style={[styles.price, rtlText]}>
                  {getPrice(config.payment_currency, {
                    pricing_type: "price",
                    price_type: "fixed",
                    price: item?.coupon?.subtotal,
                    max_price: 0,
                  })}
                </Text>
              </View>
            )}
            <View
              style={[
                styles.statusWrap,
                {
                  backgroundColor: getStatusBgColor(),
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 20,
                  marginTop: 5,
                },
                { alignItems: rtl_support ? "flex-start" : "flex-end" },
              ]}
            >
              <Text
                style={[
                  styles.status,
                  {
                    color: getStatusColor(),
                  },
                  rtlText,
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  cardLeftWrap: {
    flex: 1,
    justifyContent: "space-between",
  },
  cardRightWrap: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  container: {
    backgroundColor: COLORS.white,
    marginHorizontal: "3%",
    marginVertical: "2%",
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOpacity: 0.2,
    shadowOffset: { height: 0, width: 0 },
    shadowRadius: 3,
  },
  contentWrap: {
    flexDirection: "row",
  },
  date: {
    fontSize: 14.5,
    color: COLORS.text_gray,
  },
  methodWrap: {
    marginBottom: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text_dark,
  },
  method: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.text_dark,
  },
  status: {
    fontSize: 12,
    color: COLORS.text_dark,
  },
});

export default PaymentHistoryCard;
