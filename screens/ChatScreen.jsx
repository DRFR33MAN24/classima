/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useRef, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";

// External Libraries
import { Formik } from "formik";
import * as Yup from "yup";
import moment from "moment";

// Vector Icons
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";

// Custom Components & Functions
import { COLORS } from "../variables/color";
import { useStateValue } from "../StateProvider";
import api, { setAuthToken, removeAuthToken } from "../api/client";
import { decodeString } from "../helper/helper";
import { __ } from "../language/stringPicker";
import { routes } from "../navigation/routes";
import SendIcon from "../components/svgComponents/SendIcon";

const chatScreenImagesUrls = {
  fallbackImageUrl: require("../assets/200X150.png"),
};

const validationSchema = Yup.object().shape({
  message: Yup.string().required(),
});

const ChatScreen = ({ navigation, route }) => {
  const [{ user, auth_token, ios, appSettings, rtl_support }] = useStateValue();
  const [listingData] = useState(route?.params?.listing || null);
  const [conversationData, setConversationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [autoload, setAutoload] = useState(false);
  const [con_id, setConId] = useState(route.params.con_id);
  const [isConDeleted, setIsConDeleted] = useState({
    sendr_id: parseInt(route.params.sender_id) || 0,
    recipient_delete: parseInt(route.params.recipient_delete) || 0,
    sender_delete: parseInt(route.params.sender_delete) || 0,
    recipient_id: parseInt(route.params.recipient_id) || 0,
  });
  const scrollView = useRef();
  // scroll to end effect
  useEffect(() => {
    if (loading) return;
    scrollView.current.scrollToEnd();
  }, [loading]);

  // auto refresh effect
  useEffect(() => {
    handleLoadMessages();
    const interval = setInterval(handleLoadMessages, 15000);
    if (
      isConDeleted.recipient_delete === 1 ||
      isConDeleted.sender_delete === 1
    ) {
      clearInterval(interval);
      return;
    }
    handleCheckHasConversation();
    return () => clearInterval(interval);
  }, [con_id]);

  const handleCheckHasConversation = () => {
    if (con_id) return;
    setAuthToken(auth_token);
    api
      .get("my/chat/check", { listing_id: route.params.listing_id })
      .then((res) => {
        if (res.ok) {
          if (res.data && res.data.con_id) {
            setConversationData(res.data.messages || []);
            setConId(res.data.con_id);
          } else {
            setConversationData([]);
          }
          removeAuthToken();
          setLoading(false);
        } else {
          // print error
          // TODO Error handling
          removeAuthToken();
          setLoading(false);
        }
      });
  };

  const handleLoadMessages = () => {
    if (autoload || !con_id || sending) {
      return;
    }
    setAutoload(true);
    setAuthToken(auth_token);
    api.get("my/chat/conversation", { con_id: con_id }).then((res) => {
      if (res.ok) {
        setConversationData(res.data.messages);
        setIsConDeleted((isConDeleted) => {
          return {
            ...isConDeleted,
            ["sender_id"]: res.data.sender_id,
            ["sender_delete"]: res.data.sender_delete,
            ["recipient_delete"]: res.data.recipient_delete,
          };
        });
        removeAuthToken();
        setLoading(false);
        setAutoload(false);
      } else {
        // print error
        // TODO Error handling
        removeAuthToken();
        setLoading(false);
        setAutoload(false);
      }
    });
  };

  const handleLocationNCategoryData = () => {
    if (listingData.location.length) {
      if (listingData.category.length) {
        return decodeString(
          listingData.location[listingData.location.length - 1].name +
            ", " +
            listingData.category[listingData.category.length - 1].name
        );
      } else {
        return decodeString(
          listingData.location[listingData.location.length - 1].name
        );
      }
    } else {
      return decodeString(
        listingData.category[listingData.category.length - 1].name
      );
    }
  };

  //TODO need to check
  const handleMessageReadStatus = (item) => {
    setAuthToken(auth_token);
    api
      .put("my/chat/message", {
        con_id: item.con_id,
        message_id: item.message_id,
      })
      .then((res) => {
        if (res.ok) {
          removeAuthToken();
        } else {
          removeAuthToken();
        }
      });
  };

  const handleMessageSending = (values, { resetForm }) => {
    setSending(true);
    const newMessage = {
      message_id: new Date().getTime(),
      source_id: user.id.toString(),
      message: values.message,
      created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      con_id: route.params.con_id,
      is_read: 0,
    };
    setConversationData((conversationData) => [
      ...conversationData,
      newMessage,
    ]);
    resetForm({ values: "" });
    setAuthToken(auth_token);
    const url = con_id ? "my/chat/message" : "my/chat/conversation";
    api
      .post(url, {
        listing_id: route.params.listing_id,
        text: values.message,
        con_id: con_id || 0,
      })
      .then((res) => {
        if (res.ok) {
          removeAuthToken();
          if (!con_id && res.data.con_id) {
            setConId(res.data.con_id);
          }
        } else {
          const newConversation = [...conversationData].filter(
            (message) => message.message_id !== newMessage.message_id
          );
          setConversationData([...newConversation, res.data]);
        }
      })
      .then(() => {
        removeAuthToken();
        setSending(false);
      });
  };

  const Message = ({ text, time, sender, is_read }) => (
    <View
      style={{
        width: "100%",
        marginVertical: 15,
        alignItems: sender ? "flex-end" : "flex-start",
        paddingHorizontal: "3%",
      }}
    >
      <View style={styles.messageBubble}>
        {sender ? (
          <View
            style={{
              height: 0,
              width: 0,
              borderBottomWidth: 20,
              borderBottomColor: COLORS.white,
              borderRightWidth: 15,
              borderRightColor: "transparent",
              position: "absolute",
              right: -7,
              bottom: 0,
              backgroundColor: "transparent",
            }}
          />
        ) : (
          <View
            style={{
              height: 0,
              width: 0,
              borderBottomWidth: 20,
              borderBottomColor: COLORS.white,
              borderLeftWidth: 15,
              borderLeftColor: "transparent",
              position: "absolute",
              left: -7,
              bottom: 0,
              backgroundColor: "transparent",
            }}
          />
        )}
        <Text>{decodeString(text)}</Text>
      </View>
      <View
        style={{
          flexDirection: "row",
        }}
      >
        <Text
          style={{
            fontSize: 12,
            color: COLORS.text_gray,
            paddingHorizontal: sender ? 5 : 12,
          }}
        >
          {moment(time).format("D MMM, h:m a")}
        </Text>
        {sender && (
          <MaterialCommunityIcons
            name={is_read ? "check-all" : "check"}
            size={15}
            color={COLORS.gray}
          />
        )}
      </View>
    </View>
  );

  const rtlText = rtl_support && {
    writingDirection: "rtl",
  };
  const rtlTextA = rtl_support && {
    // writingDirection: "rtl",
    textAlign: "right",
  };
  const rtlView = rtl_support && {
    flexDirection: "row-reverse",
  };

  return !ios ? (
    <View style={{ flex: 1, backgroundColor: "#ededed" }}>
      {/* Chat Header Component */}
      {!!route?.params?.from && (
        <TouchableOpacity
          onPress={() =>
            navigation.push(routes.listingDetailScreen, {
              listingId: route.params.listing_id,
            })
          }
          style={[
            {
              flexDirection: "row",
              backgroundColor: COLORS.white,
              alignItems: "center",
              paddingVertical: 10,
              paddingHorizontal: "3%",
            },
            rtlView,
          ]}
          disabled={
            route.params.from === "listing" || route.params.from === undefined
          }
        >
          <View
            style={{
              height: 50,
              width: 50,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              borderRadius: 25,
            }}
          >
            <Image
              style={{
                height: 50,
                width: 50,
                resizeMode: "cover",
              }}
              source={
                listingData.images.length
                  ? {
                      uri: listingData.images[0].sizes.medium.src,
                    }
                  : chatScreenImagesUrls.fallbackImageUrl
              }
            />
          </View>
          <View
            style={{
              marginLeft: rtl_support ? 0 : 10,
              marginRight: rtl_support ? 10 : 0,
              flex: 1,
              // flexDirection: "column-reverse",
            }}
          >
            <Text
              style={[
                {
                  fontWeight: "bold",
                  fontSize: 16,
                  color: COLORS.text_dark,
                  textAlign: rtl_support ? "right" : "left",
                },
              ]}
              numberOfLines={1}
            >
              {decodeString(listingData.title)}
            </Text>
            <View
              style={[{ flexDirection: "row", alignItems: "center" }, rtlView]}
            >
              <View style={styles.view}>
                {rtl_support ? (
                  <FontAwesome name="tag" size={14} color={COLORS.primary} />
                ) : (
                  <Ionicons name="pricetag" size={14} color={COLORS.primary} />
                )}
              </View>
              <View style={{ paddingHorizontal: 5 }}>
                <Text
                  style={{
                    color: COLORS.primary,
                    textAlign: rtl_support ? "right" : "left",
                  }}
                  numberOfLines={1}
                >
                  {handleLocationNCategoryData()}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )}
      {/* Loading Component */}
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.text}>
            {__("chatScreenTexts.loadingMessage", appSettings.lng)}
          </Text>
        </View>
      )}
      {!loading && (
        <View style={{ flex: 1, backgroundColor: "#ededed" }}>
          {/* Chat List Component */}
          <ScrollView
            ref={scrollView}
            onContentSizeChange={() => scrollView.current.scrollToEnd()}
            contentContainerStyle={{
              paddingHorizontal: "2%",
            }}
          >
            {conversationData.map((item) => {
              const is_read = !!parseInt(item.is_read);
              if (!is_read && item.source_id != user.id) {
                handleMessageReadStatus(item);
              }

              return (
                // {* Individual Message Component *}
                <Message
                  key={item.message_id}
                  text={item.message}
                  time={item.created_at}
                  sender={item.source_id === user.id.toString()}
                  is_read={is_read}
                />
              );
            })}
          </ScrollView>
        </View>
      )}
      {(user.id === isConDeleted.sender_id &&
        isConDeleted.recipient_delete == 0) ||
      (user.id !== isConDeleted.sender_id &&
        isConDeleted.sender_delete == 0) ? (
        <Formik
          initialValues={{ message: "" }}
          onSubmit={handleMessageSending}
          validationSchema={validationSchema}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
            <View style={styles.chatBoxWrap}>
              {/* Message Input Component */}
              <TextInput
                onChangeText={handleChange("message")}
                onBlur={handleBlur("message")}
                value={values.message}
                multiline={true}
                placeholder={__(
                  "chatScreenTexts.placeholder.message",
                  appSettings.lng
                )}
                style={[styles.chatInput, rtlTextA]}
                textAlignVertical="center"
              />
              {/* Send Button Component */}
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSubmit}
                disabled={!!errors.message || !values.message.trim().length}
              >
                <SendIcon fillColor={COLORS.red} />
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      ) : (
        // {* Message Deleted Cpmponent *}
        <View style={styles.deletedMessageWrap}>
          <Text style={styles.deletedMessage}>
            {__("chatScreenTexts.dactivatedMessage", appSettings.lng)}
          </Text>
        </View>
      )}
    </View>
  ) : (
    <View style={{ flex: 1, backgroundColor: "#ededed" }}>
      {/* Chat Header Component */}
      {!!route?.params?.from && (
        <TouchableOpacity
          onPress={() =>
            navigation.push(routes.listingDetailScreen, {
              listingId: route.params.listing_id,
            })
          }
          style={[
            {
              flexDirection: "row",
              backgroundColor: COLORS.white,
              alignItems: "center",
              paddingVertical: 10,
              paddingHorizontal: "3%",
            },
            rtlView,
          ]}
          disabled={
            route.params.from === "listing" || route.params.from === undefined
          }
        >
          <View
            style={{
              height: 50,
              width: 50,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              borderRadius: 25,
            }}
          >
            <Image
              style={{
                height: 50,
                width: 50,
                resizeMode: "cover",
              }}
              source={
                listingData.images.length
                  ? {
                      uri: listingData.images[0].sizes.medium.src,
                    }
                  : chatScreenImagesUrls.fallbackImageUrl
              }
            />
          </View>
          <View
            style={{
              marginLeft: rtl_support ? 0 : 10,
              marginRight: rtl_support ? 10 : 0,
              flex: 1,
              // flexDirection: "column-reverse",
            }}
          >
            <Text
              style={[
                {
                  fontWeight: "bold",
                  fontSize: 16,
                  color: COLORS.text_dark,
                  textAlign: rtl_support ? "right" : "left",
                },
              ]}
              numberOfLines={1}
            >
              {decodeString(listingData.title)}
            </Text>
            <View
              style={[{ flexDirection: "row", alignItems: "center" }, rtlView]}
            >
              <View style={styles.view}>
                {rtl_support ? (
                  <FontAwesome name="tag" size={14} color={COLORS.primary} />
                ) : (
                  <Ionicons name="pricetag" size={14} color={COLORS.primary} />
                )}
              </View>
              <View style={{ paddingHorizontal: 5 }}>
                <Text
                  style={{
                    color: COLORS.primary,
                    textAlign: rtl_support ? "right" : "left",
                  }}
                  numberOfLines={1}
                >
                  {handleLocationNCategoryData()}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )}
      {/* Loading Component */}
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.text, rtlText]}>
            {__("chatScreenTexts.loadingMessage", appSettings.lng)}
          </Text>
        </View>
      )}
      {!loading && (
        <KeyboardAvoidingView
          style={styles.container}
          behavior="padding"
          keyboardVerticalOffset={100}
        >
          {/* Chat List Component */}
          <ScrollView
            ref={scrollView}
            onContentSizeChange={() => scrollView.current.scrollToEnd()}
            contentContainerStyle={{
              paddingHorizontal: "2%",
            }}
          >
            {conversationData.map((item) => {
              const is_read = !!parseInt(item.is_read);
              if (!is_read && item.source_id != user.id) {
                handleMessageReadStatus(item);
              }

              return (
                // {* Individual Message Component *}
                <Message
                  key={item.message_id}
                  text={item.message}
                  time={item.created_at}
                  sender={item.source_id === user.id.toString()}
                  is_read={is_read}
                />
              );
            })}
          </ScrollView>
          {(user.id === isConDeleted.sender_id &&
            isConDeleted.recipient_delete == 0) ||
          (user.id !== isConDeleted.sender_id &&
            isConDeleted.sender_delete == 0) ? (
            <Formik
              initialValues={{ message: "" }}
              onSubmit={handleMessageSending}
              validationSchema={validationSchema}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
                <View style={styles.chatBoxWrap}>
                  {/* Message Input Component */}
                  <TextInput
                    onChangeText={handleChange("message")}
                    onBlur={handleBlur("message")}
                    value={values.message}
                    multiline={true}
                    placeholder={__(
                      "chatScreenTexts.placeholder.message",
                      appSettings.lng
                    )}
                    style={[styles.chatInput, rtlText]}
                    textAlignVertical="center"
                  />
                  {/* Send Button Component */}
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSubmit}
                    disabled={!!errors.message || !values.message.trim().length}
                  >
                    <SendIcon fillColor={COLORS.red} />
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
          ) : (
            // {* Message Deleted Cpmponent *}
            <View style={styles.deletedMessageWrap}>
              <Text style={styles.deletedMessage}>
                {__("chatScreenTexts.dactivatedMessage", appSettings.lng)}
              </Text>
            </View>
          )}
        </KeyboardAvoidingView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chatBoxWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginHorizontal: "2%",
    marginVertical: 5,
    borderRadius: 30,
  },
  chatInput: {
    minHeight: 40,
    backgroundColor: COLORS.white,
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 11 : 0,
    borderRadius: 30,
    paddingHorizontal: 15,
  },

  container: {
    backgroundColor: "#ededed",
    flex: 1,
  },
  deletedMessageWrap: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "yellow",
  },
  deletedMessage: {
    color: COLORS.text_dark,
  },
  loading: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 1,
    backgroundColor: COLORS.bg_dark,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
    flex: 1,
  },
  mainWrap: {
    backgroundColor: COLORS.bg_dark,
    paddingVertical: 10,
    elevation: 2,
  },
  messageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    backgroundColor: COLORS.white,
    flex: 1,
  },
  sendButton: {
    padding: 6,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.bg_primary,
    borderRadius: 20,
  },
});

export default ChatScreen;
