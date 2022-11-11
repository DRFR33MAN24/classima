/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";

// External Libraries
import ReactNativeZoomableView from "@openspacelabs/react-native-zoomable-view/src/ReactNativeZoomableView";

// Vector Icons
import { AntDesign, Feather, FontAwesome } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";

// Custom Components & Functions
import { COLORS } from "../variables/color";
import ProfileData from "../components/ProfileData";
import { useStateValue } from "../StateProvider";
import api, { setAuthToken, removeAuthToken } from "../api/client";
import AppSeparator from "../components/AppSeparator";
import FlashNotification from "../components/FlashNotification";
import { __ } from "../language/stringPicker";
import { routes } from "../navigation/routes";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { firebaseConfig } from "../app/services/firebaseConfig";
import { initializeApp } from "firebase/app";

const { width: deviceWidth, height: deviceHeight } = Dimensions.get("window");
const MyProfileScreen = ({ navigation }) => {
  const [
    { auth_token, user, is_connected, appSettings, rtl_support, config },
    dispatch,
  ] = useStateValue();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState();
  const [imageViewer, setImageViewer] = useState(false);
  const [flashNotification, setFlashNotification] = useState(false);
  const [flashNotificationMessage, setFlashNotificationMessage] = useState();
  const isFocused = useIsFocused();

  const handleError = (message) => {
    setFlashNotificationMessage(message);
    setTimeout(() => {
      setFlashNotification(true);
    }, 10);
    setTimeout(() => {
      setFlashNotification(false);
      setFlashNotificationMessage();
    }, 1200);
  };
  useEffect(() => {
    setAuthToken(auth_token);
    api.get("my").then((res) => {
      if (isFocused) {
        if (res.ok) {
          dispatch({
            type: "SET_AUTH_DATA",
            data: { user: res.data },
          });
          setLoading(false);
          removeAuthToken();
        } else {
          // TODO handle error && add retry button on error

          setErrorMessage(
            res?.data?.error_message ||
              res?.data?.error ||
              res?.problem ||
              __("myProfileScreenTexts.customResponseError", appSettings.lng)
          );
          handleError(
            res?.data?.error_message ||
              res?.data?.error ||
              res?.problem ||
              __("myProfileScreenTexts.customResponseError", appSettings.lng)
          );
          setLoading(false);
          removeAuthToken();
        }
      }
    });
  }, []);
  useFocusEffect(
    useCallback(() => {
      setAuthToken(auth_token);
      api.get("my").then((res) => {
        if (res.ok & isFocused) {
          dispatch({
            type: "SET_AUTH_DATA",
            data: { user: res.data },
          });
          setLoading(false);
          removeAuthToken();
        } else {
          // TODO handle error && add retry button on error

          setErrorMessage(
            res?.data?.error_message ||
              res?.data?.error ||
              res?.problem ||
              __("myProfileScreenTexts.customResponseError", appSettings.lng)
          );
          handleError(
            res?.data?.error_message ||
              res?.data?.error ||
              res?.problem ||
              __("myProfileScreenTexts.customResponseError", appSettings.lng)
          );
          setLoading(false);
          removeAuthToken();
        }
      });
    }, [])
  );
  const rtlTextA = rtl_support && {
    writingDirection: "rtl",
    textAlign: "center",
  };
  const rtlText = rtl_support && {
    writingDirection: "rtl",
  };
  const rtlView = rtl_support && {
    flexDirection: "row-reverse",
  };
  const handleLocationTaxonomy = (locations) => {
    if (!locations) return;
    let result = "";
    for (let i = 0; i < locations.length; i++) {
      if (result.length < 1) {
        result = locations[i].name;
      } else {
        result = result + `, ${locations[i].name}`;
      }
    }
    return result;
  };

  const handleImageViewer = () => {
    if (!user.pp_thumb_url) return;
    setImageViewer(!imageViewer);
  };

  return is_connected ? (
    <View style={{ flex: 1 }}>
      {loading ? (
        <View style={styles.loadingWrap}>
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.loadingMessage, rtlText]}>
              {__("myProfileScreenTexts.loadingMessage", appSettings.lng)}
            </Text>
          </View>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {!imageViewer && (
            <View style={styles.container}>
              <View style={styles.screenHeaderWrap}>
                <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
                  <View style={styles.headerBackBtnWrap}>
                    <AntDesign
                      name="arrowleft"
                      size={20}
                      color={COLORS.white}
                    />
                  </View>
                </TouchableWithoutFeedback>
                <View style={styles.headerTitleWrap}>
                  <Text style={[styles.headerTitle, rtlText]}>
                    {__("myProfileScreenTexts.screenTitle", appSettings.lng)}
                  </Text>
                </View>
              </View>
              <View style={styles.userImgSectionWrap}>
                <View style={styles.imageWrap}>
                  {user.pp_thumb_url ? (
                    <TouchableWithoutFeedback onPress={handleImageViewer}>
                      <Image
                        source={{ uri: user.pp_thumb_url }}
                        style={styles.image}
                      />
                    </TouchableWithoutFeedback>
                  ) : (
                    <FontAwesome
                      name="user"
                      size={20}
                      color={COLORS.text_gray}
                    />
                  )}
                </View>
              </View>
              <View style={{ flex: 1, backgroundColor: COLORS.bg_dark }}>
                <ScrollView>
                  <View style={styles.mainWrap}>
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
                    <View style={styles.infoSectionWrap}>
                      <View style={[styles.infoSectionTitleRowWrap, rtlView]}>
                        <View style={styles.infoSectionTitleRowIconWrap}>
                          <Feather
                            name="user"
                            size={24}
                            color={COLORS.primary}
                          />
                        </View>
                        <View
                          style={[
                            styles.infoSectionTitleWrap,
                            rtl_support
                              ? { paddingRight: "3%", alignItems: "flex-end" }
                              : { paddingLeft: "3%", alignItems: "flex-start" },
                          ]}
                        >
                          <Text style={[styles.infoSectionTitle, rtlText]}>
                            {__(
                              "myProfileScreenTexts.infoSectionTitle",
                              appSettings.lng
                            )}
                          </Text>
                        </View>
                      </View>
                      <AppSeparator style={styles.separator} />
                      {!!user?.first_name && (
                        <>
                          <ProfileData
                            label={__(
                              "myProfileScreenTexts.profileInfoLabels.name",
                              appSettings.lng
                            )}
                            value={`${user.first_name} ${user.last_name}`}
                          />
                          <AppSeparator style={styles.contentSeparator} />
                        </>
                      )}
                      {!!user.email && (
                        <>
                          <ProfileData
                            label={__(
                              "myProfileScreenTexts.profileInfoLabels.email",
                              appSettings.lng
                            )}
                            value={user.email}
                          />
                          <AppSeparator style={styles.contentSeparator} />
                        </>
                      )}
                      {!!user.phone && (
                        <>
                          <ProfileData
                            label={__(
                              "myProfileScreenTexts.profileInfoLabels.phone",
                              appSettings.lng
                            )}
                            value={user.phone}
                            phone={true}
                          />
                          <AppSeparator style={styles.contentSeparator} />
                        </>
                      )}

                      {!!user.whatsapp_number && (
                        <>
                          <ProfileData
                            label={__(
                              "myProfileScreenTexts.profileInfoLabels.whatsapp",
                              appSettings.lng
                            )}
                            value={user.whatsapp_number}
                          />
                          <AppSeparator style={styles.contentSeparator} />
                        </>
                      )}
                      {!!user.website && (
                        <>
                          <ProfileData
                            label={__(
                              "myProfileScreenTexts.profileInfoLabels.website",
                              appSettings.lng
                            )}
                            value={user.website}
                          />
                          <AppSeparator style={styles.contentSeparator} />
                        </>
                      )}
                      {(!!user.locations.length || !!user.address) && (
                        <>
                          <ProfileData
                            label={__(
                              "myProfileScreenTexts.profileInfoLabels.address",
                              appSettings.lng
                            )}
                            value={
                              handleLocationTaxonomy(user.locations)
                                ? `${handleLocationTaxonomy(user.locations)}, ${
                                    user.zipcode ? user.zipcode + "," : ""
                                  } ${user.address}`
                                : `${user.zipcode ? user.zipcode + "," : ""} ${
                                    user.address
                                  }`
                            }
                          />
                          {/* <AppSeparator style={styles.contentSeparator} /> */}
                        </>
                      )}
                      {!user.phone && !!config?.verification?.gateway && (
                        <View
                          style={{
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: 20,
                            paddingHorizontal: "3%",
                            marginHorizontal: "3%",
                          }}
                        >
                          <TouchableOpacity
                            style={{
                              backgroundColor: COLORS.button.active,
                              paddingHorizontal: 15,
                              paddingVertical: 8,
                              borderRadius: 3,
                            }}
                            onPress={() => {
                              if (
                                config?.verification?.gateway === "firebase" &&
                                firebaseConfig?.enabled
                              ) {
                                try {
                                  initializeApp(firebaseConfig.config);
                                } catch (err) {
                                  // ignore app already initialized error in snack
                                }
                              }
                              navigation.navigate(routes.oTPScreen, {
                                source: "profile",
                                // phone: value,
                              });
                            }}
                          >
                            <Text style={{ color: COLORS.white }}>
                              {__(
                                "myProfileScreenTexts.addPhoneBtnTitle",
                                appSettings.lng
                              )}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      <View style={styles.buttonSectionWrap}>
                        <TouchableOpacity
                          style={[
                            styles.button,
                            config?.verification &&
                              !user?.phone_verified && {
                                backgroundColor: COLORS.button.disabled,
                              },
                            rtlView,
                          ]}
                          onPress={() =>
                            navigation.navigate(
                              routes.editPersonalDetailScreen,
                              { data: user }
                            )
                          }
                          disabled={
                            config?.verification && !user?.phone_verified
                          }
                        >
                          <View style={styles.bittonIconWrap}>
                            <Feather
                              name="edit-3"
                              size={24}
                              color={COLORS.white}
                            />
                          </View>
                          <View style={styles.buttonTitleWrap}>
                            <Text style={[styles.buttonTitle, rtlText]}>
                              {__(
                                "myProfileScreenTexts.editButtonTitle",
                                appSettings.lng
                              )}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </View>
          )}
          {imageViewer && !!user.pp_thumb_url && (
            <View style={styles.imageViewerWrap}>
              <TouchableOpacity
                style={styles.imageViewerCloseButton}
                onPress={handleImageViewer}
              >
                <FontAwesome5 name="times" size={17} color={COLORS.primary} />
              </TouchableOpacity>

              <View style={styles.imageViewer}>
                <ReactNativeZoomableView
                  maxZoom={1.5}
                  minZoom={1}
                  zoomStep={0.5}
                  initialZoom={1}
                  bindToBorders={true}
                  style={{
                    padding: 10,
                    backgroundColor: COLORS.bg_dark,
                  }}
                >
                  <Image
                    style={{
                      width: deviceWidth,
                      height: deviceHeight,
                      resizeMode: "contain",
                    }}
                    source={{
                      uri: user.pp_thumb_url,
                    }}
                  />
                </ReactNativeZoomableView>
              </View>
            </View>
          )}
        </View>
      )}
      <FlashNotification
        falshShow={flashNotification}
        flashMessage={flashNotificationMessage}
      />
    </View>
  ) : (
    <View style={styles.noInternet}>
      <View style={styles.screenHeaderWrap}>
        <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
          <View style={styles.headerBackBtnWrap}>
            <AntDesign name="arrowleft" size={20} color={COLORS.white} />
          </View>
        </TouchableWithoutFeedback>
        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, rtlText]}>
            {__("myProfileScreenTexts.screenTitle", appSettings.lng)}
          </Text>
        </View>
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <FontAwesome5
          name="exclamation-circle"
          size={24}
          color={COLORS.primary}
        />
        <Text style={styles.text}>
          {__("myProfileScreenTexts.noInternet", appSettings.lng)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    width: "100%",
    paddingVertical: 7,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 3,
  },
  buttonSectionWrap: {
    alignItems: "center",
    marginVertical: 20,
    paddingHorizontal: deviceWidth * 0.03,
  },
  buttonTitle: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonTitleWrap: {
    paddingHorizontal: 5,
  },
  container: {
    backgroundColor: COLORS.bg_dark,
    flex: 1,
  },
  contentSeparator: {
    marginHorizontal: "4%",
    width: "92%",
  },
  headerTitle: {
    paddingRight: 20,
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
  },
  headerTitleWrap: {
    paddingHorizontal: 10,
    flex: 1,
    alignItems: "center",
  },
  image: {
    height: deviceWidth * 0.26,
    width: deviceWidth * 0.26,
    resizeMode: "contain",
  },
  imageViewer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageViewerCloseButton: {
    position: "absolute",
    right: 15,
    top: 15,
    zIndex: 10,
    height: 30,
    width: 30,
    padding: 5,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    elevation: 3,
    shadowColor: COLORS.border_light,
    shadowOffset: {
      height: 3,
      width: 3,
    },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  imageViewerWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    width: "100%",
    height: "100%",
    flex: 1,
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
  infoSectionTitleRowWrap: {
    flexDirection: "row",
    paddingHorizontal: "3%",
    paddingVertical: "3%",
    alignItems: "center",
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text_dark,
  },
  infoSectionTitleWrap: {
    flex: 1,
  },
  infoSectionWrap: {
    backgroundColor: COLORS.white,
    marginHorizontal: "3%",
    borderRadius: 5,
    elevation: 1.5,
    shadowColor: COLORS.black,
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { height: 0, width: 0 },
  },
  loading: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.8,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
    flex: 1,
  },
  loadingWrap: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  mainWrap: {
    backgroundColor: COLORS.bg_dark,
    paddingBottom: 15,
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
  noInternet: {
    alignItems: "center",
    flex: 1,
    backgroundColor: "white",
  },
  phone: {
    fontSize: 16,
    color: COLORS.text_gray,
  },
  phoneWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  screenHeaderWrap: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: "3%",
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  separator: {
    width: "100%",
    backgroundColor: COLORS.gray,
  },
  titleRight: {},
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userImgSectionWrap: {
    backgroundColor: COLORS.primary,
    alignItems: "center",
    borderBottomRightRadius: 22,
    borderBottomLeftRadius: 22,
    paddingVertical: deviceWidth * 0.09,
    marginBottom: deviceWidth * 0.13,
  },
});

export default MyProfileScreen;
