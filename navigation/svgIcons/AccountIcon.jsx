import * as React from "react";
import Svg, { Path } from "react-native-svg";

const AccountIcon = (props) => (
  <Svg
    width={22}
    height={22}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      opacity={0.4}
      d="M11.11 11.715a.88.88 0 0 0-.22 0 2.997 2.997 0 0 1-2.897-2.998A3.003 3.003 0 0 1 11 5.711a3.003 3.003 0 0 1 .11 6.004Z"
      stroke={props.fillColor}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      opacity={0.34}
      d="M17.178 17.765A9.106 9.106 0 0 1 11 20.167a9.106 9.106 0 0 1-6.178-2.402c.091-.862.641-1.705 1.622-2.365 2.512-1.668 6.619-1.668 9.112 0 .98.66 1.53 1.503 1.622 2.365Z"
      stroke={props.fillColor}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M11 20.167a9.167 9.167 0 1 0 0-18.333 9.167 9.167 0 0 0 0 18.333Z"
      stroke={props.fillColor}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default AccountIcon;
