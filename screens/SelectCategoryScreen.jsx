/* eslint-disable no-unused-vars */
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";

// Expo Libraries
import Constants from "expo-constants";

// Vector Icons
import { Entypo } from "@expo/vector-icons";

// Custom Components & Functions
import api from "../api/client";
import { decodeString } from "../helper/helper";
import { COLORS } from "../variables/color";
import { useStateValue } from "../StateProvider";
import CategoryImage from "../components/CategoryImage";
import CategoryIcon from "../components/CategoryIcon";
import { __ } from "../language/stringPicker";

const { width: screenWidth, height: windowHeight } = Dimensions.get("window");

const SelectCategoryScreen = ({ route, navigation }) => {
  const [{ ios, appSettings, rtl_support }, dispatch] = useStateValue();
  const [categoryData, setCategoryData] = useState({ 0: route.params.data });
  const [currentCategory, setCurrentCategory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bottomLevel, setBottomLevel] = useState(false);

  const Category = ({ index, onPress, item }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        alignItems: "center",
        width: (screenWidth * 0.88) / 3,
        paddingTop: "5%",
        backgroundColor: COLORS.white,
        marginHorizontal: screenWidth * 0.015,
        height: (screenWidth * 0.88 * 1.04) / 3,
        marginBottom: screenWidth * 0.03,
        borderRadius: 5,
        overflow: "hidden",
        shadowColor: COLORS.black,
        shadowOpacity: 0.2,
        shadowRadius: 2,
        shadowOffset: {
          height: 2,
          width: 2,
        },
        elevation: 5,
      }}
    >
      {item?.icon?.url ? (
        <CategoryImage size={(screenWidth * 0.88) / 9} uri={item.icon.url} />
      ) : (
        <CategoryIcon
          iconName={item.icon.class}
          iconSize={(screenWidth * 0.88) / 9}
          iconColor={
            currentCategory.includes(item.term_id)
              ? COLORS.white
              : COLORS.primary
          }
        />
      )}
      <View
        style={{
          paddingTop: "12%",
          alignItems: "center",
          paddingHorizontal: 5,
          flex: 1,
          justifyContent: "center",
        }}
      >
        <Text style={{ textAlign: "center", marginTop: 5 }} numberOfLines={2}>
          {decodeString(item.name)}
        </Text>
      </View>
    </TouchableOpacity>
  );
  const Picker = () => (
    <View style={styles.pickerWrap}>
      <TouchableOpacity
        style={[styles.subCategoryWrap, rtlView]}
        onPress={handleSelectall}
      >
        <Text style={[styles.catPickerOptions, rtlText]} numberOfLines={1}>
          {__("selectCategoryScreenTexts.showAllofCategory", appSettings.lng)}
          {getAllOptionsTaxonomy()}
        </Text>
      </TouchableOpacity>
      {categoryData[Object.keys(categoryData).length - 1].map((data) => (
        <TouchableOpacity
          key={data.term_id}
          style={[styles.subCategoryWrap, rtlView]}
          onPress={() => handleSelectSubCategory(data)}
        >
          <Text style={[styles.catPickerOptions, rtlText]} numberOfLines={1}>
            {decodeString(data.name)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const getAllOptionsTaxonomy = () => {
    return decodeString(
      categoryData[currentCategory.length - 1].filter(
        (_catData) =>
          _catData.term_id === currentCategory[currentCategory.length - 1]
      )[0].name
    );
  };

  const renderCategory = useCallback(
    ({ item, index }) => (
      <Category
        index={index}
        onPress={() => handleSelectCategory(item)}
        item={item}
      />
    ),
    []
  );

  const keyExtractor = useCallback((item, index) => `${index}`, []);

  const handleSelectCategory = (item) => {
    setLoading(true);

    setCurrentCategory((prevCurrentCategory) => [
      ...prevCurrentCategory,
      item.term_id,
    ]);
    dispatch({
      type: "SET_CAT_NAME",
      cat_name: [item.name],
    });

    getSubCategoryData(item);
  };

  const getSubCategoryData = (item) => {
    api.get("categories", { parent_id: item.term_id }).then((res) => {
      if (res.ok) {
        if (res.data.length) {
          setCategoryData((prevCategoryData) => {
            const index = Object.keys(prevCategoryData).length;
            const newData = { ...prevCategoryData };
            newData[index] = [...res.data];
            return newData;
          });
          setLoading(false);
        } else {
          setBottomLevel(true);
          setLoading(false);
          dispatch({
            type: "SET_SEARCH_CATEGORIES",
            search_categories: [item.term_id],
          });
          dispatch({
            type: "SET_CAT_NAME",
            cat_name: [item.name],
          });

          navigation.goBack();
        }
      } else {
        // print error
        // TODO handle error
        setLoading(false);
      }
    });
  };

  const handleSelectedCatagoryTouch = (cat, index) => {
    setCurrentCategory((prevCurrentCategory) =>
      prevCurrentCategory.slice(0, index)
    );
    const selectedData = {};
    for (let i = 0; i <= index; i++) {
      selectedData[i] = categoryData[i];
    }
    setCategoryData(selectedData);
  };
  const handleSelectSubCategory = (item) => {
    setLoading(true);

    setCurrentCategory((prevCurrentCategory) => [
      ...prevCurrentCategory,
      item.term_id,
    ]);

    getSubCategoryData(item);
  };

  const handleSelectall = () => {
    setBottomLevel(true);
    dispatch({
      type: "SET_SEARCH_CATEGORIES",
      search_categories: currentCategory,
    });

    navigation.goBack();
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

  const ListHeaderComponent = () => (
    <View
      style={[
        {
          paddingHorizontal: "3%",
          justifyContent: "center",
          height: 37,
          alignItems: rtl_support ? "flex-end" : "flex-start",
          marginVertical: 10,
        },
        rtlView,
      ]}
    >
      <Text
        style={[
          {
            fontSize: 16,
            fontWeight: "bold",
            paddingHorizontal: 5,
            color: COLORS.text_dark,
          },
          rtlText,
        ]}
      >
        {__("selectCategoryScreenTexts.allCategory", appSettings.lng)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
      {!currentCategory?.length && (
        <View
          style={{
            flex: 1,
          }}
        >
          <FlatList
            data={categoryData[0]}
            renderItem={renderCategory}
            keyExtractor={keyExtractor}
            numColumns={3}
            contentContainerStyle={{
              paddingHorizontal: screenWidth * 0.015,
            }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={ListHeaderComponent}
          />
        </View>
      )}
      {!!currentCategory?.length && (
        <View style={styles.catPickerWrap}>
          <ScrollView>
            {!loading && Object.keys(categoryData).length > 1 && !bottomLevel && (
              <>
                {!!currentCategory.length &&
                  currentCategory.map((cat, index) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.selected, rtlView]}
                      onPress={() => handleSelectedCatagoryTouch(cat, index)}
                    >
                      <Text style={[styles.selectedText, rtlText]}>
                        {decodeString(
                          categoryData[index].find((i) => i.term_id === cat)
                            .name
                        )}
                      </Text>
                      <Entypo name="cross" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                  ))}
                <Picker />
              </>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  catPickerOptions: {
    fontSize: 14,
  },
  catPickerWrap: {
    flex: 1,
  },
  container: { flex: 1, backgroundColor: COLORS.bg_dark },
  itemSeparator: {
    height: 1,
    backgroundColor: COLORS.bg_dark,
  },
  loading: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  pickerWrap: {
    backgroundColor: COLORS.bg_dark,
    marginHorizontal: "3%",
    marginVertical: 10,
  },
  selected: {
    marginHorizontal: "3%",
    marginVertical: 10,
    backgroundColor: COLORS.white,
    borderRadius: 3,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedText: {
    fontWeight: "bold",
    color: COLORS.primary,
    fontSize: 15,
  },
  subCategoryWrap: {
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    marginVertical: 5,
    paddingHorizontal: 8,
  },
});

export default SelectCategoryScreen;
