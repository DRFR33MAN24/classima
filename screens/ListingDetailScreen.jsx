/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  Linking,
  Alert,
  ActivityIndicator,
  Share,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";

// External Libraries
import moment from "moment";
import "moment/locale/en-gb";
import ReadMore from "react-native-read-more-text";
import ReactNativeZoomableView from "@openspacelabs/react-native-zoomable-view/src/ReactNativeZoomableView";
import MapView, { Marker, UrlTile } from "react-native-maps";
import YoutubePlayer from "react-native-youtube-iframe";
import { Formik } from "formik";
import * as Yup from "yup";
import { paginationData } from "../app/pagination/paginationData";
import WebView from "react-native-webview";

// Vector Icons
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";

// Custom Components & Constants
import ListingHeader from "../components/ListingHeader";
import { COLORS } from "../variables/color";
import AppSeparator from "../components/AppSeparator";
import SimilarAdFlatList from "../components/SimilarAdFlatList";
import SellerContact from "../components/SellerContact";
import { useStateValue } from "../StateProvider";
import api, { setAuthToken, removeAuthToken } from "../api/client";
import { getPrice, decodeString } from "../helper/helper";
import Badge from "../components/Badge";
import AppButton from "../components/AppButton";
import AppTextButton from "../components/AppTextButton";
import { getRelativeTimeConfig, __ } from "../language/stringPicker";
import FlashNotification from "../components/FlashNotification";
import { admobConfig } from "../app/services/adMobConfig";
import { routes } from "../navigation/routes";
import TotalRating from "../components/TotalRating";
import AdmobBanner from "../components/AdmobBanner";

const { width: windowWidth, height: windowHeight } = Dimensions.get("window");
const { height: screenHeight } = Dimensions.get("screen");

