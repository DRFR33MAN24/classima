import * as React from "react";
import Svg, { Path } from "react-native-svg";

const SvgComponent = (props) => (
  <Svg
    width={18}
    height={18}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="m10.899 7.103-3.795 3.795a2.682 2.682 0 1 1 3.795-3.795Z"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13.364 4.328c-1.313-.99-2.813-1.53-4.365-1.53-2.648 0-5.115 1.56-6.833 4.26-.675 1.057-.675 2.835 0 3.892.593.93 1.283 1.733 2.033 2.378"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      opacity={0.4}
      d="M6.316 14.647c.855.36 1.763.555 2.685.555 2.648 0 5.115-1.56 6.833-4.26.675-1.057.675-2.835 0-3.892-.248-.39-.518-.758-.795-1.103"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      opacity={0.4}
      d="M11.63 9.525a2.674 2.674 0 0 1-2.114 2.115"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7.103 10.898 1.5 16.5M16.5 1.5l-5.602 5.603"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default SvgComponent;
