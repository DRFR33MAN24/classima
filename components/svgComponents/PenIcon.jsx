import * as React from "react";
import Svg, { Path } from "react-native-svg";

const PenIcon = (props) => (
  <Svg
    width={18}
    height={18}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      opacity={0.4}
      d="M10.275 14.924h4.783"
      stroke={props.fillColor}
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      clipRule="evenodd"
      d="M9.641 3.717c.553-.705 1.446-.668 2.151-.115l1.043.817c.704.553.954 1.41.401 2.116L7.02 14.466a1.11 1.11 0 0 1-.863.427l-2.397.03-.543-2.336c-.077-.328 0-.673.207-.939l6.217-7.931Z"
      stroke={props.fillColor}
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      opacity={0.4}
      d="m8.477 5.202 3.595 2.819"
      stroke={props.fillColor}
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default PenIcon;
