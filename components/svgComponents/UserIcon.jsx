import * as React from "react";
import Svg, { Path } from "react-native-svg";

const UserIcon = (props) => (
  <Svg
    width={18}
    height={18}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M9 9a3.75 3.75 0 1 0 0-7.5A3.75 3.75 0 0 0 9 9Z"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      opacity={0.4}
      d="M15.444 16.5c0-2.902-2.888-5.25-6.443-5.25-3.555 0-6.442 2.348-6.442 5.25"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default UserIcon;
