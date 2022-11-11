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
const ForgotPassScreen = ({ navigation }) => {
  const [{ ios, appSettings, rtl_support }] = useStateValue();
  const [validationSchema, setValidationSchema] = useState(
    Yup.object().shape({
      user_login: Yup.string()
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
    })
  );
  const [loading, setLoading] = useState(false);
  const [passSecure, setPassSecure] = useState(true);
  const [flashNotification, setFlashNotification] = useState(false);
  const [flashNotificationMessage, setFlashNotificationMessage] = useState();
  const [tnCData, setTnCData] = useState(getTnC(appSettings.lng));
  const [tnCToggle, setTnCToggle] = useState(false);
  const [tnCVisible, setTnCVisible] = useState(false);

  const [passResetErrorMessage, setPassResetResponseErrorMessage] = useState();

  const handleSuccess = (message) => {
    setFlashNotificationMessage(message);
    setTimeout(() => {
      setFlashNotification(true);
    }, 10);
    setTimeout(() => {
      setFlashNotification(false);
      setLoading(false);
      navigation.goBack();
    }, 800);
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

  const handleResetSuccess = (message) => {
    setFlashNotificationMessage(message);
    setTimeout(() => {
      setFlashNotification(true);
    }, 10);
    setTimeout(() => {
      setFlashNotification(false);
    }, 2000);
  };

  const handlePassReset = (values) => {
    setPassResetResponseErrorMessage();
    setLoading(true);
    Keyboard.dismiss();
    api
      .post("reset-password", {
        // user_login: "demo",
        user_login: values.user_login,
      })
      .then((res) => {
        if (res.ok) {
          setLoading(false);
          handleResetSuccess(
            __("forgotScreenTexts.resetSuccessMessage", appSettings.lng)
          );
        } else {
          setPassResetResponseErrorMessage(
            res?.data?.message || res?.data?.error || res?.problem
          );
          setLoading(false);
        }
      })
      .catch((error) => {
        alert("Error :", error);
      });
  };

  return (
    <KeyboardAvoidingView
      behavior={ios ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#f8f8f8" }}
      keyboardVerticalOffset={80}
    >
      <TouchableOpacity
        style={{ position: "absolute", padding: screenWidth * 0.03, zIndex: 5 }}
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
              marginBottom: 15,
            }}
          >
            <Text
              style={[
                {
                  fontSize: 20,
                  fontWeight: "bold",
                  color: COLORS.text_dark,
                },
                rtlText,
              ]}
            >
              {__("forgotScreenTexts.title", appSettings.lng)}
            </Text>
          </View>
          <View style={{ marginBottom: 30 }}>
            <Text style={[{ color: COLORS.text_gray }, rtlText]}>
              {__("forgotScreenTexts.message", appSettings.lng)}
            </Text>
          </View>
          <View style={styles.signUpForm}>
            <Formik
              initialValues={{
                user_login: "",
              }}
              validationSchema={validationSchema}
              onSubmit={handlePassReset}
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
                      <ProfileTickIcon fillColor={COLORS.primary} />
                    </View>
                    <TextInput
                      placeholderTextColor={COLORS.text_light}
                      style={[styles.inputCommon, styles.emailImput, rtlText]}
                      onChangeText={handleChange("user_login")}
                      onBlur={() => setFieldTouched("user_login")}
                      value={values.user_login}
                      placeholder={__(
                        "forgotScreenTexts.placeholder",
                        appSettings.lng
                      )}
                      keyboardType="email-address"
                    />
                  </View>
                  <View style={styles.errorWrap}>
                    {touched.user_login && errors.user_login && (
                      <Text style={[styles.errorMessage, rtlText]}>
                        {errors.user_login}
                      </Text>
                    )}
                  </View>

                  <AppButton
                    onPress={handleSubmit}
                    title={__("forgotScreenTexts.buttonTitle", appSettings.lng)}
                    style={styles.signUpBtn}
                    textStyle={styles.signUpBtnTxt}
                    disabled={
                      Object.keys(errors).length > 0 ||
                      Object.keys(touched).length === 0
                    }
                    loading={loading}
                  />
                  <View style={styles.responseErrorWrap}>
                    <Text style={styles.responseErrorMessage}>
                      {passResetErrorMessage}
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
      </ScrollView>
      <View
        style={{ zIndex: 1, position: "absolute", width: "100%", bottom: 0 }}
      >
        <BuildingBg />
      </View>
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

export default ForgotPassScreen;
