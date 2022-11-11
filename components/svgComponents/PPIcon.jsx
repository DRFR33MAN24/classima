import * as React from "react";
import Svg, { Path } from "react-native-svg";

const PPIcon = (props) => (
  <Svg
    width={18}
    height={18}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="m7.867 1.672-3.743 1.41c-.862.323-1.567 1.343-1.567 2.258v5.572c0 .885.585 2.048 1.297 2.58L7.08 15.9c1.058.795 2.798.795 3.855 0l3.225-2.408c.713-.532 1.298-1.695 1.298-2.58V5.34c0-.923-.705-1.943-1.568-2.265l-3.742-1.403c-.638-.232-1.658-.232-2.28 0Z"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      opacity={0.4}
      d="m6.787 8.902 1.208 1.208 3.225-3.225"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default PPIcon;
