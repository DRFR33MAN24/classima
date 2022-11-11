import * as React from "react";
import Svg, { G, Path } from "react-native-svg";

const SoldIcon = (props) => (
  <Svg
    width={16}
    height={16}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <G
      opacity={0.4}
      stroke={props.fillColor}
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="m6.412 10.666 1 1 2.167-2" />
      <Path
        d="M5.872 1.333 3.46 3.753M10.125 1.333l2.413 2.42"
        strokeMiterlimit={10}
      />
    </G>
    <Path
      d="M1.334 5.234c0-1.234.66-1.334 1.48-1.334h10.373c.82 0 1.48.1 1.48 1.334 0 1.433-.66 1.333-1.48 1.333H2.814c-.82 0-1.48.1-1.48-1.333Z"
      stroke={props.fillColor}
      strokeWidth={1.25}
    />
    <Path
      d="m2.334 6.667.94 5.76c.213 1.293.727 2.24 2.633 2.24h4.02c2.074 0 2.38-.907 2.62-2.16l1.12-5.84"
      stroke={props.fillColor}
      strokeWidth={1.25}
      strokeLinecap="round"
    />
  </Svg>
);

export default SoldIcon;
