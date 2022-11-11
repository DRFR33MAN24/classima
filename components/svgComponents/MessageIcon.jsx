import * as React from "react";
import Svg, { Path } from "react-native-svg";

const MessageIcon = (props) => (
  <Svg
    width={18}
    height={18}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M12.75 15.375h-7.5c-2.25 0-3.75-1.125-3.75-3.75v-5.25c0-2.625 1.5-3.75 3.75-3.75h7.5c2.25 0 3.75 1.125 3.75 3.75v5.25c0 2.625-1.5 3.75-3.75 3.75Z"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      opacity={0.4}
      d="m12.75 6.75-2.348 1.875c-.772.615-2.04.615-2.812 0L5.25 6.75"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default MessageIcon;
