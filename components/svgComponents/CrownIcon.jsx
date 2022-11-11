import * as React from "react";
import Svg, { Path } from "react-native-svg";

const CrownIcon = (props) => (
  <Svg
    width={16}
    height={16}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M11.133 12.653H4.867a.786.786 0 0 1-.687-.486l-2.76-7.72C1.027 3.34 1.487 3 2.433 3.68l2.6 1.86c.434.3.927.147 1.114-.34L7.32 2.073c.373-1 .993-1 1.367 0L9.86 5.2c.187.487.68.64 1.107.34l2.44-1.74c1.04-.747 1.54-.367 1.113.84l-2.693 7.54c-.1.253-.413.473-.694.473Z"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      opacity={0.34}
      d="M4.333 14.667h7.333M6.333 9.333h3.333"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default CrownIcon;
