import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";

// Custom Components & Constants
import api from "../api/client";
import { paginationData } from "../app/pagination/paginationData";
import { COLORS } from "../variables/color.js";
import { useStateValue } from "../StateProvider";
import { __ } from "../language/stringPicker";
import { routes } from "../navigation/routes";

const { width: windowWidth } = Dimensions.get("window");

const allStoresFallBackImages = {
  storeCardLogo: require("../assets/100x100.png"),
};

const AllStores = ({ navigation }) => {
  const [{ appSettings, rtl_support }] = useStateValue();
  const [loading, setLoading] = useState(true);
  const [storesData, setStoresData] = useState();
  const [refreshing, setRefreshing] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(
    pagination.page || paginationData.allStores.page
  );
  //  Initial Call
  useEffect(() => {
    getStoresData(paginationData.allStores);
  }, []);

  // Refreshing get listing call
  useEffect(() => {
    if (!refreshing) return;
    setCurrentPage(1);
    setPagination({});
    getStoresData(paginationData.allStores);
  }, [refreshing]);

  // next page get listing call
  useEffect(() => {
    if (!moreLoading) return;
    const data = {
      per_page: paginationData.allStores.per_page,
      page: currentPage,
    };
    getStoresData(data);
  }, [moreLoading]);

  const getStoresData = (paginationData) => {
    api.get("stores", paginationData).then((res) => {
      if (res.ok) {
        if (refreshing) {
          setRefreshing(false);
        }
        if (moreLoading) {
          setStoresData((prevStoresData) => [
            ...prevStoresData,
            ...res.data.data,
          ]);
          setMoreLoading(false);
        } else {
          setStoresData(res.data.data);
        }
        setPagination(res.data.pagination ? res.data.pagination : {});

        if (loading) {
          setLoading(false);
        }
      } else {
        // print error
        if (refreshing) {
          setRefreshing(false);
        }
        // TODO handle error
        if (moreLoading) {
          setMoreLoading(false);
        }
        if (loading) {
          setLoading(false);
        }
      }
    });
  };

  const renderListItem = useCallback(
    ({ item }) => <StoreCard item={item} />,
    []
  );

  const handleStoreCardPress = (item) => {
    navigation.navigate(routes.storeDetailsScreen, { storeId: item.id });
  };
  const StoreCard = ({ item }) => (
    <View style={styles.storeWrap}>
      <TouchableOpacity
        style={styles.storeContent}
        onPress={() => handleStoreCardPress(item)}
      >
        <View style={styles.logoWrap}>
          {item.logo ? (
            <Image source={{ uri: item.logo }} style={styles.logo} />
          ) : (
            <Image
              source={allStoresFallBackImages.storeCardLogo}
              style={styles.logo}
            />
          )}
        </View>
        <Text style={[styles.storeCardTitle, rtlText]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.storeCardListingCount, rtlText]}>
          {item.listings_count ? item.listings_count : 0}{" "}
          {__("allStoresTexts.storeAdCount", appSettings.lng)}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const keyExtractor = useCallback((item, index) => `${index}`, []);
  const EmptyListComponent = () => (
    <View>
      <Text>{__("allStoresTexts.noShopText", appSettings.lng)}</Text>
    </View>
  );
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
    setRefreshing((prevRefreshing) => true);
  };

  const handleNextPageLoading = () => {
    if (refreshing) return;
    if (pagination && pagination.total_pages > pagination.current_page) {
      setCurrentPage((prevCurrentPage) => prevCurrentPage + 1);
      setMoreLoading(true);
    }
  };
  const rtlText = rtl_support && {
    writingDirection: "rtl",
  };

  return loading ? (
    // {* Loading Component *}
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={rtlText}>
        {__("allStoresTexts.loadingText", appSettings.lng)}
      </Text>
    </View>
  ) : (
    <View style={styles.container}>
      {/* Stores List */}
      <FlatList
        data={storesData}
        renderItem={renderListItem}
        keyExtractor={keyExtractor}
        horizontal={false}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        onEndReached={handleNextPageLoading}
        onEndReachedThreshold={1}
        ListFooterComponent={listFooter}
        maxToRenderPerBatch={15}
        windowSize={60}
        onRefresh={onRefresh}
        refreshing={refreshing}
        scrollEventThrottle={1}
        ListEmptyComponent={EmptyListComponent}
        contentContainerStyle={{
          marginHorizontal: windowWidth * 0.015,
          paddingVertical: 20,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  loading: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  logo: {
    height: windowWidth * 0.17,
    width: windowWidth * 0.25,
    resizeMode: "contain",
  },
  logoWrap: {
    height: windowWidth * 0.17,
    width: windowWidth * 0.25,
    overflow: "hidden",
  },
  storeCardListingCount: {
    fontSize: 13,
    fontWeight: "bold",
    color: COLORS.text_gray,
  },
  storeCardTitle: {
    fontWeight: "bold",
    fontSize: 14,
    marginVertical: 5,
  },
  storeContent: {
    alignItems: "center",
    padding: 5,
  },
  storeWrap: {
    // height: (windowWidth * 0.88) / 3,
    width: (windowWidth * 0.88) / 3,
    marginHorizontal: windowWidth * 0.015,
    backgroundColor: COLORS.white,
    marginBottom: windowWidth * 0.03,
    borderRadius: 5,
    // overflow: "hidden",
    alignItems: "center",
    elevation: 3,
    shadowColor: COLORS.gray,
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: {
      height: 2,
      width: 2,
    },
  },
});

export default AllStores;
