import React, { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";

// External Libraries
import DraggableFlatList from "react-native-draggable-flatlist";

// Custom Components & Constants
import ImageInput from "./ImageInput";
import { useStateValue } from "../StateProvider";
import { __ } from "../language/stringPicker";
import { AntDesign } from "@expo/vector-icons";
import { COLORS } from "../variables/color";

const ImageInputList = ({
  imageUris = [],
  onRemoveImage,
  onAddImage,
  maxCount,
  reorder,
}) => {
  const [{ appSettings }] = useStateValue();
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const renderImageItem = ({ item, drag, isActive, index }) => {
    return (
      <ImageInput
        imageUri={item}
        onChangeImage={() => onRemoveImage(item)}
        drag={drag}
        active={isActive}
        display={true}
        index={index}
      />
    );
  };

  return (
    <View
      style={{
        marginVertical: !imageUris.length ? 15 / 2 : 15,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <TouchableOpacity
        style={{ alignItems: "center", paddingHorizontal: 5 }}
        onPress={() => {
          setPhotoModalVisible(true);
        }}
        disabled={imageUris.length >= maxCount}
      >
        <View
          style={{
            backgroundColor: COLORS.primary,
            height: 50,
            width: 50,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 25,
          }}
        >
          <AntDesign name="plus" size={28} color={COLORS.white} />
        </View>
        <View style={{ paddingTop: 5 }}>
          <Text style={{ fontSize: 12, color: COLORS.text_light }}>
            {!maxCount || maxCount == 1
              ? __("imageInputListTexts.addPhotoButtonTitle", appSettings.lng)
              : __("imageInputListTexts.addPhotosButtonTitle", appSettings.lng)}
          </Text>
        </View>
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <DraggableFlatList
          ListHeaderComponent={
            imageUris.length < maxCount && (
              <ImageInput
                onChangeImage={(uri) => {
                  onAddImage(uri);
                  setPhotoModalVisible(false);
                }}
                addingImage={photoModalVisible}
                closePhotoModal={() => setPhotoModalVisible(false)}
                display={false}
              />
            )
          }
          data={imageUris}
          renderItem={renderImageItem}
          keyExtractor={(item, index) => `draggable-item-${index}`}
          onDragEnd={({ data }) => {
            reorder(data);
          }}
          horizontal
        />
      </View>
    </View>
  );
};

export default ImageInputList;
