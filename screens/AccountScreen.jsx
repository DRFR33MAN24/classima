import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";

// Custom Components & Constants
import TabScreenHeader from "../components/TabScreenHeader";
import { COLORS } from "../variables/color";
import Option from "../components/Option";
import AppButton from "../components/AppButton";
import authStorage from "../app/auth/authStorage";
import FlashNotification from "../components/FlashNotification";
import { useStateValue } from "../StateProvider";
import { __, getAccountOptionsData } from "../language/stringPicker";
import { routes } from "../navigation/routes";
import api, { removeAuthToken, setAuthToken } from "../api/client";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import DeleteIcon from "../components/svgComponents/DeleteIcon";
import { CommonActions } from "@react-navigation/native";

const { width: deviceWidth } = Dimensions.get("window");
const AccountScreen = ({ navigation }) => {
  const [{ user, appSettings, rtl_support, auth_token, push_token }, dispatch] =
    useStateValue();
  const [flashNotification, setFlashNotification] = useState(false);
  const [options, setOptions] = useState(
    getAccountOptionsData(appSettings.lng)
  );
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setOptions(getAccountOptionsData(appSettings.lng, !!user));
  }, [user, appSettings.lng]);

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
      })
      .then(() => {
        removeAuthToken(), setLoggingOut(false);
      });
  };

  // external event on mount
  useEffect(() => {
    dispatch({
      type: "SET_NEW_LISTING_SCREEN",
      newListingScreen: false,
    });
  }, []);

  const getUsername = () => {
    if (!!user.first_name || !!user.last_name) {
      return [user.first_name, user.last_name].join(" ");
    } else {
      return user.username;
    }
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

  const handleDeleteAccountPrompt = () => {
    Alert.alert(
      "",
      __("accountScreenTexts.deleteAccountPrompt", appSettings.lng),

      [
        {
          text: __("accountScreenTexts.cancelBtnTitle", appSettings.lng),
        },
        {
          text: __("accountScreenTexts.okBtnTitle", appSettings.lng),
          onPress: () => handleDeleteAccountFinalNotice(),
        },
      ]
    );
  };

  const handleDeleteAccountFinalNotice = () => {
    Alert.alert(
      __("accountScreenTexts.deleteAccountMessageTitle", appSettings.lng),
      __("accountScreenTexts.deleteAccountMessage", appSettings.lng),

      [
        {
          text: __("accountScreenTexts.cancelBtnTitle", appSettings.lng),
        },
        {
          text: __("accountScreenTexts.confirmBtnTitle", appSettings.lng),
          onPress: () => handleAccountDeletion(),
        },
      ]
    );
  };

  const handleAccountDeletion = () => {
    setLoggingOut(true);
    setAuthToken(auth_token);
    api
      .post("account-delete")
      .then((res) => {
        if (res?.ok) {
          dispatch({
            type: "SET_AUTH_DATA",
            data: {
              user: null,
              auth_token: null,
            },
          });
          authStorage.removeUser();
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "Tabs" }],
            })
          );
        }
      })
      .catch((err) => alert(err.message))
      .finally(setLoggingOut(false));
  };

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <View style={styles.screenHeaderWrap}>
            <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
              <View style={styles.headerBackBtnWrap}>
                <AntDesign name="arrowleft" size={20} color={COLORS.white} />
              </View>
            </TouchableWithoutFeedback>
            <View style={styles.headerTitleWrap}>
              <Text style={[styles.headerTitle, rtlText]}>
                {__("screenTitles.accountScreen", appSettings.lng)}
              </Text>
            </View>
          </View>
          <View style={styles.userImgSectionWrap}>
            <View style={styles.imageWrap}>
              {user?.pp_thumb_url ? (
                <Image
                  source={{ uri: user.pp_thumb_url }}
                  style={styles.image}
                />
              ) : (
                <FontAwesome name="user" size={20} color={COLORS.text_gray} />
              )}
            </View>
          </View>
          <View style={styles.nameSectionWrap}>
            <View style={styles.nameWrap}>
              <Text style={[styles.name, rtlText]}>
                {user?.first_name
                  ? `${user.first_name} ${user.last_name}`
                  : user.username}
              </Text>
            </View>
            <View style={styles.userTypeWrap}></View>
          </View>
          <View style={styles.optionsContainer}>
            <ScrollView>
              {options.map((item, index) => (
                <Option
                  key={item.id}
                  title={item.title}
                  onPress={() => navigation.navigate(item.routeName)}
                  uri={item.assetUri}
                  item={item}
                />
              ))}
              {user && (
                <View
                  style={[
                    styles.logOutWrap,
                    {
                      alignItems: "center",
                      paddingHorizontal: "3%",
                      paddingVertical: 20,
                      justifyContent: "space-around",
                      flexDirection: "row",
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      {
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: COLORS.primary,
                        paddingHorizontal: 15,
                        paddingVertical: 10,
                        borderRadius: 5,
                      },
                      rtlView,
                    ]}
                    onPress={() => handleLogout()}
                  >
                    <View style={{ height: 20, width: 20 }}>
                      <Image
                        source={require("../assets/log_out.png")}
                        style={{
                          height: "100%",
                          width: "100%",
                          resizeMode: "contain",
                        }}
                      />
                    </View>
                    <View style={{ paddingHorizontal: 0 }}>
                      <Text
                        style={{
                          fontWeight: "bold",
                          color: COLORS.white,
                          paddingHorizontal: 10,
                        }}
                      >
                        {__(
                          "accountScreenTexts.logOutButtonText",
                          appSettings.lng
                        )}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      {
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: COLORS.button.disabled,
                        paddingHorizontal: 15,
                        paddingVertical: 10,
                        borderRadius: 5,
                      },
                      rtlView,
                    ]}
                    onPress={() => handleDeleteAccountPrompt()}
                  >
                    <View
                      style={{
                        height: 20,
                        // width: 20,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <DeleteIcon fillColor={COLORS.white} />
                    </View>
                    <View style={{ paddingHorizontal: 0 }}>
                      <Text
                        style={{
                          fontWeight: "bold",
                          color: COLORS.white,
                          paddingHorizontal: 5,
                        }}
                      >
                        {__(
                          "accountScreenTexts.deleteAccountBtn",
                          appSettings.lng
                        )}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </>
      ) : (
        <>
          <TabScreenHeader sideBar={true} />
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: "3%",
            }}
          >
            <View
              style={{
                width: deviceWidth * 0.65,
                height: deviceWidth * 0.65 * 0.6,
              }}
            >
              <Image
                source={require("../assets/account_bg.png")}
                style={{
                  width: deviceWidth * 0.65,
                  height: deviceWidth * 0.65 * 0.6,
                  resizeMode: "contain",
                }}
              />
            </View>
            <View
              style={{
                width: deviceWidth * 0.75,
                paddingVertical: 30,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 20,
                  color: COLORS.text_dark,
                }}
              >
                {__("accountScreenTexts.loginTitle", appSettings.lng)}
              </Text>
            </View>
            <AppButton
              title={__("accountScreenTexts.loginButtonText", appSettings.lng)}
              style={styles.loginButton}
              onPress={() => navigation.navigate(routes.loginScreen)}
              textStyle={rtlText}
            />
          </View>
        </>
      )}
      {/* Flash Notification */}
      <FlashNotification
        falshShow={flashNotification}
        flashMessage={__("accountScreenTexts.successMessage", appSettings.lng)}
      />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bg_dark,
    flex: 1,
  },
  headerMain: {
    alignItems: "center",
    flex: 1,
  },
  headerTitle: {
    paddingRight: 20,
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
  },
  headerTitleWrap: {
    paddingHorizontal: 10,
    flex: 1,
    alignItems: "center",
  },
  headerWrap: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: "3%",
    flexDirection: "row",
    height: 50,
    alignItems: "center",
    justifyContent: "space-between",
  },
  image: {
    height: deviceWidth * 0.26,
    width: deviceWidth * 0.26,
    resizeMode: "contain",
  },
  imageWrap: {
    height: deviceWidth * 0.26,
    width: deviceWidth * 0.26,
    borderRadius: deviceWidth * 0.13,
    overflow: "hidden",
    backgroundColor: COLORS.white,
    position: "absolute",
    top: deviceWidth * 0.05,
  },
  loginButton: {
    paddingVertical: 10,
    borderRadius: 3,
    width: "70%",
  },

  logOutWrap: {
    paddingBottom: 50,
  },
  name: {
    fontSize: 18,
    color: COLORS.text_dark,
    fontWeight: "bold",
  },
  nameSectionWrap: {
    alignItems: "center",
    padding: "3%",
  },
  optionsContainer: {
    flex: 1,
  },
  screenHeaderWrap: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: "3%",
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  userImgSectionWrap: {
    backgroundColor: COLORS.primary,
    alignItems: "center",
    borderBottomRightRadius: 22,
    borderBottomLeftRadius: 22,
    paddingVertical: deviceWidth * 0.09,
    marginBottom: deviceWidth * 0.13,
  },
  userNameContainer: {
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  userNameText: {
    fontSize: 20,
    color: "#444",
  },
});

export default AccountScreen;
