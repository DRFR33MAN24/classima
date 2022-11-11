import * as React from "react";
import Svg, { Path } from "react-native-svg";

const PromoteIcon = (props) => (
  <Svg
    width={16}
    height={16}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M2.66 9.773 1.645 8.76a1.07 1.07 0 0 1 0-1.507L2.659 6.24a1.23 1.23 0 0 0 .314-.754V4.053c0-.587.48-1.067 1.066-1.067h1.434c.24 0 .58-.14.753-.313L7.239 1.66a1.07 1.07 0 0 1 1.507 0l1.013 1.013c.174.173.514.313.754.313h1.433c.587 0 1.067.48 1.067 1.067v1.433c0 .24.14.58.313.754l1.013 1.013a1.07 1.07 0 0 1 0 1.507l-1.013 1.013a1.23 1.23 0 0 0-.313.753v1.434a1.07 1.07 0 0 1-1.067 1.066h-1.433c-.24 0-.58.14-.754.314l-1.013 1.013a1.07 1.07 0 0 1-1.507 0L6.226 13.34a1.23 1.23 0 0 0-.753-.314H4.039a1.07 1.07 0 0 1-1.066-1.066v-1.434c0-.246-.14-.586-.314-.753Z"
      stroke={props.fillColor}
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      opacity={0.4}
      d="m6 10 4-4M9.664 9.666h.006M6.33 6.333h.006"
      stroke={props.fillColor}
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default PromoteIcon;
