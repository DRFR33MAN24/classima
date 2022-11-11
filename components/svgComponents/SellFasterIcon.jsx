import * as React from "react";
import Svg, { G, Path } from "react-native-svg";

const SellFasterIcon = (props) => (
  <Svg
    width={18}
    height={18}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <G
      opacity={0.4}
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M6.375 10.688A2.638 2.638 0 0 0 9 13.312a2.638 2.638 0 0 0 2.625-2.624M6.608 1.5 3.893 4.223M11.393 1.5l2.715 2.723" />
    </G>
    <Path
      d="M1.5 5.888c0-1.388.743-1.5 1.665-1.5h11.67c.922 0 1.665.112 1.665 1.5 0 1.612-.742 1.5-1.665 1.5H3.165c-.922 0-1.665.112-1.665-1.5Z"
      stroke={props.fillColor}
      strokeWidth={1.5}
    />
    <Path
      d="m2.625 7.5 1.058 6.48c.24 1.455.817 2.52 2.962 2.52h4.523c2.332 0 2.677-1.02 2.947-2.43l1.26-6.57"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

export default SellFasterIcon;
