import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  ActivityIndicator,
} from "react-native";

// Vector Icons
import {
  FontAwesome5,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome,
} from "@expo/vector-icons";

import * as Localization from "expo-localization";

// Custom Components & Functions
import AppSeparator from "../components/AppSeparator";
import { COLORS } from "../variables/color";
import authStorage from "../app/auth/authStorage";
import { useStateValue } from "../StateProvider";
import { getRelativeTimeConfig, __ } from "../language/stringPicker";
import settingsStorage from "../app/settings/settingsStorage";
import api, { removeAuthToken, setAuthToken, setLocale } from "../api/client";
import rtlSupoortedLng from "../language/rtlSupoortedLng.json";
import { listViewConfig } from "../app/services/listViewConfig";
import ListPicker from "../components/ListPicker";
import { routes } from "../navigation/routes";
import moment from "moment";
import "moment/locale/en-gb";
const languages = require("../language/languages.json");

const SettingsScreen = ({ navigation }) => {
  const [
    { user, appSettings, config, rtl_support, push_token, auth_token, ios },
    dispatch,
  ] = useStateValue();
  const [notification, setNotifiaction] = useState(appSettings.notifications);
  const [loggingOut, setLoggingOut] = useState(false);
  const [langArr, setLangArr] = useState([]);
  const [langloading, setLangLoading] = useState(true);
  const [langPicker, setLangPicker] = useState(false);
  const [deviceLocale, setDeviceLocale] = useState(
    Localization.locale.slice(0, 2)
  );

  useEffect(() => {
    if (Object.keys(languages).length > 1) {
      let tempLangArr = [];
      Object.keys(languages).map(
        (_key, ind) => (tempLangArr[ind] = { id: _key, name: languages[_key] })
      );
      setLangArr([...tempLangArr]);
      setLangLoading(false);
    }
  }, []);

  const handleLanguageChange = (language) => {
    if (appSettings.lng === language.id) {
      setLangPicker(false);
      return true;
    }
    setLoggingOut(true);
    setLocale(language.id);
    const tempSettings = {
      ...appSettings,
      lng: language.id,
    };

    dispatch({
      type: "SET_SETTINGS",
      appSettings: tempSettings,
    });

    if (!rtl_support) {
      if (
        rtlSupoortedLng.includes(language.id) &&
        !rtlSupoortedLng.includes(deviceLocale)
      ) {
        dispatch({
          type: "SET_RTL_SUPPORT",
          rtl_support: true,
        });
      }
    } else {
      if (!rtlSupoortedLng.includes(language.id)) {
        dispatch({
          type: "SET_RTL_SUPPORT",
          rtl_support: false,
        });
      }
    }

    settingsStorage.storeAppSettings(JSON.stringify(tempSettings));
    const timeConfig = getRelativeTimeConfig(appSettings.lng);
    moment.updateLocale("en-gb", {
      relativeTime: timeConfig,
    });
    setLangPicker(false);
    setTimeout(() => {
      navigation.replace(routes.drawerNavigator);
    }, 1000);
  };

  const toggleSwitch = (type) => {
    setLoggingOut(true);
    const temparr = notification?.includes(type)
      ? [...notification.filter((_noti) => _noti !== type)]
      : [...notification, type];
    setNotifiaction(temparr);

    const tempSettings = {
      ...appSettings,
      notifications: [...temparr],
    };

    dispatch({
      type: "SET_SETTINGS",
      appSettings: tempSettings,
    });
    settingsStorage.storeAppSettings(JSON.stringify(tempSettings));
    handlePushRegister(temparr);
  };

  const handlePushRegister = (data) => {
    if (user) {
      setAuthToken(auth_token);
    }
    let nCon = [];
    if (data?.length) {
      data.map((_item) => {
        if (config.pn_events.includes(_item)) {
          nCon.push(_item);
        }
      });
    }

    api
      .post("push-notification/add-device", {
        push_token: push_token,
        events: nCon,
      })
      .then((res) => {
        if (!res?.ok) {
          console.log(
            __("alerts.notificationRegistrationFail", appSettings.lng),
            res.data
          );
        }
      })
      .then(() => {
        if (user) {
          removeAuthToken();
        }
        setLoggingOut(false);
      });
  };

  const rtlText = rtl_support && {
    writingDirection: "rtl",
  };
  const rtlView = rtl_support && {
    flexDirection: "row-reverse",
  };

  const rtlTextA = rtl_support && {
    writingDirection: "rtl",
    textAlign: "right",
  };

  const handleLogout = () => {
    setLoggingOut(true);
    if (user) {
      setAuthToken(auth_token);
    }
    api
      .post("logout", { push_token: push_token })
      .then((res) => {
        dispatch({
          type: "SET_AUTH_DATA",
          data: {
            user: null,
            auth_token: null,
          },
        });
        authStorage.removeUser();
        // if (res?.ok) {
        //   dispatch({
        //     type: "SET_AUTH_DATA",
        //     data: {
        //       user: null,
        //       auth_token: null,
        //     },
        //   });
        //   authStorage.removeUser();
        // } else {
        //   Alert.alert(
        //     "Logout failed!",
        //     res?.data?.error_message || res?.data?.error || res?.problem,
        //     [{ text: "Ok" }]
        //   );
        // }
      })
      .then(() => {
        removeAuthToken();
        setLoggingOut(false);
      });
  };

  const toggleView = (val) => {
    setLoggingOut(true);

    const tempSettings = {
      ...appSettings,
      listView: !val,
    };
    dispatch({
      type: "SET_SETTINGS",
      appSettings: tempSettings,
    });
    settingsStorage.storeAppSettings(JSON.stringify(tempSettings));
    setTimeout(() => {
      setLoggingOut(false);
    }, 1000);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={{ paddingBottom: 30 }}>
        <View style={styles.contentWrapper}>
          {/* Language Setting */}
          {Object.keys(languages).length > 1 && (
            <View
              style={[
                styles.notiWrapper,
                {
                  flexDirection: rtl_support ? "row-reverse" : "row",
                  alignItems: "center",
                },
              ]}
            >
              <View
                style={{
                  flex: 1,
                  alignItems: rtl_support ? "flex-end" : "flex-start",
                }}
              >
                <Text
                  style={[
                    {
                      fontSize: 20,
                      color: COLORS.text_dark,
                      paddingHorizontal: 5,
                    },
                    rtlText,
                  ]}
                >
                  {__("settingsScreenTexts.languageTitle", appSettings.lng)}
                </Text>
              </View>
              {langloading ? (
                <View style={{ flex: 1 }}>
                  <ActivityIndicator size={"small"} color={COLORS.primary} />
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginVertical: 15,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      borderRadius: 5,
                      // borderWidth: 1,
                      // borderColor: COLORS.border_light,
                      paddingHorizontal: 15,
                      paddingVertical: 8,
                      flexDirection: rtl_support ? "row-reverse" : "row",
                      alignItems: "center",
                      backgroundColor: COLORS.white,
                    }}
                    onPress={() => setLangPicker(true)}
                  >
                    <Text style={{ paddingHorizontal: 5 }}>
                      {languages[appSettings.lng]}
                    </Text>
                    <View style={{ paddingHorizontal: 5 }}>
                      <FontAwesome
                        name="caret-down"
                        size={15}
                        color={COLORS.gray}
                      />
                    </View>
                  </TouchableOpacity>
                  <ListPicker
                    pickerVisible={langPicker}
                    data={langArr}
                    onClick={handleLanguageChange}
                    overlayClick={() => setLangPicker(false)}
                    selected={appSettings?.lng || null}
                    pickerLabel={__(
                      "settingsScreenTexts.languageTitle",
                      appSettings.lng
                    )}
                  />
                </View>
              )}
            </View>
          )}

          {!!config?.pn_events?.length && (
            <View style={styles.notificationSection}>
              <View style={styles.notiWrapper}>
                <View
                  style={{
                    flexDirection: rtl_support ? "row-reverse" : "row",
                    alignItems: "center",
                    justifyContent: rtl_support ? "flex-end" : "flex-start",
                  }}
                >
                  <View>
                    <MaterialCommunityIcons
                      name="bell-ring"
                      size={20}
                      color={COLORS.primary}
                    />
                  </View>
                  <Text style={[styles.notiTitle, rtlTextA]}>
                    {__(
                      "settingsScreenTexts.notificationTitle",
                      appSettings.lng
                    )}
                  </Text>
                </View>
                <AppSeparator style={styles.separator} />
                {config?.pn_events?.includes("news_letter") && (
                  <View
                    style={[
                      styles.notiSetWrap,
                      { paddingVertical: ios ? 7 : 0 },
                      rtlView,
                    ]}
                  >
                    <View style={styles.notisetTtlWrap}>
                      <Text style={[styles.notisetTtl, rtlTextA]}>
                        {__(
                          "settingsScreenTexts.newsletterNotiTitle",
                          appSettings.lng
                        )}
                      </Text>
                    </View>
                    <View style={styles.notiSetBtnWrap}>
                      <Switch
                        trackColor={{
                          false: COLORS.gray,
                          true: COLORS.primary,
                        }}
                        thumbColor={COLORS.white}
                        onValueChange={() => toggleSwitch("news_letter")}
                        value={notification.includes("news_letter")}
                      />
                    </View>
                  </View>
                )}
                {config?.pn_events?.includes("listing_approved") && (
                  <View
                    style={[
                      styles.notiSetWrap,
                      { paddingVertical: ios ? 7 : 0 },
                      rtlView,
                    ]}
                  >
                    <View style={styles.notisetTtlWrap}>
                      <Text style={[styles.notisetTtl, rtlTextA]}>
                        {__(
                          "settingsScreenTexts.ListingApprovalNotiTitle",
                          appSettings.lng
                        )}
                      </Text>
                    </View>
                    <View style={styles.notiSetBtnWrap}>
                      <Switch
                        trackColor={{
                          false: COLORS.gray,
                          true: COLORS.primary,
                        }}
                        thumbColor={COLORS.white}
                        onValueChange={() => toggleSwitch("listing_approved")}
                        value={notification.includes("listing_approved")}
                      />
                    </View>
                  </View>
                )}
                {config?.pn_events?.includes("chat") && (
                  <View
                    style={[
                      styles.notiSetWrap,
                      { paddingVertical: ios ? 7 : 0 },
                      rtlView,
                    ]}
                  >
                    <View style={styles.notisetTtlWrap}>
                      <Text style={[styles.notisetTtl, rtlTextA]}>
                        {__(
                          "settingsScreenTexts.messageNotiTitle",
                          appSettings.lng
                        )}
                      </Text>
                    </View>
                    <View style={styles.notiSetBtnWrap}>
                      <Switch
                        trackColor={{
                          false: COLORS.gray,
                          true: COLORS.primary,
                        }}
                        thumbColor={COLORS.white}
                        onValueChange={() => toggleSwitch("chat")}
                        value={notification.includes("chat")}
                      />
                    </View>
                  </View>
                )}

                {config?.pn_events?.includes("listing_expired") && (
                  <View
                    style={[
                      styles.notiSetWrap,
                      { paddingVertical: ios ? 7 : 0 },
                      rtlView,
                    ]}
                  >
                    <View style={styles.notisetTtlWrap}>
                      <Text style={[styles.notisetTtl, rtlTextA]}>
                        {__(
                          "settingsScreenTexts.expiredListingNotification",
                          appSettings.lng
                        )}
                      </Text>
                    </View>
                    <View style={styles.notiSetBtnWrap}>
                      <Switch
                        trackColor={{
                          false: COLORS.gray,
                          true: COLORS.primary,
                        }}
                        thumbColor={COLORS.white}
                        onValueChange={() => toggleSwitch("listing_expired")}
                        value={notification.includes("listing_expired")}
                      />
                    </View>
                  </View>
                )}
                {!!user?.isAdmin && (
                  <>
                    {config?.pn_events?.includes("listing_created") && (
                      <View
                        style={[
                          styles.notiSetWrap,
                          { paddingVertical: ios ? 7 : 0 },
                          rtlView,
                        ]}
                      >
                        <View style={styles.notisetTtlWrap}>
                          <Text style={[styles.notisetTtl, rtlTextA]}>
                            {__(
                              "settingsScreenTexts.onlyAdmin.newListing",
                              appSettings.lng
                            )}
                          </Text>
                        </View>
                        <View style={styles.notiSetBtnWrap}>
                          <Switch
                            trackColor={{
                              false: COLORS.gray,
                              true: COLORS.primary,
                            }}
                            thumbColor={COLORS.white}
                            onValueChange={() =>
                              toggleSwitch("listing_created")
                            }
                            value={notification.includes("listing_created")}
                          />
                        </View>
                      </View>
                    )}
                    {config?.pn_events?.includes("order_created") && (
                      <View
                        style={[
                          styles.notiSetWrap,
                          { paddingVertical: ios ? 7 : 0 },
                          rtlView,
                        ]}
                      >
                        <View style={styles.notisetTtlWrap}>
                          <Text style={[styles.notisetTtl, rtlTextA]}>
                            {__(
                              "settingsScreenTexts.onlyAdmin.newOrder",
                              appSettings.lng
                            )}
                          </Text>
                        </View>
                        <View style={styles.notiSetBtnWrap}>
                          <Switch
                            trackColor={{
                              false: COLORS.gray,
                              true: COLORS.primary,
                            }}
                            thumbColor={COLORS.white}
                            onValueChange={() => toggleSwitch("order_created")}
                            value={notification.includes("order_created")}
                          />
                        </View>
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>
          )}

          {listViewConfig?.enableUserControl && (
            <View style={styles.notificationSection}>
              <View style={[styles.notiWrapper]}>
                <View
                  style={{
                    flexDirection: rtl_support ? "row-reverse" : "row",
                    alignItems: "center",
                    justifyContent: rtl_support ? "flex-end" : "flex-start",
                  }}
                >
                  <View>
                    <MaterialIcons
                      name="featured-play-list"
                      size={20}
                      color={COLORS.primary}
                    />
                  </View>
                  <Text
                    style={[
                      { paddingHorizontal: 5 },
                      styles.notiTitle,
                      rtlTextA,
                    ]}
                  >
                    {__("settingsScreenTexts.viewStyleTitle", appSettings.lng)}
                  </Text>
                </View>
                <AppSeparator style={styles.separator} />
                <View
                  style={[
                    styles.notiSetWrap,
                    { paddingVertical: ios ? 7 : 0 },
                    rtlView,
                  ]}
                >
                  <View style={styles.notisetTtlWrap}>
                    <Text style={[styles.notisetTtl, rtlTextA]}>
                      {__("settingsScreenTexts.listView", appSettings.lng)}
                    </Text>
                  </View>
                  <View style={styles.notiSetBtnWrap}>
                    <Switch
                      trackColor={{
                        false: COLORS.gray,
                        true: COLORS.primary,
                      }}
                      thumbColor={COLORS.white}
                      onValueChange={() => toggleView(appSettings.listView)}
                      value={appSettings.listView}
                    />
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        {user && (
          <View style={[styles.contentWrapper, { paddingHorizontal: "3%" }]}>
            <TouchableOpacity
              style={[styles.logOutWrap, rtlView]}
              onPress={handleLogout}
            >
              <FontAwesome5 name="power-off" size={16} color="#F65D71" />
              <Text
                style={[
                  styles.logOutTitle,
                  rtlText,
                  { paddingEnd: rtl_support ? 10 : 0, color: "#F65D71" },
                ]}
              >
                {__("settingsScreenTexts.logoutbuttonTitle", appSettings.lng)}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <Modal animationType="slide" transparent={true} visible={loggingOut}>
        <View
          style={{
            flex: 1,
            backgroundColor: COLORS.black,
            opacity: 0.3,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  btnCommon: {
    width: "50%",
    paddingVertical: 9,
    borderRadius: 0,
  },
  btninActive: {
    backgroundColor: COLORS.white,
  },
  btnTextinActive: {
    color: COLORS.text_gray,
  },
  btnTextCommon: {
    color: COLORS.white,
  },
  changeDetailTitle: {
    padding: "3%",
    fontWeight: "bold",
  },
  changePassTitle: {
    padding: "3%",
    fontWeight: "bold",
  },

  container: {
    backgroundColor: "#f8f8f8",
  },
  contentWrapper: {},

  form: {
    paddingHorizontal: "3%",
    paddingTop: 10,
    paddingBottom: 20,
  },

  formSeparator: {
    backgroundColor: COLORS.gray,
    width: "100%",
    marginBottom: 10,
  },
  label: {
    color: COLORS.text_gray,
  },
  languageTitle: {
    fontSize: 20,
  },
  languageTitle2: {
    padding: "3%",
    fontWeight: "bold",
  },
  langButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  languageSupport: {
    padding: "3%",
  },
  languageSupport2: {
    paddingBottom: 10,
  },
  logOutWrap: {
    flexDirection: "row",
    paddingHorizontal: "5%",
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: COLORS.white,
    justifyContent: "center",
    borderRadius: 5,
  },
  logOutTitle: {
    fontWeight: "bold",
    paddingLeft: 10,
    fontSize: 16,
  },
  notiSetBtnWrap: {
    flex: 1.5,
  },
  notisetTtl: { fontSize: 16, color: COLORS.text_medium },
  notisetTtlWrap: {
    flex: 3.5,
  },
  notiSetWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  notiSetBtnWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  notiTitle: {
    fontSize: 20,
    color: COLORS.primary,
    paddingHorizontal: 5,
  },
  notiWrapper: {
    padding: "3%",
  },
  pickerWrap: {
    paddingHorizontal: "1%",
    paddingTop: 10,
  },
  screenTitle: {
    padding: "3%",
    fontWeight: "bold",
  },

  separator: {
    width: "100%",
    backgroundColor: COLORS.separator_light,
    marginVertical: 10,
  },
  toggleSwitch: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  updateButton: {
    width: "100%",
    borderRadius: 0,
    paddingVertical: 10,
  },
});

export default SettingsScreen;
