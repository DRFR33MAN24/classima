import * as React from "react";
import Svg, { Path } from "react-native-svg";

const GearIcon = (props) => (
  <Svg
    width={18}
    height={18}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      opacity={0.34}
      d="M9 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1.5 9.66V8.34c0-.78.638-1.425 1.425-1.425 1.357 0 1.913-.96 1.23-2.137a1.424 1.424 0 0 1 .525-1.943l1.298-.742a1.252 1.252 0 0 1 1.71.45l.082.142c.675 1.178 1.785 1.178 2.468 0l.082-.142a1.252 1.252 0 0 1 1.71-.45l1.298.742c.682.39.915 1.268.524 1.943-.682 1.177-.127 2.137 1.23 2.137.78 0 1.425.638 1.425 1.425v1.32a1.43 1.43 0 0 1-1.425 1.425c-1.357 0-1.912.96-1.23 2.138.39.682.158 1.552-.524 1.942l-1.298.743a1.252 1.252 0 0 1-1.71-.45l-.082-.143c-.675-1.177-1.785-1.177-2.468 0l-.082.143a1.252 1.252 0 0 1-1.71.45l-1.298-.743a1.424 1.424 0 0 1-.525-1.942c.683-1.178.127-2.138-1.23-2.138A1.43 1.43 0 0 1 1.5 9.66Z"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default GearIcon;
