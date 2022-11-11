import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
  Alert,
  TouchableOpacity,
  Modal,
  Text,
  Dimensions,
} from "react-native";

// Expo Libraries
import * as ImagePicker from "expo-image-picker";
import { Entypo } from "@expo/vector-icons";

// Vector Icons
import { FontAwesome } from "@expo/vector-icons";

// Custom Component & Variables
import { COLORS } from "../variables/color";
import AppTextButton from "./AppTextButton";
import { useStateValue } from "../StateProvider";
import { __ } from "../language/stringPicker";
import CameraButtonIcon from "./svgComponents/CameraButtonIcon";
import GalleryButtonIcon from "./svgComponents/GalleryButtonIcon";

const { width: deviceWidth } = Dimensions.get("screen");

const ImageInput = ({
  imageUri,
  onChangeImage,
  drag,
  active,
  addingImage,
  closePhotoModal,
  display,
  index,
}) => {
  const [{ appSettings }] = useStateValue();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!addingImage) {
      return;
    }
    setModalVisible(true);
  }, [addingImage]);

  const requestGalleryParmission = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted)
      alert(
        __("imageInputTexts.ifImageLibraryPermissionDenied", appSettings.lng)
      );
    else handleSelectGalleryImage();
  };
  const requestCameraParmission = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted)
      alert(__("imageInputTexts.ifCameraPermissionDenied", appSettings.lng));
    else handleSelectCameraImage();
  };
  const handleSelectGalleryImage = async () => {
    // if (Platform.OS === "android") {
    //   setModalVisible((preVodalVisible) => !preVodalVisible);
    // }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.5,
      });
      if (!result.cancelled) {
        // if (Platform.OS === "ios") {
        setModalVisible(false);
        // }
        onChangeImage(result.uri);
      }
    } catch (error) {
      // TODO add error storing
      setModalVisible((modalVisible) => !modalVisible);
    }
  };
  const handleSelectCameraImage = async () => {
    // if (Platform.OS === "android") {
    //   setModalVisible((prevModalVisible) => !prevModalVisible);
    // }
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.5,
      });
      if (!result.cancelled) {
        // if (Platform.OS === "ios") {
        setModalVisible(false);
        // }
        onChangeImage(result.uri);
      }
    } catch (error) {
      // TODO add error storing
      setModalVisible((modalVisible) => !modalVisible);
    }
  };
  const handleDelete = () => {
    Alert.alert(
      __("imageInputTexts.deleteMessageHeader", appSettings.lng),
      __("imageInputTexts.deletePrompt", appSettings.lng),
      [
        { text: __("imageInputTexts.noButton", appSettings.lng) },
        {
          text: __("imageInputTexts.yesButton", appSettings.lng),
          onPress: () => onChangeImage(null),
        },
      ]
    );
  };
  const handlePress = () => {
    if (!imageUri) setModalVisible((modalVisible) => !modalVisible);
  };
  return (
    <>
      <TouchableWithoutFeedback onPress={handlePress} onLongPress={drag}>
        <View
          style={[styles.container, { display: display ? "flex" : "none" }]}
        >
          {active && <View style={styles.activeOverlay} />}
          {!imageUri && (
            <FontAwesome name="camera" size={30} color={COLORS.text_gray} />
          )}
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.image} />
          )}
        </View>
      </TouchableWithoutFeedback>
      {index === 0 && (
        <TouchableOpacity style={styles.titleImgWrap} onPress={handleDelete}>
          <Entypo name="check" size={12} color={COLORS.white} />
        </TouchableOpacity>
      )}
      {imageUri && (
        <TouchableOpacity style={styles.deleteImgWrap} onPress={handleDelete}>
          <View
            style={{ height: 3, width: 10, backgroundColor: COLORS.white }}
          />
        </TouchableOpacity>
      )}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setModalVisible((modalVisible) => !modalVisible);
            closePhotoModal();
          }}
        >
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalTitleWrap}>
              <Text style={styles.modalTitle}>
                {__("imageInputTexts.addPhoto", appSettings.lng)}
              </Text>
            </View>
            <View style={styles.contentWrap}>
              <TouchableOpacity
                style={styles.libraryWrap}
                onPress={() => requestCameraParmission()}
              >
                <CameraButtonIcon
                  fillColor={COLORS.bg_primary}
                  strokeColor={COLORS.primary}
                  iconColor={COLORS.primary}
                />
                <Text style={styles.libraryText}>
                  {__("imageInputTexts.takePhoto", appSettings.lng)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.libraryWrap}
                onPress={() => requestGalleryParmission()}
              >
                <GalleryButtonIcon
                  fillColor="#EBF9FF"
                  strokeColor="#2267ED"
                  iconColor="#2267ED"
                />
                <Text style={styles.libraryText}>
                  {__("imageInputTexts.fromGallery", appSettings.lng)}
                </Text>
              </TouchableOpacity>
            </View>
            <AppTextButton
              style={styles.cancelButton}
              title={__("imageInputTexts.cancelButtonTitle", appSettings.lng)}
              onPress={() => {
                setModalVisible((modalVisible) => !modalVisible);
                closePhotoModal();
              }}
              textStyle={{ color: COLORS.text_dark, fontWeight: "bold" }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  activeOverlay: {
    height: "100%",
    width: "100%",
    backgroundColor: COLORS.bg_primary,
    opacity: 0.3,
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 6,
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: "#e5e5e5",
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 6,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    height: deviceWidth * 0.2,
    width: deviceWidth * 0.2,
    marginRight: deviceWidth * 0.04,
  },
  contentWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteImgWrap: {
    position: "absolute",
    height: 18,
    width: 18,
    borderRadius: 9,
    top: "20%",
    right: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.red,
  },
  titleImgWrap: {
    position: "absolute",
    height: 18,
    width: 18,
    borderRadius: 9,
    top: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.green,
  },
  image: {
    height: "100%",
    width: "100%",
  },
  libraryText: {
    fontSize: 14.5,
    color: COLORS.text_gray,
    marginVertical: 10,
  },
  libraryWrap: {
    alignItems: "center",
    marginHorizontal: 15,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: COLORS.text_dark,
    marginBottom: 15,
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 25,
    alignItems: "center",
  },
});

export default ImageInput;
