/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
} from "react-native";

// External Libraries
import { Formik } from "formik";
import * as Yup from "yup";

// Custom Components & Functions
import Constants from "expo-constants";
import AppButton from "../components/AppButton";
import api from "../api/client";
import { COLORS } from "../variables/color";
import FlashNotification from "../components/FlashNotification";
import { useStateValue } from "../StateProvider";
import { __ } from "../language/stringPicker";
import { getTnC } from "../language/stringPicker";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import EyeSlashIcon from "../components/svgComponents/EyeSlashIcon";
import UserIcon from "../components/svgComponents/UserIcon";
import MessageIcon from "../components/svgComponents/MessageIcon";
import ProfileTickIcon from "../components/svgComponents/ProfileTickIcon";
import CallIcon from "../components/svgComponents/CallIcon";
import LockIcon from "../components/svgComponents/LockIcon";
import ScatteredBg from "../components/svgComponents/ScatteredBg";
import BuildingBg from "../components/svgComponents/BuildingBg";

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");
const SignUpScreen = ({ navigation, route }) => {
  const [{ ios, appSettings, rtl_support }] = useStateValue();
  const [validationSchema, setValidationSchema] = useState(
    Yup.object().shape({
      first_name: Yup.string().required(
        __("signUpScreenTexts.formFieldLabels.first_name", appSettings.lng) +
          " " +
          __("signUpScreenTexts.formValidation.requiredField", appSettings.lng)
      ),
      last_name: Yup.string().required(
        __("signUpScreenTexts.formFieldLabels.last_name", appSettings.lng) +
          " " +
          __("signUpScreenTexts.formValidation.requiredField", appSettings.lng)
      ),
      username: Yup.string()
        .required(
          __("signUpScreenTexts.formFieldLabels.username", appSettings.lng) +
            " " +
            __(
              "signUpScreenTexts.formValidation.requiredField",
              appSettings.lng
            )
        )
        .min(
          3,
          __("signUpScreenTexts.formFieldLabels.username", appSettings.lng) +
            " " +
            __(
              "signUpScreenTexts.formValidation.minimumLength3",
              appSettings.lng
            )
        ),
      phone: Yup.string()
        .required(
          __("signUpScreenTexts.formFieldLabels.phone", appSettings.lng) +
            " " +
            __(
              "signUpScreenTexts.formValidation.requiredField",
              appSettings.lng
            )
        )
        .min(
          5,
          __("signUpScreenTexts.formFieldLabels.phone", appSettings.lng) +
            " " +
            __(
              "signUpScreenTexts.formValidation.minimumLength5",
              appSettings.lng
            )
        ),
      email: Yup.string()
        .required(
          __("signUpScreenTexts.formFieldLabels.email", appSettings.lng) +
            " " +
            __(
              "signUpScreenTexts.formValidation.requiredField",
              appSettings.lng
            )
        )
        .email(
          __("signUpScreenTexts.formValidation.validEmail", appSettings.lng)
        ),
      password: Yup.string()
        .required(
          __("signUpScreenTexts.formFieldLabels.password", appSettings.lng) +
            " " +
            __(
              "signUpScreenTexts.formValidation.requiredField",
              appSettings.lng
            )
        )
        .min(
          6,
          __("signUpScreenTexts.formFieldLabels.password", appSettings.lng) +
            " " +
            __(
              "signUpScreenTexts.formValidation.minimumLength6",
              appSettings.lng
            )
        ),
    })
  );
  const [responseErrorMessage, setResponseErrorMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [passSecure, setPassSecure] = useState(true);
  const [flashNotification, setFlashNotification] = useState(false);
  const [flashNotificationMessage, setFlashNotificationMessage] = useState();
  const [tnCData, setTnCData] = useState(getTnC(appSettings.lng));
  const [tnCToggle, setTnCToggle] = useState(false);
  const [tnCVisible, setTnCVisible] = useState(false);
  const handleSignup = (values) => {
    setResponseErrorMessage();
    setLoading(true);
    Keyboard.dismiss();
    api.post("signup", values).then((res) => {
      if (res.ok) {
        if (res?.data?.verification_mail) {
          alert(__("signUpScreenTexts.mailVerification", appSettings.lng));
        }
        handleSuccess(
          __("signUpScreenTexts.signupSuccessMessage", appSettings.lng)
        );
      } else {
        if (res.problem === "TIMEOUT_ERROR") {
          setResponseErrorMessage(
            __("signUpScreenTexts.errorMessage.timeoutError", appSettings.lng)
          );
          handleError(
            __("signUpScreenTexts.errorMessage.timeoutError", appSettings.lng)
          );
        } else {
          setResponseErrorMessage(
            res?.data?.error_message ||
              res?.data?.error ||
              res?.problem ||
              __("signUpScreenTexts.errorMessage.serverError", appSettings.lng)
          );
          handleError(
            res?.data?.error_message ||
              res?.data?.error ||
              res?.problem ||
              __("signUpScreenTexts.errorMessage.serverError", appSettings.lng)
          );
        }
      }
    });
  };

  const handleTnCShow = () => {
    setTnCVisible(!tnCVisible);
  };
  const handleSuccess = (message) => {
    setFlashNotificationMessage(message);
    setTimeout(() => {
      setFlashNotification(true);
    }, 10);
    setTimeout(() => {
      setFlashNotification(false);
      setLoading(false);
      route?.params?.verified ? navigation.pop(2) : navigation.goBack();
    }, 1000);
  };
  const handleError = (message) => {
    setFlashNotificationMessage(message);
    setTimeout(() => {
      setFlashNotification(true);
    }, 10);
    setTimeout(() => {
      setFlashNotification(false);
      setLoading(false);
    }, 1000);
  };

  const rtlText = rtl_support && {
    writingDirection: "rtl",
    textAlign: "right",
  };
  const rtlTextPE5 = rtl_support && {
    writingDirection: "rtl",
    paddingEnd: 5,
    textAlign: "right",
  };
  const rtlView = rtl_support && {
    flexDirection: "row-reverse",
  };
  return (
    <KeyboardAvoidingView
      behavior={ios ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#f8f8f8" }}
      keyboardVerticalOffset={ios ? 70 : 0}
      enabled={ios}
    >
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={{
            position: "absolute",
            padding: screenWidth * 0.03,
            zIndex: 5,
          }}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <View
          style={{
            alignItems: "center",
            zIndex: 1,
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
          }}
        >
          <ScatteredBg fillColor="red" />
        </View>
        <ScrollView style={{ zIndex: 2 }}>
          <View style={[styles.container, { paddingBottom: 30 }]}>
            <View
              style={{
                width: screenWidth,
                height: screenWidth * 0.25,
                alignItems: "center",
                justifyContent: "center",
                marginVertical: screenWidth * 0.05,
              }}
            >
              <Image
                source={require("../assets/auth_logo.png")}
                style={{
                  width: screenWidth * 0.5,
                  height: screenWidth * 0.25,
                  resizeMode: "contain",
                }}
              />
            </View>
            <View
              style={{
                marginBottom: 30,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: COLORS.text_dark,
                }}
              >
                {__("signUpScreenTexts.title", appSettings.lng)}
              </Text>
            </View>
            <View style={styles.signUpForm}>
              <Formik
                initialValues={{
                  first_name: "",
                  last_name: "",
                  username: "",
                  phone:
                    route?.params?.verified && route?.params?.phone
                      ? route.params.phone
                      : "",
                  email: "",
                  password: "",
                }}
                validationSchema={validationSchema}
                onSubmit={handleSignup}
              >
                {({
                  handleChange,
                  handleSubmit,
                  values,
                  errors,
                  setFieldTouched,
                  touched,
                }) => (
                  <View style={{ paddingHorizontal: "3%" }}>
                    <View style={[styles.inputWrap, rtlView]}>
                      <View style={styles.iconWrap}>
                        <UserIcon fillColor={COLORS.primary} />
                      </View>
                      <TextInput
                        placeholderTextColor={COLORS.text_light}
                        style={[styles.inputCommon, rtlText]}
                        onChangeText={handleChange("first_name")}
                        onBlur={() => setFieldTouched("first_name")}
                        value={values.first_name}
                        placeholder={__(
                          "signUpScreenTexts.formFieldLabels.first_name",
                          appSettings.lng
                        )}
                      />
                    </View>
                    <View style={styles.errorWrap}>
                      {touched.first_name && errors.first_name && (
                        <Text style={[styles.errorMessage, rtlText]}>
                          {errors.first_name}
                        </Text>
                      )}
                    </View>
                    <View style={[styles.inputWrap, rtlView]}>
                      <View style={styles.iconWrap}>
                        <UserIcon fillColor={COLORS.primary} />
                      </View>
                      <TextInput
                        placeholderTextColor={COLORS.text_light}
                        style={[styles.inputCommon, rtlText]}
                        onChangeText={handleChange("last_name")}
                        onBlur={() => setFieldTouched("last_name")}
                        value={values.last_name}
                        placeholder={__(
                          "signUpScreenTexts.formFieldLabels.last_name",
                          appSettings.lng
                        )}
                      />
                    </View>
                    <View style={styles.errorWrap}>
                      {touched.last_name && errors.last_name && (
                        <Text style={[styles.errorMessage, rtlText]}>
                          {errors.last_name}
                        </Text>
                      )}
                    </View>
                    <View style={[styles.inputWrap, rtlView]}>
                      <View style={styles.iconWrap}>
                        <ProfileTickIcon fillColor={COLORS.primary} />
                      </View>
                      <TextInput
                        placeholderTextColor={COLORS.text_light}
                        style={[
                          styles.inputCommon,
                          styles.usernameInput,
                          rtlText,
                        ]}
                        onChangeText={handleChange("username")}
                        onBlur={() => setFieldTouched("username")}
                        value={values.username}
                        placeholder={__(
                          "signUpScreenTexts.formFieldLabels.username",
                          appSettings.lng
                        )}
                        autoCapitalize="none"
                      />
                    </View>
                    <View style={styles.errorWrap}>
                      {touched.username && errors.username && (
                        <Text style={[styles.errorMessage, rtlText]}>
                          {errors.username}
                        </Text>
                      )}
                    </View>
                    <View style={[styles.inputWrap, rtlView]}>
                      <View style={styles.iconWrap}>
                        <MessageIcon fillColor={COLORS.primary} />
                      </View>
                      <TextInput
                        placeholderTextColor={COLORS.text_light}
                        style={[
                          styles.inputCommon,
                          {
                            color:
                              route?.params?.verified && route?.params?.phone
                                ? COLORS.text_gray
                                : COLORS.text_dark,
                          },
                          rtlText,
                        ]}
                        onChangeText={handleChange("email")}
                        onBlur={() => setFieldTouched("email")}
                        value={values.email}
                        placeholder={__(
                          "signUpScreenTexts.formFieldLabels.email",
                          appSettings.lng
                        )}
                        keyboardType="email-address"
                      />
                    </View>
                    <View style={styles.errorWrap}>
                      {touched.email && errors.email && (
                        <Text style={[styles.errorMessage, rtlText]}>
                          {errors.email}
                        </Text>
                      )}
                    </View>
                    <View style={[styles.inputWrap, rtlView]}>
                      <View style={styles.iconWrap}>
                        <CallIcon fillColor={COLORS.primary} />
                      </View>
                      <TextInput
                        placeholderTextColor={COLORS.text_light}
                        style={[styles.inputCommon, styles.phoneImput, rtlText]}
                        onChangeText={handleChange("phone")}
                        onBlur={() => setFieldTouched("phone")}
                        value={values.phone}
                        placeholder={__(
                          "signUpScreenTexts.formFieldLabels.phone",
                          appSettings.lng
                        )}
                        keyboardType="phone-pad"
                        editable={
                          !route?.params?.verified && !route?.params?.phone
                        }
                      />
                    </View>
                    <View style={styles.errorWrap}>
                      {touched.phone && errors.phone && (
                        <Text style={[styles.errorMessage, rtlText]}>
                          {errors.phone}
                        </Text>
                      )}
                    </View>
                    <View style={[styles.inputWrap, rtlView]}>
                      <View style={styles.iconWrap}>
                        <LockIcon fillColor={COLORS.primary} />
                      </View>
                      <TextInput
                        placeholderTextColor={COLORS.text_light}
                        style={[
                          {
                            justifyContent: "center",
                            height: 38,
                            paddingHorizontal: 10,
                            flex: 1,
                          },
                          rtlText,
                        ]}
                        onChangeText={handleChange("password")}
                        onBlur={() => setFieldTouched("password")}
                        value={values.password}
                        placeholder={__(
                          "signUpScreenTexts.formFieldLabels.password",
                          appSettings.lng
                        )}
                        secureTextEntry={passSecure}
                        autoCapitalize="none"
                      />
                      <TouchableWithoutFeedback
                        onPress={() =>
                          setPassSecure((prevPassSecure) => !prevPassSecure)
                        }
                      >
                        <View
                          style={{
                            justifyContent: "center",
                            alignItems: "center",
                            width: 35,
                          }}
                        >
                          <EyeSlashIcon
                            fillColor={
                              passSecure
                                ? COLORS.primary_soft
                                : COLORS.text_light
                            }
                          />
                        </View>
                      </TouchableWithoutFeedback>
                    </View>
                    <View style={styles.errorWrap}>
                      {touched.password && errors.password && (
                        <Text style={[styles.errorMessage, rtlText]}>
                          {errors.password}
                        </Text>
                      )}
                    </View>
                    {/* Terms & Conditions Toggle */}
                    <TouchableOpacity
                      style={[styles.tnCToggle, rtlView]}
                      onPress={() => setTnCToggle(!tnCToggle)}
                    >
                      <MaterialCommunityIcons
                        name={
                          tnCToggle
                            ? "checkbox-marked"
                            : "checkbox-blank-outline"
                        }
                        size={24}
                        color={COLORS.primary}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            { paddingLeft: rtl_support ? 0 : 5 },
                            rtlTextPE5,
                          ]}
                        >
                          {__(
                            "listingFormTexts.tnCToggleText",
                            appSettings.lng
                          )}
                          <Text style={styles.tncText} onPress={handleTnCShow}>
                            {__("listingFormTexts.tncText", appSettings.lng)}
                          </Text>
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <AppButton
                      onPress={handleSubmit}
                      title={__(
                        "signUpScreenTexts.signUpButtonTitle",
                        appSettings.lng
                      )}
                      style={styles.signUpBtn}
                      textStyle={styles.signUpBtnTxt}
                      disabled={
                        Object.keys(errors).length > 0 ||
                        Object.keys(touched).length === 0 ||
                        !tnCToggle
                      }
                      loading={loading}
                    />
                    <View style={styles.responseErrorWrap}>
                      <Text style={styles.responseErrorMessage}>
                        {responseErrorMessage}
                      </Text>
                    </View>
                  </View>
                )}
              </Formik>
            </View>

            <FlashNotification
              falshShow={flashNotification}
              flashMessage={flashNotificationMessage}
              containerStyle={styles.flashContainerStyle}
            />
          </View>
          <View
            style={[
              {
                width: "100%",
                paddingHorizontal: "3%",
                paddingBottom: 20,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
              },
              rtlView,
            ]}
          >
            <Text
              style={[{ fontSize: 14.5, color: COLORS.text_gray }, rtlText]}
            >
              {__("signUpScreenTexts.signinMessage", appSettings.lng)}
            </Text>
            <Text
              style={{ paddingHorizontal: 5, color: COLORS.primary }}
              onPress={() => navigation.goBack()}
            >
              {__("signUpScreenTexts.signInButtonTitle", appSettings.lng)}
            </Text>
          </View>
        </ScrollView>
        <View
          style={{ zIndex: 1, position: "absolute", width: "100%", bottom: 0 }}
        >
          <BuildingBg />
        </View>
      </View>
      {/* Terms & Conditions */}
      <Modal animationType="slide" transparent={true} visible={tnCVisible}>
        <SafeAreaView
          style={[styles.tncModal, { marTop: Constants.statusBarHeight }]}
        >
          <ScrollView contentContainerStyle={styles.tnCModalContent}>
            <Text
              style={[
                {
                  textAlign: "center",
                  fontWeight: "bold",
                  marginTop: 10,
                  fontSize: 17,
                },
                rtlText,
              ]}
            >
              {__("listingFormTexts.tncTitleText", appSettings.lng)}
            </Text>
            <View
              style={{
                paddingVertical: 10,
                paddingHorizontal: 10,
              }}
            >
              {tnCData.map((_tnc, index) => (
                <View style={styles.tncParaWrap} key={index}>
                  {!!_tnc.paraTitle && (
                    <Text style={[styles.paraTitle, rtlText]}>
                      {_tnc.paraTitle}
                    </Text>
                  )}
                  <Text style={[styles.paraData, rtlText]}>
                    {_tnc.paraData}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
          <TouchableOpacity style={styles.tnCClose} onPress={handleTnCShow}>
            <Text style={[styles.tnCCloseText, rtlText]}>
              {__("paymentMethodScreen.closeButton", appSettings.lng)}
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
  },
  errorMessage: {
    color: COLORS.red,
    fontSize: 12,
  },
  errorWrap: {
    height: 20,
  },
  flashContainerStyle: {
    top: "85%",
    bottom: "5%",
  },
  signUpForm: {
    width: "100%",
    paddingTop: 10,
  },
  iconWrap: {
    width: 35,
    alignItems: "center",
    justifyContent: "center",
  },
  inputCommon: {
    justifyContent: "center",
    height: 38,
    paddingHorizontal: 10,
    flex: 1,
  },
  inputWrap: {
    backgroundColor: COLORS.white,
    flexDirection: "row",
    width: "100%",
    elevation: 1,
    borderRadius: 3,
    shadowColor: COLORS.gray,
    shadowOpacity: 0.2,
    shadowRadius: 1,
    shadowOffset: {
      height: 0,
      width: 0,
    },
  },
  label: {
    alignItems: "flex-start",
  },
  loginPrompt: {
    marginTop: 40,
  },
  paraData: {
    textAlign: "justify",
  },
  paraTitle: {
    fontWeight: "bold",
    fontSize: 15,
    paddingBottom: 5,
  },
  responseErrorWrap: {
    alignItems: "center",
  },
  responseErrorMessage: {
    color: COLORS.red,
    fontSize: 15,
    fontWeight: "bold",
  },
  signUpBtn: {
    height: 40,
    borderRadius: 3,
    marginVertical: 10,
    width: "100%",
  },
  tnCClose: {
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    height: screenHeight / 22,
    borderRadius: 3,
  },
  tnCCloseText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "bold",
  },
  tncModal: {
    backgroundColor: COLORS.white,
    flex: 1,
    alignItems: "center",
  },
  tnCModalContent: {
    marginHorizontal: "3%",
    marginBottom: screenHeight / 20,
  },
  tnCModalText: {
    color: COLORS.text_dark,
    fontSize: 15,
  },
  tncParaWrap: {
    marginBottom: 20,
  },
  tncText: {
    color: "#ff6600",
  },
  tnCToggle: {
    flexDirection: "row",
    paddingHorizontal: screenWidth * 0.03,
    marginVertical: 10,
  },
});

export default SignUpScreen;
