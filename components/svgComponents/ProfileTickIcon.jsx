import * as React from "react";
import Svg, { Path } from "react-native-svg";

const ProfileTickIcon = (props) => (
  <Svg
    width={18}
    height={18}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      opacity={0.4}
      d="m10.828 14.287 1.14 1.14 2.28-2.28M9.122 8.152a1.363 1.363 0 0 0-.248 0A3.315 3.315 0 0 1 5.672 4.83 3.32 3.32 0 0 1 8.994 1.5a3.332 3.332 0 0 1 3.33 3.33 3.32 3.32 0 0 1-3.202 3.322Z"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8.994 16.357c-1.365 0-2.723-.345-3.758-1.035-1.815-1.215-1.815-3.195 0-4.402 2.063-1.38 5.445-1.38 7.508 0"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default ProfileTickIcon;
