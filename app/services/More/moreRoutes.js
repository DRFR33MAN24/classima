import { appName } from "../appName";

const routes = {
  contact_us: "Contact us",
  about_us: appName,
  tnc: "TnC",
  pp: "Privacy Policy",
  // licenses: "Licenses",
};

export function getMoreRoutes() {
  return routes;
}
