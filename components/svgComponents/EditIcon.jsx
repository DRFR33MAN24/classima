import * as React from "react";
import Svg, { Path } from "react-native-svg";

const EditIcon = (props) => (
  <Svg
    width={20}
    height={20}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="m11.05 3-6.842 7.242c-.259.275-.509.816-.559 1.191l-.308 2.7c-.108.975.592 1.642 1.558 1.475l2.684-.458c.375-.067.9-.342 1.158-.625l6.842-7.242c1.183-1.25 1.716-2.675-.125-4.416-1.834-1.725-3.225-1.117-4.409.133Z"
      stroke={props.fillColor}
      strokeWidth={1.8}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9.908 4.208A5.105 5.105 0 0 0 14.45 8.5M2.5 18.333h15"
      stroke={props.fillColor}
      strokeWidth={1.8}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default EditIcon;
