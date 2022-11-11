/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";

// Vector Icons
import { FontAwesome } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";

// Custom Components & Functions
import MyAdsFlatList from "../components/MyAdsFlatList";
import { COLORS } from "../variables/color";
import AppButton from "../components/AppButton";
import api, { setAuthToken, removeAuthToken } from "../api/client";
import LoadingIndicator from "../components/LoadingIndicator";
import FlashNotification from "../components/FlashNotification";
import { decodeString } from "../helper/helper";
import { paginationData } from "../app/pagination/paginationData";
import { useStateValue } from "../StateProvider";
import { getRelativeTimeConfig, __ } from "../language/stringPicker";
import { routes } from "../navigation/routes";
import SoldIcon from "../components/svgComponents/SoldIcon";
import PromoteIcon from "../components/svgComponents/PromoteIcon";
import DeleteIcon from "../components/svgComponents/DeleteIcon";
import PenIcon from "../components/svgComponents/PenIcon";
import moment from "moment";
import "moment/locale/en-gb";

const { height: windowHeight, width: windowWidth } = Dimensions.get("window");
const extraHeight = 50;

const MyListingsScreen = ({ navigation }) => {
  const [
    { auth_token, is_connected, config, appSettings, rtl_support, ios },
    dispatch,
  ] = useStateValue();
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState();
  const [actionItem, setActionItem] = useState();
  const [actionPosition, setActionPosition] = useState();
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(
    pagination.page || paginationData.myListings.page
  );
  const [flashNotification, setFlashNotification] = useState(false);
  const [flashNotificationMessage, setFlashNotificationMessage] = useState();

  // Initial get listing call
  useEffect(() => {
    const timeConfig = getRelativeTimeConfig(appSettings.lng);
    moment.updateLocale("en-gb", {
      relativeTime: timeConfig,
    });
    if (!auth_token) {
      setLoading(false);
      return;
    }
    handleLoadAdsList(paginationData.myListings);
  }, []);

  // Refreshing get listing call
  useEffect(() => {
    if (!refreshing) return;
    setCurrentPage(1);
    setPagination({});
    handleLoadAdsList(paginationData.myListings);
  }, [refreshing]);

  // next page get listing call
  useEffect(() => {
    if (!moreLoading) return;
    const data = {
      per_page: paginationData.myListings.per_page,
      page: currentPage,
    };
    handleLoadAdsList(data);
  }, [moreLoading]);

  const handleLoadAdsList = (arg) => {
    setAuthToken(auth_token);
    api.get("my/listings", arg).then((res) => {
      if (res.ok) {
        if (refreshing) {
          setRefreshing(false);
        }
        if (moreLoading) {
          setMyListings((prevMyListings) => [
            ...prevMyListings,
            ...res.data.data,
          ]);
          setMoreLoading(false);
        } else {
          setMyListings(res.data.data);
        }
        setPagination(res.data.pagination ? res.data.pagination : {});
        removeAuthToken();
        if (loading) {
          setLoading(false);
        }
      } else {
        // TODO handle error

        if (refreshing) {
          setRefreshing(false);
        }

        if (moreLoading) {
          setMoreLoading(false);
        }
        handleError(
          res?.data?.error_message ||
            res?.data?.error ||
            res?.problem ||
            __(
              "myListingsScreenTexts.customServerErrorMessage",
              appSettings.lng
            )
        );
        if (loading) {
          setLoading(false);
        }
        removeAuthToken();
      }
    });
  };

  const handleDeleteAlert = (listing) => {
    Alert.alert(
      "",
      `${__(
        "myListingsScreenTexts.deletePromptMessage",
        appSettings.lng
      )} ${decodeString(listing.title)} ?`,
      [
        {
          text: __("myListingsScreenTexts.cancelButtonTitle", appSettings.lng),
        },
        {
          text: __("myListingsScreenTexts.deleteButtonTitle", appSettings.lng),
          onPress: () => handleDeleteListing(listing),
        },
      ],
      { cancelable: false }
    );
  };

  const handleDeleteListing = (listing) => {
    setActionMenuVisible(false);
    setDeleteLoading(true);

    setAuthToken(auth_token);
    api
      .delete("my/listings", { listing_id: listing.listing_id })
      .then((res) => {
        if (res.ok) {
          const filtered = myListings.filter(
            (item) => item.listing_id != listing.listing_id
          );
          setMyListings(filtered);
          removeAuthToken();
          setDeleteLoading(false);
          handleSuccess(
            __(
              "myListingsScreenTexts.listingDeleteSuccessText",
              appSettings.lng
            )
          );
        } else {
          setDeleteLoading(false);
          removeAuthToken();
          handleError(
            res?.data?.error_message ||
              res?.data?.error ||
              res?.problem ||
              __(
                "myListingsScreenTexts.listingDeleteErrorText",
                appSettings.lng
              )
          );
        }
      });
  };

  const handleEditListing = (listing) => {
    setActionMenuVisible(false);
    navigation.navigate(routes.editListingScreen, {
      item: listing,
    });
  };

  const handlePromoteListing = (listing) => {
    setActionMenuVisible(false);
    navigation.navigate(routes.promoteScreen, {
      title: listing.title,
      id: listing.listing_id,
    });
  };

  const handleSoldAlert = (listing) => {
    Alert.alert(
      "",
      `${__(
        "myListingsScreenTexts.soldPromptMessage",
        appSettings.lng
      )} ${decodeString(listing.title)} ${
        listing.badges.includes("is-sold")
          ? __("myListingsScreenTexts.asUnsold", appSettings.lng)
          : __("myListingsScreenTexts.asSold", appSettings.lng)
      } ?`,
      [
        {
          text: __("myListingsScreenTexts.cancelButtonTitle", appSettings.lng),
        },
        {
          text: __("myListingsScreenTexts.okayButtonTitle", appSettings.lng),
          onPress: () => handleSoldMarking(listing),
        },
      ],
      { cancelable: false }
    );
  };

  const handleSoldMarking = (item) => {
    setActionMenuVisible(false);
    setDeleteLoading(true);
    setAuthToken(auth_token);
    //send arg in api call
    api.post("my/mark-as-sold", { listing_id: item.listing_id }).then((res) => {
      if (res.ok) {
        removeAuthToken();
        updateVisualFlatListItemSoldStatus(res.data.action);
        setDeleteLoading(false);
      } else {
        // TODO handle error

        setErrorMessage(
          __("myListingsScreenTexts.customServerErrorMessage", appSettings.lng)
        );
        handleError(
          res?.data?.error_message ||
            res?.data?.error ||
            res?.problem ||
            __(
              "myListingsScreenTexts.customServerErrorMessage",
              appSettings.lng
            )
        );

        removeAuthToken();
        setDeleteLoading(false);
      }
    });
  };

  const updateVisualFlatListItemSoldStatus = (action) => {
    const data = [...myListings];
    const tempMyListings = data.map((_listing) => {
      if (_listing.listing_id == actionItem.listing_id) {
        let _item = { ...actionItem };
        if (action === "unsold") {
          _item.badges = _item.badges.filter((_i) => _i !== "is-sold");
        } else {
          _item.badges.push("is-sold");
        }
        return _item;
      } else {
        return _listing;
      }
    });
    setMyListings(tempMyListings);
    setActionItem();
  };
  const handleViewListing = (listing) => {
    navigation.navigate(routes.listingDetailScreen, {
      listingId: listing.listing_id,
    });
  };

  const onRefresh = () => {
    if (moreLoading) return;
    setRefreshing(true);
  };

  const handleSetActionPosition = (urg) => {
    setActionPosition({
      actionX: urg.nativeEvent.pageX,
      actionY: urg.nativeEvent.pageY,
    });
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

  const renderListingItem = useCallback(
    ({ item }) => (
      <MyAdsFlatList
        item={item}
        onClick={() => handleViewListing(item)}
        onAction={() => handleActionButtonPress(item)}
        onActionTouch={handleSetActionPosition}
      />
    ),
    [myListings]
  );

  const keyExtractor = (item, index) => `${index}`;

  const handleNewListing = () => {
    navigation.navigate(routes.newListingScreen);
    dispatch({
      type: "SET_NEW_LISTING_SCREEN",
      newListingScreen: true,
    });
  };
  const listFooter = () => {
    if (pagination && pagination.total_pages > pagination.current_page) {
      return (
        <View style={styles.loadMoreWrap}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      );
    } else {
      return null;
    }
  };

  const handleNextPageLoading = () => {
    if (refreshing) return;
    if (pagination && pagination.total_pages > pagination.current_page) {
      setCurrentPage((prevCurrentPage) => prevCurrentPage + 1);
      setMoreLoading(true);
    }
  };

  const handleSuccess = (message) => {
    setFlashNotificationMessage(message);
    setTimeout(() => {
      setFlashNotification(true);
    }, 10);
    setTimeout(() => {
      setFlashNotification(false);
      setFlashNotificationMessage();
    }, 1000);
  };
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

  const handleActionButtonPress = (listing) => {
    setActionItem(listing);
    setActionMenuVisible(true);
  };

  const handleActionOverlayPress = () => {
    setActionMenuVisible(false);
    setActionItem();
  };

  return is_connected ? (
    <>
      {/* Initial Loading Component */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingMessage}>
              {__("myListingsScreenTexts.loadingMessage", appSettings.lng)}
            </Text>
          </View>
        </View>
      ) : (
        <>
          {/* ActionLoading Component */}
          {!!deleteLoading && (
            <View style={styles.deleteLoading}>
              <View style={styles.deleteLoadingContentWrap}>
                <LoadingIndicator
                  visible={true}
                  style={{
                    width: "100%",
                    marginLeft: "3.125%",
                  }}
                />
              </View>
            </View>
          )}
          {/* Action Menu Component */}
          {actionMenuVisible && (
            <TouchableWithoutFeedback onPress={handleActionOverlayPress}>
              <View style={styles.actionLoading}>
                <View
                  style={
                    windowHeight - actionPosition.actionY >= 120
                      ? [
                          styles.actionMenu,
                          rtl_support
                            ? {
                                left: "3%",
                                top: actionPosition.actionY - extraHeight,
                              }
                            : {
                                right: "3%",
                                top: actionPosition.actionY - extraHeight,
                              },
                        ]
                      : [
                          styles.actionMenu,
                          rtl_support
                            ? {
                                left: "3%",
                                bottom: windowHeight - actionPosition.actionY,
                              }
                            : {
                                right: "3%",
                                bottom: windowHeight - actionPosition.actionY,
                              },
                        ]
                  }
                >
                  {rtl_support ? (
                    <View
                      style={[
                        {
                          height: 0,
                          width: 0,
                          borderRightWidth: 10,
                          borderLeftWidth: 10,
                          borderRightColor: "transparent",
                          borderLeftColor: "transparent",
                          position: "absolute",
                          marginLeft: windowWidth * 0.03,
                          left: 0,
                        },
                        windowHeight - actionPosition.actionY >= 120
                          ? {
                              top: -15,
                              borderBottomWidth: 15,
                              borderBottomColor: COLORS.white,
                            }
                          : {
                              bottom: -15,
                              borderTopWidth: 15,
                              borderTopColor: COLORS.white,
                            },
                      ]}
                    />
                  ) : (
                    <View
                      style={[
                        {
                          height: 0,
                          width: 0,
                          borderRightWidth: 10,
                          borderLeftWidth: 10,
                          borderRightColor: "transparent",
                          borderLeftColor: "transparent",
                          position: "absolute",
                          marginRight: windowWidth * 0.03,
                          right: 0,
                        },
                        ,
                        windowHeight - actionPosition.actionY >= 120
                          ? {
                              top: -15,
                              borderBottomWidth: 15,
                              borderBottomColor: COLORS.white,
                            }
                          : {
                              bottom: -15,
                              borderTopWidth: 15,
                              borderTopColor: COLORS.white,
                            },
                      ]}
                    />
                  )}
                  <TouchableOpacity
                    style={[styles.iconButton, rtlView]}
                    onPress={() => handleEditListing(actionItem)}
                  >
                    <View
                      style={[
                        styles.buttonIconWrap,
                        {
                          marginRight: rtl_support ? 0 : 5,
                          marginLeft: rtl_support ? 5 : 0,
                        },
                      ]}
                    >
                      <PenIcon fillColor={COLORS.text_gray} />
                    </View>
                    <Text style={[styles.buttonText, rtlText]}>
                      {__(
                        "myListingsScreenTexts.actionMenuButtons.edit",
                        appSettings.lng
                      )}
                    </Text>
                  </TouchableOpacity>
                  {!config?.iap_disabled && (
                    <TouchableOpacity
                      style={[styles.iconButton, rtlView]}
                      onPress={() => handlePromoteListing(actionItem)}
                    >
                      <View
                        style={[
                          styles.buttonIconWrap,
                          {
                            marginRight: rtl_support ? 0 : 5,
                            marginLeft: rtl_support ? 5 : 0,
                          },
                        ]}
                      >
                        <PromoteIcon fillColor={COLORS.text_gray} />
                      </View>
                      <Text style={[styles.buttonText, rtlText]}>
                        {__(
                          "myListingsScreenTexts.actionMenuButtons.promote",
                          appSettings.lng
                        )}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[
                      {
                        paddingHorizontal: 7,
                      },
                    ]}
                    onPress={() => handleDeleteAlert(actionItem)}
                  >
                    <View
                      style={[
                        {
                          backgroundColor: COLORS.bg_primary,
                          paddingHorizontal: 8,
                          flexDirection: "row",
                          alignItems: "center",
                          paddingVertical: 5,
                          borderRadius: 5,
                        },
                        rtlView,
                      ]}
                    >
                      <View
                        style={[
                          styles.buttonIconWrap,
                          {
                            marginRight: rtl_support ? 0 : 5,
                            marginLeft: rtl_support ? 5 : 0,
                          },
                        ]}
                      >
                        <DeleteIcon fillColor={COLORS.primary} />
                      </View>
                      <Text
                        style={[
                          styles.buttonText,
                          rtlText,
                          { color: COLORS.primary },
                        ]}
                      >
                        {__(
                          "myListingsScreenTexts.actionMenuButtons.delete",
                          appSettings.lng
                        )}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {config?.mark_as_sold && (
                    <TouchableOpacity
                      style={[styles.iconButton, rtlView]}
                      onPress={() => handleSoldAlert(actionItem)}
                    >
                      <View
                        style={[
                          styles.buttonIconWrap,
                          {
                            marginRight: rtl_support ? 0 : 5,
                            marginLeft: rtl_support ? 5 : 0,
                          },
                        ]}
                      >
                        <SoldIcon fillColor={COLORS.text_gray} />
                      </View>
                      <Text style={[styles.buttonText, rtlText]}>
                        {actionItem.badges.includes("is-sold")
                          ? __(
                              "myListingsScreenTexts.actionMenuButtons.unsold",
                              appSettings.lng
                            )
                          : __(
                              "myListingsScreenTexts.actionMenuButtons.sold",
                              appSettings.lng
                            )}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
          )}
          {/* Listing FlatList Component */}
          {!!myListings.length && !loading && (
            <View
              style={{
                flex: 1,
                backgroundColor: COLORS.bg_dark,
              }}
            >
              <FlatList
                data={myListings}
                renderItem={renderListingItem}
                keyExtractor={keyExtractor}
                horizontal={false}
                onEndReached={handleNextPageLoading}
                onEndReachedThreshold={0.2}
                ListFooterComponent={listFooter}
                maxToRenderPerBatch={14}
                onRefresh={onRefresh}
                refreshing={refreshing}
                contentContainerStyle={{
                  paddingVertical: 5,
                }}
              />
            </View>
          )}
          {/* Empty List component */}
          {!myListings.length && (
            <>
              {!!auth_token ? (
                <View style={styles.noAdWrap}>
                  <FontAwesome
                    name="exclamation-triangle"
                    size={50}
                    color={COLORS.gray}
                  />
                  <Text style={styles.noAdTitle}>
                    {__("myListingsScreenTexts.noAdTitle", appSettings.lng)}
                  </Text>
                  <AppButton
                    title={__(
                      "myListingsScreenTexts.postAdButtonTitle",
                      appSettings.lng
                    )}
                    style={styles.postButton}
                    onPress={handleNewListing}
                  />
                </View>
              ) : (
                <View style={styles.noAdWrap}>
                  <FontAwesome
                    name="exclamation-triangle"
                    size={50}
                    color={COLORS.gray}
                  />
                  <Text style={styles.noAdTitle}>
                    {__("myListingsScreenTexts.loggedOut", appSettings.lng)}
                  </Text>
                </View>
              )}
            </>
          )}
          {/* Flash Notification Component */}
          <FlashNotification
            falshShow={flashNotification}
            flashMessage={flashNotificationMessage}
          />
        </>
      )}
    </>
  ) : (
    <View style={styles.noInternet}>
      <FontAwesome5
        name="exclamation-circle"
        size={24}
        color={COLORS.primary}
      />
      <Text style={styles.text}>
        {__("myListingsScreenTexts.noInternet", appSettings.lng)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  actionLoading: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,.5)",
    zIndex: 5,
    flex: 1,
    height: "100%",
    width: "100%",
  },
  actionMenu: {
    backgroundColor: "#fff",
    borderRadius: 5,
    paddingVertical: 10,
    position: "absolute",
  },
  buttonIcon: {
    height: "100%",
    width: "100%",
    resizeMode: "contain",
  },
  buttonIconWrap: {
    height: 16,
    width: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontWeight: "bold",
    color: COLORS.text_gray,
  },
  containerNoAds: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {},
  deleteLoading: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
    flex: 1,
    height: "100%",
    width: "100%",
  },
  deleteLoadingContentWrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 15,
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
  noAdTitle: {
    marginTop: 15,
    fontSize: 18,
    color: COLORS.text_gray,
  },
  noAdWrap: {
    alignItems: "center",
    marginHorizontal: "3%",
    flex: 1,
    justifyContent: "center",
  },
  noInternet: {
    alignItems: "center",
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  postButton: {
    borderRadius: 3,
    marginTop: 40,
    marginBottom: 20,
    width: "60%",
  },
});

export default MyListingsScreen;
