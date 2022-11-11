import * as React from "react";
import Svg, { Path } from "react-native-svg";

const AboutUsIcon = (props) => (
  <Svg
    width={20}
    height={20}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M11.191 12.5H3.666c-1.516 0-2.483-1.625-1.75-2.958l1.942-3.533L5.675 2.7c.758-1.375 2.741-1.375 3.5 0L11 6.01l.875 1.591 1.066 1.942c.734 1.333-.233 2.958-1.75 2.958Z"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      opacity={0.4}
      d="M18.333 12.917a5.416 5.416 0 1 1-10.833 0c0-.142.008-.275.017-.417h3.675c1.516 0 2.483-1.625 1.75-2.958L11.875 7.6a5.417 5.417 0 0 1 6.458 5.317Z"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default AboutUsIcon;
