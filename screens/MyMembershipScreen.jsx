import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { COLORS } from "../variables/color";
import AppSeparator from "../components/AppSeparator";
import { useStateValue } from "../StateProvider";
import { __ } from "../language/stringPicker";
import { routes } from "../navigation/routes";
import { AntDesign } from "@expo/vector-icons";
import api, { removeAuthToken, setAuthToken } from "../api/client";

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");
const MyMembershipScreen = ({ navigation }) => {
  const [{ appSettings, auth_token, config, rtl_support }] = useStateValue();

  const [loading, setLoading] = useState(true);
  const [tempUser, setTempUser] = useState();

  useEffect(() => {
    getMyMembershipStatus();
  }, []);

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
  const getMyMembershipStatus = () => {
    setAuthToken(auth_token);
    api
      .get("my")
      .then((res) => {
        if (res.ok) {
          setTempUser(res?.data);
        } else {
          // TODO handle error
        }
      })
      .then(() => {
        removeAuthToken();
        setLoading(false);
      });
  };

  const getUser = (tempUser) => {
    if (!tempUser) return null;
    if (tempUser.first_name) {
      return tempUser.first_name + " " + tempUser.last_name;
    }
    return tempUser.username;
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ width: "100%" }}>
          <View
            style={tempUser?.membership ? styles.mainWrap_2 : styles.mainWrap}
          >
            {tempUser?.membership ? (
              <View style={styles.membershipDetailWrap}>
                <View
                  style={[
                    styles.memberInfoWrap,
                    { alignItems: rtl_support ? "flex-end" : "flex-start" },
                  ]}
                >
                  <View style={styles.nameWrap}>
                    <Text style={[styles.name, rtlText]}>
                      {getUser(tempUser)}
                    </Text>
                  </View>
                  {rtl_support ? (
                    <View style={styles.emailWrap}>
                      <Text style={styles.emailLabel}>
                        {tempUser.email}
                        <Text style={{ fontWeight: "bold" }}>
                          {__(
                            "myMembershipScreenTexts.emailLabel",
                            appSettings.lng
                          )}{" "}
                        </Text>
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.emailWrap}>
                      <Text style={[styles.emailLabel, { fontWeight: "bold" }]}>
                        {__(
                          "myMembershipScreenTexts.emailLabel",
                          appSettings.lng
                        )}{" "}
                        <Text style={{ fontWeight: "normal" }}>
                          {tempUser.email}
                        </Text>
                      </Text>
                    </View>
                  )}
                </View>
                <AppSeparator style={styles.separator} />
                <View style={styles.membershipReportWrap}>
                  <View
                    style={[
                      styles.reportHeaderWrap,
                      { alignItems: rtl_support ? "flex-end" : "flex-start" },
                    ]}
                  >
                    <View
                      style={{
                        backgroundColor: COLORS.bg_primary,
                        paddingVertical: 5,
                        paddingHorizontal: 10,
                        borderRadius: 3,
                        marginVertical: 5,
                      }}
                    >
                      <Text style={[styles.reportHeader, rtlText]}>
                        {__(
                          "myMembershipScreenTexts.membershipDetailHeader",
                          appSettings.lng
                        )}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.reportRow, rtlView]}>
                    <View
                      style={[
                        styles.reportLeft,
                        { alignItems: rtl_support ? "flex-end" : "flex-start" },
                      ]}
                    >
                      <Text style={[styles.reportLabel, rtlTextA]}>
                        {__(
                          "myMembershipScreenTexts.membershipStatusLabel",
                          appSettings.lng
                        )}
                      </Text>
                    </View>
                    <View style={styles.reportRight}>
                      <Text style={[styles.reportValue, rtlTextA]}>
                        {__(
                          tempUser?.membership?.is_expired
                            ? "myMembershipScreenTexts.expired"
                            : "myMembershipScreenTexts.active",
                          appSettings.lng
                        )}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.reportRow, rtlView]}>
                    <View
                      style={[
                        styles.reportLeft,
                        { alignItems: rtl_support ? "flex-end" : "flex-start" },
                      ]}
                    >
                      <Text style={[styles.reportLabel, rtlTextA]}>
                        {__(
                          "myMembershipScreenTexts.membershipValidityLabel",
                          appSettings.lng
                        )}
                      </Text>
                    </View>
                    <View style={styles.reportRight}>
                      <Text style={[styles.reportValue, rtlTextA]}>
                        {__(
                          tempUser?.membership?.is_expired
                            ? "myMembershipScreenTexts.expiredOn"
                            : "myMembershipScreenTexts.till",
                          appSettings.lng
                        )}{" "}
                        {tempUser?.membership?.expired_at}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.reportRow, rtlView]}>
                    <View
                      style={[
                        styles.reportLeft,
                        { alignItems: rtl_support ? "flex-end" : "flex-start" },
                      ]}
                    >
                      <Text style={[styles.reportLabel, rtlTextA]}>
                        {__(
                          "myMembershipScreenTexts.remainingAdsLabel",
                          appSettings.lng
                        )}
                      </Text>
                    </View>
                    <View style={styles.reportRight}>
                      <Text style={[styles.reportValue, rtlTextA]}>
                        {tempUser?.membership?.remaining_ads}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.reportRow,
                      { borderBottomWidth: 0 },
                      rtlView,
                    ]}
                  >
                    <View
                      style={[
                        styles.reportLeft,
                        { alignItems: rtl_support ? "flex-end" : "flex-start" },
                      ]}
                    >
                      <Text style={[styles.reportLabel, rtlTextA]}>
                        {__(
                          "myMembershipScreenTexts.postedAdsLabel",
                          appSettings.lng
                        )}
                      </Text>
                    </View>
                    <View style={styles.reportRight}>
                      <Text style={[styles.reportValue, rtlTextA]}>
                        {tempUser?.membership?.posted_ads}
                      </Text>
                    </View>
                  </View>
                  {tempUser?.membership?.promotions && (
                    <View style={styles.promotionsWrap}>
                      <View style={[styles.promotionHeaderRow, rtlView]}>
                        <View style={styles.promotionHeaderContent}>
                          <Text style={styles.promotionHeaderText}>
                            {__(
                              "myMembershipScreenTexts.promotions",
                              appSettings.lng
                            )}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.promotionHeaderContent,
                            {
                              borderColor: COLORS.border_light,
                              borderLeftWidth: 1,
                              borderRightWidth: 1,
                            },
                          ]}
                        >
                          <Text style={styles.promotionHeaderText}>
                            {__(
                              "myMembershipScreenTexts.remainingAdsTableLabel",
                              appSettings.lng
                            )}
                          </Text>
                        </View>
                        <View style={styles.promotionHeaderContent}>
                          {rtl_support ? (
                            <Text
                              style={styles.promotionHeaderText}
                              numberOfLines={1}
                            >
                              (
                              {__(
                                "myMembershipScreenTexts.validityUnit",
                                appSettings.lng
                              )}
                              ){" "}
                              {__(
                                "myMembershipScreenTexts.membershipValidityTableLabel",
                                appSettings.lng
                              )}
                            </Text>
                          ) : (
                            <Text
                              style={styles.promotionHeaderText}
                              numberOfLines={1}
                            >
                              {__(
                                "myMembershipScreenTexts.membershipValidityTableLabel",
                                appSettings.lng
                              )}{" "}
                              (
                              {__(
                                "myMembershipScreenTexts.validityUnit",
                                appSettings.lng
                              )}
                              )
                            </Text>
                          )}
                        </View>
                      </View>
                      {!!tempUser?.membership?.promotions &&
                        Object.keys(tempUser.membership.promotions).map(
                          (promo, index, arr) => (
                            <View
                              style={[
                                styles.promotionRow,
                                {
                                  borderBottomWidth:
                                    arr.length - 1 === index ? 0 : 1,
                                },
                                rtlView,
                              ]}
                              key={index}
                            >
                              <View
                                style={[
                                  styles.promotionLabelWrap,
                                  styles.promotionContent,
                                ]}
                              >
                                <Text
                                  style={styles.promotionLabel}
                                  numberOfLines={1}
                                >
                                  {config?.promotions[promo] || promo}
                                </Text>
                              </View>
                              <View
                                style={[
                                  styles.promotionValueWrap,
                                  styles.promotionContent,
                                ]}
                              >
                                <Text
                                  style={styles.promotionValue}
                                  numberOfLines={1}
                                >
                                  {tempUser.membership.promotions[promo].ads}
                                </Text>
                              </View>
                              <View
                                style={[
                                  styles.promotionDurationWrap,
                                  styles.promotionContent,
                                ]}
                              >
                                <Text
                                  style={styles.promotionDuration}
                                  numberOfLines={1}
                                >
                                  {
                                    tempUser.membership.promotions[promo]
                                      .validate
                                  }
                                </Text>
                              </View>
                            </View>
                          )
                        )}
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.noMembershipWrap}>
                <View style={styles.bgImgWrap}>
                  <Image
                    source={require("../assets/membership_bg.png")}
                    style={styles.bgImg}
                  />
                </View>
                <View style={styles.titleWrap}>
                  <Text style={[styles.title, rtlText]}>
                    {__("myMembershipScreenTexts.title", appSettings.lng)}
                  </Text>
                </View>
                <View style={styles.membershipTextWrap}>
                  <Text style={[styles.membershipText, rtlText]}>
                    {__(
                      "myMembershipScreenTexts.membershipText",
                      appSettings.lng
                    )}
                  </Text>
                </View>
              </View>
            )}
          </View>
          <View style={styles.buttonWrap}>
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={() =>
                navigation.navigate(routes.membershipsScreen, {
                  isMember: tempUser?.membership ? true : false,
                })
              }
            >
              <Text
                style={[styles.showMoreButtonText, rtlText]}
                numberOfLines={1}
              >
                {__(
                  tempUser?.membership
                    ? "myMembershipScreenTexts.upgradeMembershipPackageButtonTitle"
                    : "myMembershipScreenTexts.showMembershipPackageButtonTitle",
                  appSettings.lng
                )}
              </Text>
              <View style={styles.iconWrap}>
                <AntDesign name="arrowright" size={18} color={COLORS.white} />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bgImg: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  bgImgWrap: {
    width: screenWidth * 0.5,
    height: screenWidth * 0.5 * 0.85,
    marginBottom: screenHeight * 0.03,
  },
  button: {
    width: "100%",
    paddingVertical: 6,
    borderRadius: 3,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "500",
  },
  buttonWrap: {
    marginHorizontal: "8%",
  },
  container: {
    backgroundColor: "#F8F8F8",
    flex: 1,
  },
  email: {
    fontSize: 14,
    fontWeight: "normal",
    color: COLORS.text_dark,
  },
  emailLabel: {
    color: COLORS.text_gray,
  },
  iconWrap: {
    marginLeft: 5,
    marginTop: 2,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mainWrap: {
    paddingHorizontal: "4%",
    paddingTop: screenHeight * 0.1,
  },
  mainWrap_2: {
    paddingHorizontal: "4%",
    paddingVertical: "4%",
    backgroundColor: COLORS.white,
    borderRadius: 5,
    elevation: 5,
    margin: "4%",
    shadowColor: COLORS.black,
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 5,
  },
  membershipDetailWrap: {
    width: "100%",
  },
  membershipText: {
    fontSize: 16,
    color: COLORS.text_gray,
    marginBottom: 5,
    lineHeight: 22,
    textAlign: "center",
  },
  membershipTextWrap: {
    alignItems: "center",
    paddingVertical: 10,
  },
  name: {
    fontWeight: "bold",
    color: COLORS.text_dark,
    fontSize: 16,
  },
  nameWrap: {
    marginBottom: 5,
  },
  noMembershipWrap: {
    alignItems: "center",
  },
  promotionContent: {
    flex: 1,
    padding: 5,
    alignItems: "center",
  },
  promotionDuration: {
    fontWeight: "bold",
  },
  promotionHeaderContent: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 5,
    backgroundColor: COLORS.bg_dark,
  },
  promotionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border_light,
  },
  promotionHeaderText: {
    fontWeight: "bold",
    color: COLORS.text_dark,
  },
  promotionLabel: {
    fontWeight: "bold",
    color: COLORS.text_dark,
  },
  promotionRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border_light,
  },
  promotionValue: {
    fontWeight: "bold",
  },
  promotionValueWrap: {
    borderColor: COLORS.border_light,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  promotionsWrap: {
    borderWidth: 1,
    borderColor: COLORS.border_light,
    marginTop: 15,
  },
  reportHeader: {
    fontWeight: "bold",
    color: COLORS.primary,
  },
  reportLabel: {
    fontWeight: "bold",
    color: COLORS.text_dark,
  },
  reportLeft: {
    flex: Platform.OS === "ios" ? 1.5 : 1.2,
  },
  reportRight: { flex: 2 },
  reportRow: {
    flexDirection: "row",
    paddingVertical: Platform.OS === "ios" ? 9 : 7,
    borderBottomWidth: 0.8,
    borderBottomColor: COLORS.border_light,
  },
  reportValue: {
    color: COLORS.text_gray,
  },
  separator: {
    width: "100%",
    marginVertical: 15,
  },
  showMoreButton: {
    backgroundColor: COLORS.button.active,
    borderRadius: 3,
    marginVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Platform.OS === "ios" ? 13 : 10,
  },
  showMoreButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
  },
  title: {
    fontSize: 20,
    color: COLORS.text_dark,
    paddingHorizontal: 10,
    fontWeight: "bold",
  },
  titleWrap: {
    alignItems: "center",
    paddingVertical: 10,
  },
});

export default MyMembershipScreen;