const ListingDetailScreen = ({ route, navigation }) => {
  const [{ user, auth_token, config, ios, appSettings, rtl_support }] =
    useStateValue();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [badgeDim, setBadgeDim] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [listingData, setListingData] = useState();
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [moreloading, setMoreLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(
    pagination.current_page || paginationData.rating.page
  );
  const [favoriteDisabled, setFavoriteDisabled] = useState(false);
  const [imageViewer, setImageViewer] = useState(false);
  const [viewingImage, setViewingImage] = useState();
  const [mapType, setMapType] = useState("standard");
  const [playing, setPlaying] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [flashNotification, setFlashNotification] = useState(false);
  const [flashNotificationMessage, setFlashNotificationMessage] = useState();
  const [today, setToday] = useState(new Date().getDay());
  const [now, setNow] = useState(
    new Date().getHours() + ":" + new Date().getMinutes()
  );
  const [ratingShown, setRatingShown] = useState(false);
  const [formShown, setFormShown] = useState(false);
  const [validationSchema, setValidationSchema] = useState(
    config?.review?.rating
      ? Yup.object().shape({
          author_name: Yup.string().required(
            __("listingDetailScreenTexts.formLabels.name", appSettings.lng) +
              " " +
              __(
                "listingDetailScreenTexts.formValidation.required",
                appSettings.lng
              )
          ),
          author_email: Yup.string()
            .required(
              __("listingDetailScreenTexts.formLabels.email", appSettings.lng) +
                " " +
                __(
                  "listingDetailScreenTexts.formValidation.required",
                  appSettings.lng
                )
            )
            .email(
              __("listingDetailScreenTexts.formLabels.email", appSettings.lng) +
                " " +
                __(
                  "listingDetailScreenTexts.formValidation.invalid",
                  appSettings.lng
                )
            ),
          rating: Yup.number()
            .required(
              __(
                "listingDetailScreenTexts.formLabels.rating",
                appSettings.lng
              ) +
                " " +
                __(
                  "listingDetailScreenTexts.formValidation.required",
                  appSettings.lng
                )
            )
            .positive()
            .integer(),
          title: Yup.string().required(
            __("listingDetailScreenTexts.formLabels.title", appSettings.lng) +
              " " +
              __(
                "listingDetailScreenTexts.formValidation.required",
                appSettings.lng
              )
          ),
          content: Yup.string().required(
            __("listingDetailScreenTexts.formLabels.review", appSettings.lng) +
              " " +
              __(
                "listingDetailScreenTexts.formValidation.required",
                appSettings.lng
              )
          ),
        })
      : Yup.object().shape({
          author_name: Yup.string().required(
            __("listingDetailScreenTexts.formLabels.name", appSettings.lng) +
              " " +
              __(
                "listingDetailScreenTexts.formValidation.required",
                appSettings.lng
              )
          ),
          author_email: Yup.string()
            .required(
              __("listingDetailScreenTexts.formLabels.email", appSettings.lng) +
                " " +
                __(
                  "listingDetailScreenTexts.formValidation.required",
                  appSettings.lng
                )
            )
            .email(
              __("listingDetailScreenTexts.formLabels.email", appSettings.lng) +
                " " +
                __(
                  "listingDetailScreenTexts.formValidation.invalid",
                  appSettings.lng
                )
            ),
          title: Yup.string().required(
            __("listingDetailScreenTexts.formLabels.title", appSettings.lng) +
              " " +
              __(
                "listingDetailScreenTexts.formValidation.required",
                appSettings.lng
              )
          ),
          content: Yup.string().required(
            __("listingDetailScreenTexts.formLabels.review", appSettings.lng) +
              " " +
              __(
                "listingDetailScreenTexts.formValidation.required",
                appSettings.lng
              )
          ),
        })
  );
  const [ratingData, setRatingData] = useState();

  const scrollRef = useRef();
  const mapRef = useRef();

  // Initial Get Listing Data

  useEffect(() => {
    if (user) {
      setAuthToken(auth_token);
    }
    const timeConfig = getRelativeTimeConfig(appSettings.lng);
    moment.updateLocale("en-gb", {
      relativeTime: timeConfig,
    });

    api.get(`/listings/${route.params.listingId}`).then((res) => {
      if (res.ok) {
        if (!!res?.data?.bh?.special_bhs?.length) {
          let tempListingData = { ...res.data };
          let tempbhs = { ...res.data.bh.bhs };
          const tempsbhs = [...res.data.bh.special_bhs];
          const dataArr = tempsbhs.filter(
            (_sbhObj) =>
              moment(_sbhObj.date, "YYYY-MM-DD")._i ==
              moment(new Date()).format("YYYY-MM-DD")
          );
          if (dataArr.length) {
            const tempReplacingObj = dataArr[dataArr.length - 1];
            tempbhs[new Date().getDay()] = tempReplacingObj;
          }
          const tempBH = { bhs: tempbhs, special_bhs: tempsbhs };
          tempListingData.bh = tempBH;
          setListingData(tempListingData);
        } else {
          setListingData(res.data);
        }

        removeAuthToken();
        setLoading(false);
      } else {
        // print error
        // TODO handle error
        removeAuthToken();
        setLoading(false);
      }
    });

    getComments(paginationData.rating);
  }, []);

  const getComments = (args) => {
    api
      .get("/reviews", { listing: route.params.listingId, ...args })
      .then((res) => {
        if (res.ok) {
          if (moreloading) {
            setRatingData((prevRD) => [...prevRD, ...res.data.data]);
          } else {
            setRatingData(res.data.data);
          }
          if (res.data.pagination) {
            setPagination(res.data.pagination);
          }
        } else {
          // TODO error handling
        }
      })
      .then(() => {
        if (moreloading) {
          setMoreLoading(false);
        }
      });
  };

  useEffect(() => {
    if (!moreloading) {
      return;
    }

    let tempArgs = { ...pagination };
    pagination.current_page = currentPage + 1;
    getComments(tempArgs);
  }, [moreloading]);

  const handleCall = (number) => {
    setModalVisible(false);

    let phoneNumber = "";
    if (ios) {
      phoneNumber = `telprompt:${number}`;
    } else {
      phoneNumber = `tel:${number}`;
    }
    Linking.openURL(phoneNumber);
  };
  const handleScroll = (e) => {
    if (playing) {
      setPlaying(false);
    }
    setCurrentSlide(Math.round(e.nativeEvent.contentOffset.x / windowWidth));
  };
  const handleChatLoginAlert = () => {
    Alert.alert(
      "",
      __("listingDetailScreenTexts.chatLoginAlert", appSettings.lng),
      [
        {
          text: __(
            "listingDetailScreenTexts.cancelButtonTitle",
            appSettings.lng
          ),
        },
        {
          text: __(
            "listingDetailScreenTexts.loginButtonTitle",
            appSettings.lng
          ),
          onPress: () => navigation.navigate(routes.loginScreen),
        },
      ],
      { cancelable: false }
    );
  };
  const handleEmailLoginAlert = () => {
    Alert.alert(
      "",
      __("listingDetailScreenTexts.emailLoginAlert", appSettings.lng),
      [
        {
          text: __(
            "listingDetailScreenTexts.cancelButtonTitle",
            appSettings.lng
          ),
        },
        {
          text: __(
            "listingDetailScreenTexts.loginButtonTitle",
            appSettings.lng
          ),
          onPress: () => navigation.navigate(routes.loginScreen),
        },
      ],
      { cancelable: false }
    );
  };
  const getLocation = (contact) => {
    let locationData;
    if (config.location_type === "local") {
      locationData =
        contact?.locations?.map((item) => item?.name).join(", ") || "";
      return contact.address
        ? locationData + ", " + decodeString(contact.address)
        : locationData;
    }
    if (config.location_type === "geo") {
      return decodeString(contact?.geo_address) || "";
    }
  };
  const getPriceType = (priceType) => {
    const pU = listingData?.price_unit || "";
    if (!!pU && listingData?.price_units?.length) {
      if (priceType === "fixed") {
        return (
          __("listingDetailScreenTexts.priceTypes.fixed", appSettings.lng) +
          `  / ${
            listingData.price_units.filter((_pu) => _pu.id === pU)[0].name
          }`
        );
      } else {
        return (
          __(
            "listingDetailScreenTexts.priceTypes.negotiable",
            appSettings.lng
          ) +
          `  / ${
            listingData.price_units.filter((_pu) => _pu.id === pU)[0].name
          }`
        );
      }
    } else if (!!pU) {
      if (priceType === "fixed") {
        return (
          __("listingDetailScreenTexts.priceTypes.fixed", appSettings.lng) +
          `  / ${pU}`
        );
      } else {
        return (
          __(
            "listingDetailScreenTexts.priceTypes.negotiable",
            appSettings.lng
          ) + `  / ${pU}`
        );
      }
    } else {
      if (priceType === "fixed") {
        return __("listingDetailScreenTexts.priceTypes.fixed", appSettings.lng);
      } else {
        return __(
          "listingDetailScreenTexts.priceTypes.negotiable",
          appSettings.lng
        );
      }
    }
  };
  const handleFavourite = () => {
    setFavLoading(true);
    setFavoriteDisabled((favoriteDisabled) => true);
    setAuthToken(auth_token);
    api
      .post("my/favourites", { listing_id: listingData.listing_id })
      .then((res) => {
        if (res.ok) {
          const newListingData = { ...listingData };
          newListingData.is_favourite = res.data.includes(
            listingData.listing_id
          );
          setListingData(newListingData);
          setFavLoading(false);
          setFavoriteDisabled((favoriteDisabled) => false);
          removeAuthToken();
        } else {
          // print error
          // TODO handle error
          handleError(
            res?.data?.error_message || res?.data?.error || res?.problem
          );
          setFavLoading(false);
          setFavoriteDisabled((favoriteDisabled) => false);
          removeAuthToken();
          // setLoading(false);
        }
      });
  };
  const renderTruncatedFooter = (handleDescriptionToggle) => {
    return (
      <Text
        style={{
          color: COLORS.text_gray,
          marginTop: 10,
          fontWeight: "bold",
          textAlign: "center",
        }}
        onPress={handleDescriptionToggle}
      >
        {__("listingDetailScreenTexts.showMore", appSettings.lng)}
      </Text>
    );
  };
  const renderRevealedFooter = (handleDescriptionToggle) => {
    return (
      <Text
        style={{
          color: COLORS.text_gray,
          marginTop: 10,
          fontWeight: "bold",
          textAlign: "center",
        }}
        onPress={handleDescriptionToggle}
      >
        {__("listingDetailScreenTexts.showLess", appSettings.lng)}
      </Text>
    );
  };
  const handleChat = () => {
    if (playing) {
      setPlaying(false);
    }
    const data = {
      id: listingData.listing_id,
      title: listingData.title,
      images: listingData.images,
      category: listingData.categories,
      location: listingData.contact.locations,
    };
    user !== null && user.id !== listingData.author_id
      ? navigation.navigate(routes.chatScreen, {
          listing: data,
          from: "listing",
          listing_id: listingData.listing_id,
        })
      : handleChatLoginAlert();
  };

  const handleEmail = () => {
    if (playing) {
      setPlaying(false);
    }

    const data = {
      id: listingData.listing_id,
      title: listingData.title,
    };
    if (user !== null && user.id !== listingData.author_id) {
      navigation.navigate(routes.sendEmailScreen, {
        listing: data,
        source: "listing",
      });
    } else {
      handleEmailLoginAlert();
    }
  };

  const getCheckboxValue = (field) => {
    const checkBoxValue = field.value.map(
      (value) =>
        field.options.choices.filter((choice) => choice.id == value)[0]?.name ||
        __("listingDetailScreenTexts.deletedValue", appSettings.lng)
    );
    return decodeString(checkBoxValue.filter((_val) => !!_val).join(", "));
  };

  const getSellerName = () => {
    if (!!listingData.author.first_name || !!listingData.author.last_name) {
      return decodeString(
        listingData.author.first_name + " " + listingData.author.last_name
      );
    } else {
      return decodeString(listingData.author.username);
    }
  };

  const handleImageZoomView = (image) => {
    setViewingImage(image);
    setTimeout(() => {
      setImageViewer(true);
    }, 20);
  };

  const handleImageViewerClose = () => {
    setImageViewer((prevImageViewer) => false);
  };

  const getRangeField = (field) => {
    if (!!field.value.start || !!field.value.end) {
      return true;
    } else return false;
  };

  const getAddress = (contact) => {
    if (!contact) return "";
    const address = [];
    if (config?.location_type === "local") {
      if (contact?.address) {
        address.push(contact.address);
      }
      if (contact?.zipcode) {
        address.push(contact.zipcode);
      }
      if (contact?.locations?.length) {
        contact.locations.map((loc) => {
          address.push(loc.name);
        });
      }
    } else {
      if (contact?.geo_address) {
        address.push(contact.geo_address);
      }
    }

    return address.length ? decodeString(address.join(", ")) : "";
  };

  const handleMapTypeChange = () => {
    if (mapType == "standard") {
      setMapType("hybrid");
    } else {
      setMapType("standard");
    }
  };

  const getCustomFields = () => {
    return listingData.custom_fields.filter((_field) => !!_field?.value).length;
  };

  const handleStorePress = () => {
    if (playing) {
      setPlaying(false);
    }
    navigation.push(routes.storeDetailsScreen, {
      storeId: listingData.store.id,
    });
  };

  const getListingTime = () => {
    return moment(listingData.created_at).format("Do MMM, h:mm a");
  };

  const getTotalSlideCount = () => {
    if (!listingData?.video_urls?.length) {
      return listingData.images.length;
    }
    if (!listingData?.images?.length) {
      return listingData.video_urls.length;
    }
    return listingData.images.length + listingData.video_urls.length;
  };

  const get_sanitized_embed_url = (url) => {
    const regExp =
      /^https?\:\/\/(?:www\.youtube(?:\-nocookie)?\.com\/|m\.youtube\.com\/|youtube\.com\/)?(?:ytscreeningroom\?vi?=|youtu\.be\/|vi?\/|user\/.+\/u\/\w{1,2}\/|embed\/|watch\?(?:.*\&)?vi?=|\&vi?=|\?(?:.*\&)?vi?=)([^#\&\?\n\/<>"']*)/i;
    const match = url.match(regExp);
    const ytId = match && match[1].length === 11 ? match[1] : null;

    if (ytId) {
      return (
        <View key={ytId}>
          <YoutubePlayer
            height={windowWidth * 0.75}
            // height={300}
            width={windowWidth * 0.94}
            play={playing}
            videoId={ytId}
            onChangeState={onStateChange}
            forceAndroidAutoplay={false}
            initialPlayerParams={{
              showClosedCaptions: false,
              // controls: false,
              loop: false,
              cc_lang_pref: "en",
              modestbranding: 1,
              rel: false,
            }}
            webViewStyle={{ opacity: 0.99 }}
          />
        </View>
      );
    }

    return null;
  };

  const onStateChange = useCallback((state) => {
    if (state === "playing") {
      setPlaying(true);
    }
  }, []);
  const handleReport = () => {
    if (playing) {
      setPlaying(false);
    }
    navigation.navigate(routes.reportScreen, {
      listingId: listingData.listing_id,
      listingTitle: listingData.title,
    });
  };

  const handleSocialProfileClick = (_profile) => {
    Linking.openURL(listingData.social_profiles[_profile]);
  };

  const handleError = (message) => {
    setFlashNotificationMessage((prevFlashNotificationMessage) => message);
    setTimeout(() => {
      setFlashNotification((prevFlashNotification) => true);
    }, 5);
    setTimeout(() => {
      setFlashNotification((prevFlashNotification) => false);
      setFlashNotificationMessage();
    }, 1200);
  };

  const BHDayComponent = ({ day, index, dataArr }) => (
    <View
      style={[
        styles.bHDayWrap,
        {
          borderBottomWidth: dataArr.length - 1 === index ? 0 : 1,
        },
        rtlView,
      ]}
    >
      <View
        style={[
          styles.dayNameWrap,
          {
            borderRightWidth: rtl_support ? 0 : 1,
            borderLeftWidth: rtl_support ? 1 : 0,
            alignItems: rtl_support ? "flex-end" : "flex-start",
          },
        ]}
      >
        <Text style={[styles.dayName, rtlText]} numberOfLines={1}>
          {day.name}
        </Text>
      </View>
      <View style={styles.hoursSlotsWrap}>{getTimeObject(day)}</View>
    </View>
  );

  const getTimeObject = (day) => {
    const tempDayObj = listingData.bh.bhs[day.id];
    if (tempDayObj?.open) {
      if (tempDayObj?.times?.length) {
        const tempTimes = tempDayObj.times.filter(
          (_timeSlot) => !!_timeSlot.start && !!_timeSlot.end
        );
        if (tempTimes.length) {
          // Open and has valid time slot
          return tempTimes.map((_slot, index, arr) => (
            <View
              style={[
                styles.slotWrap,
                {
                  borderBottomWidth: arr.length - 1 > index ? 1 : 0,
                  borderBottomColor: COLORS.gray,
                },
                rtlView,
              ]}
              key={index}
            >
              <View
                style={[
                  styles.slotTimeWrap,
                  { alignItems: rtl_support ? "flex-end" : "flex-start" },
                ]}
              >
                <Text
                  style={[
                    styles.slotText,
                    {
                      color:
                        day.id === today &&
                        isTimeBetween(_slot.start, _slot.end, now)
                          ? COLORS.green
                          : COLORS.text_gray,
                    },
                    rtlText,
                  ]}
                >
                  {moment(_slot.start, "HH:mm").format(
                    config.datetime_fmt.time
                  )}
                </Text>
              </View>
              <View
                style={[
                  styles.slotTimeWrap,
                  {
                    borderLeftColor: COLORS.gray,
                    borderLeftWidth: rtl_support ? 0 : 1,
                    borderRightWidth: rtl_support ? 1 : 0,
                    alignItems: rtl_support ? "flex-end" : "flex-start",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.slotText,
                    {
                      color:
                        day.id === today &&
                        isTimeBetween(_slot.start, _slot.end, now)
                          ? COLORS.green
                          : COLORS.text_gray,
                    },
                    rtlText,
                  ]}
                >
                  {moment(_slot.end, "HH:mm").format(config.datetime_fmt.time)}
                </Text>
              </View>
            </View>
          ));
        }
        // Open and all slots are invalid
        return (
          <View style={[styles.slotWrap, rtlView]}>
            <Text
              style={[
                styles.slotText,
                { color: day.id === today ? COLORS.green : COLORS.text_gray },
                rtlText,
              ]}
            >
              {day.id === today
                ? __(
                    "listingDetailScreenTexts.bHTexts.openTodayText",
                    appSettings.lng
                  )
                : __(
                    "listingDetailScreenTexts.bHTexts.openText",
                    appSettings.lng
                  )}
            </Text>
          </View>
        );
      }
      // Full day open
      return (
        <View style={[styles.slotWrap, rtlView]}>
          <Text
            style={[
              styles.slotText,
              { color: day.id === today ? COLORS.green : COLORS.text_gray },
              rtlText,
            ]}
          >
            {day.id === today
              ? __(
                  "listingDetailScreenTexts.bHTexts.openTodayText",
                  appSettings.lng
                )
              : __(
                  "listingDetailScreenTexts.bHTexts.openText",
                  appSettings.lng
                )}
          </Text>
        </View>
      );
    }
    // Full day closed
    return (
      <View style={[styles.slotWrap, rtlView]}>
        <Text
          style={[
            styles.slotText,
            { color: day.id === today ? COLORS.red : COLORS.text_gray },
            rtlText,
          ]}
        >
          {day.id === today
            ? __(
                "listingDetailScreenTexts.bHTexts.closeTodayText",
                appSettings.lng
              )
            : __("listingDetailScreenTexts.bHTexts.closeText", appSettings.lng)}
        </Text>
      </View>
    );
  };

  const getCurrentStatus = () => {
    const tempDay = listingData?.bh?.bhs[today];

    if (tempDay.open) {
      if (tempDay?.times?.length) {
        const tempTimes = tempDay.times.filter(
          (_timeSlot) => !!_timeSlot.start && !!_timeSlot.end
        );
        if (tempTimes.length) {
          if (
            tempTimes.filter((_tempSlot) =>
              isTimeBetween(_tempSlot.start, _tempSlot.end, now)
            ).length
          ) {
            return (
              <Text
                style={[styles.currentStatus, { color: COLORS.green }, rtlText]}
              >
                {__(
                  "listingDetailScreenTexts.bHTexts.currentStatusOpen",
                  appSettings.lng
                )}
              </Text>
            );
          } else {
            return (
              <Text
                style={[styles.currentStatus, { color: COLORS.red }, rtlText]}
              >
                {__(
                  "listingDetailScreenTexts.bHTexts.currentStatusClose",
                  appSettings.lng
                )}
              </Text>
            );
          }
        }
        // Open and all slots are invalid
        return (
          <Text
            style={[styles.currentStatus, { color: COLORS.green }, rtlText]}
          >
            {__(
              "listingDetailScreenTexts.bHTexts.currentStatusOpen",
              appSettings.lng
            )}
          </Text>
        );
      }
      // Full day open
      return (
        <Text style={[styles.currentStatus, { color: COLORS.green }, rtlText]}>
          {__(
            "listingDetailScreenTexts.bHTexts.currentStatusOpen",
            appSettings.lng
          )}
        </Text>
      );
    }
    // Full day closed
    return (
      <Text style={[styles.currentStatus, { color: COLORS.red }, rtlText]}>
        {__(
          "listingDetailScreenTexts.bHTexts.currentStatusClose",
          appSettings.lng
        )}
      </Text>
    );
  };

  const isTimeBetween = function (startTime, endTime, now) {
    let start = moment(startTime, "HH:mm");
    let end = moment(endTime, "HH:mm");
    let time = moment(now, "HH:mm");
    // if (end < start) {
    //   return (
    //     (time >= start && time <= moment("23:59:59", "h:mm:ss")) ||
    //     (time >= moment("0:00:00", "h:mm:ss") && time < end)
    //   );
    // }
    return time >= start && time < end;
  };

  const onShare = async () => {
    const tempShare = ios
      ? { url: listingData.url }
      : { message: listingData.url };
    try {
      const result = await Share.share(tempShare);
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // console.log(result.activityType);
        } else {
          // console.log("Shared");
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleWhatsapp = () => {
    if (playing) {
      setPlaying(false);
    }

    if (user === null && config?.registered_only?.listing_contact) {
      handleLoginAlert();
    } else {
      Linking.openURL(
        "http://api.whatsapp.com/send?phone=" +
          listingData.contact.whatsapp_number
      );
    }
  };
  const handleLoginAlert = () => {
    Alert.alert(
      "",
      __("listingDetailScreenTexts.loginAlert", appSettings.lng),
      [
        {
          text: __(
            "listingDetailScreenTexts.cancelButtonTitle",
            appSettings.lng
          ),
        },
        {
          text: __(
            "listingDetailScreenTexts.loginButtonTitle",
            appSettings.lng
          ),
          onPress: () => navigation.navigate(routes.loginScreen),
        },
      ],
      { cancelable: false }
    );
  };

  const handleMarkerPress = (e) => {
    if (ios) {
      Linking.openURL(
        `maps://app?daddr=${e.nativeEvent.coordinate.latitude}+${e.nativeEvent.coordinate.longitude}`
      );
    }
  };

  const handleHeaderLayout = (e) => {
    setBadgeDim(e.nativeEvent.layout);
  };

  const toggleRatings = () => {
    setRatingShown((prevRS) => !prevRS);
  };

  const handleRating = (fn, val, current) => {
    if (val === current) return;
    fn("rating", val);
  };

  const handleReview = (values) => {
    setPosting(true);
    const tempArgs = { ...values, listing: route.params.listingId };
    if (!config?.review?.rating) {
      delete tempArgs.rating;
    }
    if (user) {
      setAuthToken(auth_token);
    }
    api
      .post("reviews", tempArgs)
      .then((res) => {
        if (res.ok) {
          if (res?.data?.status === "approved") {
            setRatingData((prevRatingData) => [...prevRatingData, res.data]);
            alert(
              __("listingDetailScreenTexts.reviewApproved", appSettings.lng)
            );
          } else {
            alert(__("listingDetailScreenTexts.reviewNotice", appSettings.lng));
          }
        } else {
          // Handle Error
        }
      })
      .then(() => {
        if (user) {
          removeAuthToken();
        }
        setPosting(false);
      });
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

  const html_script = `

<!DOCTYPE html>
<html>
<head>
	
	<title>Quick Start - Leaflet</title>

	<meta charset="utf-8" />
	<meta name="viewport" content="initial-scale=1.0">
	
	<link rel="shortcut icon" type="image/x-icon" href="docs/images/favicon.ico" />

    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css" integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ==" crossorigin=""/>
    <script src="https://unpkg.com/leaflet@1.6.0/dist/leaflet.js" integrity="sha512-gZwIG9x3wUXg2hdXF6+rVkLF/0Vi9U8D2Ntg4Ga5I5BZpVkVxlJWbSQtXPSiUTtC0TjtGOmxa1AJPuV0CPthew==" crossorigin=""></script>


	
</head>
<body style="padding: 0; margin: 0">



<div id="map" style="width: 100%; height: 100vh;"></div>
<script>

var osmLayer = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }
);
var map = L.map('map', {
  zoom: 10,
  maxZoom: 18,
  center: [${
    listingData?.contact?.latitude || config?.map?.center?.lat || 0
  }, ${listingData?.contact?.longitude || config?.map?.center?.lng || 0}],
  layers: [osmLayer],
  dragging:false
});

const marker = L.marker([${
    listingData?.contact?.latitude || config?.map?.center?.lat || 0
  }, ${
    listingData?.contact?.longitude || config?.map?.center?.lng || 0
  }], { draggable: false }).addTo(map);

</script>



</body>
</html>

`;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F8F8F8" }}
      behavior={ios ? "padding" : "height"}
      keyboardVerticalOffset={15}
    >
      {/* Page Header */}
      <ListingHeader
        title={__("listingDetailScreenTexts.pageTitle", appSettings.lng)}
        onBack={() => navigation.goBack()}
        onFavorite={handleFavourite}
        author={listingData ? listingData.author_id : null}
        is_favourite={listingData ? listingData.is_favourite : null}
        favoriteDisabled={favoriteDisabled || loading}
        style={{ position: "relative" }}
        favLoading={favLoading}
        sharable={!!listingData?.url}
        onShare={onShare}
      />
      {/* Loading Component */}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.text, rtlText]}>
            {__("listingDetailScreenTexts.loadingText", appSettings.lng)}
          </Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
            }}
          >
            {/* main scrollview */}
            <ScrollView
              bounces={false}
              contentContainerStyle={styles.container}
              ref={scrollRef}
              // scrollEnabled={false}
            >
              <View
                style={{
                  backgroundColor: COLORS.white,
                  borderRadius: 6,
                  elevation: 0.5,
                  shadowColor: COLORS.border_light,
                  shadowOpacity: 0.2,
                  shadowRadius: 5,
                  shadowOffset: { height: 1, width: 0 },
                  marginBottom: 20,
                  width: "100%",
                }}
              >
                <View
                  style={{
                    overflow: "hidden",
                    borderRadius: 6,
                    backgroundColor: "#white",
                  }}
                >
                  {/* Media Slider */}
                  {(!!listingData?.images?.length ||
                    !!listingData?.video_urls?.length) && (
                    <View style={styles.imageSlider}>
                      {/* Sold out badge */}
                      {listingData?.badges?.includes("is-sold") && badgeDim ? (
                        <View
                          style={{
                            backgroundColor: COLORS.primary,
                            paddingVertical: 5,
                            paddingHorizontal: 50,
                            position: "absolute",
                            top: 0,
                            right: 0,
                            transform: [
                              {
                                translateX: ios
                                  ? badgeDim.width / 3.3
                                  : badgeDim.width / 3.3,
                              },

                              {
                                translateY: ios
                                  ? badgeDim.width / 3.3 - badgeDim.height / 2
                                  : badgeDim.width / 3.8 - badgeDim.height / 2,
                              },
                              { rotate: "45deg" },
                            ],
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 5,
                          }}
                        >
                          <Text style={styles.soldOutMessage}>
                            {__(
                              "listingDetailScreenTexts.soldOutMessage",
                              appSettings.lng
                            )}
                          </Text>
                        </View>
                      ) : (
                        <View
                          onLayout={(event) => handleHeaderLayout(event)}
                          style={[
                            styles.soldOutBadge,
                            {
                              top: !ios
                                ? screenHeight - windowHeight
                                  ? "3%"
                                  : "3.5%"
                                : "4%",

                              left: ios ? "73%" : "73%",
                              width: "35%",
                              // elevation: 2,
                              opacity: 0,
                            },
                          ]}
                        >
                          <Text style={styles.soldOutMessage}>
                            {__(
                              "listingDetailScreenTexts.soldOutMessage",
                              appSettings.lng
                            )}
                          </Text>
                        </View>
                      )}

                      <ScrollView
                        horizontal
                        pagingEnabled
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        showsHorizontalScrollIndicator={false}
                      >
                        {!!listingData?.video_urls?.length &&
                          listingData.video_urls.map((url) =>
                            get_sanitized_embed_url(url)
                          )}

                        {listingData.images.map((image) => (
                          <TouchableWithoutFeedback
                            key={image.ID}
                            onPress={() => handleImageZoomView(image)}
                          >
                            <Image
                              style={{
                                width: windowWidth * 0.94,
                                // height: 300,
                                height: windowWidth * 0.75,
                                resizeMode: "contain",
                              }}
                              source={{
                                uri: image.sizes.full.src,
                              }}
                            />
                          </TouchableWithoutFeedback>
                        ))}
                      </ScrollView>

                      {(listingData?.images?.length > 1 ||
                        listingData?.video_urls?.length > 0) && (
                        <>
                          {rtl_support ? (
                            <Text style={styles.scrollProgress}>
                              {getTotalSlideCount()}
                              {" / "}
                              {currentSlide + 1}
                            </Text>
                          ) : (
                            <Text style={styles.scrollProgress}>
                              {currentSlide + 1} / {getTotalSlideCount()}
                            </Text>
                          )}
                        </>
                      )}
                    </View>
                  )}

                  {/* title, location, date, badges */}
                  <View
                    style={[
                      styles.bgWhite_W100_PH3,
                      {
                        overflow: "hidden",
                        alignItems: rtl_support ? "flex-end" : "flex-start",
                      },
                    ]}
                  >
                    {/* Title */}
                    <Text style={[styles.listingTitle, rtlTextA]}>
                      {decodeString(listingData.title)}
                    </Text>

                    {/* Other Badges */}
                    {listingData?.promotions?.length > 0 && (
                      <View style={styles.badgeSection}>
                        {listingData.promotions.map((_badge) => (
                          <Badge badgeName={_badge} key={_badge} />
                        ))}
                      </View>
                    )}
                    {/* Date & Time */}
                    <View
                      style={[{ paddingVertical: 5 }, styles.flexRow, rtlView]}
                    >
                      <View
                        style={[
                          styles.listingLocationAndTimeIconContainer,
                          {
                            alignItems: rtl_support ? "flex-end" : "flex-start",
                          },
                        ]}
                      >
                        <FontAwesome5
                          name="clock"
                          size={15}
                          color={COLORS.text_gray}
                        />
                      </View>
                      <Text
                        style={[styles.listingLocationAndTimeText, rtlText]}
                      >
                        {__(
                          "listingDetailScreenTexts.postTimePrefix",
                          appSettings.lng
                        )}
                        {getListingTime()}
                      </Text>
                    </View>
                    {/* Location */}
                    {!!getLocation(listingData.contact) && (
                      <View
                        style={[styles.locationData, styles.flexRow, rtlView]}
                      >
                        <View
                          style={[
                            styles.listingLocationAndTimeIconContainer,
                            {
                              alignItems: rtl_support
                                ? "flex-end"
                                : "flex-start",
                            },
                          ]}
                        >
                          <FontAwesome5
                            name="map-marker-alt"
                            size={15}
                            color={COLORS.text_gray}
                          />
                        </View>
                        <View
                          style={{
                            flex: 1,
                            alignItems: rtl_support ? "flex-end" : "flex-start",
                          }}
                        >
                          <Text
                            style={[
                              styles.listingLocationAndTimeText,
                              rtlTextA,
                            ]}
                          >
                            {getLocation(listingData.contact)}
                          </Text>
                        </View>
                      </View>
                    )}
                    {listingData.pricing_type !== "disabled" && (
                      <View style={{ marginTop: 10 }}>
                        {rtl_support ? (
                          <View style={[styles.listingPriceWrap, rtlView]}>
                            <View style={[styles.priceTag]}>
                              <View style={styles.view}>
                                <Text
                                  style={[styles.listingPrice, rtlText]}
                                  numberOfLines={1}
                                >
                                  {getPrice(
                                    config.currency,
                                    {
                                      pricing_type: listingData.pricing_type,
                                      price_type: listingData.price_type,
                                      price: listingData.price,
                                      max_price: listingData.max_price,
                                    },
                                    appSettings.lng
                                  )}
                                </Text>
                              </View>
                            </View>

                            {listingData?.price_type !== "on_call" && (
                              <Text
                                style={[styles.listingPricenegotiable, rtlText]}
                              >
                                {getPriceType(listingData.price_type)}
                              </Text>
                            )}
                          </View>
                        ) : (
                          <View style={styles.listingPriceWrap}>
                            <View style={styles.priceTag}>
                              <Text
                                style={styles.listingPrice}
                                numberOfLines={1}
                              >
                                {getPrice(
                                  config.currency,
                                  {
                                    pricing_type: listingData.pricing_type,
                                    price_type: listingData.price_type,
                                    price: listingData.price,
                                    max_price: listingData.max_price,
                                  },
                                  appSettings.lng
                                )}
                              </Text>
                            </View>

                            {listingData?.price_type !== "on_call" && (
                              <Text style={styles.listingPricenegotiable}>
                                {getPriceType(listingData.price_type)}
                              </Text>
                            )}
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View
                style={{
                  backgroundColor: COLORS.white,
                  borderRadius: 6,
                  elevation: 0.5,
                  shadowColor: COLORS.border_light,
                  shadowOpacity: 0.2,
                  shadowRadius: 5,
                  shadowOffset: { height: 1, width: 0 },
                  marginBottom: 20,
                  width: "100%",
                }}
              >
                <View
                  style={{
                    overflow: "hidden",
                    borderRadius: 6,
                    backgroundColor: "#white",
                  }}
                >
                  <View style={{ paddingHorizontal: "3%", marginTop: 15 }}>
                    <Text style={[styles.descriptionTitle, rtlText]}>
                      {__(
                        "listingDetailScreenTexts.description",
                        appSettings.lng
                      )}
                    </Text>
                  </View>
                  <View style={styles.screenSeparatorWrap}>
                    <AppSeparator style={styles.screenSeparator} />
                  </View>

                  {/* custom fields & description */}
                  {(!!getCustomFields() || !!listingData.description) && (
                    <View style={styles.bgWhite_W100_PH3}>
                      {/* Custom Fields */}
                      {!!listingData.custom_fields.length && (
                        <View
                          style={[
                            styles.listingCustomInfoWrap,
                            { marginTop: -3 },
                          ]}
                        >
                          {listingData.custom_fields.map((field, index) => (
                            <View key={index}>
                              {["text", "textarea"].includes(field.type) &&
                                !!field.value && (
                                  <View style={[styles.customfield, rtlView]}>
                                    <Text
                                      style={[styles.customfieldName, rtlTextA]}
                                    >
                                      {decodeString(field.label)}
                                      {" : "}
                                    </Text>
                                    <Text
                                      style={[
                                        styles.customfieldValue,
                                        rtlTextA,
                                      ]}
                                    >
                                      {decodeString(field?.value) ||
                                        __(
                                          "listingDetailScreenTexts.deletedValue",
                                          appSettings.lng
                                        )}
                                    </Text>
                                  </View>
                                )}
                              {["url", "number"].includes(field.type) &&
                                !!field.value && (
                                  <View style={[styles.customfield, rtlView]}>
                                    <Text
                                      style={[styles.customfieldName, rtlTextA]}
                                    >
                                      {decodeString(field.label)}
                                      {" : "}
                                    </Text>
                                    <Text
                                      style={[
                                        styles.customfieldValue,
                                        rtlTextA,
                                      ]}
                                    >
                                      {field?.value ||
                                        __(
                                          "listingDetailScreenTexts.deletedValue",
                                          appSettings.lng
                                        )}
                                    </Text>
                                  </View>
                                )}
                              {["radio", "select"].includes(field.type) &&
                                !!field.value &&
                                !!field.options.choices.filter(
                                  (choice) => choice.id === field.value
                                ).length && (
                                  <View style={[styles.customfield, rtlView]}>
                                    <Text
                                      style={[styles.customfieldName, rtlTextA]}
                                    >
                                      {decodeString(field.label)}
                                      {" : "}
                                    </Text>
                                    <Text
                                      style={[
                                        styles.customfieldValue,
                                        rtlTextA,
                                      ]}
                                    >
                                      {decodeString(
                                        field.options.choices.filter(
                                          (choice) => choice.id === field.value
                                        )[0].name
                                      ) ||
                                        __(
                                          "listingDetailScreenTexts.deletedValue",
                                          appSettings.lng
                                        )}
                                    </Text>
                                  </View>
                                )}
                              {field.type === "checkbox" &&
                                !!field.value.length && (
                                  <View style={[styles.customfield, rtlView]}>
                                    <Text
                                      style={[styles.customfieldName, rtlTextA]}
                                    >
                                      {decodeString(field.label)}
                                      {" : "}
                                    </Text>
                                    <Text
                                      style={[
                                        styles.customfieldValue,
                                        rtlTextA,
                                      ]}
                                    >
                                      {getCheckboxValue(field)}
                                    </Text>
                                  </View>
                                )}
                              {field.type === "date" && !!field.value && (
                                <View style={[styles.customfield, rtlView]}>
                                  {["date", "date_time"].includes(
                                    field.date.type
                                  ) && (
                                    <Text
                                      style={[styles.customfieldName, rtlTextA]}
                                    >
                                      {decodeString(field.label)}
                                      {" : "}
                                    </Text>
                                  )}
                                  {["date_range", "date_time_range"].includes(
                                    field.date.type
                                  ) &&
                                    getRangeField(field) && (
                                      <Text
                                        style={[
                                          styles.customfieldName,
                                          rtlTextA,
                                        ]}
                                      >
                                        {decodeString(field.label)}
                                        {" : "}
                                      </Text>
                                    )}
                                  {field.date.type === "date" && (
                                    <Text
                                      style={[
                                        styles.customfieldValue,
                                        rtlTextA,
                                      ]}
                                    >
                                      {field?.value ||
                                        __(
                                          "listingDetailScreenTexts.deletedValue",
                                          appSettings.lng
                                        )}
                                    </Text>
                                  )}
                                  {field.date.type === "date_time" && (
                                    <Text
                                      style={[
                                        styles.customfieldValue,
                                        rtlTextA,
                                      ]}
                                    >
                                      {field?.value ||
                                        __(
                                          "listingDetailScreenTexts.deletedValue",
                                          appSettings.lng
                                        )}
                                    </Text>
                                  )}
                                  {field.date.type === "date_range" &&
                                    getRangeField(field) && (
                                      <Text
                                        style={[
                                          styles.customfieldValue,
                                          rtlTextA,
                                        ]}
                                      >
                                        {__(
                                          "listingDetailScreenTexts.custom_fields.date_range.start",
                                          appSettings.lng
                                        ) +
                                          field.value.start +
                                          "\n" +
                                          __(
                                            "listingDetailScreenTexts.custom_fields.date_range.end",
                                            appSettings.lng
                                          ) +
                                          field.value.end ||
                                          __(
                                            "listingDetailScreenTexts.deletedValue",
                                            appSettings.lng
                                          )}
                                      </Text>
                                    )}
                                  {field.date.type === "date_time_range" &&
                                    getRangeField(field) && (
                                      <Text
                                        style={[
                                          styles.customfieldValue,
                                          rtlTextA,
                                        ]}
                                      >
                                        {__(
                                          "listingDetailScreenTexts.custom_fields.date_time_range.start",
                                          appSettings.lng
                                        ) +
                                          field.value.start +
                                          "\n" +
                                          __(
                                            "listingDetailScreenTexts.custom_fields.date_time_range.end",
                                            appSettings.lng
                                          ) +
                                          field.value.end ||
                                          __(
                                            "listingDetailScreenTexts.deletedValue",
                                            appSettings.lng
                                          )}
                                      </Text>
                                    )}
                                </View>
                              )}
                            </View>
                          ))}
                        </View>
                      )}

                      {!!listingData.custom_fields.length &&
                        !!listingData.description && (
                          <View
                            style={{
                              width: "100%",
                              height: 10,
                            }}
                          />
                        )}
                      {/* Description */}
                      {!!listingData.description && (
                        <View
                          style={[
                            styles.listingDescriptionWrap,
                            {
                              marginTop: !listingData.custom_fields.length
                                ? -7
                                : 0,
                            },
                            {
                              alignItems: rtl_support
                                ? "flex-end"
                                : "flex-start",
                            },
                          ]}
                        >
                          <View
                            style={{
                              width: "100%",
                            }}
                          >
                            <ReadMore
                              numberOfLines={3}
                              renderTruncatedFooter={renderTruncatedFooter}
                              renderRevealedFooter={renderRevealedFooter}
                            >
                              <Text
                                style={[
                                  styles.cardText,
                                  rtlText,
                                  {
                                    textAlign: rtl_support
                                      ? "right"
                                      : "justify",
                                  },
                                ]}
                              >
                                {decodeString(listingData.description).trim()}
                              </Text>
                            </ReadMore>
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>
              {/* Admob banner Component */}
              {admobConfig.admobEnabled && (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    height: 100,
                    marginBottom: 20,
                  }}
                >
                  <AdmobBanner />
                </View>
              )}

              {
                // config?.store_enabled && !!listingData?.store &&
                <View
                  style={{
                    backgroundColor: COLORS.white,
                    borderRadius: 6,
                    elevation: 0.5,
                    shadowColor: COLORS.border_light,
                    shadowOpacity: 0.2,
                    shadowRadius: 5,
                    shadowOffset: { height: 1, width: 0 },
                    marginBottom: 20,
                    width: "100%",
                  }}
                >
                  <View
                    style={{
                      overflow: "hidden",
                      borderRadius: 6,
                      backgroundColor: "#white",
                    }}
                  >
                    <View>
                      <View
                        style={[
                          {
                            flexDirection: "row",
                            alignItems: "flex-start",
                            width: "100%",
                            paddingVertical: 15,
                            paddingHorizontal: "1.5%",
                          },
                          rtlView,
                        ]}
                      >
                        <View
                          style={{
                            height: 70,
                            width: 70,
                            borderRadius: 70 / 2,
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            marginHorizontal: "1.5%",
                            borderWidth: listingData?.author?.pp_thumb_url
                              ? 0
                              : 0.7,
                            borderColor: COLORS.border_light,
                            backgroundColor: "red",
                          }}
                        >
                          {listingData.author.pp_thumb_url ? (
                            <Image
                              source={{ uri: listingData.author.pp_thumb_url }}
                              style={{
                                height: "100%",
                                width: "100%",
                                resizeMode: "contain",
                              }}
                            />
                          ) : (
                            <Ionicons
                              name="person-outline"
                              size={30}
                              color="black"
                            />
                          )}
                        </View>
                        <View
                          style={{
                            marginHorizontal: "1.5%",
                            // flex: 1,
                          }}
                        >
                          <View style={styles.view}>
                            <Text
                              style={[
                                {
                                  fontSize: 16,
                                  color: COLORS.text_dark,
                                  fontWeight: "bold",
                                },
                                rtlTextA,
                              ]}
                            >
                              {config?.store_enabled && !!listingData?.store
                                ? decodeString(listingData.store.title)
                                : getSellerName()}
                            </Text>
                          </View>
                          {listingData?.author?.seller_verified && (
                            <View
                              style={{
                                flexDirection: rtl_support
                                  ? "row-reverse"
                                  : "row",
                                alignItems: "center",
                                paddingTop: 5,
                              }}
                            >
                              <MaterialIcons
                                name="verified"
                                size={20}
                                color={
                                  config?.seller_verification?.badge_color ||
                                  "green"
                                }
                              />
                              <View style={{ paddingHorizontal: 5 }}>
                                <Text
                                  style={[
                                    {
                                      fontSize: 15,
                                      color:
                                        config?.seller_verification
                                          ?.badge_color || "green",
                                    },
                                    rtlText,
                                  ]}
                                >
                                  {__(
                                    "listingDetailScreenTexts.verified",
                                    appSettings.lng
                                  )}
                                </Text>
                              </View>
                            </View>
                          )}
                          {config?.store_enabled && !!listingData?.store && (
                            <View
                              style={{
                                paddingVertical: 10,
                                alignItems: "center",
                              }}
                            >
                              <AppButton
                                title={__(
                                  "listingDetailScreenTexts.seeAllAds",
                                  appSettings.lng
                                )}
                                style={{
                                  paddingHorizontal: 10,
                                  paddingVertical: 7,
                                }}
                                textStyle={{ fontWeight: "normal" }}
                                onPress={handleStorePress}
                              />
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              }
              {/* Business Hours Component */}
              {!!listingData?.bh?.bhs &&
                !!Object.keys(listingData.bh.bhs).length && (
                  <View
                    style={{
                      backgroundColor: COLORS.white,
                      borderRadius: 6,
                      elevation: 0.5,
                      shadowColor: COLORS.border_light,
                      shadowOpacity: 0.2,
                      shadowRadius: 5,
                      shadowOffset: { height: 1, width: 0 },
                      marginBottom: 20,
                      width: "100%",
                    }}
                  >
                    <View
                      style={{
                        overflow: "hidden",
                        borderRadius: 6,
                        backgroundColor: "#white",
                      }}
                    >
                      <View
                        style={[styles.bgWhite_W100_PH3, { paddingTop: 15 }]}
                      >
                        <View
                          style={[
                            styles.bHTitleWrap,
                            {
                              alignItems: rtl_support
                                ? "flex-end"
                                : "flex-start",
                            },
                          ]}
                        >
                          <Text style={[styles.bHTitle, rtlText]}>
                            {__(
                              "listingDetailScreenTexts.businessHoursTitle",
                              appSettings.lng
                            )}
                          </Text>
                        </View>
                        <View style={styles.businessHourContentWrap}>
                          <View
                            style={[
                              styles.currentStatusWrap,
                              {
                                alignItems: rtl_support
                                  ? "flex-end"
                                  : "flex-start",
                              },
                            ]}
                          >
                            {getCurrentStatus()}
                          </View>
                          <View style={styles.bHTableWrap}>
                            {config.week_days.map((_day, index, arr) => (
                              <BHDayComponent
                                day={_day}
                                key={index}
                                dataArr={arr}
                                index={index}
                              />
                            ))}
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                )}

              {/* Map Component */}
              {!listingData?.contact?.hide_map &&
                !!listingData?.contact?.latitude &&
                !!listingData?.contact?.longitude &&
                !!config?.map && (
                  <View
                    style={{
                      marginBottom: 20,
                      backgroundColor: COLORS.white,
                      paddingHorizontal: "3%",
                    }}
                  >
                    <View style={{ borderRadius: 6, overflow: "hidden" }}>
                      {"google" === config?.map?.type ? (
                        <>
                          {/* Map Type Change Buttons */}
                          <View style={styles.mapViewButtonsWrap}>
                            {/* Standard */}
                            <TouchableOpacity
                              style={[
                                styles.mapViewButton,
                                {
                                  backgroundColor:
                                    mapType == "standard"
                                      ? COLORS.dodgerblue
                                      : "transparent",
                                },
                              ]}
                              onPress={handleMapTypeChange}
                              disabled={mapType == "standard"}
                            >
                              <Text
                                style={[
                                  styles.mapViewButtonTitle,
                                  {
                                    color:
                                      mapType == "standard"
                                        ? COLORS.white
                                        : COLORS.text_gray,
                                  },
                                ]}
                              >
                                {__(
                                  "listingDetailScreenTexts.mapButtons.standard",
                                  appSettings.lng
                                )}
                              </Text>
                            </TouchableOpacity>
                            {/* Hybrid */}
                            <TouchableOpacity
                              style={[
                                styles.mapViewButton,
                                {
                                  backgroundColor:
                                    mapType == "hybrid"
                                      ? COLORS.dodgerblue
                                      : "transparent",
                                },
                              ]}
                              onPress={handleMapTypeChange}
                              disabled={mapType == "hybrid"}
                            >
                              <Text
                                style={[
                                  styles.mapViewButtonTitle,
                                  {
                                    color:
                                      mapType == "hybrid"
                                        ? COLORS.white
                                        : COLORS.text_gray,
                                  },
                                ]}
                              >
                                {__(
                                  "listingDetailScreenTexts.mapButtons.hybrid",
                                  appSettings.lng
                                )}
                              </Text>
                            </TouchableOpacity>
                          </View>
                          {/* MapView */}
                          <MapView
                            style={{
                              width: windowWidth * 0.94,
                              height: windowWidth * 0.7,
                            }}
                            initialRegion={{
                              latitude: parseFloat(
                                listingData?.contact?.latitude ||
                                  config?.map?.center?.lat ||
                                  0
                              ),
                              longitude: parseFloat(
                                listingData?.contact?.longitude ||
                                  config?.map?.center?.lng ||
                                  0
                              ),
                              latitudeDelta: 0.0135135,
                              longitudeDelta: 0.0135135 * 0.7,
                            }}
                            provider={MapView.PROVIDER_GOOGLE}
                            // provider={null}
                            mapType={mapType}
                            scrollEnabled={false}
                          >
                            {/* Marker */}
                            <Marker
                              coordinate={{
                                latitude: parseFloat(
                                  listingData?.contact?.latitude ||
                                    config?.map?.center?.lat ||
                                    0
                                ),
                                longitude: parseFloat(
                                  listingData?.contact?.longitude ||
                                    config?.map?.center?.lng ||
                                    0
                                ),
                              }}
                              title={getAddress(listingData?.contact || {})}
                              onPress={(e) => handleMarkerPress(e)}
                            />
                            <UrlTile
                              urlTemplate="http://a.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png"
                              maximumZ={19}
                              flipY={false}
                            />
                          </MapView>
                        </>
                      ) : (
                        <View
                          style={{
                            width: windowWidth * 0.94,
                            height: windowWidth * 0.7,
                          }}
                        >
                          <WebView
                            ref={mapRef}
                            source={{ html: html_script }}
                            style={{ flex: 1, opacity: 0.99 }}
                            // scrollEnabled={true}
                            // panGestureEnabled={false}
                          />
                        </View>
                      )}
                    </View>
                  </View>
                )}

              {/* Social Profiles */}
              {!!listingData?.social_profiles &&
                !!Object.keys(listingData.social_profiles).length && (
                  <View
                    style={{
                      backgroundColor: COLORS.white,
                      borderRadius: 6,
                      elevation: 0.5,
                      shadowColor: COLORS.border_light,
                      shadowOpacity: 0.2,
                      shadowRadius: 5,
                      shadowOffset: { height: 1, width: 0 },
                      marginBottom: 20,
                      width: "100%",
                    }}
                  >
                    <View
                      style={{
                        overflow: "hidden",
                        borderRadius: 6,
                        backgroundColor: "#white",
                      }}
                    >
                      <View style={styles.bgWhite_W100_PH3}>
                        <View
                          style={[styles.socialProfileComponentWrap, rtlView]}
                        >
                          <View style={styles.sclPrflTtlWrap}>
                            <Text style={[styles.sclPrflTtl, rtlTextA]}>
                              {__(
                                "listingDetailScreenTexts.socialProfileTitle",
                                appSettings.lng
                              )}
                            </Text>
                          </View>
                          <View style={styles.sclPrflsWrap}>
                            <View style={styles.sclPrfls}>
                              {Object.keys(listingData.social_profiles).map(
                                (_profile, index) => (
                                  <TouchableOpacity
                                    style={[
                                      styles.sclPrflIconWrap,
                                      {
                                        marginLeft: index === 0 ? 14 : 7,
                                        marginRight:
                                          index ===
                                          listingData.social_profiles.length - 1
                                            ? 15
                                            : 7,
                                      },
                                    ]}
                                    key={_profile}
                                    onPress={() =>
                                      handleSocialProfileClick(_profile)
                                    }
                                  >
                                    <FontAwesome
                                      name={_profile}
                                      size={20}
                                      color={COLORS.primary}
                                    />
                                  </TouchableOpacity>
                                )
                              )}
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              {/* Whatsapp Button */}
              {!!listingData?.contact?.whatsapp_number &&
                (user === null || user.id !== listingData.author_id) && (
                  <View
                    style={{
                      paddingHorizontal: "3%",
                      width: "100%",
                      marginBottom: 20,
                      alignItems: "center",
                    }}
                  >
                    <TouchableOpacity
                      style={styles.whatsappWrap}
                      onPress={handleWhatsapp}
                    >
                      <Text style={{ color: COLORS.white, fontWeight: "bold" }}>
                        {__(
                          "listingDetailScreenTexts.whatsappButton",
                          appSettings.lng
                        )}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

              {/* Reviews & Rating */}
              {!!listingData?.review && !!config?.review && (
                <View
                  style={{
                    backgroundColor: COLORS.white,
                    borderRadius: 6,
                    elevation: 0.5,
                    shadowColor: COLORS.border_light,
                    shadowOpacity: 0.2,
                    shadowRadius: 5,
                    shadowOffset: { height: 1, width: 0 },
                    width: "100%",
                    marginBottom: 20,
                  }}
                >
                  <View
                    style={{
                      overflow: "hidden",
                      borderRadius: 6,
                      backgroundColor: COLORS.white,
                    }}
                  >
                    <View style={styles.ratingReviewSectionWrap}>
                      <View style={styles.ratingDisplayWrap}>
                        <View
                          style={[
                            styles.ratingDisHdrWrap,
                            {
                              justifyContent: config?.review?.rating
                                ? "space-between"
                                : "flex-start",
                            },
                            rtlView,
                          ]}
                        >
                          <View style={styles.ratingCountWrap}>
                            {listingData?.review?.rating?.count === 0 ? (
                              <Text style={[styles.ratingCount, rtlText]}>
                                {__(
                                  "listingDetailScreenTexts.ratingHeader.zero",
                                  appSettings.lng
                                )}
                              </Text>
                            ) : (
                              <>
                                {rtl_support ? (
                                  <Text style={[styles.ratingCount, rtlText]}>
                                    {__(
                                      listingData?.review?.rating?.count === 1
                                        ? "listingDetailScreenTexts.ratingHeader.single"
                                        : "listingDetailScreenTexts.ratingHeader.multiple",
                                      appSettings.lng
                                    )}{" "}
                                    {listingData?.review?.rating?.count}
                                  </Text>
                                ) : (
                                  <Text style={[styles.ratingCount, rtlText]}>
                                    {listingData?.review?.rating?.count}{" "}
                                    {__(
                                      listingData?.review?.rating?.count === 1
                                        ? "listingDetailScreenTexts.ratingHeader.single"
                                        : "listingDetailScreenTexts.ratingHeader.multiple",
                                      appSettings.lng
                                    )}
                                  </Text>
                                )}
                              </>
                            )}
                          </View>
                          {config?.review?.rating && (
                            <TotalRating
                              ratio={listingData?.review?.rating?.average || 0}
                              // rating.toFixed(2).toString()
                            />
                          )}
                        </View>
                        {listingData?.review?.rating?.count >= 1 && (
                          <>
                            <View
                              style={{
                                height: 1,
                                width: "100%",
                                backgroundColor: COLORS.text_gray,
                                marginBottom: 8,
                              }}
                            />
                            {ratingShown && (
                              <View style={styles.ratingsList}>
                                {/* map function will return the following component */}
                                {ratingData.map((rat, ind) => (
                                  <View
                                    style={[styles.ratingWrap, rtlView]}
                                    key={ind}
                                  >
                                    <View style={styles.avatarWrap}>
                                      {rat?.author_avatar_urls ? (
                                        <Image
                                          source={{
                                            uri:
                                              rat.author_avatar_urls["96"] ||
                                              rat.author_avatar_urls["48"] ||
                                              rat.author_avatar_urls["24"],
                                          }}
                                          style={styles.ratingAvatar}
                                        />
                                      ) : (
                                        <FontAwesome
                                          name={"user-circle-o"}
                                          size={45}
                                          color={COLORS.text_gray}
                                        />
                                      )}
                                    </View>

                                    <View
                                      style={[
                                        styles.detailWrap,
                                        {
                                          paddingLeft: rtl_support ? 0 : 5,
                                          paddingRight: rtl_support ? 5 : 0,
                                        },
                                      ]}
                                    >
                                      <View
                                        style={{
                                          flexDirection: rtl_support
                                            ? "row-reverse"
                                            : "row",
                                          alignItems: "center",
                                        }}
                                      >
                                        <View
                                          style={[
                                            styles.reviewTitleWrap,
                                            {
                                              alignItems: rtl_support
                                                ? "flex-end"
                                                : "flex-start",
                                            },
                                          ]}
                                        >
                                          <Text
                                            style={[
                                              styles.reviewTitle,
                                              rtlText,
                                            ]}
                                          >
                                            {rat.title}
                                          </Text>
                                        </View>
                                        {config?.review?.rating && (
                                          <TotalRating
                                            ratio={
                                              rat.rating
                                                .toFixed(2)
                                                .toString() || 0
                                            }
                                          />
                                        )}
                                      </View>

                                      <View
                                        style={[
                                          styles.userWrap,
                                          {
                                            alignItems: rtl_support
                                              ? "flex-end"
                                              : "flex-start",
                                          },
                                        ]}
                                      >
                                        <Text
                                          style={[styles.username, rtlText]}
                                        >
                                          {rat.author_name}
                                        </Text>
                                      </View>

                                      <View
                                        style={[
                                          styles.timeWrap,
                                          {
                                            alignItems: rtl_support
                                              ? "flex-end"
                                              : "flex-start",
                                          },
                                        ]}
                                      >
                                        <Text
                                          style={[styles.reviewTime, rtlText]}
                                        >
                                          {moment(rat.date).format(
                                            "MMM Do, YYYY"
                                          )}
                                        </Text>
                                      </View>
                                      <View
                                        style={[
                                          styles.reviewdetailWrap,
                                          {
                                            alignItems: rtl_support
                                              ? "flex-end"
                                              : "flex-start",
                                          },
                                        ]}
                                      >
                                        <Text
                                          style={[styles.reviewDetail, rtlText]}
                                        >
                                          {decodeString(rat.content.raw)}
                                        </Text>
                                      </View>
                                    </View>
                                  </View>
                                ))}
                                {pagination.total_pages >
                                  pagination.current_page && (
                                  <>
                                    {moreloading ? (
                                      <View style={styles.moreLoadingWrap}>
                                        <ActivityIndicator
                                          size="small"
                                          color={COLORS.primary}
                                        />
                                      </View>
                                    ) : (
                                      <View style={styles.showMoreWrap}>
                                        <AppTextButton
                                          title={__(
                                            "listingDetailScreenTexts.showMore",
                                            appSettings.lng
                                          )}
                                          onPress={() => setMoreLoading(true)}
                                        />
                                      </View>
                                    )}
                                  </>
                                )}
                              </View>
                            )}
                            <View style={styles.showReviewBtnWrap}>
                              <AppTextButton
                                title={
                                  ratingShown
                                    ? __(
                                        "listingDetailScreenTexts.hideRatingBtn",
                                        appSettings.lng
                                      )
                                    : __(
                                        "listingDetailScreenTexts.showRatingBtn",
                                        appSettings.lng
                                      )
                                }
                                style={{ marginBottom: 5 }}
                                onPress={toggleRatings}
                              />
                            </View>
                          </>
                        )}
                      </View>
                      {config?.review && (
                        <View style={styles.ratingFormWrap}>
                          <TouchableWithoutFeedback
                            onPress={() => {
                              setFormShown(true);
                              setTimeout(() => {
                                scrollRef.current.scrollToEnd({
                                  animated: true,
                                  duration: 100,
                                });
                              }, 10);
                            }}
                          >
                            <View
                              style={[
                                styles.formTitleWrap,
                                {
                                  alignItems: formShown
                                    ? rtl_support
                                      ? "flex-end"
                                      : "flex-start"
                                    : "center",
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.formTitle,
                                  {
                                    color: formShown
                                      ? COLORS.text_dark
                                      : COLORS.primary,
                                  },
                                  rtlText,
                                ]}
                              >
                                {__(
                                  "listingDetailScreenTexts.ratingFormTitle",
                                  appSettings.lng
                                )}
                              </Text>
                            </View>
                          </TouchableWithoutFeedback>
                          {formShown && (
                            <>
                              <View
                                style={{
                                  width: "100%",
                                  height: 1,
                                  backgroundColor: COLORS.text_gray,
                                }}
                              />
                              <Formik
                                initialValues={{
                                  author_name:
                                    listingData?.review?.item?.author_name ||
                                    user?.first_name + user?.last_name ||
                                    user?.first_name ||
                                    user?.last_name ||
                                    user?.username ||
                                    "",
                                  author_email:
                                    listingData?.review?.item?.author_email ||
                                    user?.email ||
                                    "",
                                  title: listingData?.review?.item?.title || "",
                                  rating:
                                    listingData?.review?.item?.rating || "",
                                  content:
                                    listingData?.review?.item?.content?.raw ||
                                    "",
                                }}
                                onSubmit={(values) => handleReview(values)}
                                validationSchema={validationSchema}
                              >
                                {({
                                  handleChange,
                                  handleBlur,
                                  handleSubmit,
                                  values,
                                  errors,
                                  touched,
                                  setFieldValue,
                                }) => (
                                  <View
                                    style={{
                                      backgroundColor: COLORS.bg_light,
                                      paddingHorizontal: "3%",
                                      paddingVertical: 10,
                                    }}
                                  >
                                    <View
                                      style={[
                                        styles.ratingNoticeWrap,
                                        {
                                          alignItems: rtl_support
                                            ? "flex-end"
                                            : "flex-start",
                                        },
                                      ]}
                                    >
                                      <Text
                                        style={[styles.ratingNotice, rtlText]}
                                      >
                                        {__(
                                          "listingDetailScreenTexts.ratingFormNotice",
                                          appSettings.lng
                                        )}
                                      </Text>
                                    </View>
                                    {!user?.first_name &&
                                      !user?.last_name &&
                                      !user?.username && (
                                        <View style={styles.formFieldWrap}>
                                          <View
                                            style={[
                                              styles.formFieldLabelWrap,
                                              {
                                                alignItems: rtl_support
                                                  ? "flex-end"
                                                  : "flex-start",
                                              },
                                            ]}
                                          >
                                            <Text
                                              style={[
                                                styles.formFieldLabel,
                                                rtlText,
                                              ]}
                                            >
                                              {__(
                                                "listingDetailScreenTexts.formLabels.name",
                                                appSettings.lng
                                              )}
                                              <Text style={styles.mendatory}>
                                                {" "}
                                                *
                                              </Text>
                                            </Text>
                                          </View>
                                          <TextInput
                                            style={[
                                              styles.formImput,
                                              {
                                                textAlign: rtl_support
                                                  ? "right"
                                                  : "left",
                                              },
                                            ]}
                                            onChangeText={handleChange(
                                              "author_name"
                                            )}
                                            onBlur={handleBlur("author_name")}
                                            value={values.author_name}
                                          />
                                          <View
                                            style={[
                                              styles.formFieldErrorWrap,
                                              {
                                                alignItems: rtl_support
                                                  ? "flex-end"
                                                  : "flex-start",
                                              },
                                            ]}
                                          >
                                            {touched.author_name &&
                                              errors.author_name && (
                                                <Text
                                                  style={[
                                                    styles.formFieldError,
                                                    rtlText,
                                                  ]}
                                                >
                                                  {errors.author_name}
                                                </Text>
                                              )}
                                          </View>
                                        </View>
                                      )}
                                    {!user?.email && (
                                      <View style={styles.formFieldWrap}>
                                        <View
                                          style={[
                                            styles.formFieldLabelWrap,
                                            {
                                              alignItems: rtl_support
                                                ? "flex-end"
                                                : "flex-start",
                                            },
                                          ]}
                                        >
                                          <Text
                                            style={[
                                              styles.formFieldLabel,
                                              rtlText,
                                            ]}
                                          >
                                            {__(
                                              "listingDetailScreenTexts.formLabels.email",
                                              appSettings.lng
                                            )}
                                            <Text style={styles.mendatory}>
                                              {" "}
                                              *
                                            </Text>
                                          </Text>
                                        </View>
                                        <TextInput
                                          style={[
                                            styles.formImput,
                                            {
                                              textAlign: rtl_support
                                                ? "right"
                                                : "left",
                                            },
                                          ]}
                                          onChangeText={handleChange(
                                            "author_email"
                                          )}
                                          onBlur={handleBlur("author_email")}
                                          value={values.author_email}
                                        />
                                        <View
                                          style={[
                                            styles.formFieldErrorWrap,
                                            {
                                              alignItems: rtl_support
                                                ? "flex-end"
                                                : "flex-start",
                                            },
                                          ]}
                                        >
                                          {touched.author_email &&
                                            errors.author_email && (
                                              <Text
                                                style={[
                                                  styles.formFieldError,
                                                  rtlText,
                                                ]}
                                              >
                                                {errors.author_email}
                                              </Text>
                                            )}
                                        </View>
                                      </View>
                                    )}
                                    <View style={styles.formFieldWrap}>
                                      <View
                                        style={[
                                          styles.formFieldLabelWrap,
                                          {
                                            alignItems: rtl_support
                                              ? "flex-end"
                                              : "flex-start",
                                          },
                                        ]}
                                      >
                                        <Text
                                          style={[
                                            styles.formFieldLabel,
                                            rtlText,
                                          ]}
                                        >
                                          {__(
                                            "listingDetailScreenTexts.formLabels.title",
                                            appSettings.lng
                                          )}
                                          <Text style={styles.mendatory}>
                                            {" "}
                                            *
                                          </Text>
                                        </Text>
                                      </View>
                                      <TextInput
                                        style={[
                                          styles.formImput,
                                          {
                                            textAlign: rtl_support
                                              ? "right"
                                              : "left",
                                          },
                                        ]}
                                        onChangeText={handleChange("title")}
                                        onBlur={handleBlur("title")}
                                        value={values.title}
                                      />
                                      <View
                                        style={[
                                          styles.formFieldErrorWrap,
                                          {
                                            alignItems: rtl_support
                                              ? "flex-end"
                                              : "flex-start",
                                          },
                                        ]}
                                      >
                                        {touched.title && errors.title && (
                                          <Text
                                            style={[
                                              styles.formFieldError,
                                              rtlText,
                                            ]}
                                          >
                                            {errors.title}
                                          </Text>
                                        )}
                                      </View>
                                    </View>
                                    {config?.review?.rating && (
                                      <View style={styles.formFieldWrap}>
                                        <View
                                          style={[
                                            styles.formFieldLabelWrap,
                                            {
                                              alignItems: rtl_support
                                                ? "flex-end"
                                                : "flex-start",
                                            },
                                          ]}
                                        >
                                          <Text
                                            style={[
                                              styles.formFieldLabel,
                                              rtlText,
                                            ]}
                                          >
                                            {__(
                                              "listingDetailScreenTexts.formLabels.rating",
                                              appSettings.lng
                                            )}
                                            <Text style={styles.mendatory}>
                                              {" "}
                                              *
                                            </Text>
                                          </Text>
                                        </View>
                                        <View
                                          style={[styles.ratingWrap, rtlView]}
                                        >
                                          <View
                                            style={[
                                              styles.totalRatingWrap,
                                              rtlView,
                                            ]}
                                          >
                                            <TouchableOpacity
                                              style={styles.ratingStarWrap}
                                              onPress={() =>
                                                handleRating(
                                                  setFieldValue,
                                                  1,
                                                  values.rating
                                                )
                                              }
                                            >
                                              <FontAwesome
                                                name={
                                                  values.rating > 0
                                                    ? "star"
                                                    : "star-o"
                                                }
                                                size={30}
                                                color={COLORS.rating_star}
                                              />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                              style={styles.ratingStarWrap}
                                              onPress={() =>
                                                handleRating(
                                                  setFieldValue,
                                                  2,
                                                  values.rating
                                                )
                                              }
                                            >
                                              <FontAwesome
                                                name={
                                                  values.rating > 1
                                                    ? "star"
                                                    : "star-o"
                                                }
                                                size={30}
                                                color={COLORS.rating_star}
                                              />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                              style={styles.ratingStarWrap}
                                              onPress={() =>
                                                handleRating(
                                                  setFieldValue,
                                                  3,
                                                  values.rating
                                                )
                                              }
                                            >
                                              <FontAwesome
                                                name={
                                                  values.rating > 2
                                                    ? "star"
                                                    : "star-o"
                                                }
                                                size={30}
                                                color={COLORS.rating_star}
                                              />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                              style={styles.ratingStarWrap}
                                              onPress={() =>
                                                handleRating(
                                                  setFieldValue,
                                                  4,
                                                  values.rating
                                                )
                                              }
                                            >
                                              <FontAwesome
                                                name={
                                                  values.rating > 3
                                                    ? "star"
                                                    : "star-o"
                                                }
                                                size={30}
                                                color={COLORS.rating_star}
                                              />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                              style={styles.ratingStarWrap}
                                              onPress={() =>
                                                handleRating(
                                                  setFieldValue,
                                                  5,
                                                  values.rating
                                                )
                                              }
                                            >
                                              <FontAwesome
                                                name={
                                                  values.rating > 4
                                                    ? "star"
                                                    : "star-o"
                                                }
                                                size={30}
                                                color={COLORS.rating_star}
                                              />
                                            </TouchableOpacity>
                                          </View>
                                        </View>

                                        <View
                                          style={[
                                            styles.formFieldErrorWrap,
                                            {
                                              alignItems: rtl_support
                                                ? "flex-end"
                                                : "flex-start",
                                            },
                                          ]}
                                        >
                                          {touched.rating && errors.rating && (
                                            <Text
                                              style={[
                                                styles.formFieldError,
                                                rtlText,
                                              ]}
                                            >
                                              {errors.rating}
                                            </Text>
                                          )}
                                        </View>
                                      </View>
                                    )}
                                    <View style={styles.formFieldWrap}>
                                      <View
                                        style={[
                                          styles.formFieldLabelWrap,
                                          {
                                            alignItems: rtl_support
                                              ? "flex-end"
                                              : "flex-start",
                                          },
                                        ]}
                                      >
                                        <Text
                                          style={[
                                            styles.formFieldLabel,
                                            rtlText,
                                          ]}
                                        >
                                          {__(
                                            "listingDetailScreenTexts.formLabels.review",
                                            appSettings.lng
                                          )}
                                          <Text style={styles.mendatory}>
                                            {" "}
                                            *
                                          </Text>
                                        </Text>
                                      </View>
                                      <TextInput
                                        style={[
                                          styles.formImput,
                                          {
                                            height: 80,
                                            textAlign: rtl_support
                                              ? "right"
                                              : "left",
                                          },
                                        ]}
                                        onChangeText={handleChange("content")}
                                        onBlur={handleBlur("content")}
                                        value={values.content}
                                        multiline
                                      />
                                      <View
                                        style={[
                                          styles.formFieldErrorWrap,
                                          {
                                            alignItems: rtl_support
                                              ? "flex-end"
                                              : "flex-start",
                                          },
                                        ]}
                                      >
                                        {touched.content && errors.content && (
                                          <Text
                                            style={[
                                              styles.formFieldError,
                                              rtlText,
                                            ]}
                                          >
                                            {errors.content}
                                          </Text>
                                        )}
                                      </View>
                                    </View>
                                    <AppButton
                                      onPress={handleSubmit}
                                      title={__(
                                        "listingDetailScreenTexts.submitBtn",
                                        appSettings.lng
                                      )}
                                      disabled={posting}
                                      loading={posting}
                                    />
                                  </View>
                                )}
                              </Formik>
                            </>
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              )}

              {/* Report ad */}
              {user !== null && user.id !== listingData.author_id && (
                <View
                  style={{
                    alignItems: "center",
                    paddingHorizontal: "3%",
                    width: "100%",
                    marginVertical: 20,
                  }}
                >
                  <TouchableWithoutFeedback onPress={handleReport}>
                    <View style={styles.reportWrap}>
                      <FontAwesome5
                        name="ban"
                        size={16}
                        color={COLORS.text_gray}
                      />
                      <Text style={styles.reportText}>
                        {__(
                          "listingDetailScreenTexts.reportAd",
                          appSettings.lng
                        )}
                      </Text>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              )}

              {/* Similar Ads */}
              {(user === null || user.id !== listingData.author_id) &&
                listingData.related.length > 0 && (
                  <View style={styles.similarAddWrap}>
                    <View
                      style={[
                        styles.similarAddTitleWrap,
                        {
                          alignItems: rtl_support ? "flex-end" : "flex-start",
                        },
                      ]}
                    >
                      <Text style={[styles.similarAddTitle, rtlText]}>
                        {__(
                          "listingDetailScreenTexts.similar",
                          appSettings.lng
                        )}
                      </Text>
                    </View>
                    <View
                      style={{
                        paddingHorizontal: "3%",
                        width: "100%",
                        marginVertical: 5,
                      }}
                    >
                      {listingData.related.map((similar) => (
                        <SimilarAdFlatList
                          key={similar.listing_id}
                          category={
                            similar.categories.length
                              ? similar.categories[0].name
                              : null
                          }
                          time={moment(similar.created_at).fromNow()}
                          title={similar.title}
                          url={
                            similar.images.length
                              ? similar.images[0].sizes.thumbnail.src
                              : null
                          }
                          views={similar.view_count}
                          id={similar.listing_id}
                          price={similar.price}
                          price_type={similar.price_type}
                          onClick={() => {
                            if (playing) {
                              setPlaying(false);
                            }
                            navigation.push(routes.listingDetailScreen, {
                              listingId: similar.listing_id,
                            });
                          }}
                          item={similar}
                        />
                      ))}
                    </View>
                  </View>
                )}
              <FlashNotification
                falshShow={flashNotification}
                flashMessage={flashNotificationMessage}
              />
              {/* Call prompt */}
              <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
              >
                <TouchableWithoutFeedback
                  onPress={() => setModalVisible(false)}
                >
                  <View style={styles.modalOverlay} />
                </TouchableWithoutFeedback>
                <View
                  style={{
                    flex: 1,
                    justifyContent: "flex-end",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      paddingHorizontal: "3%",
                      padding: 20,
                      backgroundColor: COLORS.white,
                      width: "100%",
                    }}
                  >
                    <Text style={[styles.callText, rtlText]}>
                      {__("listingDetailScreenTexts.call", appSettings.lng)}
                      {listingData.author.first_name}{" "}
                      {listingData.author.last_name}?
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleCall(listingData.contact.phone)}
                      style={[styles.phone, rtlView]}
                    >
                      <Text style={[styles.phoneText, rtlText]}>
                        {listingData.contact.phone}
                      </Text>
                      {rtl_support ? (
                        <FontAwesome5
                          name="phone-alt"
                          size={18}
                          color={COLORS.primary}
                        />
                      ) : (
                        <FontAwesome5
                          name="phone"
                          size={18}
                          color={COLORS.primary}
                        />
                      )}
                    </TouchableOpacity>
                    {ios && (
                      <AppTextButton
                        title={__(
                          "listingDetailScreenTexts.cancelButtonTitle",
                          appSettings.lng
                        )}
                        style={{ marginTop: 20 }}
                        onPress={() => setModalVisible(false)}
                      />
                    )}
                  </View>
                </View>
              </Modal>
            </ScrollView>
          </View>
          {/*  Seller contact  */}
          {(user === null || user?.id !== listingData.author_id) &&
            !config?.disabled?.listing_contact &&
            !!listingData.contact && (
              <SellerContact
                phone={!!listingData.contact?.phone}
                email={!!listingData.contact?.email}
                onCall={() => {
                  if (playing) {
                    setPlaying(false);
                  }
                  if (
                    user === null &&
                    config?.registered_only?.listing_contact
                  ) {
                    handleLoginAlert();
                  } else {
                    setModalVisible(true);
                  }
                }}
                onChat={handleChat}
                onEmail={handleEmail}
              />
            )}
        </View>
      )}
      {imageViewer && (
        <View style={styles.imageViewerWrapq}>
          <TouchableOpacity
            style={styles.imageViewerCloseButton}
            onPress={handleImageViewerClose}
          >
            <FontAwesome5 name="times" size={24} color="black" />
          </TouchableOpacity>

          <View style={styles.imageViewer}>
            <ReactNativeZoomableView
              maxZoom={2}
              minZoom={1}
              zoomStep={0.5}
              initialZoom={1}
              bindToBorders={true}
              style={{
                padding: 10,
                backgroundColor: COLORS.black,
              }}
            >
              <Image
                style={{
                  width: windowWidth,
                  height: windowHeight,
                  resizeMode: "contain",
                }}
                source={{
                  uri: viewingImage.sizes.full.src,
                }}
              />
            </ReactNativeZoomableView>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  avatarWrap: {
    height: 45,
    width: 45,
    borderRadius: 45 / 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  badgeSection: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  bgWhite_W100_PH3: {
    backgroundColor: COLORS.white,
    paddingHorizontal: "3%",
    width: "100%",
    paddingVertical: 20,
  },
  bHDayWrap: {
    borderBottomColor: COLORS.gray,

    flexDirection: "row",
  },
  bHTableWrap: {
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  bHTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  businessHourContentWrap: {},
  callText: {
    fontSize: 20,
    color: COLORS.text_dark,
    textAlign: "center",
  },
  cardText: {
    fontSize: 14,
    lineHeight: 22,

    color: COLORS.gray,
  },
  container: {
    alignItems: "center",
    paddingHorizontal: "3%",
    paddingVertical: 15,
  },
  currentStatus: {
    fontWeight: "bold",
  },
  currentStatusWrap: {
    marginVertical: 15,
  },
  customfield: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
  },
  customfieldName: {
    width: "37%",
    fontWeight: "bold",
    fontSize: 13,
  },
  customfieldValue: {
    width: "57%",
    fontWeight: "bold",
    fontSize: 13,
    color: COLORS.text_gray,
  },
  dayName: {
    fontWeight: "bold",
    color: COLORS.text_gray,
  },
  dayNameWrap: {
    padding: 5,
    flex: 1,
    borderRightColor: COLORS.gray,
  },
  descriptionText: {
    color: COLORS.text_gray,
    textAlign: "justify",
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text_dark,
    paddingBottom: 10,
  },
  detailWrap: {
    flex: 1,
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  formFieldError: {
    color: COLORS.red,
    fontSize: 12,
  },
  formFieldErrorWrap: {
    minHeight: 20,
    justifyContent: "center",
  },
  formFieldLabel: {
    fontWeight: "bold",
    color: COLORS.text_gray,
  },
  formImput: {
    // backgroundColor: "red",
    height: 40,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.border_light,
    paddingHorizontal: 10,
    marginTop: 7,
    textAlignVertical: "top",
    paddingVertical: 10,
  },
  formTitle: {
    fontSize: 16,
    color: COLORS.text_dark,
    fontWeight: "bold",
  },
  formTitleWrap: {
    paddingVertical: 10,
    paddingHorizontal: "3%",
    marginTop: 10,
  },
  hoursSlotsWrap: {
    flex: 3,
  },
  imageSlider: {
    justifyContent: "center",
    alignItems: "center",
    height: windowWidth * 0.75,
  },
  imageViewer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageViewerCloseButton: {
    position: "absolute",
    right: 15,
    top: 15,
    zIndex: 10,
    height: 25,
    width: 25,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
  },
  imageViewerWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    width: "100%",
    height: "100%",
    flex: 1,
  },
  imageViewerWrapq: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    width: "100%",
    // height: "100%",
    zIndex: 2,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  locationData: {
    marginVertical: 5,
  },
  listingDescriptionWrap: {},
  listingLocationAndTimeText: {
    fontSize: 15,
    color: COLORS.text_gray,
  },
  listingLocationAndTimeIconContainer: {
    width: 25,
  },
  listingPrice: {
    fontSize: 19.5,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  listingPricenegotiable: {
    color: COLORS.text_gray,
    fontSize: 15,
    paddingHorizontal: 10,
    fontStyle: "italic",
  },
  listingPriceWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  listingTitle: {
    color: COLORS.text_dark,
    fontSize: 20,
    fontWeight: "bold",
    paddingBottom: 10,
    marginTop: -5,
  },
  listingPriceAndOwnerWrap: {},
  loading: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
    flex: 1,
  },
  mapViewButtonsWrap: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 5,
    right: 10,
    zIndex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 5,
  },
  mapViewButton: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 5,
  },
  mapViewButtonTitle: {
    textTransform: "capitalize",
    fontSize: 12,
    fontWeight: "bold",
  },
  mendatory: {
    color: COLORS.red,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  phone: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  phoneText: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: 18,
  },
  priceTag: {
    paddingHorizontal: "3%",
  },
  ratingAvatar: {
    height: 45,
    width: 45,
    resizeMode: "contain",
  },
  ratingCount: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text_dark,
  },
  ratingDisHdrWrap: {
    flexDirection: "row",
    alignItems: "center",

    paddingVertical: 10,
  },
  ratingDisplayWrap: {
    width: "100%",
    paddingHorizontal: 10,
  },
  ratingFormWrap: {
    marginBottom: 20,
  },
  ratingReviewSectionWrap: {
    width: "100%",
    paddingHorizontal: "3%",
    marginTop: 10,
  },
  ratingsList: {
    paddingVertical: 5,
  },
  ratingNoticeWrap: {
    marginBottom: 10,
  },
  ratingStarWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 1.5,
  },
  ratingWrap: {
    flexDirection: "row",
    paddingVertical: 5,
  },
  reportText: {
    fontSize: 16,
    color: COLORS.text_gray,
    paddingLeft: 5,
  },
  reportWrap: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#d4cfcf",
    borderRadius: 5,
    paddingHorizontal: 20,
  },

  reviewDetail: {
    textAlign: "justify",
    color: COLORS.text_dark,
  },
  reviewTime: {
    color: COLORS.text_gray,
    fontSize: 12,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text_,
  },
  reviewTitleWrap: {
    flex: 1,
    marginBottom: 4,
  },
  sclPrfls: {
    flexDirection: "row",
    alignItems: "center",
  },
  sclPrflTtl: {
    fontSize: 18,
    fontWeight: "bold",
  },
  sclPrflTtlWrap: {
    backgroundColor: COLORS.white,
    // paddingBottom: 10,
  },
  sclPrflsWrap: {
    flex: 1,
  },
  screenSeparator: {
    width: "94%",
    backgroundColor: COLORS.border_light,
    height: 0.7,
  },
  screenSeparatorWrap: {
    width: "100%",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  scrollProgress: {
    padding: 5,
    borderRadius: 3,
    backgroundColor: "rgba(0, 0, 0, .3)",
    fontWeight: "bold",
    color: COLORS.white,
    position: "absolute",
    right: "3%",
    bottom: "3%",
  },
  sellerIcon: {
    height: 16,
    width: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    overflow: "hidden",
  },
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  sellerName: {
    fontWeight: "bold",
    color: COLORS.text_dark,
  },
  sellerWrap: {
    color: COLORS.text_gray,
  },
  showMore: {
    color: COLORS.text_gray,
    paddingRight: 5,
  },
  showMoreWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  showReviewBtnWrap: {
    marginTop: 10,
  },
  similarAddTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  similarAddTitleWrap: {
    paddingHorizontal: "3%",
    paddingBottom: 10,
  },

  similarAddWrap: {},
  slotText: {
    fontWeight: "bold",
    padding: 5,
  },
  slotTimeWrap: {
    flex: 1,
  },
  slotWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  socialProfileComponentWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  soldOutBadge: {
    position: "absolute",
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,

    transform: [{ rotate: "45deg" }],
    zIndex: 5,
  },
  soldOutMessage: {
    color: COLORS.white,
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  storeIcon: {
    // height: 118,
    // width: 18,
    alignItems: "center",
    justifyContent: "center",
    // borderRadius: 8,
    // overflow: "hidden",
  },
  storeIconImage: {
    height: 18,
    width: 18,
  },
  storeName: {
    fontWeight: "bold",
    color: COLORS.dodgerblue,
  },
  timeWrap: {
    marginVertical: 5,
  },
  totalRatingWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  whatsappWrap: {
    backgroundColor: "#4FCE5D",
    // width: "100%",
    // marginHorizontal: "3%",
    paddingHorizontal: "3%",
    paddingVertical: 10,
    // marginTop: 20,
    alignItems: "center",
    borderRadius: 3,
  },
  username: {
    color: COLORS.dodgerblue,
    fontWeight: "bold",
  },
});

export default ListingDetailScreen;
