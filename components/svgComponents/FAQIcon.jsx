import * as React from "react";
import Svg, { Path } from "react-native-svg";

const FAQIcon = (props) => (
  <Svg
    width={18}
    height={18}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M12.75 13.822h-3l-3.338 2.22a.748.748 0 0 1-1.162-.622v-1.598c-2.25 0-3.75-1.5-3.75-3.75v-4.5c0-2.25 1.5-3.75 3.75-3.75h7.5c2.25 0 3.75 1.5 3.75 3.75v4.5c0 2.25-1.5 3.75-3.75 3.75Z"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      opacity={0.4}
      d="M9 8.52v-.158c0-.51.316-.78.63-.997.308-.21.616-.48.616-.975 0-.69-.555-1.245-1.245-1.245-.69 0-1.245.555-1.245 1.245M8.997 10.313h.006"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default FAQIcon;
