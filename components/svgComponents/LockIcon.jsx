import * as React from "react";
import Svg, { Path } from "react-native-svg";

const LockIcon = (props) => (
  <Svg
    width={18}
    height={18}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      opacity={0.4}
      d="M4.5 7.5V6c0-2.482.75-4.5 4.5-4.5s4.5 2.018 4.5 4.5v1.5"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12.75 16.5h-7.5c-3 0-3.75-.75-3.75-3.75v-1.5c0-3 .75-3.75 3.75-3.75h7.5c3 0 3.75.75 3.75 3.75v1.5c0 3-.75 3.75-3.75 3.75Z"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      opacity={0.4}
      d="M11.996 12h.007M8.996 12h.007M5.996 12h.007"
      stroke={props.fillColor}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default LockIcon;
