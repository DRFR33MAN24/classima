import * as React from "react";
import Svg, { Path } from "react-native-svg";

const TargetIcon = (props) => (
  <Svg
    width={26}
    height={26}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M13 21.125a8.125 8.125 0 1 0 0-16.25 8.125 8.125 0 0 0 0 16.25Z"
      stroke={props.fillColor}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13 16.25a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5ZM13 4.334V2.167M4.334 13H2.167M13 21.667v2.167M21.667 13h2.167"
      stroke={props.fillColor}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default TargetIcon;
