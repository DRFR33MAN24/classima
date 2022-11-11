// External Libraries
import { Html5Entities, decode } from "html-entities";
import { __ } from "../language/stringPicker";

const getPrice = (config, priceData, lng) => {
  const price = priceData?.price || 0;
  const max_price = priceData?.max_price || 0;
  const price_type = priceData?.price_type || "fixed";
  const pricing_type = priceData?.pricing_type || "price";

  const symbol = getCurrencySymbol(config);

  if (pricing_type === "disabled") return;
  // if (price_type === "on_call") return helperTexts.callForPrice;
  if (price_type === "on_call") return __("callForPrice", lng || "en");

  if (pricing_type !== "range") {
    let result = "";
    if (config.position === "left") {
      result = symbol + price;
    } else if (config.position === "left_space") {
      result = symbol + " " + price;
    } else if (config.position === "right") {
      result = price + symbol;
    } else {
      result = price + " " + symbol;
    }
    return result;
  } else {
    let result = "";
    if (config.position === "left") {
      result = symbol + price + " - " + symbol + max_price;
    } else if (config.position === "left_space") {
      result = symbol + " " + price + " - " + symbol + " " + max_price;
    } else if (config.position === "right") {
      result = price + symbol + " - " + max_price + symbol;
    } else {
      result = price + " " + symbol + " - " + max_price + " " + symbol;
    }
    return result;
  }
};

const getCurrencySymbol = (config) => {
  // const entities = new Html5Entities();
  // return entities.decode(config.symbol);
  return decode(config.symbol);
};

const decodeString = (string) => {
  // const entities = new Html5Entities();
  // return entities.decode(string);
  return decode(string);
};

export { decodeString, getCurrencySymbol, getPrice };
