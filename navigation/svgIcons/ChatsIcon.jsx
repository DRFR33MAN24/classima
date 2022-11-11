import * as React from "react";
import Svg, { Path } from "react-native-svg";

const ChatsIcon = (props) => (
  <Svg
    width={22}
    height={22}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M7.792 17.417h-.459c-3.666 0-5.5-.917-5.5-5.5V7.333c0-3.666 1.834-5.5 5.5-5.5h7.334c3.666 0 5.5 1.834 5.5 5.5v4.584c0 3.666-1.834 5.5-5.5 5.5h-.459a.929.929 0 0 0-.733.366L12.1 19.617c-.605.806-1.595.806-2.2 0l-1.375-1.834c-.147-.201-.486-.366-.733-.366Z"
      stroke={props.fillColor}
      strokeWidth={2}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      opacity={0.4}
      d="M14.663 10.083h.009M10.996 10.083h.008M7.328 10.083h.009"
      stroke={props.fillColor}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default ChatsIcon;
