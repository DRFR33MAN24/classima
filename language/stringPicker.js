const en = require("./en.json");
const ar = require("./ar.json");
const defaultLng = "en";

// Do not edit/remove/add anything below this line!!!

import { getOptionsExtraData } from "../app/services/AccountOptions/optionsExtraData";
import { getSellFastImages } from "../app/services/HowToSellFast/images";
import { getMoreRoutes } from "../app/services/More/moreRoutes";
const routes = getMoreRoutes();
const images = getSellFastImages();
const optionsExtraData = getOptionsExtraData();

//  General String
const __ = (keyString, selectedLanguage) => {
  // let data = `${defaultLng}.${keyString}`;
  let data = `${selectedLanguage}.${keyString}`;
  return `${eval(data)}`;
};

// Account Options
const getAccountOptionsData = (selectedLanguage) => {
  let resData = eval(selectedLanguage)["options_user"];
  resData.map((_dat) => {
    _dat["assetUri"] = optionsExtraData[_dat.id].assetUri;
    _dat["icon"] = optionsExtraData[_dat.id].icon;
    _dat["routeName"] = optionsExtraData[_dat.id].routeName;
  });

  return resData;
};
// Drawer Options
const getDrawerOptionsData = (selectedLanguage) => {
  let resData = eval(selectedLanguage)["options_drawer"];
  resData.map((_dat) => {
    _dat["routeName"] = optionsExtraData[_dat.id].routeName;
  });

  return resData;
};

// App Description
const getAppDescription = (selectedLanguage) => {
  let data = `${selectedLanguage}.${"appDescription"}`;
  return eval(data);
};

// FAQ
const getFAQ = (selectedLanguage) => {
  let data = `${selectedLanguage}.${"frequentlyAskedQuestions"}`;
  return eval(data);
};

// Sell Faster
const getSellFastTips = (selectedLanguage) => {
  const data = `${selectedLanguage}.${"sellFastTips"}`;
  let resData = eval(data);
  eval(data).map((_obj) => {
    _obj["uri"] = images[_obj.id];
  });
  return resData;
};

// More Options
const getMoreOptionsData = (selectedLanguage) => {
  let resData = eval(selectedLanguage)["moreOptions"];
  resData.map((_data) => {
    _data["routeName"] = routes[_data.id];
  });
  return resData;
};

// Privacy Policy
const getPrivacyPolicy = (selectedLanguage) => {
  let data = `${selectedLanguage}.${"privacyPolicy"}`;
  return eval(data);
};

// TnC
const getTnC = (selectedLanguage) => {
  let data = `${selectedLanguage}.${"termsAndConditions"}`;
  return eval(data);
};
// week
const getWeek = (selectedLanguage) => {
  let data = `${selectedLanguage}.${"weekDayNames"}`;
  return eval(data);
};

const getRelativeTimeConfig = (selectedLanguage) => {
  let data = `${selectedLanguage}.${"relativeTime"}`;
  return eval(data);
};

export {
  __,
  getAccountOptionsData,
  getAppDescription,
  getFAQ,
  getSellFastTips,
  getMoreOptionsData,
  getPrivacyPolicy,
  getTnC,
  getWeek,
  getRelativeTimeConfig,
  getDrawerOptionsData,
};
