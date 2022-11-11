import * as React from "react";
import Svg, { Path } from "react-native-svg";

const SearchIcon = (props) => (
  <Svg
    width={22}
    height={22}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M10.542 19.25a8.708 8.708 0 1 0 0-17.417 8.708 8.708 0 0 0 0 17.417Z"
      stroke={props.fillColor}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      opacity={0.4}
      d="m20.167 20.167-1.834-1.834"
      stroke={props.fillColor}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default SearchIcon;
