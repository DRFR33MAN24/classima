/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// import { requestPermissionsAsync, getPermissionsAsync } from "expo-ads-admob";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  Animated,
  ActivityIndicator,
  Keyboard,
  RefreshControl,
  Modal,
  Alert,
} from "react-native";

// Expo Libraries
import Constants from "expo-constants";

// Vector Fonts
import { FontAwesome } from "@expo/vector-icons";
import { SimpleLineIcons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { Fontisto } from "@expo/vector-icons";
import { Formik } from "formik";

// Custom Components & Constants
import { COLORS } from "../variables/color";
import TabScreenHeader from "../components/TabScreenHeader";
import { useStateValue } from "../StateProvider";
import api from "../api/client";
import { decodeString } from "../helper/helper";
import FlashNotification from "../components/FlashNotification";
import AppButton from "../components/AppButton";
import ListingCard from "../components/ListingCard";
import ListingCardList from "../components/ListingCardList";
import ListingCardOld from "../components/ListingCardOld";
import ListingCardListOld from "../components/ListingCardListOld";
import { paginationData } from "../app/pagination/paginationData";
import CategoryIconOld from "../components/CategoryIconOld";
import CategoryImageOld from "../components/CategoryImageOld";
import { __ } from "../language/stringPicker";
import { admobConfig } from "../app/services/adMobConfig";
import { routes } from "../navigation/routes";
import { miscConfig } from "../app/services/miscConfig";

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");
const { height: windowHeight } = Dimensions.get("window");

const HomeScreenOld = ({ navigation }) => {
  const [
    {
      search_locations,
      config,
      search_categories,
      cat_name,
      ios,
      appSettings,
      rtl_support,
    },
    dispatch,
  ] = useStateValue();
  const [topCategoriesData, setTopCategoriesData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [searchData, setSearchData] = useState(() => {
    return {
      ...paginationData.home,
      search: "",
      locations: search_locations.length
        ? search_locations.map((location) => location.term_id)
        : "",
      categories: "",
      page: pagination.current_page || 1,
      onScroll: false,
    };
  });
  const [locationsData, setLocationsData] = useState([]);
  const [listingsData, setListingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [initial, setInitial] = useState(true);
  const [flashNotification, setFlashNotification] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [timedOut, setTimedOut] = useState();
  const [networkError, setNetworkError] = useState();
  const [retry, setRetry] = useState(false);
  const [scrollButtonVisible, setScrollButtonVisible] = useState(false);

  const iosFlatList = useRef(null);

  // Search on Location Change
  useEffect(() => {
    if (!search_locations) return;
    setSearchData((prevSearchData) => {
      return {
        ...prevSearchData,
        locations: search_locations
          .map((location) => location.term_id)
          .splice(search_locations.length - 1),
        page: 1,
      };
    });
    setLoading(true);
  }, [search_locations]);

  // Search on Category Change from All Category Page
  useEffect(() => {
    if (!search_categories.length) return;
    setSearchData((prevSearchData) => {
      return {
        ...prevSearchData,
        categories: search_categories[search_categories.length - 1],
        page: 1,
      };
    });
    setLoading(true);
  }, [search_categories]);

  // Initial Load Listings Data
  useEffect(() => {
    if (!initial) return;
    dispatch({
      type: "SET_NEW_LISTING_SCREEN",
      newListingScreen: false,
    });
    handleLoadTopCategories();
    if (config.location_type === "local") {
      handleLoadLocations();
    }
    handleLoadListingsData();
  }, [initial, config]);

  useEffect(() => {
    if (!loading) return;
    if (!retry) {
      dispatch({
        type: "SET_NEW_LISTING_SCREEN",
        newListingScreen: false,
      });
      handleLoadListingsData();
    } else {
      handleLoadTopCategories();
      if (config.location_type === "local") {
        handleLoadLocations();
      }
      handleLoadListingsData();
    }
  }, [loading]);

  // Get Listing on Next Page Request
  useEffect(() => {
    if (!searchData.onScroll) return;

    handleLoadListingsData(true);
  }, [searchData.onScroll]);

  // Refreshing get listing call
  useEffect(() => {
    if (!refreshing) return;
    handleLoadListingsData();
  }, [refreshing]);

  useEffect(() => {
    if (ios && admobConfig?.admobEnabled) {
      getper();
    }
  }, []);

  const getper = async () => {
    const { status } = await getPermissionsAsync();
    if (status !== "granted") {
      const { granted } = await requestPermissionsAsync();
      if (!granted) {
        Alert.alert("", __("adMobTexts.appDisabledAlert", appSettings.lng), [
          {
            text: __("adMobTexts.okButton", appSettings.lng),
            onPress: () => {
              dispatch({
                type: "SET_ADMOB_PERMISSION",
                admobPermission: false,
              });
            },
          },
        ]);
      } else {
        dispatch({
          type: "SET_ADMOB_PERMISSION",
          admobPermission: true,
        });
      }
    } else {
      dispatch({
        type: "SET_ADMOB_PERMISSION",
        admobPermission: true,
      });
    }
  };
  const rtlTextA = rtl_support && {
    writingDirection: "rtl",
    textAlign: "right",
  };
  const rtlText = rtl_support && {
    writingDirection: "rtl",
  };
  const rtlView = rtl_support && {
    flexDirection: "row-reverse",
  };
  const onRefresh = () => {
    if (moreLoading) return;
    setRefreshing(true);
  };

  const handleLoadLocations = () => {
    api.get("locations").then((res) => {
      if (res.ok) {
        setLocationsData(res.data);
      } else {
        // print error
        // TODO handle error
        if (res.problem === "CANCEL_ERROR") {
          return true;
        }
      }
    });
  };

  const handleLoadListingsData = (onScroll) => {
    const args = !refreshing ? { ...searchData } : { ...searchData, page: 1 };
    api.get("listings", args).then((res) => {
      if (res.ok) {
        if (refreshing) {
          setRefreshing(false);
        }
        if (onScroll) {
          if (admobConfig.admobEnabled) {
            if (listingsData.length % 2 == 0) {
              setListingsData((prevListingsData) => [
                ...prevListingsData,
                { listAd: true },
                { listAd: true, dummy: true },
                ...res.data.data,
              ]);
            } else {
              setListingsData((prevListingsData) => [
                ...prevListingsData,
                { listAd: true, dummy: true },
                { listAd: true },
                ...res.data.data,
              ]);
            }
          } else {
            setListingsData((prevListingsData) => [
              ...prevListingsData,
              ...res.data.data,
            ]);
          }
          setSearchData((prevSearchData) => {
            return {
              ...prevSearchData,
              onScroll: false,
            };
          });
        } else {
          setListingsData(res.data.data);
        }
        setPagination(res.data.pagination ? res.data.pagination : {});
        if (initial) {
          setInitial(false);
        }
        setLoading(false);
      } else {
        if (refreshing) {
          setRefreshing(false);
        }
        // print error
        // TODO handle error
        if (res.problem === "CANCEL_ERROR") {
          return true;
        }
        if (res.problem === "TIMEOUT_ERROR") {
          setTimedOut(true);
        }
      }
      setMoreLoading(false);
      setLoading(false);
    });
  };
  const handleNextPageLoading = () => {
    // if (!searchData.onScroll) return;
    if (pagination && pagination.total_pages > pagination.current_page) {
      setMoreLoading(true);
      setSearchData((prevSearchData) => {
        return {
          ...prevSearchData,
          page: prevSearchData.page + 1,
          onScroll: true,
        };
      });
    }
  };
  const handleLoadTopCategories = () => {
    api.get("categories").then((res) => {
      if (res.ok) {
        setTopCategoriesData(res.data);
        dispatch({
          type: "SET_CATEGORIES_DATA",
          categories_data: res.data,
        });
      } else {
        if (res.problem === "CANCEL_ERROR") {
          return true;
        }
        // print error
        // TODO handle error
      }
    });
  };
  const handleSelectCategory = (item) => {
    setSearchData((prevSearchData) => {
      return { ...prevSearchData, categories: item.term_id, page: 1 };
    });
    dispatch({
      type: "SET_CAT_NAME",
      cat_name: [item.name],
    });
    setLoading(true);
  };

  const scrollY = new Animated.Value(0);
  const diffClamp = Animated.diffClamp(scrollY, 0, 100);
  const translateY = diffClamp.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -100],
  });

  const Category = ({ onPress, item }) => (
    <TouchableOpacity
      onPress={() => onPress(item)}
      style={{
        justifyContent: "center",
        alignItems: "center",
        width: screenWidth / 5,
        padding: 5,
      }}
    >
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {item?.icon?.url ? (
          <CategoryImageOld size={27} uri={item.icon.url} />
        ) : (
          <CategoryIconOld
            iconName={item.icon.class}
            iconSize={27}
            iconColor={COLORS.primary}
          />
        )}
        <Text
          style={{
            marginTop: 5,
            color: COLORS.text_gray,
            fontWeight: "bold",
            fontSize: 12,
          }}
          numberOfLines={1}
        >
          {decodeString(item.name)}
        </Text>
      </View>
    </TouchableOpacity>
  );
  const renderCategory = useCallback(
    ({ item }) => <Category onPress={handleSelectCategory} item={item} />,
    [refreshing, config]
  );

  const keyExtractor = useCallback((item, index) => `${index}`, []);

  const renderFeaturedItem = useCallback(
    ({ item }) => (
      <ListingCard
        onPress={() =>
          navigation.navigate(routes.listingDetailScreen, {
            listingId: item.listing_id,
          })
        }
        item={item}
      />
    ),
    [refreshing, config]
  );
  const renderFeaturedItemList = useCallback(
    ({ item }) => (
      <ListingCardList
        onPress={() =>
          navigation.navigate(routes.listingDetailScreen, {
            listingId: item.listing_id,
          })
        }
        item={item}
      />
    ),
    [refreshing, config]
  );
  const renderFeaturedItemOld = useCallback(
    ({ item }) => (
      <ListingCardOld
        onPress={() =>
          navigation.navigate(routes.listingDetailScreen, {
            listingId: item.listing_id,
          })
        }
        item={item}
      />
    ),
    [refreshing, config]
  );
  const renderFeaturedItemListOld = useCallback(
    ({ item }) => (
      <ListingCardListOld
        onPress={() =>
          navigation.navigate(routes.listingDetailScreen, {
            listingId: item.listing_id,
          })
        }
        item={item}
      />
    ),
    [refreshing, config]
  );

  const featuredListFooter = () => {
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

  const FeaturedListIosHeader = () => (
    <Animated.View>
      <View
        style={{
          flexDirection: rtl_support ? "row-reverse" : "row",
          alignItems: "center",
          paddingHorizontal: screenWidth * 0.015,

          paddingVertical: 10,
          width: screenWidth,
          justifyContent: "space-between",

          width: screenWidth * 0.97,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            fontWeight: "bold",
          }}
        >
          {__("homeScreenTexts.topCategoriesText", appSettings.lng)}
        </Text>
        <TouchableOpacity onPress={handleSeeAll}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "bold",
              color: COLORS.primary,
            }}
          >
            {__("homeScreenTexts.seAllButtonText", appSettings.lng)}
          </Text>
        </TouchableOpacity>
      </View>
      {/* categories flatlist */}
      <FlatList
        data={topCategoriesData}
        renderItem={renderCategory}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        inverted={rtl_support}
      />

      {rtl_support ? (
        <View style={[styles.featuredListingTop, rtlView]}>
          <Text
            style={[
              {
                fontSize: 15,
                fontWeight: "bold",
              },
              // rtlText,
            ]}
          >
            {searchData.categories && cat_name && (
              <Text style={[styles.selectedCat]} numberOfLines={1}>
                ({getSelectedCat(cat_name[0])})
              </Text>
            )}{" "}
            {__("homeScreenTexts.latestAdsText", appSettings.lng)}
          </Text>
        </View>
      ) : (
        <View style={[styles.featuredListingTop, rtlView]}>
          <Text
            style={[
              {
                fontSize: 15,
                fontWeight: "bold",
              },
              rtlText,
            ]}
          >
            {__("homeScreenTexts.latestAdsText", appSettings.lng)}{" "}
            {searchData.categories && cat_name && (
              <Text style={[styles.selectedCat, rtlText]} numberOfLines={1}>
                ({getSelectedCat(cat_name[0])})
              </Text>
            )}
          </Text>
        </View>
      )}
    </Animated.View>
  );

  const handleSearch = (values) => {
    Keyboard.dismiss();
    setSearchData((prevSearchData) => {
      return { ...prevSearchData, search: values.search };
    });
    setLoading(true);
  };

  const handleReset = () => {
    setSearchData({
      categories: "",
      locations: "",
      onScroll: false,
      page: 1,
      per_page: 20,
      search: "",
    });
    dispatch({
      type: "SET_SEARCH_LOCATIONS",
      search_locations: [],
    });
    dispatch({
      type: "SET_SEARCH_CATEGORIES",
      search_categories: [],
    });
  };

  const onAndroidFeaturedListingScroll = (e) => {
    scrollY.setValue(e.nativeEvent.contentOffset.y);
  };
  const onIOSFeaturedListingScroll = (e) => {
    if (!scrollButtonVisible && e.nativeEvent.contentOffset.y > 300) {
      setScrollButtonVisible(true);
    }
    if (scrollButtonVisible && e.nativeEvent.contentOffset.y < 300) {
      setScrollButtonVisible(false);
    }
  };

  const getSelectedCat = (urg) => {
    return decodeString(urg);
  };

  const ListHeader = () => {
    return (
      <View style={[styles.featuredListingTop, rtlView]}>
        {rtl_support ? (
          <>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "bold",
              }}
            >
              {searchData?.categories && cat_name && (
                <Text style={styles.selectedCat} numberOfLines={1}>
                  ({getSelectedCat(cat_name[0])})
                </Text>
              )}{" "}
              {__("homeScreenTexts.latestAdsText", appSettings.lng)}
            </Text>
          </>
        ) : (
          <>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "bold",
              }}
            >
              {__("homeScreenTexts.latestAdsText", appSettings.lng)}{" "}
              {searchData?.categories && cat_name && (
                <Text style={styles.selectedCat} numberOfLines={1}>
                  ({getSelectedCat(cat_name[0])})
                </Text>
              )}
            </Text>
          </>
        )}
      </View>
    );
  };

  const handleSeeAll = () => {
    navigation.navigate(routes.selectcategoryScreen, {
      data: topCategoriesData,
    });
  };

  const handleRetry = () => {
    setLoading(true);
    if (timedOut) setTimedOut(false);
  };

  return (
    <View style={styles.container}>
      <TabScreenHeader style={{ elevation: 0, zIndex: 2 }} sideBar />
      {/* Loading Animation */}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.text, rtlText]}>
            {__("homeScreenTexts.loadingMessage", appSettings.lng)}
          </Text>
        </View>
      ) : (
        <>
          {/* Search , Location , Reset button */}
          <View style={styles.listingTop}>
            {config.location_type === "local" && (
              <TouchableOpacity
                disabled={timedOut || networkError}
                style={styles.locationWrap}
                onPress={() =>
                  navigation.navigate(routes.selectLocationScreen, {
                    data: locationsData,
                    type: "search",
                  })
                }
              >
                <View style={[styles.locationContent, rtlView]}>
                  <FontAwesome
                    name="map-marker"
                    size={18}
                    color={COLORS.primary}
                  />
                  <Text
                    style={[styles.locationContentText, rtlTextA]}
                    numberOfLines={1}
                  >
                    {search_locations === null || !search_locations.length
                      ? __(
                          "homeScreenTexts.selectLocationText",
                          appSettings.lng
                        )
                      : search_locations.map((location) => location.name)[
                          search_locations.length - 1
                        ]}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            <Formik initialValues={{ search: "" }} onSubmit={handleSearch}>
              {({ handleChange, handleBlur, handleSubmit, values }) => (
                <View
                  style={[
                    styles.ListingSearchContainer,
                    {
                      marginLeft:
                        config?.location_type === "geo"
                          ? screenWidth * 0.015
                          : 0,
                    },
                  ]}
                >
                  <TextInput
                    style={[styles.searchInput, rtlTextA]}
                    placeholder={
                      searchData.search ||
                      __(
                        "homeScreenTexts.listingSearchPlaceholder",
                        appSettings.lng
                      )
                    }
                    placeholderTextColor={COLORS.textGray}
                    onChangeText={handleChange("search")}
                    onBlur={() => {
                      handleBlur("search");
                    }}
                    value={values.search}
                    returnKeyType="search"
                    onSubmitEditing={handleSubmit}
                  />

                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={!values.search || timedOut || networkError}
                    style={styles.listingSearchBtnContainer}
                  >
                    <Feather
                      name="search"
                      size={20}
                      color={values.search ? COLORS.primary : COLORS.primary}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <SimpleLineIcons name="refresh" size={18} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          {/* Category Slider */}
          {!!topCategoriesData.length && !ios && (
            <Animated.View
              style={[
                {
                  transform: [{ translateY: translateY }],
                },
                styles.topCatSliderWrap,
              ]}
            >
              <View
                style={{
                  flexDirection: rtl_support ? "row-reverse" : "row",
                  alignItems: "center",
                  paddingHorizontal: "3%",
                  paddingVertical: 10,
                  width: screenWidth,
                  justifyContent: "space-between",
                }}
              >
                <View style={{ alignItems: "center", flexDirection: "row" }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "bold",
                    }}
                  >
                    {__("homeScreenTexts.topCategoriesText", appSettings.lng)}
                  </Text>
                </View>
                <TouchableOpacity onPress={handleSeeAll}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "bold",
                      color: COLORS.primary,
                    }}
                  >
                    {__("homeScreenTexts.seAllButtonText", appSettings.lng)}
                  </Text>
                </TouchableOpacity>
              </View>
              {/* categories flatlist */}
              <FlatList
                data={topCategoriesData}
                renderItem={renderCategory}
                keyExtractor={keyExtractor}
                horizontal
                showsHorizontalScrollIndicator={false}
                inverted={rtl_support}
              />
            </Animated.View>
          )}

          {/* FlatList */}
          {!!listingsData.length && (
            <>
              {ios ? (
                <View
                  style={{
                    paddingHorizontal: screenWidth * 0.015,

                    flex: 1,
                  }}
                >
                  {miscConfig?.oldListingCard ? (
                    <FlatList
                      key={appSettings?.listView ? "list" : "grid"}
                      data={listingsData}
                      renderItem={
                        appSettings?.listView
                          ? renderFeaturedItemListOld
                          : renderFeaturedItemOld
                      }
                      keyExtractor={keyExtractor}
                      horizontal={false}
                      showsVerticalScrollIndicator={false}
                      onEndReached={handleNextPageLoading}
                      onEndReachedThreshold={1}
                      ListFooterComponent={featuredListFooter}
                      numColumns={appSettings?.listView ? 1 : 2}
                      maxToRenderPerBatch={appSettings?.listView ? 15 : 8}
                      windowSize={appSettings?.listView ? 41 : 61}
                      onScroll={onIOSFeaturedListingScroll}
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      contentContainerStyle={{
                        paddingBottom: screenHeight - windowHeight,
                      }}
                      ListHeaderComponent={FeaturedListIosHeader}
                      scrollEventThrottle={1}
                      ref={iosFlatList}
                    />
                  ) : (
                    <FlatList
                      key={appSettings?.listView ? "list" : "grid"}
                      data={listingsData}
                      renderItem={
                        appSettings?.listView
                          ? renderFeaturedItemList
                          : renderFeaturedItem
                      }
                      keyExtractor={keyExtractor}
                      horizontal={false}
                      showsVerticalScrollIndicator={false}
                      onEndReached={handleNextPageLoading}
                      onEndReachedThreshold={1}
                      ListFooterComponent={featuredListFooter}
                      numColumns={appSettings?.listView ? 1 : 2}
                      maxToRenderPerBatch={appSettings?.listView ? 15 : 8}
                      windowSize={appSettings?.listView ? 41 : 61}
                      onScroll={onIOSFeaturedListingScroll}
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      contentContainerStyle={{
                        paddingBottom: screenHeight - windowHeight,
                      }}
                      ListHeaderComponent={FeaturedListIosHeader}
                      scrollEventThrottle={1}
                      ref={iosFlatList}
                    />
                  )}
                  <TouchableOpacity
                    style={{
                      display: scrollButtonVisible ? "flex" : "none",
                      height: 40,
                      width: 40,
                      backgroundColor: COLORS.bg_dark,
                      alignItems: "center",
                      justifyContent: "center",
                      position: "absolute",
                      bottom: 10,
                      right: 15,
                      borderRadius: 40 / 2,
                      shadowRadius: 5,
                      shadowOpacity: 0.3,
                      shadowOffset: {
                        height: 2,
                        width: 2,
                      },
                      shadowColor: "#000",
                      paddingBottom: 3,
                    }}
                    onPress={() =>
                      iosFlatList.current.scrollToOffset({
                        animated: true,
                        offset: 0,
                      })
                    }
                  >
                    <FontAwesome
                      name="chevron-up"
                      size={20}
                      color={COLORS.primary}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <View
                  style={{
                    paddingHorizontal: screenWidth * 0.015,
                    height:
                      screenHeight - Constants.statusBarHeight - 50 - 45 - 50,
                  }}
                >
                  {miscConfig?.oldListingCard ? (
                    <Animated.FlatList
                      key={appSettings?.listView ? "list" : "grid"}
                      data={listingsData}
                      renderItem={
                        appSettings?.listView
                          ? renderFeaturedItemListOld
                          : renderFeaturedItemOld
                      }
                      keyExtractor={keyExtractor}
                      horizontal={false}
                      numColumns={appSettings?.listView ? 1 : 2}
                      showsVerticalScrollIndicator={false}
                      onEndReached={handleNextPageLoading}
                      onEndReachedThreshold={1}
                      ListFooterComponent={featuredListFooter}
                      maxToRenderPerBatch={appSettings?.listView ? 15 : 8}
                      windowSize={appSettings?.listView ? 41 : 61}
                      onScroll={onAndroidFeaturedListingScroll}
                      refreshControl={
                        <RefreshControl
                          refreshing={refreshing}
                          onRefresh={onRefresh}
                          progressViewOffset={100}
                        />
                      }
                      contentContainerStyle={{
                        paddingBottom: screenHeight - windowHeight,
                        paddingTop: 100,
                      }}
                      ListHeaderComponent={ListHeader}
                      scrollEventThrottle={1}
                      bounces={false}
                    />
                  ) : (
                    <Animated.FlatList
                      key={appSettings?.listView ? "list" : "grid"}
                      data={listingsData}
                      renderItem={
                        appSettings?.listView
                          ? renderFeaturedItemList
                          : renderFeaturedItem
                      }
                      keyExtractor={keyExtractor}
                      horizontal={false}
                      numColumns={appSettings?.listView ? 1 : 2}
                      showsVerticalScrollIndicator={false}
                      onEndReached={handleNextPageLoading}
                      onEndReachedThreshold={1}
                      ListFooterComponent={featuredListFooter}
                      maxToRenderPerBatch={appSettings?.listView ? 15 : 8}
                      windowSize={appSettings?.listView ? 41 : 61}
                      onScroll={onAndroidFeaturedListingScroll}
                      refreshControl={
                        <RefreshControl
                          refreshing={refreshing}
                          onRefresh={onRefresh}
                          progressViewOffset={100}
                        />
                      }
                      contentContainerStyle={{
                        paddingBottom: screenHeight - windowHeight,
                        paddingTop: 100,
                      }}
                      ListHeaderComponent={ListHeader}
                      scrollEventThrottle={1}
                      bounces={false}
                    />
                  )}
                </View>
              )}
            </>
          )}
          {/* No Listing Found */}
          {!listingsData.length && !timedOut && !networkError && (
            <View style={styles.noListingsWrap}>
              <Fontisto
                name="frowning"
                size={100}
                color={COLORS.primary_soft}
              />
              <Text style={styles.noListingsMessage}>
                {__("homeScreenTexts.noListingsMessage", appSettings.lng)}
              </Text>
            </View>
          )}
          {/* Timeout & Network Error notice */}
          {!listingsData.length && (!!timedOut || !!networkError) && (
            <View style={styles.noListingsWrap}>
              <Fontisto
                name="frowning"
                size={100}
                color={COLORS.primary_soft}
              />
              {!!timedOut && (
                <Text style={styles.noListingsMessage}>
                  {__("homeScreenTexts.requestTimedOut", appSettings.lng)}
                </Text>
              )}

              <View style={styles.retryButton}>
                <AppButton title="Retry" onPress={handleRetry} />
              </View>
            </View>
          )}
          {/* Flash notification */}
          <FlashNotification
            falshShow={flashNotification}
            flashMessage="Hello World!"
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  admobOverLay: {
    flex: 1,
    backgroundColor: COLORS.primary_soft,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
    padding: windowHeight * 0.03,
  },
  admobOverLayText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
  },
  categoriesRowWrap: {},
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  featuredListingTop: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: screenWidth * 0.015,
    paddingBottom: 15,
    paddingTop: 5,
  },
  itemSeparator: {
    height: "100%",
    width: 1.333,
    backgroundColor: COLORS.bg_dark,
  },
  listingSearchBtnContainer: {
    marginLeft: 7,
  },
  ListingSearchContainer: {
    flex: 1,
    height: 34,
    backgroundColor: COLORS.white,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 7,
  },
  listingTop: {
    backgroundColor: COLORS.primary,
    width: "100%",
    marginTop: -1,
    paddingTop: 1,
    zIndex: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: screenWidth * 0.015,
    paddingBottom: 10,
  },
  locationWrap: {
    maxWidth: screenWidth * 0.25,
    marginHorizontal: screenWidth * 0.015,
    backgroundColor: COLORS.white,
    borderRadius: 5,
    padding: 7,
  },
  locationContent: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  locationContentText: {
    paddingHorizontal: 5,
    color: COLORS.text_gray,
  },
  loadMoreWrap: {
    marginBottom: 10,
  },
  loading: {
    justifyContent: "center",
    alignItems: "center",
    height: screenHeight - 120,
  },
  noListingsMessage: {
    fontSize: 18,
    color: COLORS.text_gray,
    marginVertical: 10,
  },
  noListingsWrap: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  resetButton: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.white,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: screenWidth * 0.015,
  },
  retryButton: {
    width: "30%",
    alignItems: "center",
    justifyContent: "center",
  },
  searchInput: {
    flex: 1,
  },
  selectedCat: {
    fontSize: 12,
  },
  topCatSliderWrap: {
    position: "absolute",
    top: 94,
    zIndex: 1,
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },
});

export default HomeScreenOld;
