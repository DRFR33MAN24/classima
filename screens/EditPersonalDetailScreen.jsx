/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
  Pressable,
} from "react-native";

// Expo Libraries
import * as ImagePicker from "expo-image-picker";

// External Libraries
import { Formik } from "formik";
import * as Yup from "yup";

// Vector Icons
import {
  MaterialCommunityIcons,
  FontAwesome,
  FontAwesome5,
  Ionicons,
  AntDesign,
  Feather,
} from "@expo/vector-icons";

// Custom Components & Constants
import AppSeparator from "../components/AppSeparator";
import { COLORS } from "../variables/color";
import AppButton from "../components/AppButton";
import { useStateValue } from "../StateProvider";
import api, {
  setAuthToken,
  setMultipartHeader,
  removeAuthToken,
  removeMultipartHeader,
} from "../api/client";
import AppTextButton from "../components/AppTextButton";
import FlashNotification from "../components/FlashNotification";
import authStorage from "../app/auth/authStorage";
import { __ } from "../language/stringPicker";
import CameraButtonIcon from "../components/svgComponents/CameraButtonIcon";
import GalleryButtonIcon from "../components/svgComponents/GalleryButtonIcon";

const { width: deviceWidth, height: deviceHeight } = Dimensions.get("window");
const EditPersonalDetailScreen = ({ route, navigation }) => {
  const [{ auth_token, user, ios, appSettings, rtl_support }, dispatch] =
    useStateValue();
  const [{ data }] = useState(route.params);
  const [validationSchema, setValidationSchema] = useState(
    Yup.object().shape({
      first_name: Yup.string().required(
        __(
          "editPersonalDetailScreenTexts.fieldLabels.firstName",
          appSettings.lng
        ) +
          " " +
          __(
            "editPersonalDetailScreenTexts.formValidation.requiredField",
            appSettings.lng
          )
      ),
      last_name: Yup.string().required(
        __(
          "editPersonalDetailScreenTexts.fieldLabels.lastName",
          appSettings.lng
        ) +
          " " +
          __(
            "editPersonalDetailScreenTexts.formValidation.requiredField",
            appSettings.lng
          )
      ),
      pass1: Yup.string().min(
        3,
        __(
          "editPersonalDetailScreenTexts.fieldLabels.password",
          appSettings.lng
        ) +
          " " +
          __(
            "editPersonalDetailScreenTexts.formValidation.minimumLength3",
            appSettings.lng
          )
      ),
      phone: Yup.string()
        .required(
          __(
            "editPersonalDetailScreenTexts.fieldLabels.phone",
            appSettings.lng
          ) +
            " " +
            __(
              "editPersonalDetailScreenTexts.formValidation.requiredField",
              appSettings.lng
            )
        )
        .min(
          5,
          __(
            "editPersonalDetailScreenTexts.fieldLabels.phone",
            appSettings.lng
          ) +
            " " +
            __(
              "editPersonalDetailScreenTexts.formValidation.minimumLength5",
              appSettings.lng
            )
        ),
      whatsapp_number: Yup.string().min(
        5,
        __(
          "editPersonalDetailScreenTexts.fieldLabels.whatsapp",
          appSettings.lng
        ) +
          " " +
          __(
            "editPersonalDetailScreenTexts.formValidation.minimumLength3",
            appSettings.lng
          )
      ),
      website: Yup.string()
        .url(
          __(
            "editPersonalDetailScreenTexts.formValidation.validUrl",
            appSettings.lng
          )
        )
        .label(
          __(
            "editPersonalDetailScreenTexts.fieldLabels.website",
            appSettings.lng
          )
        ),
      zipcode: Yup.string()
        .required(
          __(
            "editPersonalDetailScreenTexts.fieldLabels.zipcode",
            appSettings.lng
          ) +
            " " +
            __(
              "editPersonalDetailScreenTexts.formValidation.requiredField",
              appSettings.lng
            )
        )
        .min(
          3,
          __(
            "editPersonalDetailScreenTexts.fieldLabels.zipcode",
            appSettings.lng
          ) +
            " " +
            __(
              "editPersonalDetailScreenTexts.formValidation.minimumLength3",
              appSettings.lng
            )
        ),
      address: Yup.string().required(
        __(
          "editPersonalDetailScreenTexts.fieldLabels.address",
          appSettings.lng
        ) +
          " " +
          __(
            "editPersonalDetailScreenTexts.formValidation.requiredField",
            appSettings.lng
          )
      ),
    })
  );
  const [passwordToggle, setPasswordToggle] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [flashNotification, setFlashNotification] = useState(false);
  const [flashNotificationMessage, setFlashNotificationMessage] = useState();
  const [secureUserData, setSecureUserData] = useState(null);
  const [passSecure, setPassSecure] = useState({ pass1: true, pass2: true });

  // get secureUser
  useEffect(() => {
    getSecureUserData();
  }, []);

  const getSecureUserData = async () => {
    const storedUserData = await authStorage.getUser();
    if (!storedUserData) return;

    setSecureUserData(JSON.parse(storedUserData));
  };

  const requestGalleryParmission = async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert(
          __(
            "editPersonalDetailScreenTexts.cameraRollPermissionAlert",
            appSettings.lng
          )
        );
      } else handleSelectGalleryImage();
    }
  };
  const requestCameraParmission = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alert(
          __(
            "editPersonalDetailScreenTexts.cameraPermissionAlert",
            appSettings.lng
          )
        );
      } else handleSelectCameraImage();
    }
  };

  const handleSelectGalleryImage = async () => {
    // if (Platform.OS === "android") {
    //   setModalVisible((prevModalVisible) => false);
    // }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });
    // if (
    //   ios && !result.cancelled) {
    //   }
    if (!result.cancelled) {
      setModalVisible(false);
      setImageLoading(true);
      setAuthToken(auth_token);
      setMultipartHeader();
      let localUri = result.uri;
      let filename = localUri.split("/").pop();
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : `image`;
      const image = {
        uri: localUri,
        name: filename,
        type,
      };
      // Upload the image using the fetch and FormData APIs
      let formData = new FormData();
      // Assume "photo" is the name of the form field the server expects
      formData.append("image", image);
      updateImage(formData);
    }
  };

  const handleSelectCameraImage = async () => {
    // if (Platform.OS === "android") {
    //   setModalVisible((prevModalVisible) => false);
    // }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });
    // if (ios && !result.cancelled) {
    // }

    if (!result.cancelled) {
      setModalVisible(false);
      setImageLoading(true);
      setAuthToken(auth_token);
      setMultipartHeader();
      let localUri = result.uri;
      let filename = localUri.split("/").pop();
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : `image`;
      const image = {
        uri: localUri,
        name: filename,
        type,
      };
      // Upload the image using the fetch and FormData APIs
      let formData = new FormData();
      // Assume "photo" is the name of the form field the server expects
      formData.append("image", image);
      updateImage(formData);
    }
  };

  const updateImage = (formData) => {
    api.post("my/profile-image", formData).then((res) => {
      if (res.ok) {
        const userWithUpdatedImage = {
          ...user,
          ["pp_thumb_url"]: res.data.src,
        };
        dispatch({
          type: "SET_AUTH_DATA",
          data: { user: userWithUpdatedImage },
        });
        removeAuthToken();
        removeMultipartHeader();
        setImageLoading(false);
        handleSuccess(
          __("editPersonalDetailScreenTexts.successText", appSettings.lng)
        );
        const tempuser = { ...user, ["pp_thumb_url"]: res.data.src };
        authStorage.storeUser(
          JSON.stringify({ ...secureUserData, ["user"]: tempuser })
        );
      } else {
        removeAuthToken();
        removeMultipartHeader();
        setImageLoading(false);
        handleError(
          res?.data?.error_message ||
            res?.data?.error ||
            res?.problem ||
            __("editPersonalDetailScreenTexts.errorText", appSettings.lng)
        );
      }
    });
  };

  const handleUpdate = (values) => {
    if (loading) false;
    setLoading(true);

    const update = { ...values, ["change_password"]: passwordToggle };

    setAuthToken(auth_token);
    api.post("my", values).then((res) => {
      if (res.ok) {
        dispatch({
          type: "SET_AUTH_DATA",
          data: {
            user: res.data,
          },
        });

        setLoading(false);
        handleSuccess(
          __("editPersonalDetailScreenTexts.successText", appSettings.lng)
        );

        authStorage.storeUser(
          JSON.stringify({ ...secureUserData, ["user"]: res.data })
        );
      } else {
        setLoading(false);
        handleError(
          res?.data?.error_message ||
            res?.data?.error ||
            res?.problem ||
            __("editPersonalDetailScreenTexts.errorText", appSettings.lng)
        );
      }
    });

    removeAuthToken();
  };
  const handleButtonDisable = (touched, errors, values) => {
    if (
      !Object.keys(touched).length ||
      !!Object.keys(errors).length ||
      values.pass1 !== values.pass2 ||
      (passwordToggle && !values.pass1)
    ) {
      return true;
    } else {
      return false;
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
      navigation.goBack();
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
  const rtlTextA = rtl_support && {
    writingDirection: "rtl",
    textAlign: "right",
  };
  const rtlView = rtl_support && {
    flexDirection: "row-reverse",
  };
  return (
    <KeyboardAvoidingView
      behavior={ios ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: COLORS.bg_dark }}
      keyboardVerticalOffset={80}
    >
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
      <View style={{ alignItems: "center", height: deviceWidth * 0.31 }}>
        <View style={styles.userImgSectionBg} />
        <View style={styles.imageWrap}>
          {imageLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Pressable
              onPress={() => {
                setModalVisible((modalVisible) => !modalVisible);
              }}
            >
              <View style={styles.editImgBtnWrap}>
                <Ionicons name="ios-camera-outline" size={24} color="black" />
              </View>
              {user.pp_thumb_url ? (
                <Image
                  source={{ uri: user.pp_thumb_url }}
                  style={styles.image}
                />
              ) : (
                <FontAwesome name="user" size={20} color={COLORS.text_gray} />
              )}
            </Pressable>
          )}
        </View>
      </View>
      <>
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
              <View style={styles.formSectionWrap}>
                <View style={[styles.infoSectionTitleRowWrap, rtlView]}>
                  <View style={styles.infoSectionTitleRowIconWrap}>
                    <Feather name="user" size={24} color={COLORS.primary} />
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
                <Formik
                  initialValues={{
                    first_name: data?.first_name || "",
                    last_name: data?.last_name || "",
                    pass1: "",
                    pass2: "",
                    phone: data?.phone || "",
                    whatsapp_number: data?.whatsapp_number || "",
                    website: data?.website || "",
                    zipcode: data?.zipcode || "",
                    address: data?.address || "",
                  }}
                  validationSchema={validationSchema}
                  onSubmit={handleUpdate}
                >
                  {({
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    values,
                    errors,
                    setFieldTouched,
                    touched,
                  }) => (
                    <View style={styles.formWrap}>
                      <View style={styles.inputWrap}>
                        <Text style={[styles.label, rtlTextA]}>
                          {__(
                            "editPersonalDetailScreenTexts.fieldLabels.firstName",
                            appSettings.lng
                          )}
                          <Text style={styles.required}> *</Text>
                        </Text>
                        <TextInput
                          style={[styles.formInput, rtlTextA]}
                          onChangeText={handleChange("first_name")}
                          onBlur={handleBlur("first_name")}
                          value={values.first_name}
                          placeholder={__(
                            "editPersonalDetailScreenTexts.fieldLabels.firstName",
                            appSettings.lng
                          )}
                          defaultValue={data.first_name || ""}
                        />
                        <View style={styles.inputErrorWrap}>
                          {errors.first_name && touched.first_name && (
                            <Text style={[styles.inputErrorMessage, rtlTextA]}>
                              {errors.first_name}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.inputWrap}>
                        <Text style={[styles.label, rtlTextA]}>
                          {__(
                            "editPersonalDetailScreenTexts.fieldLabels.lastName",
                            appSettings.lng
                          )}
                          <Text style={styles.required}> *</Text>
                        </Text>
                        <TextInput
                          style={[styles.formInput, rtlTextA]}
                          onChangeText={handleChange("last_name")}
                          onBlur={handleBlur("last_name")}
                          value={values.last_name}
                          placeholder={__(
                            "editPersonalDetailScreenTexts.fieldLabels.lastName",
                            appSettings.lng
                          )}
                          defaultValue={data.last_name || ""}
                        />
                        <View style={styles.inputErrorWrap}>
                          {errors.last_name && touched.last_name && (
                            <Text style={[styles.inputErrorMessage, rtlTextA]}>
                              {errors.last_name}
                            </Text>
                          )}
                        </View>
                      </View>

                      <View style={styles.inputWrap}>
                        <Text style={[styles.label, rtlTextA]}>
                          {__(
                            "editPersonalDetailScreenTexts.fieldLabels.phone",
                            appSettings.lng
                          )}
                          <Text style={styles.required}> *</Text>
                        </Text>
                        <TextInput
                          style={[
                            styles.formInput,
                            {
                              color: user?.phone_verified
                                ? COLORS.text_gray
                                : COLORS.text_dark,
                            },
                            rtlTextA,
                          ]}
                          onChangeText={handleChange("phone")}
                          onBlur={handleBlur("phone")}
                          value={values.phone}
                          placeholder={__(
                            "editPersonalDetailScreenTexts.fieldLabels.phone",
                            appSettings.lng
                          )}
                          defaultValue={data.phone || ""}
                          keyboardType="phone-pad"
                          editable={!user?.phone_verified}
                        />
                        <View style={styles.inputErrorWrap}>
                          {errors.phone && touched.phone && (
                            <Text style={[styles.inputErrorMessage, rtlTextA]}>
                              {errors.phone}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.inputWrap}>
                        <Text style={[styles.label, rtlTextA]}>
                          {__(
                            "editPersonalDetailScreenTexts.fieldLabels.whatsapp",
                            appSettings.lng
                          )}
                        </Text>
                        <TextInput
                          style={[styles.formInput, rtlTextA]}
                          onChangeText={handleChange("whatsapp_number")}
                          onBlur={handleBlur("whatsapp_number")}
                          value={values.whatsapp_number}
                          placeholder={__(
                            "editPersonalDetailScreenTexts.fieldLabels.whatsapp",
                            appSettings.lng
                          )}
                          defaultValue={data.whatsapp_number || ""}
                          keyboardType="phone-pad"
                        />
                        <View style={styles.inputErrorWrap}>
                          {errors.whatsapp_number &&
                            touched.whatsapp_number && (
                              <Text
                                style={[styles.inputErrorMessage, rtlTextA]}
                              >
                                {errors.whatsapp_number}
                              </Text>
                            )}
                        </View>
                      </View>
                      <View style={styles.inputWrap}>
                        <Text style={[styles.label, rtlTextA]}>
                          {__(
                            "editPersonalDetailScreenTexts.fieldLabels.website",
                            appSettings.lng
                          )}
                        </Text>
                        <TextInput
                          style={[styles.formInput, rtlTextA]}
                          onChangeText={handleChange("website")}
                          onBlur={handleBlur("website")}
                          value={values.website}
                          placeholder={__(
                            "editPersonalDetailScreenTexts.fieldLabels.website",
                            appSettings.lng
                          )}
                          defaultValue={data.website || ""}
                        />
                        <View style={styles.inputErrorWrap}>
                          {errors.website && touched.website && (
                            <Text style={[styles.inputErrorMessage, rtlTextA]}>
                              {errors.website}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.inputWrap}>
                        <Text style={[styles.label, rtlTextA]}>
                          {__(
                            "editPersonalDetailScreenTexts.fieldLabels.zipcode",
                            appSettings.lng
                          )}
                          <Text style={styles.required}> *</Text>
                        </Text>
                        <TextInput
                          style={[styles.formInput, rtlTextA]}
                          onChangeText={handleChange("zipcode")}
                          onBlur={handleBlur("zipcode")}
                          value={values.zipcode}
                          placeholder={__(
                            "editPersonalDetailScreenTexts.fieldLabels.zipcode",
                            appSettings.lng
                          )}
                          defaultValue={data.zipcode || ""}
                        />
                        <View style={styles.inputErrorWrap}>
                          {errors.zipcode && touched.zipcode && (
                            <Text style={[styles.inputErrorMessage, rtlTextA]}>
                              {errors.zipcode}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.inputWrap}>
                        <Text style={[styles.label, rtlTextA]}>
                          {__(
                            "editPersonalDetailScreenTexts.fieldLabels.address",
                            appSettings.lng
                          )}
                          <Text style={styles.required}> *</Text>
                        </Text>
                        <TextInput
                          style={[styles.formInput, rtlTextA]}
                          onChangeText={handleChange("address")}
                          onBlur={handleBlur("address")}
                          value={values.address}
                          placeholder={__(
                            "editPersonalDetailScreenTexts.fieldLabels.address",
                            appSettings.lng
                          )}
                          defaultValue={data.address || ""}
                        />
                        <View style={styles.inputErrorWrap}>
                          {errors.address && touched.address && (
                            <Text style={[styles.inputErrorMessage, rtlTextA]}>
                              {errors.address}
                            </Text>
                          )}
                        </View>
                      </View>
                      {passwordToggle && (
                        <>
                          <View style={styles.inputWrap}>
                            <Text style={[styles.label, rtlTextA]}>
                              {__(
                                "editPersonalDetailScreenTexts.fieldLabels.newPassword",
                                appSettings.lng
                              )}
                            </Text>
                            <View
                              style={[
                                {
                                  flexDirection: "row",
                                  alignItems: "center",
                                },
                                rtlView,
                              ]}
                            >
                              <TextInput
                                style={[
                                  styles.formInput,
                                  { flex: 1 },
                                  rtlTextA,
                                ]}
                                onChangeText={handleChange("pass1")}
                                onBlur={handleBlur("pass1")}
                                value={values.pass1}
                                placeholder={__(
                                  "editPersonalDetailScreenTexts.enterNewPassword",
                                  appSettings.lng
                                )}
                                defaultValue={data.pass1}
                                secureTextEntry={passSecure.pass1}
                              />
                              <TouchableWithoutFeedback
                                onPress={() =>
                                  setPassSecure((prevPassSecure) => {
                                    return {
                                      ...prevPassSecure,
                                      pass1: !prevPassSecure.pass1,
                                    };
                                  })
                                }
                              >
                                <View
                                  style={{
                                    width: 35,
                                    alignItems: "center",
                                  }}
                                >
                                  <FontAwesome5
                                    name={
                                      passSecure?.pass1 ? "eye" : "eye-slash"
                                    }
                                    size={16}
                                    color={COLORS.text_gray}
                                  />
                                </View>
                              </TouchableWithoutFeedback>
                            </View>
                            <View style={styles.inputErrorWrap}>
                              {errors.pass1 && touched.pass1 && (
                                <Text
                                  style={[styles.inputErrorMessage, rtlTextA]}
                                >
                                  {errors.pass1}
                                </Text>
                              )}
                            </View>
                          </View>
                          <View style={styles.inputWrap}>
                            <Text style={[styles.label, rtlTextA]}>
                              {__(
                                "editPersonalDetailScreenTexts.fieldLabels.confirmPassword",
                                appSettings.lng
                              )}
                            </Text>
                            <View
                              style={[
                                {
                                  flexDirection: "row",
                                  alignItems: "center",
                                },
                                rtlView,
                              ]}
                            >
                              <TextInput
                                style={[
                                  styles.formInput,
                                  { flex: 1 },
                                  rtlTextA,
                                ]}
                                onChangeText={handleChange("pass2")}
                                onBlur={() => setFieldTouched("pass2")}
                                value={values.pass2}
                                placeholder={__(
                                  "editPersonalDetailScreenTexts.reEnterPassword",
                                  appSettings.lng
                                )}
                                defaultValue={data.pass2}
                                secureTextEntry={passSecure.pass2}
                              />
                              <TouchableWithoutFeedback
                                onPress={() =>
                                  setPassSecure((prevPassSecure) => {
                                    return {
                                      ...prevPassSecure,
                                      pass2: !prevPassSecure.pass2,
                                    };
                                  })
                                }
                              >
                                <View
                                  style={{
                                    width: 35,
                                    alignItems: "center",
                                  }}
                                >
                                  <FontAwesome5
                                    name={
                                      passSecure?.pass2 ? "eye" : "eye-slash"
                                    }
                                    size={16}
                                    color={COLORS.text_gray}
                                  />
                                </View>
                              </TouchableWithoutFeedback>
                            </View>
                            <View style={styles.inputErrorWrap}>
                              {touched.pass2 &&
                                values.pass1 !== values.pass2 && (
                                  <Text
                                    style={[styles.inputErrorMessage, rtlTextA]}
                                  >
                                    {__(
                                      "editPersonalDetailScreenTexts.passwordNotSameMessage",
                                      appSettings.lng
                                    )}
                                  </Text>
                                )}
                            </View>
                          </View>
                        </>
                      )}
                      <View style={styles.passwordToggleWrap}>
                        <TouchableOpacity
                          style={[styles.passwordToggle, rtlView]}
                          onPress={() => setPasswordToggle(!passwordToggle)}
                        >
                          <MaterialCommunityIcons
                            name={
                              passwordToggle
                                ? "checkbox-marked"
                                : "checkbox-blank-outline"
                            }
                            size={24}
                            color={COLORS.primary}
                          />
                          <Text style={[styles.passwordToggleText, rtlTextA]}>
                            {__(
                              "editPersonalDetailScreenTexts.passwordToggleText",
                              appSettings.lng
                            )}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <AppButton
                        onPress={handleSubmit}
                        title={__(
                          "editPersonalDetailScreenTexts.updateDetailsButtonTitle",
                          appSettings.lng
                        )}
                        style={[
                          styles.updateButton,
                          { writingDirection: "rtl" },
                        ]}
                        textStyle={styles.loginBtnTxt}
                        loading={loading}
                        disabled={handleButtonDisable(touched, errors, values)}
                      />
                    </View>
                  )}
                </Formik>
              </View>
            </View>
          </ScrollView>
        </View>
      </>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback
          onPress={() => setModalVisible((modalVisible) => !modalVisible)}
        >
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalTitleWrap}>
              <Text style={styles.modalTitle}>
                {__(
                  "editPersonalDetailScreenTexts.addPhotoTitle",
                  appSettings.lng
                )}
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
                  {__(
                    "editPersonalDetailScreenTexts.takePhotoButtonTitle",
                    appSettings.lng
                  )}
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
                  {__(
                    "editPersonalDetailScreenTexts.fromGalleryButtonTitle",
                    appSettings.lng
                  )}
                </Text>
              </TouchableOpacity>
            </View>
            <AppTextButton
              style={styles.cancelButton}
              title={__("imageInputTexts.cancelButtonTitle", appSettings.lng)}
              onPress={() => {
                setModalVisible((modalVisible) => !modalVisible);
              }}
              textStyle={{ color: COLORS.text_dark, fontWeight: "bold" }}
            />
          </View>
        </View>
      </Modal>

      <FlashNotification
        falshShow={flashNotification}
        flashMessage={flashNotificationMessage}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: COLORS.bg_dark,
    flex: 1,
    paddingTop: 15,
  },
  contentWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  editImgBtnWrap: {
    position: "absolute",
    zIndex: 1,
    opacity: 0.3,
    height: "100%",
    width: "100%",
    backgroundColor: COLORS.gray,
    alignItems: "center",
    justifyContent: "center",
  },
  formSectionWrap: {
    backgroundColor: COLORS.white,
    marginHorizontal: "3%",
    borderRadius: 5,
    elevation: 1.5,
    shadowColor: COLORS.black,
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { height: 0, width: 0 },
  },
  inputErrorMessage: {
    color: COLORS.red,
    fontSize: 12,
  },
  formInput: {
    fontSize: 16,
    color: COLORS.text_dark,
    // minHeight: 32,
    backgroundColor: "#f8f8f8",
    paddingVertical: Platform.OS == "ios" ? 10 : 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  formWrap: {
    paddingHorizontal: "3%",
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
  imagePicker: {
    flexDirection: "row",
    paddingHorizontal: "3%",
    marginVertical: 10,
    alignItems: "center",
  },
  imagePickerButton: {
    paddingVertical: 10,
    borderRadius: 3,
  },
  imagePickerButtonWrap: {
    flex: 1,
    alignItems: "flex-end",
  },
  imageWrap: {
    height: deviceWidth * 0.26,
    width: deviceWidth * 0.26,
    borderRadius: deviceWidth * 0.13,
    overflow: "hidden",
    backgroundColor: COLORS.white,
    top: deviceWidth * 0.05,
    alignItems: "center",
    justifyContent: "center",
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
  inputErrorWrap: {
    minHeight: 17,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  inputWrap: {
    marginBottom: 5,
  },
  label: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.text_gray,
    marginBottom: 10,
    marginTop: 2,
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
  mainWrap: {
    backgroundColor: COLORS.bg_dark,
    paddingBottom: 15,
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
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text_dark,
    marginBottom: 15,
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: "center",
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
  passwordToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  passwordToggleText: {
    marginHorizontal: 5,
  },
  passwordToggleWrap: {
    marginBottom: 10,
  },
  required: {
    color: COLORS.red,
  },
  rowInputWrap: {
    width: "48%",
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
    backgroundColor: COLORS.bg_dark,
  },
  title: {
    fontWeight: "bold",
    color: COLORS.text_gray,
  },
  titleWrap: {
    paddingHorizontal: "3%",
    marginBottom: 10,
  },
  updateButton: {
    width: "100%",
    paddingVertical: 10,
    borderRadius: 3,
    marginTop: 15,
    marginBottom: 30,
  },
  userImgSectionBg: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 22,
    borderBottomLeftRadius: 22,
    height: deviceWidth * 0.18,
    width: deviceWidth,
    position: "absolute",
  },
});

export default EditPersonalDetailScreen;
