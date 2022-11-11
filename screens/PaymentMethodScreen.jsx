import React, { useState, useEffect } from "react";
import { create } from "apisauce";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
  SafeAreaView,
  TextInput,
  Pressable,
} from "react-native";
import { confirmPayment } from "@stripe/stripe-react-native";
import { COLORS } from "../variables/color";
import { decodeString, getPrice } from "../helper/helper";
import { useStateValue } from "../StateProvider";
import PaymentMethodCard from "../components/PaymentMethodCard";
import AppSeparator from "../components/AppSeparator";
import AppTextButton from "../components/AppTextButton";

import { __ } from "../language/stringPicker";
import api, { apiKey, removeAuthToken, setAuthToken } from "../api/client";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import { WebView } from "react-native-webview";

const PaymentMethodScreen = ({ navigation, route }) => {
  const [{ config, ios, appSettings, auth_token, user, rtl_support }] =
    useStateValue();
  const [loading, setLoading] = useState(true);
  const [selected] = useState(route.params.selected);
  const [selectedMethod, setSelectedMethod] = useState();
  const [paymentMethodData, setPaymentMethodData] = useState([]);
  const [keyboardStatus, setKeyboardStatus] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState();
  const [paymentError, setPaymentError] = useState();
  const [paypalLoading, setPaypalLoading] = useState(false);
  const [cardData, setCardData] = useState();
  const [paypalData, setPaypalData] = useState(null);
  const [razorpayData, setRazorpayData] = useState(null);
  const [razorpaySuccess, setRazorpaySuccess] = useState(null);
  const [stripe3dConfirming, setStripe3dConfirming] = useState(false);
  const [wooCom, setWooCom] = useState(false);
  const [wooLoading, setWooLoading] = useState(false);
  const [wooModal, setWooModal] = useState(false);
  const [wooData, setWooData] = useState(null);
  const [wooComplete, setWooComplete] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [validCoupon, setValidCoupon] = useState("");
  const [couponInfo, setCouponInfo] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);

  useEffect(() => {
    Keyboard.addListener("keyboardDidShow", _keyboardDidShow);
    Keyboard.addListener("keyboardDidHide", _keyboardDidHide);

    // cleanup function
    return () => {
      Keyboard.removeListener("keyboardDidShow", _keyboardDidShow);
      Keyboard.removeListener("keyboardDidHide", _keyboardDidHide);
    };
  }, []);

  const _keyboardDidShow = () => setKeyboardStatus(true);
  const _keyboardDidHide = () => setKeyboardStatus(false);

  useEffect(() => {
    if (!loading) return;
    getPaymentMethods();

    return () => {
      // TODO
    };
  }, []);

  const getPaymentMethods = () => {
    api
      .get("payment-gateways")
      .then((res) => {
        if (res.ok) {
          if (res?.data?.id === "woo-payment") {
            setWooCom(true);
            setWooData(res.data);
          } else {
            setPaymentMethodData(res.data);
          }
        } else {
          alert(res?.data?.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handlePaymentMethodSelection = (method) => {
    setSelectedMethod(method);
    setCardData();
    setTimeout(() => {
      selectedMethod;
    }, 500);
  };

  const handlePayment = () => {
    Keyboard.dismiss();
    let args = {};
    if (route?.params?.type === "membership") {
      args = {
        type: "membership",
        gateway_id: selectedMethod?.id,
        plan_id: route?.params?.selected?.id,
      };
    } else if (route?.params?.type === "promotion") {
      args = {
        type: "promotion",
        promotion_type: "regular",
        gateway_id: selectedMethod?.id,
        plan_id: route?.params?.selected?.id,
        listing_id: route?.params?.listingID,
      };
    }
    if (config?.coupon && validCoupon && couponInfo && !couponError) {
      args.coupon_code = validCoupon;
    }

    if (selectedMethod?.id === "stripe") {
      handleStripeCardPayment(args);
    } else if (selectedMethod?.id === "authorizenet") {
      setPaymentLoading(true);
      setPaymentModal(true);
      handleAuthorizeCardPayment(args);
    } else if (selectedMethod?.id === "paypal") {
      setPaymentLoading(true);
      setPaymentModal(true);
      handlePaypalPayment(args);
    } else if (selectedMethod?.id === "razorpay") {
      setPaymentLoading(true);
      setPaymentModal(true);
      handleRazorpayPayment(args);
    } else {
      setPaymentLoading(true);
      setPaymentModal(true);
      handleCheckout(args);
    }
  };

  const handlePaypalPayment = (args) => {
    setAuthToken(auth_token);

    // return;
    api
      .post("checkout", args)
      .then((res) => {
        if (res.ok) {
          setPaymentData(res.data);
          setPaypalLoading(true);
          setPaymentLoading(false);
          if (args?.gateway_id === "paypal" && res?.data?.redirect) {
            setPaypalData(res.data);
          }
        } else {
          setPaymentError(
            res?.data?.error_message ||
              res?.data?.error ||
              res?.problem ||
              __("paymentMethodScreen.unknownError", appSettings.lng)
          );
          // TODO handle error
        }
      })
      .then(() => {
        removeAuthToken();
      });
  };
  const handleRazorpayPayment = (args) => {
    setAuthToken(auth_token);

    // return;
    api
      .post("checkout", args)
      .then((res) => {
        if (res.ok) {
          setPaymentData(res.data);
          setPaypalLoading(true);
          setPaymentLoading(false);
          if (args?.gateway_id === "razorpay" && res?.data?.redirect) {
            setRazorpayData(res.data);
          }
        } else {
          setPaymentError(
            res?.data?.error_message ||
              res?.data?.error ||
              res?.problem ||
              __("paymentMethodScreen.unknownError", appSettings.lng)
          );
          // TODO handle error
        }
      })
      .then(() => {
        removeAuthToken();
      });
  };

  const handleCheckout = (args) => {
    setAuthToken(auth_token);

    // return;
    api
      .post("checkout", args)
      .then((res) => {
        if (res.ok) {
          setPaymentData(res.data);
        } else {
          setPaymentError(
            res?.data?.error_message ||
              res?.data?.error ||
              res?.problem ||
              __("paymentMethodScreen.unknownError", appSettings.lng)
          );
          // TODO handle error
        }
      })
      .then(() => {
        removeAuthToken();
        setPaymentLoading(false);
      });
  };

  const handleCardData = (cardData) => {
    setCardData(cardData);
  };

  const proccedPaymentBtn =
    selectedMethod?.id === "stripe" && !cardData?.complete;

  const handleStripeCardPayment = async (args) => {
    if (!cardData?.complete) {
      Alert.alert(
        __("paymentMethodScreen.invalidCardMessage", appSettings.lng)
      );
      return;
    }
    setPaymentLoading(true);
    setPaymentModal(true);
    // const { error, paymentMethod } = await createPaymentMethod({
    //   type: "card",
    //   card: cardData,
    //   billing_details: {
    //     name: [user.first_name, user.last_name].join(" "),
    //     email: user.email,
    //   },
    // });
    // if (error) {
    //   setPaymentLoading(false);
    //   setPaymentError(error.message);
    //   Alert.alert(error.message);
    //   return;
    // }
    setAuthToken(auth_token);
    api
      .post("checkout", args)
      .then(async (res) => {
        console.log(res);
        if (res.ok) {
          if (
            res?.data?.requiresAction &&
            res?.data?.payment_intent_client_secret
          ) {
            setStripe3dConfirming(true);
            const { error, paymentIntent } = await confirmPayment(
              res?.data?.payment_intent_client_secret,
              {
                type: "Card",
              }
            );
            // const { error, paymentIntent } = await handleCardAction(
            //   res?.data?.payment_intent_client_secret
            // );
            if (error) {
              setPaymentData(res?.data);
              return;
            }
            const raw_api = create({
              baseURL: res?.data?.gateway.routes.confirm_payment_intent,
              headers: {
                Accept: "application/json",
                "X-API-KEY": apiKey,
              },
              timeout: 30000,
            });
            raw_api.setHeader("Authorization", "Bearer " + auth_token);
            raw_api
              .post("", {
                rest_api: true,
                order_id: res?.data.id,
              })
              .then((confirmRes) => {
                if (confirmRes.ok && confirmRes?.data.result === "success") {
                  setPaymentData(confirmRes?.data.order_data);
                } else {
                  setPaymentData(res?.data);
                }
              });
          } else {
            setPaymentData(res?.data);
          }
        } else {
          setPaymentError(
            res?.data?.error_message || res?.data?.error || res?.problem
          );
        }
      })
      .then(() => {
        removeAuthToken();
        setPaymentLoading(false);
        setStripe3dConfirming(false);
      });
  };

  const handleAuthorizeCardPayment = (args) => {
    if (!cardData?.valid) {
      Alert.alert(
        __("paymentMethodScreen.invalidCardMessage", appSettings.lng)
      );
      return;
    }

    setAuthToken(auth_token);
    api
      .post("checkout", {
        card_number: cardData?.values?.number,
        card_exp_month: cardData?.values?.expiry.split("/")[0],
        card_exp_year: cardData?.values?.expiry.split("/")[1],
        card_cvc: cardData?.values?.cvc,
        ...args,
      })
      .then((res) => {
        if (res.ok) {
          setPaymentData(res?.data);
        } else {
          setPaymentError(
            res?.data?.message ||
              res?.data?.error ||
              res?.problem ||
              res?.status
          );
        }
      })
      .then(() => {
        removeAuthToken();
        setPaymentLoading(false);
      });
  };

  const handlePaymentSumaryDismiss = () => {
    Keyboard.dismiss();
    if (paymentError) {
      setPaymentModal(false);
      setPaymentError();
      return;
    }
    setPaymentModal(false);
    navigation.pop(3);
  };

  const handleWebviewDataChange = (data) => {
    if (data.url.search("rtcl_return=success") > -1) {
      setPaymentModal(false);
      navigation.pop(3);
      return;
    } else if (data.url.search("rtcl_return=cancel") > -1) {
      setPaymentModal(false);
      setPaymentLoading(false);
      return;
    }

    return;
  };

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

  let HTML = `<html>
		<head>
			<title>Payment</title>
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
		<head>
		<body  style="height:100vh">
		</body>
    </html>`;

  const handleWooPayment = () => {
    Keyboard.dismiss();
    setWooLoading(true);
    setWooModal(true);
  };

  const handleWooModalClose = () => {
    setWooLoading(false);
    setWooModal(false);
  };

  const handleWooURLDataChange = (data) => {
    if (
      data.url.search("order-received") > -1 &&
      data.loading === false &&
      data.canGoBack === true
    ) {
      setWooComplete(true);
      return;
    }

    return;
  };

  const handleCouponApplication = () => {
    setCouponLoading(true);
    setCouponError(null);
    setCouponInfo(null);
    setValidCoupon("");
    setAuthToken(auth_token);
    const params = {
      plan_id: route.params.selected.id,
      coupon_code: coupon,
    };
    api
      .post("coupon/apply", params)
      .then((res) => {
        if (res.ok) {
          setCouponInfo(res.data);
          setValidCoupon(coupon);
          setCoupon("");
        } else {
          setCouponError(
            res?.data?.message ||
              __("paymentMethodScreen.couponValidationFailed", appSettings.lng)
          );
        }
      })
      .catch((error) => console.log(error))
      .finally(() => {
        removeAuthToken();
        setCouponLoading(false);
      });
  };

  const handleCouponRemove = () => {
    setCoupon();
    setValidCoupon();
    setCouponError();
    setCouponInfo();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={ios ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        keyboardShouldPersistTaps="never"
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: 90,
        }}
      >
        <View style={[styles.paymentDetailWrap]}>
          <View
            style={[
              styles.paymentDetailHeaderWrap,
              { alignItems: rtl_support ? "flex-end" : "flex-start" },
            ]}
          >
            <Text style={[styles.paymentDetailHeaderText, rtlTextA]}>
              {__("paymentMethodScreen.paymentDetail", appSettings.lng)}
            </Text>
          </View>
          <View style={{ paddingHorizontal: "5%" }}>
            {route?.params?.type === "membership" && (
              <View style={[styles.selectedPackageWrap, rtlView]}>
                <View style={{ marginRight: rtl_support ? 0 : 10 }}>
                  <Text style={[styles.selectedLabelText, rtlTextA]}>
                    {__("paymentMethodScreen.selectedPackage", appSettings.lng)}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    alignItems: rtl_support ? "flex-start" : "flex-end",
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={styles.selectedPackageNameText}
                  >
                    {selected.title}
                  </Text>
                </View>
              </View>
            )}
            {route?.params?.type === "promotion" && (
              <>
                <View style={[styles.selectedPackageWrap, rtlView]}>
                  <View style={{ marginRight: rtl_support ? 0 : 10 }}>
                    <Text style={[styles.selectedLabelText, rtlTextA]}>
                      {__(
                        "paymentMethodScreen.promotionConfirmation",
                        appSettings.lng
                      )}
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      alignItems: rtl_support ? "flex-start" : "flex-end",
                    }}
                  >
                    <Text style={[styles.selectedPackageNameText, rtlText]}>
                      {decodeString(route.params.listingTitle)}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.selectedPackageWrap,
                    rtlView,
                    { marginTop: 15 },
                  ]}
                >
                  <View style={{ marginRight: rtl_support ? 0 : 10 }}>
                    <Text style={[styles.selectedLabelText, rtlTextA]}>
                      {__("paymentMethodScreen.promotionPlan", appSettings.lng)}
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      alignItems: rtl_support ? "flex-start" : "flex-end",
                    }}
                  >
                    <Text style={[styles.selectedPackageNameText, rtlText]}>
                      {decodeString(selected.title)}
                    </Text>
                  </View>
                </View>
              </>
            )}

            <AppSeparator style={styles.separator} />
            <View style={styles.pricingWrap}>
              <View style={[styles.priceRow, rtlView]}>
                <Text style={[styles.priceRowLabel, rtlText]}>
                  {__(
                    route.params.type === "membership"
                      ? "paymentMethodScreen.packagePrice"
                      : "paymentMethodScreen.promotionPrice",
                    appSettings.lng
                  )}
                </Text>
                <Text style={[styles.priceRowValue, rtlText]} numberOfLines={1}>
                  {getPrice(config.payment_currency, {
                    pricing_type: "price",
                    price_type: "fixed",
                    price: selected.price,
                    max_price: 0,
                  })}
                </Text>
              </View>
            </View>
            {couponInfo && config?.coupon && (
              <>
                <AppSeparator style={styles.separator} />
                <View style={styles.pricingWrap}>
                  <View style={[styles.priceRow, rtlView]}>
                    <Text style={[styles.priceRowLabel, rtlText]}>
                      {__(
                        "paymentMethodScreen.couponDiscount",
                        appSettings.lng
                      )}
                    </Text>
                    <View
                      style={[
                        {
                          alignItems: "center",
                          flexDirection: "row",
                        },
                        rtlView,
                      ]}
                    >
                      <Pressable onPress={handleCouponRemove}>
                        <View
                          style={{
                            backgroundColor: COLORS.red,
                            paddingHorizontal: 10,
                            paddingVertical: 3,
                            borderRadius: 3,
                            marginHorizontal: 5,
                          }}
                        >
                          <Text style={{ fontSize: 12, color: COLORS.white }}>
                            {__(
                              "paymentMethodScreen.removeButton",
                              appSettings.lng
                            )}
                          </Text>
                        </View>
                      </Pressable>
                      <Text
                        style={[
                          styles.priceRowValue,
                          { color: COLORS.green },
                          rtlText,
                        ]}
                        numberOfLines={1}
                      >
                        {getPrice(config.payment_currency, {
                          pricing_type: "price",
                          price_type: "fixed",
                          price: `-${couponInfo.discount}`,
                          max_price: 0,
                        })}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}
            <AppSeparator style={styles.separator} />
            <View style={styles.pricingWrap}>
              <View style={[styles.priceRow, rtlView]}>
                <Text
                  style={[
                    styles.priceRowLabel,
                    { color: COLORS.text_dark },
                    rtlText,
                  ]}
                >
                  {__("paymentMethodScreen.subTotal", appSettings.lng)}
                </Text>
                <Text
                  style={[
                    styles.priceRowValue,
                    { color: COLORS.primary },
                    rtlText,
                  ]}
                  numberOfLines={1}
                >
                  {getPrice(config.payment_currency, {
                    pricing_type: "price",
                    price_type: "fixed",
                    price:
                      couponInfo?.discount && config?.coupon
                        ? couponInfo.subtotal
                        : selected.price,
                    max_price: 0,
                  })}
                </Text>
              </View>
            </View>
            {config?.coupon && (
              <>
                <AppSeparator style={styles.separator} />
                <View style={styles.couponWrap}>
                  <View style={[styles.couponRowWrap, rtlView]}>
                    <View style={styles.couponFieldWrap}>
                      <TextInput
                        style={[
                          styles.couponField,
                          {
                            marginRight: rtl_support ? 0 : 10,
                            marginLeft: rtl_support ? 10 : 0,
                          },
                          rtlText,
                        ]}
                        value={coupon}
                        onChangeText={(text) => setCoupon(text)}
                        placeholder={__(
                          "paymentMethodScreen.couponPlaceholder",
                          appSettings.lng
                        )}
                        placeholderTextColor={COLORS.border_light}
                      />
                    </View>
                    <Pressable onPress={handleCouponApplication}>
                      <View
                        style={[
                          styles.couponApplyBtn,
                          {
                            backgroundColor: coupon
                              ? COLORS.button.active
                              : COLORS.button.disabled,
                          },
                        ]}
                      >
                        <Text style={[styles.couponApply, rtlText]}>
                          {__(
                            "paymentMethodScreen.applyButton",
                            appSettings.lng
                          )}
                        </Text>
                      </View>
                    </Pressable>
                  </View>
                </View>
              </>
            )}
            {!!couponError && (
              <View style={styles.couponErrorWrap}>
                <Text style={[styles.couponError, rtlText]}>
                  {couponError ||
                    __(
                      "paymentMethodScreen.couponValidationFailed",
                      appSettings.lng
                    )}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={{ paddingVertical: 10 }} />
        {!wooCom && (
          <View style={styles.paymentSectionWrap}>
            <View
              style={[
                styles.paymentSectionTitle,
                { alignItems: rtl_support ? "flex-end" : "flex-start" },
              ]}
            >
              <Text
                style={[styles.paymentHeaderTitle, rtlText]}
                numberOfLines={1}
              >
                {__("paymentMethodScreen.choosePayment", appSettings.lng)}
              </Text>
            </View>
            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color={COLORS.primary} size="large" />
              </View>
            ) : (
              <View style={styles.paymentMethodsWrap}>
                {paymentMethodData?.map((method, index, arr) => (
                  <PaymentMethodCard
                    key={method.id}
                    method={method}
                    isLast={arr.length - 1 === index}
                    onSelect={handlePaymentMethodSelection}
                    selected={selectedMethod}
                    onCardDataUpdate={handleCardData}
                  />
                ))}
              </View>
            )}
          </View>
        )}
        {ios && selectedMethod?.id === "stripe" && !wooCom && (
          <View
            style={{
              marginHorizontal: "10%",
              backgroundColor: "transparent",
            }}
          >
            <TouchableOpacity
              style={[
                styles.showMoreButton,
                {
                  backgroundColor: proccedPaymentBtn
                    ? COLORS.button.disabled
                    : COLORS.button.active,
                },
              ]}
              onPress={handlePayment}
              disabled={proccedPaymentBtn}
            >
              <Text
                style={[styles.showMoreButtonText, rtlText]}
                numberOfLines={1}
              >
                {__("paymentMethodScreen.proceedPayment", appSettings.lng)}
              </Text>
              <View style={styles.iconWrap}>
                <AntDesign name="arrowright" size={18} color={COLORS.white} />
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      {!!wooCom && (
        <View style={[styles.buttonWrap, { marginHorizontal: "3%" }]}>
          <TouchableOpacity
            style={[
              styles.showMoreButton,
              {
                backgroundColor: proccedPaymentBtn
                  ? COLORS.button.disabled
                  : COLORS.button.active,
              },
            ]}
            onPress={handleWooPayment}
            disabled={loading || wooLoading}
          >
            <Text
              style={[styles.showMoreButtonText, rtlText]}
              numberOfLines={1}
            >
              {__("paymentMethodScreen.proceedPayment", appSettings.lng)}
            </Text>
            <View style={styles.iconWrap}>
              <AntDesign name="arrowright" size={18} color={COLORS.white} />
            </View>
          </TouchableOpacity>
        </View>
      )}
      {((ios &&
        !!selectedMethod &&
        selectedMethod?.id !== "stripe" &&
        !wooCom) ||
        (!ios && !keyboardStatus && !!selectedMethod && !wooCom)) && (
        <View style={[styles.buttonWrap, { marginHorizontal: "3%" }]}>
          <TouchableOpacity
            style={[
              styles.showMoreButton,
              {
                backgroundColor: proccedPaymentBtn
                  ? COLORS.button.disabled
                  : COLORS.button.active,
              },
            ]}
            onPress={handlePayment}
            disabled={proccedPaymentBtn}
          >
            <Text
              style={[styles.showMoreButtonText, rtlText]}
              numberOfLines={1}
            >
              {__("paymentMethodScreen.proceedPayment", appSettings.lng)}
            </Text>
            <View style={styles.iconWrap}>
              <AntDesign name="arrowright" size={18} color={COLORS.white} />
            </View>
          </TouchableOpacity>
        </View>
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={wooModal}
        statusBarTranslucent={ios}
      >
        <SafeAreaView style={{ backgroundColor: COLORS.primary, flex: 1 }}>
          {wooComplete && (
            <View
              style={{
                position: "absolute",
                height: "100%",
                width: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                zIndex: 5,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  padding: 20,
                  backgroundColor: COLORS.white,
                  borderRadius: 6,
                }}
              >
                <Text style={styles.text}>
                  {__("paymentMethodScreen.orderSuccess", appSettings.lng)}
                </Text>
                <View style={{ marginTop: 20 }}>
                  <AppTextButton
                    title={__(
                      "paymentMethodScreen.closeButton",
                      appSettings.lng
                    )}
                    onPress={() => navigation.pop(3)}
                  />
                </View>
              </View>
            </View>
          )}
          {wooLoading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                backgroundColor: COLORS.white,
              }}
            >
              <View
                style={{
                  backgroundColor: COLORS.white,
                  alignItems: "flex-end",
                }}
              >
                <TouchableOpacity
                  style={[
                    {
                      flexDirection: "row",
                      backgroundColor: COLORS.primary,
                      paddingHorizontal: 2,
                      paddingVertical: 2,
                      borderRadius: 15,
                      alignItems: "center",
                      margin: 5,
                    },
                    rtlView,
                  ]}
                  onPress={handleWooModalClose}
                >
                  <View style={{ paddingHorizontal: 10 }}>
                    <Text
                      style={{
                        color: COLORS.white,
                        fontSize: 12,
                        fontWeight: "bold",
                      }}
                    >
                      {__("paymentMethodScreen.closeButton", appSettings.lng)}
                    </Text>
                  </View>
                  <FontAwesome5
                    name="times-circle"
                    size={24}
                    color={COLORS.white}
                  />
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1 }}>
                <WebView
                  source={{
                    uri:
                      route?.params?.type === "promotion"
                        ? `${wooData.routes.web}&api_key=${apiKey}&token=${auth_token}&pricing_id=${route?.params?.selected?.id}&listing_id=${route?.params?.listingID}`
                        : `${wooData.routes.web}&api_key=${apiKey}&token=${auth_token}&pricing_id=${route?.params?.selected?.id}`,
                  }}
                  style={{ opacity: 0.99 }}
                  onNavigationStateChange={(data) =>
                    // handleWebviewDataChange(data)
                    handleWooURLDataChange(data)
                  }
                  startInLoadingState={true}
                  renderLoading={() => (
                    <View
                      style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                  )}
                  onMessage={(e) => {
                    console.log(e.nativeEvent.data);
                  }}
                  javaScriptEnabled={true}
                  javaScriptEnabledAndroid={true}
                  domStorageEnabled={true}
                  onError={console.error.bind(console, "error")}
                />
              </View>
            </View>
          ) : (
            <View style={{ flex: 1, backgroundColor: COLORS.white }}>
              {!paymentError && !paymentData && (
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={styles.text}>
                    {__(
                      "paymentMethodScreen.paymentProcessing",
                      appSettings.lng
                    )}
                  </Text>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
              )}
              {!!paymentError && (
                <View style={styles.paymentErrorWrap}>
                  <Text style={styles.paymentError}>{paymentError}</Text>
                </View>
              )}
              {paymentData && !paymentError && (
                <ScrollView>
                  <View style={{ paddingBottom: 80 }}>
                    {!!paymentData && (
                      <View style={styles.paymentTableWrap}>
                        {!!paymentData?.id && (
                          <View style={styles.paymentTableHeaderWrap}>
                            <View
                              style={{
                                paddingVertical: ios ? 10 : 7,
                                paddingHorizontal: 15,
                              }}
                            >
                              <Text
                                style={[
                                  styles.paymentTableValue,
                                  { color: COLORS.primary },
                                  rtlTextA,
                                ]}
                              >
                                {__(
                                  "paymentDetailScreen.invoiceNo",
                                  appSettings.lng
                                )}{" "}
                                {paymentData.id}
                              </Text>
                            </View>
                          </View>
                        )}
                        {!!paymentData?.method && (
                          <View style={styles.paymentTableRow}>
                            <View style={styles.paymentTableLabelWrap}>
                              <Text style={styles.paymentTableLabel}>
                                {__(
                                  "paymentMethodScreen.payment.method",
                                  appSettings.lng
                                )}
                              </Text>
                            </View>
                            <View style={styles.paymentTableValueWrap}>
                              <Text style={styles.paymentTableValue}>
                                {paymentData.method}
                              </Text>
                            </View>
                          </View>
                        )}

                        {!!paymentData?.price && (
                          <View style={styles.paymentTableRow}>
                            <View style={styles.paymentTableLabelWrap}>
                              <Text style={styles.paymentTableLabel}>
                                {__(
                                  "paymentMethodScreen.payment.totalAmount",
                                  appSettings.lng
                                )}
                              </Text>
                            </View>
                            <View style={styles.paymentTableValueWrap}>
                              <Text style={styles.paymentTableValue}>
                                {getPrice(config.payment_currency, {
                                  pricing_type: "price",
                                  price_type: "fixed",
                                  price: paymentData.price,
                                  max_price: 0,
                                })}
                              </Text>
                            </View>
                          </View>
                        )}
                        {!!paymentData?.paid_date && (
                          <View style={styles.paymentTableRow}>
                            <View style={styles.paymentTableLabelWrap}>
                              <Text style={styles.paymentTableLabel}>
                                {__(
                                  "paymentMethodScreen.payment.date",
                                  appSettings.lng
                                )}
                              </Text>
                            </View>
                            <View style={styles.paymentTableValueWrap}>
                              <Text style={styles.paymentTableValue}>
                                {paymentData.paid_date}
                              </Text>
                            </View>
                          </View>
                        )}
                        {!!paymentData?.transaction_id && (
                          <View style={styles.paymentTableRow}>
                            <View style={styles.paymentTableLabelWrap}>
                              <Text style={styles.paymentTableLabel}>
                                {__(
                                  "paymentMethodScreen.payment.transactionID",
                                  appSettings.lng
                                )}
                              </Text>
                            </View>
                            <View style={styles.paymentTableValueWrap}>
                              <Text style={styles.paymentTableValue}>
                                {paymentData.transaction_id}
                              </Text>
                            </View>
                          </View>
                        )}

                        {!!paymentData?.status && (
                          <View
                            style={[
                              styles.paymentTableRow,
                              {
                                borderBottomWidth:
                                  paymentData?.status !== "Completed" &&
                                  !!selectedMethod?.instructions
                                    ? 1
                                    : 0,
                              },
                            ]}
                          >
                            <View style={styles.paymentTableLabelWrap}>
                              <Text style={styles.paymentTableLabel}>
                                {__(
                                  "paymentMethodScreen.payment.status",
                                  appSettings.lng
                                )}
                              </Text>
                            </View>
                            <View style={styles.paymentTableValueWrap}>
                              <Text style={styles.paymentTableValue}>
                                {paymentData.status}
                              </Text>
                            </View>
                          </View>
                        )}
                        {paymentData?.status !== "Completed" &&
                          !!selectedMethod?.instructions && (
                            <View
                              style={[
                                styles.paymentTableRow,
                                {
                                  borderBottomWidth: 0,
                                },
                              ]}
                            >
                              <View
                                style={[
                                  styles.paymentTableLabelWrap,
                                  { justifyContent: "flex-start" },
                                ]}
                              >
                                <Text style={styles.paymentTableLabel}>
                                  {__(
                                    "paymentMethodScreen.payment.instructions",
                                    appSettings.lng
                                  )}
                                </Text>
                              </View>
                              <View style={styles.paymentTableValueWrap}>
                                <Text style={styles.paymentTableValue}>
                                  {decodeString(selectedMethod.instructions)}
                                </Text>
                              </View>
                            </View>
                          )}
                      </View>
                    )}
                    {!!paymentData?.plan && (
                      <View style={styles.planTableWrap}>
                        <View
                          style={{
                            paddingHorizontal: 15,
                            paddingVertical: ios ? 10 : 7,
                            backgroundColor: COLORS.bg_primary,
                            borderTopLeftRadius: 10,
                            borderTopRightRadius: 10,
                          }}
                        >
                          <Text
                            style={[
                              styles.paymentTableValue,
                              { color: COLORS.primary },
                              rtlTextA,
                            ]}
                          >
                            {__(
                              "paymentMethodScreen.plan.details",
                              appSettings.lng
                            )}
                          </Text>
                        </View>

                        {!!paymentData?.plan?.title && (
                          <View style={styles.paymentTableRow}>
                            <View style={styles.paymentTableLabelWrap}>
                              <Text style={styles.paymentTableLabel}>
                                {__(
                                  "paymentMethodScreen.plan.pricingOption",
                                  appSettings.lng
                                )}
                              </Text>
                            </View>
                            <View style={styles.paymentTableValueWrap}>
                              <Text style={styles.paymentTableValue}>
                                {decodeString(paymentData.plan.title)}
                              </Text>
                            </View>
                          </View>
                        )}
                        {!!paymentData?.plan?.visible && (
                          <View style={styles.paymentTableRow}>
                            <View style={styles.paymentTableLabelWrap}>
                              <Text style={styles.paymentTableLabel}>
                                {__(
                                  "paymentMethodScreen.plan.duration",
                                  appSettings.lng
                                )}
                              </Text>
                            </View>
                            <View style={styles.paymentTableValueWrap}>
                              <Text style={styles.paymentTableValue}>
                                {paymentData.plan.visible}
                              </Text>
                            </View>
                          </View>
                        )}
                        {!!paymentData?.plan?.price && (
                          <View
                            style={{
                              flexDirection: "row",
                              paddingHorizontal: 10,
                            }}
                          >
                            <View style={styles.paymentTableLabelWrap}>
                              <Text style={styles.paymentTableLabel}>
                                {__(
                                  "paymentMethodScreen.plan.amount",
                                  appSettings.lng
                                )}
                              </Text>
                            </View>
                            <View style={styles.paymentTableValueWrap}>
                              <Text style={styles.paymentTableValue}>
                                {getPrice(config.payment_currency, {
                                  pricing_type: "price",
                                  price_type: "fixed",
                                  price: paymentData.plan.price,
                                  max_price: 0,
                                })}
                              </Text>
                            </View>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </ScrollView>
              )}

              <View style={styles.buttonWrap}>
                <TouchableOpacity
                  style={[
                    styles.showMoreButton,
                    {
                      backgroundColor: COLORS.button.active,
                    },
                  ]}
                  onPress={handlePaymentSumaryDismiss}
                >
                  <Text style={styles.showMoreButtonText} numberOfLines={1}>
                    {__(
                      !!paymentError
                        ? "paymentMethodScreen.closeButton"
                        : "paymentMethodScreen.goToAccountButton",
                      appSettings.lng
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </SafeAreaView>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={paymentModal}
        statusBarTranslucent
      >
        <SafeAreaView
          style={[
            styles.modalInnerWrap,
            { backgroundColor: paypalLoading ? COLORS.primary : COLORS.white },
          ]}
        >
          {paymentLoading ? (
            <View style={styles.paymentLoadingWrap}>
              {razorpaySuccess ? (
                <Text style={styles.text}>
                  {__("paymentMethodScreen.paymentVerifying", appSettings.lng)}
                </Text>
              ) : (
                <Text style={styles.text}>
                  {__("paymentMethodScreen.paymentProcessing", appSettings.lng)}
                </Text>
              )}
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <>
              {paypalLoading ? (
                <>
                  {selectedMethod?.id === "razorpay" && (
                    <View
                      style={{
                        flex: 1,
                      }}
                    >
                      {ios ? (
                        <WebView
                          style={{ marginTop: 20, opacity: 0.99 }}
                          startInLoadingState={true}
                          renderLoading={() => (
                            <View
                              style={{
                                flex: 1,
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <ActivityIndicator
                                size="large"
                                color={COLORS.primary}
                              />
                            </View>
                          )}
                          source={{ html: HTML }}
                          injectedJavaScript={`(function(){
                    
                        var razorpayCheckout = new Razorpay({
                          key: "${paymentData.checkout_data.key}",
                          currency: "${paymentData.checkout_data.currency}",
                          description: "${paymentData.checkout_data.description}",
                          name: "${paymentData.checkout_data.name}",
                          notes: {
                            rtcl_payment_id: ${paymentData.id}
                          },
                          order_id: "${paymentData.checkout_data.order_id}",
                          modal:{
                            ondismiss: function(e){
                              var resp = {reason:'dismiss', success:false, payment:null};
                              window.ReactNativeWebView.postMessage(JSON.stringify(resp));
                            }
                          },
                          handler: function(payment){
                            var resp = {reason:'', success:true, payment: payment};
                            window.ReactNativeWebView.postMessage(JSON.stringify(resp));
                          }
                        });
                        razorpayCheckout.open();
                      
                  })();`}
                          onMessage={(event) => {
                            // var response = JSON.parse(event);
                            const result = event.nativeEvent.data;
                            if (result) {
                              const res = JSON.parse(result);
                              if (res.success) {
                                setRazorpaySuccess(true);
                                setPaymentLoading(true);

                                var formdata = new FormData();
                                formdata.append("payment_id", paymentData.id);
                                formdata.append("rest_api", 1);
                                formdata.append(
                                  "razorpay_payment_id",
                                  res?.payment?.razorpay_payment_id
                                );
                                formdata.append(
                                  "razorpay_order_id",
                                  res?.payment?.razorpay_order_id
                                );
                                formdata.append(
                                  "razorpay_signature",
                                  res?.payment?.razorpay_signature
                                );
                                const myHeaders = new Headers();
                                myHeaders.append("Accept", "application/json");
                                myHeaders.append("X-API-KEY", apiKey);
                                myHeaders.append(
                                  "Authorization",
                                  "Bearer " + auth_token
                                );

                                fetch(paymentData.auth_api_url, {
                                  method: "POST",
                                  body: formdata,
                                  headers: myHeaders,
                                })
                                  .then((response) => response.json())
                                  .then((json) => {
                                    if (json?.success) {
                                      setPaymentData(json.data);
                                    }
                                  })
                                  .catch((error) => alert(error))
                                  .finally(() => {
                                    setPaypalLoading(false);
                                    setPaymentLoading(false);
                                  });
                              } else {
                                setPaymentError(res.reason);
                                setPaypalLoading(false);
                                setPaymentLoading(false);
                              }
                            }
                            // console.log(response);
                          }}
                          javaScriptEnabled={true}
                          // javaScriptEnabledAndroid={true}
                          // domStorageEnabled={true}
                          onError={console.error.bind(console, "error")}
                        />
                      ) : (
                        <WebView
                          style={{ marginTop: 20, opacity: 0.99 }}
                          startInLoadingState={true}
                          renderLoading={() => (
                            <View
                              style={{
                                flex: 1,
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <ActivityIndicator
                                size="large"
                                color={COLORS.primary}
                              />
                            </View>
                          )}
                          source={{ html: HTML }}
                          injectedJavaScript={`(function(){
                    if(!window.Razorpay){ 
                        var resp = {reason:'Could not initiate Razerpay', success:false, payment:null};
                        window.ReactNativeWebView.postMessage(JSON.stringify(resp));
                      }else{
                        var razorpayCheckout = new Razorpay({
                          key: "${paymentData.checkout_data.key}",
                          currency: "${paymentData.checkout_data.currency}",
                          description: "${paymentData.checkout_data.description}",
                          name: "${paymentData.checkout_data.name}",
                          notes: {
                            rtcl_payment_id: ${paymentData.id}
                          },
                          order_id: "${paymentData.checkout_data.order_id}",
                          modal:{
                            ondismiss: function(e){
                              var resp = {reason:'dismiss', success:false, payment:null};
                              window.ReactNativeWebView.postMessage(JSON.stringify(resp));
                            }
                          },
                          handler: function(payment){
                            var resp = {reason:'', success:true, payment: payment};
                            window.ReactNativeWebView.postMessage(JSON.stringify(resp));
                          }
                        });
                        razorpayCheckout.open();
                      }
                  })();`}
                          onMessage={(event) => {
                            // var response = JSON.parse(event);
                            const result = event.nativeEvent.data;
                            if (result) {
                              const res = JSON.parse(result);
                              if (res.success) {
                                setRazorpaySuccess(true);
                                setPaymentLoading(true);

                                var formdata = new FormData();
                                formdata.append("payment_id", paymentData.id);
                                formdata.append("rest_api", 1);
                                formdata.append(
                                  "razorpay_payment_id",
                                  res?.payment?.razorpay_payment_id
                                );
                                formdata.append(
                                  "razorpay_order_id",
                                  res?.payment?.razorpay_order_id
                                );
                                formdata.append(
                                  "razorpay_signature",
                                  res?.payment?.razorpay_signature
                                );
                                const myHeaders = new Headers();
                                myHeaders.append("Accept", "application/json");
                                myHeaders.append("X-API-KEY", apiKey);
                                myHeaders.append(
                                  "Authorization",
                                  "Bearer " + auth_token
                                );

                                fetch(paymentData.auth_api_url, {
                                  method: "POST",
                                  body: formdata,
                                  headers: myHeaders,
                                })
                                  .then((response) => response.json())
                                  .then((json) => {
                                    if (json?.success) {
                                      setPaymentData(json.data);
                                    }
                                  })
                                  .catch((error) => alert(error))
                                  .finally(() => {
                                    setPaypalLoading(false);
                                    setPaymentLoading(false);
                                  });
                              } else {
                                setPaymentError(res.reason);
                                setPaypalLoading(false);
                                setPaymentLoading(false);
                              }
                            }
                            // console.log(response);
                          }}
                          javaScriptEnabled={true}
                          javaScriptEnabledAndroid={true}
                          domStorageEnabled={true}
                          onError={console.error.bind(console, "error")}
                        />
                      )}
                    </View>
                  )}
                  {selectedMethod?.id === "paypal" && (
                    <View style={{ flex: 1, justifyContent: "center" }}>
                      <WebView
                        source={{ uri: paymentData.redirect }}
                        style={{ marginTop: 20, opacity: 0.99 }}
                        onNavigationStateChange={(data) =>
                          handleWebviewDataChange(data)
                        }
                        startInLoadingState={true}
                        renderLoading={() => (
                          <View
                            style={{
                              flex: 1,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <ActivityIndicator
                              size="large"
                              color={COLORS.primary}
                            />
                          </View>
                        )}
                        onMessage={(e) => {
                          console.log(e.nativeEvent.data);
                        }}
                        javaScriptEnabled={true}
                        javaScriptEnabledAndroid={true}
                        domStorageEnabled={true}
                        onError={console.error.bind(console, "error")}
                      />
                    </View>
                  )}
                </>
              ) : (
                <View style={{ flex: 1 }}>
                  {!paymentError && !paymentData && (
                    <View
                      style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={styles.text}>
                        {__(
                          "paymentMethodScreen.paymentProcessing",
                          appSettings.lng
                        )}
                      </Text>
                      <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                  )}
                  {!!paymentError && (
                    <View style={styles.paymentErrorWrap}>
                      <Text style={styles.paymentError}>{paymentError}</Text>
                    </View>
                  )}
                  {paymentData && !paymentError && (
                    <ScrollView>
                      <View style={{ paddingBottom: 80 }}>
                        {!!paymentData && (
                          <View style={styles.paymentTableWrap}>
                            {!!paymentData?.id && (
                              <View style={styles.paymentTableHeaderWrap}>
                                <View
                                  style={{
                                    paddingVertical: ios ? 10 : 7,
                                    paddingHorizontal: 15,
                                  }}
                                >
                                  <Text
                                    style={[
                                      styles.paymentTableValue,
                                      { color: COLORS.primary },
                                      rtlTextA,
                                    ]}
                                  >
                                    {__(
                                      "paymentDetailScreen.invoiceNo",
                                      appSettings.lng
                                    )}{" "}
                                    {paymentData.id}
                                  </Text>
                                </View>
                              </View>
                            )}
                            {!!paymentData?.method && (
                              <View style={styles.paymentTableRow}>
                                <View style={styles.paymentTableLabelWrap}>
                                  <Text style={styles.paymentTableLabel}>
                                    {__(
                                      "paymentMethodScreen.payment.method",
                                      appSettings.lng
                                    )}
                                  </Text>
                                </View>
                                <View style={styles.paymentTableValueWrap}>
                                  <Text style={styles.paymentTableValue}>
                                    {paymentData.method}
                                  </Text>
                                </View>
                              </View>
                            )}

                            {!!paymentData?.price && (
                              <View style={styles.paymentTableRow}>
                                <View style={styles.paymentTableLabelWrap}>
                                  <Text style={styles.paymentTableLabel}>
                                    {__(
                                      "paymentMethodScreen.payment.totalAmount",
                                      appSettings.lng
                                    )}
                                  </Text>
                                </View>
                                <View style={styles.paymentTableValueWrap}>
                                  <Text style={styles.paymentTableValue}>
                                    {getPrice(config.payment_currency, {
                                      pricing_type: "price",
                                      price_type: "fixed",
                                      price: paymentData.price,
                                      max_price: 0,
                                    })}
                                  </Text>
                                </View>
                              </View>
                            )}
                            {!!paymentData?.paid_date && (
                              <View style={styles.paymentTableRow}>
                                <View style={styles.paymentTableLabelWrap}>
                                  <Text style={styles.paymentTableLabel}>
                                    {__(
                                      "paymentMethodScreen.payment.date",
                                      appSettings.lng
                                    )}
                                  </Text>
                                </View>
                                <View style={styles.paymentTableValueWrap}>
                                  <Text style={styles.paymentTableValue}>
                                    {paymentData.paid_date}
                                  </Text>
                                </View>
                              </View>
                            )}
                            {!!paymentData?.transaction_id && (
                              <View style={styles.paymentTableRow}>
                                <View style={styles.paymentTableLabelWrap}>
                                  <Text style={styles.paymentTableLabel}>
                                    {__(
                                      "paymentMethodScreen.payment.transactionID",
                                      appSettings.lng
                                    )}
                                  </Text>
                                </View>
                                <View style={styles.paymentTableValueWrap}>
                                  <Text style={styles.paymentTableValue}>
                                    {paymentData.transaction_id}
                                  </Text>
                                </View>
                              </View>
                            )}

                            {!!paymentData?.status && (
                              <View
                                style={[
                                  styles.paymentTableRow,
                                  {
                                    borderBottomWidth:
                                      paymentData?.status !== "Completed" &&
                                      !!selectedMethod?.instructions
                                        ? 1
                                        : 0,
                                  },
                                ]}
                              >
                                <View style={styles.paymentTableLabelWrap}>
                                  <Text style={styles.paymentTableLabel}>
                                    {__(
                                      "paymentMethodScreen.payment.status",
                                      appSettings.lng
                                    )}
                                  </Text>
                                </View>
                                <View style={styles.paymentTableValueWrap}>
                                  <Text style={styles.paymentTableValue}>
                                    {paymentData.status}
                                  </Text>
                                </View>
                              </View>
                            )}
                            {paymentData?.status !== "Completed" &&
                              !!selectedMethod?.instructions && (
                                <View
                                  style={[
                                    styles.paymentTableRow,
                                    {
                                      borderBottomWidth: 0,
                                    },
                                  ]}
                                >
                                  <View
                                    style={[
                                      styles.paymentTableLabelWrap,
                                      { justifyContent: "flex-start" },
                                    ]}
                                  >
                                    <Text style={styles.paymentTableLabel}>
                                      {__(
                                        "paymentMethodScreen.payment.instructions",
                                        appSettings.lng
                                      )}
                                    </Text>
                                  </View>
                                  <View style={styles.paymentTableValueWrap}>
                                    <Text style={styles.paymentTableValue}>
                                      {decodeString(
                                        selectedMethod.instructions
                                      )}
                                    </Text>
                                  </View>
                                </View>
                              )}
                          </View>
                        )}
                        {!!paymentData?.plan && (
                          <View style={styles.planTableWrap}>
                            <View
                              style={{
                                paddingHorizontal: 15,
                                paddingVertical: ios ? 10 : 7,
                                backgroundColor: COLORS.bg_primary,
                                borderTopLeftRadius: 10,
                                borderTopRightRadius: 10,
                              }}
                            >
                              <Text
                                style={[
                                  styles.paymentTableValue,
                                  { color: COLORS.primary },
                                  rtlTextA,
                                ]}
                              >
                                {__(
                                  "paymentMethodScreen.plan.details",
                                  appSettings.lng
                                )}
                              </Text>
                            </View>

                            {!!paymentData?.plan?.title && (
                              <View style={styles.paymentTableRow}>
                                <View style={styles.paymentTableLabelWrap}>
                                  <Text style={styles.paymentTableLabel}>
                                    {__(
                                      "paymentMethodScreen.plan.pricingOption",
                                      appSettings.lng
                                    )}
                                  </Text>
                                </View>
                                <View style={styles.paymentTableValueWrap}>
                                  <Text style={styles.paymentTableValue}>
                                    {decodeString(paymentData.plan.title)}
                                  </Text>
                                </View>
                              </View>
                            )}
                            {!!paymentData?.plan?.visible && (
                              <View style={styles.paymentTableRow}>
                                <View style={styles.paymentTableLabelWrap}>
                                  <Text style={styles.paymentTableLabel}>
                                    {__(
                                      "paymentMethodScreen.plan.duration",
                                      appSettings.lng
                                    )}
                                  </Text>
                                </View>
                                <View style={styles.paymentTableValueWrap}>
                                  <Text style={styles.paymentTableValue}>
                                    {paymentData.plan.visible}
                                  </Text>
                                </View>
                              </View>
                            )}
                            {!!paymentData?.plan?.price && (
                              <View
                                style={{
                                  flexDirection: "row",
                                  paddingHorizontal: 10,
                                }}
                              >
                                <View style={styles.paymentTableLabelWrap}>
                                  <Text style={styles.paymentTableLabel}>
                                    {__(
                                      "paymentMethodScreen.plan.amount",
                                      appSettings.lng
                                    )}
                                  </Text>
                                </View>
                                <View style={styles.paymentTableValueWrap}>
                                  <Text style={styles.paymentTableValue}>
                                    {getPrice(config.payment_currency, {
                                      pricing_type: "price",
                                      price_type: "fixed",
                                      price: paymentData.plan.price,
                                      max_price: 0,
                                    })}
                                  </Text>
                                </View>
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    </ScrollView>
                  )}

                  <View style={styles.buttonWrap}>
                    <TouchableOpacity
                      style={[
                        styles.showMoreButton,
                        {
                          backgroundColor: COLORS.button.active,
                        },
                      ]}
                      onPress={handlePaymentSumaryDismiss}
                    >
                      <Text style={styles.showMoreButtonText} numberOfLines={1}>
                        {__(
                          !!paymentError
                            ? "paymentMethodScreen.closeButton"
                            : "paymentMethodScreen.goToAccountButton",
                          appSettings.lng
                        )}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}
        </SafeAreaView>
      </Modal>
      <Modal visible={couponLoading} statusBarTranslucent transparent={true}>
        <View style={styles.loadingOverlay} />
        <View style={styles.couponLoadingWrap}>
          <ActivityIndicator size={"large"} color={COLORS.primary} />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  buttonWrap: {
    backgroundColor: "transparent",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 15,
  },
  container: { flex: 1, backgroundColor: "#F8F8F8" },
  couponApply: {
    color: COLORS.white,
    fontWeight: "bold",
  },
  couponApplyBtn: {
    paddingHorizontal: 15,
    minHeight: 32,
    justifyContent: "center",
    borderRadius: 3,
  },
  couponError: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.red,
  },
  couponErrorWrap: {
    alignItems: "center",
    paddingTop: 5,
  },
  couponField: {
    minHeight: 32,
    borderColor: COLORS.border_light,
    borderWidth: 1,
    paddingHorizontal: 5,
    textAlignVertical: "center",
    borderRadius: 3,
    color: COLORS.text_gray,
  },
  couponFieldWrap: {
    flex: 1,
    marginVertical: 5,
  },
  couponLoadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  couponRowWrap: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  loadingOverlay: {
    flex: 1,
    width: "100%",
    backgroundColor: COLORS.bg_light,
    opacity: 0.3,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingWrap: {
    width: "100%",
    marginVertical: 50,
  },
  iconWrap: {
    marginLeft: 5,
    marginTop: 2,
  },

  modalInnerWrap: {
    backgroundColor: COLORS.bg_light,
    flex: 1,
    // padding: 15,
  },
  paymentDetailHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  paymentDetailHeaderWrap: {
    paddingHorizontal: "5%",
    backgroundColor: COLORS.bg_primary,
    paddingVertical: 10,
    marginBottom: 12,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  paymentDetailWrap: {
    backgroundColor: COLORS.white,
    marginHorizontal: "3%",
    paddingBottom: "3%",
    borderRadius: 10,
    elevation: 5,
    shadowColor: COLORS.grey,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {
      height: 0,
      width: 0,
    },
  },
  paymentError: {
    fontSize: 15,
    color: COLORS.red,
    fontWeight: "bold",
  },
  paymentErrorWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 75,
  },
  paymentHeaderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  paymentLoadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentMethodsWrap: {},
  paymentSectionWrap: {
    backgroundColor: COLORS.white,
    marginHorizontal: "3%",
    borderRadius: 10,
    elevation: 5,
    shadowColor: COLORS.gray,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },
  paymentSectionTitle: {
    backgroundColor: COLORS.bg_primary,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: "5%",
  },
  paymentTableHeaderWrap: {
    backgroundColor: COLORS.bg_primary,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  paymentTableLabel: {
    fontWeight: "bold",
    color: COLORS.text_gray,
  },
  paymentTableLabelWrap: {
    justifyContent: "center",
    flex: 2,
    paddingVertical: Platform.OS === "ios" ? 10 : 7,
    paddingHorizontal: 5,
  },
  paymentTableRow: {
    flexDirection: "row",

    borderBottomWidth: 1,
    borderBottomColor: COLORS.border_light,
    paddingHorizontal: 10,
  },
  paymentTableValue: {
    fontWeight: "bold",
    color: COLORS.text_gray,
  },
  paymentTableValueWrap: {
    justifyContent: "center",
    flex: 2.5,
    paddingHorizontal: 5,
    paddingVertical: Platform.OS === "ios" ? 10 : 7,
  },
  paymentTableWrap: {
    elevation: 5,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginHorizontal: 15,
    shadowColor: COLORS.black,
    shadowOpacity: 0.3,
    shadowOffset: {
      height: 3,
      width: 3,
    },
    shadowRadius: 5,
    marginTop: 20,
  },
  planTableWrap: {
    marginTop: 30,
    elevation: 5,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginHorizontal: 15,
    shadowColor: COLORS.black,
    shadowOpacity: 0.3,
    shadowOffset: {
      height: 3,
      width: 3,
    },
    shadowRadius: 5,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceRowLabel: {
    fontWeight: "bold",
    color: COLORS.text_gray,
  },
  priceRowValue: {
    fontWeight: "bold",
    color: COLORS.text_gray,
  },
  selectedLabelText: {
    fontWeight: "bold",
    color: COLORS.text_gray,
  },
  selectedPackageNameText: {
    fontWeight: "bold",
    color: COLORS.text_gray,
    textAlign: "right",
  },
  selectedPackageWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  separator: {
    backgroundColor: COLORS.border_light,
    height: 0.5,
    width: "100%",
    marginVertical: 15,
  },
  showMoreButton: {
    borderRadius: 3,
    marginVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOpacity: 0.3,
    shadowOffset: {
      height: 3,
      width: 3,
    },
    shadowRadius: 5,
  },
  showMoreButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
  },
});

export default PaymentMethodScreen;
