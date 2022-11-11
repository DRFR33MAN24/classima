import * as React from "react";
import Svg, { Path } from "react-native-svg";

const TnCIcon = (props) => (
  <Svg
    width={18}
    height={17}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M6 1.417v2.125M12 1.417v2.125"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      opacity={0.4}
      d="M5.25 7.792h6M5.25 10.625H9"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M11.25 15.584h-4.5c-3.75 0-4.5-1.46-4.5-4.378v-4.37c0-3.33 1.252-4.222 3.75-4.357h6c2.498.128 3.75 1.028 3.75 4.357v4.498"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="m15.75 11.333-4.5 4.25v-2.125c0-1.417.75-2.125 2.25-2.125h2.25Z"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default TnCIcon;
