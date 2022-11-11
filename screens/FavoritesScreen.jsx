/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  FlatList,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  Platform,
} from "react-native";

// vector Icons
import { FontAwesome5 } from "@expo/vector-icons";

// Custom Components & Functions
import { useStateValue } from "../StateProvider";
import FavoritesFlatList from "../components/FavoritesFlatList";
import { COLORS } from "../variables/color";
import api, { setAuthToken, removeAuthToken } from "../api/client";
import FlashNotification from "../components/FlashNotification";
import LoadingIndicator from "../components/LoadingIndicator";
import { paginationData } from "../app/pagination/paginationData";
import { getRelativeTimeConfig, __ } from "../language/stringPicker";
import { routes } from "../navigation/routes";
import moment from "moment";
import "moment/locale/en-gb";

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");
const FavoritesScreen = ({ navigation }) => {
  const [{ auth_token, is_connected, appSettings, rtl_support, ios }] =
    useStateValue();

  const [myFavs, setMyFavs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState(true);
  const [errorMessage, setErrorMessage] = useState();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(
    pagination.current_page || paginationData.favourites.page
  );
  const [flashNotification, setFlashNotification] = useState(false);
  const [flashNotificationMessage, setFlashNotificationMessage] = useState();

  // Initial get listing call
  useEffect(() => {
    const timeConfig = getRelativeTimeConfig(appSettings.lng);
    moment.updateLocale("en-gb", {
      relativeTime: timeConfig,
    });
    if (!initial) return;
    handleLoadFavsList(paginationData.favourites);
    setInitial(false);
  }, [initial]);

  // Refresh get listing call
  useEffect(() => {
    if (!refreshing) return;
    setCurrentPage(1);
    setPagination({});
    handleLoadFavsList(paginationData.favourites);
  }, [refreshing]);

  // next page get listing call
  useEffect(() => {
    if (!moreLoading) return;
    const data = {
      per_page: paginationData.favourites.per_page,
      page: currentPage,
    };
    handleLoadFavsList(data);
  }, [moreLoading]);

  const handleLoadFavsList = (data) => {
    setAuthToken(auth_token);

    api.get("my/favourites", data).then((res) => {
      if (res.ok) {
        if (refreshing) {
          setRefreshing(false);
        }
        if (moreLoading) {
          setMyFavs((prevMyFavs) => [...prevMyFavs, ...res.data.data]);
          setMoreLoading(false);
        } else {
          setMyFavs(res.data.data);
        }
        setPagination(res?.data?.pagination || {});

        removeAuthToken();
        if (loading) {
          setLoading(false);
        }
      } else {
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
              "favoritesScreenTexts.customServerResponseError",
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

  const handleRemoveFavAlert = (listing) => {
    // Alert.alert(
    //   "",
    //   __("favoritesScreenTexts.removePromptMessage", appSettings.lng),
    //   [
    //     {
    //       text: __("favoritesScreenTexts.cancelButtonTitle", appSettings.lng),

    //       style: "cancel",
    //     },
    //     {
    //       text: __("favoritesScreenTexts.removeButtonTitle", appSettings.lng),
    //       onPress: () => handleRemoveFromFavorites(listing),
    //     },
    //   ],
    //   { cancelable: false }
    // );
    setDeleteItem(listing);
    setDeleteModal(true);
  };
  const handleRemoveFromFavorites = (listing) => {
    setDeleteLoading(true);
    setDeleteModal(false);
    setAuthToken(auth_token);
    api
      .post("my/favourites", { listing_id: listing.listing_id })
      .then((res) => {
        if (res.ok) {
          setMyFavs(myFavs.filter((fav) => fav != listing));
          removeAuthToken();
          setDeleteLoading(false);
          handleSuccess(
            __("favoritesScreenTexts.favRemoveSuccessMessage", appSettings.lng)
          );
        } else {
          setErrorMessage(
            res?.data?.error_message ||
              res?.data?.error ||
              res?.problem ||
              __(
                "favoritesScreenTexts.favRemoveErrorCustomMessage",
                appSettings.lng
              )
          );
          removeAuthToken();
          setDeleteLoading(false);
          handleError(
            res?.data?.error_message ||
              res?.data?.error ||
              res?.problem ||
              __(
                "favoritesScreenTexts.favRemoveErrorCustomMessage",
                appSettings.lng
              )
          );
        }
      })
      .then(() => {
        setDeleteItem(null);
      });
  };

  const handleExplore = () => {
    navigation.replace(routes.drawerNavigator);
  };

  const renderFavsItem = ({ item }) => (
    <FavoritesFlatList
      item={item}
      onDelete={() => handleRemoveFavAlert(item)}
      onClick={() => handleViewListing(item)}
    />
  );

  const handleViewListing = (item) => {
    navigation.navigate(routes.listingDetailScreen, {
      listingId: item.listing_id,
    });
  };

  const keyExtractor = useCallback((item, index) => `${index}`, []);

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

  const onRefresh = () => {
    if (moreLoading) return;
    setRefreshing(true);
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

  const rtlText = rtl_support && {
    writingDirection: "rtl",
  };

  const DeleteAlert = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={deleteModal}
      statusBarTranslucent
    >
      <View
        style={{
          backgroundColor: "transparent",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: "7%",
        }}
      >
        <TouchableWithoutFeedback onPress={() => setDeleteModal(false)}>
          <View
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: COLORS.black,
              opacity: 0.5,
            }}
          />
        </TouchableWithoutFeedback>

        <View
          style={{
            backgroundColor: COLORS.white,
            width: "100%",
            padding: screenWidth * 0.05,
            borderRadius: 10,
          }}
        >
          <View style={{ padding: 5, alignItems: "center" }}>
            <Text
              style={{
                textAlign: "center",
                fontSize: 18,
                fontWeight: "bold",
                color: COLORS.text_dark,
              }}
            >
              {__("favoritesScreenTexts.removePromptMessage", appSettings.lng)}
            </Text>
          </View>
          <View
            style={{
              flexDirection: rtl_support ? "row-reverse" : "row",
              alignItems: "center",
              justifyContent: "center",
              paddingBottom: 10,
              paddingTop: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setDeleteModal(false);
                setDeleteItem(null);
              }}
              style={{
                backgroundColor: COLORS.bg_dark,
                paddingHorizontal: 15,
                paddingVertical: ios ? 8 : 6,
                borderRadius: 5,
                marginHorizontal: 10,
              }}
            >
              <Text style={{ color: COLORS.text_dark, fontSize: 16 }}>
                {__("favoritesScreenTexts.cancelButtonTitle", appSettings.lng)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleRemoveFromFavorites(deleteItem)}
              style={{
                backgroundColor: COLORS.primary,
                paddingHorizontal: 15,
                paddingVertical: ios ? 8 : 6,
                borderRadius: 5,
                marginHorizontal: 10,
              }}
            >
              <Text style={{ color: COLORS.white, fontSize: 16 }}>
                {__("favoritesScreenTexts.removeButtonTitle", appSettings.lng)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return is_connected ? (
    <>
      {loading ? (
        <View style={styles.loadingWrap}>
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.loadingMessage, rtlText]}>
              {__("favoritesScreenTexts.loadingMessage", appSettings.lng)}
            </Text>
          </View>
        </View>
      ) : (
        <>
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

          {!!myFavs?.length && (
            <View
              style={{
                backgroundColor: COLORS.bg_dark,
                flex: 1,
                paddingVertical: 5,
              }}
            >
              <FlatList
                data={myFavs}
                renderItem={renderFavsItem}
                keyExtractor={keyExtractor}
                horizontal={false}
                onEndReached={handleNextPageLoading}
                onEndReachedThreshold={0.2}
                ListFooterComponent={listFooter}
                onRefresh={onRefresh}
                refreshing={refreshing}
              />
            </View>
          )}
          {!myFavs?.length && (
            <View style={styles.noFavWrap}>
              <View style={styles.emptyBgWrap}>
                <Image
                  source={require("../assets/empty.png")}
                  style={styles.emptyBg}
                />
              </View>
              <Text style={[styles.noFavTitle, rtlText]}>
                {__("favoritesScreenTexts.noFavoriteMessage", appSettings.lng)}
              </Text>
              <TouchableOpacity
                style={styles.postButton}
                onPress={handleExplore}
              >
                <Text style={[styles.buttonText, rtlText]}>
                  {__("favoritesScreenTexts.exploreTitle", appSettings.lng)}
                </Text>
                <View style={styles.arrowWrap}>
                  <Image
                    source={require("../assets/arror-right.png")}
                    style={styles.arrow}
                  />
                </View>
              </TouchableOpacity>
            </View>
          )}
          <FlashNotification
            falshShow={flashNotification}
            flashMessage={flashNotificationMessage}
          />
          <DeleteAlert />
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
      <Text style={[styles.text, rtlText]}>
        {__("favoritesScreenTexts.noInternet", appSettings.lng)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  arrow: {
    width: "100%",
    height: "100%",
  },
  arrowWrap: {
    width: 15,
    height: 10,
    marginHorizontal: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
    paddingHorizontal: 3,
  },
  container: {},
  containerNoFavs: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  deleteLoading: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.8,
    backgroundColor: "rgba(255,255,255,.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
    flex: 1,
    height: "100%",
    width: "100%",
  },
  emptyBg: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  emptyBgWrap: {
    width: screenWidth * 0.55,
    height: screenWidth * 0.55 * 0.8,
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
  noFavTitle: {
    fontSize: 20,
    color: COLORS.text_dark,
    marginTop: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  noFavWrap: {
    alignItems: "center",
    marginHorizontal: "3%",
    flex: 1,
    justifyContent: "center",
    backgroundColor: COLORS.bg_dark,
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
    marginTop: 20,
    // width: "60%",
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: Platform.OS === "ios" ? 7 : 5,
  },
});

export default FavoritesScreen;
