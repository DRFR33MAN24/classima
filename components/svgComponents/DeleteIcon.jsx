import * as React from "react";
import Svg, { Path } from "react-native-svg";

const DeleteIcon = (props) => (
  <Svg
    width={16}
    height={16}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M12.883 6.313s-.362 4.49-.572 6.38c-.1.904-.659 1.434-1.572 1.45-1.74.031-3.481.034-5.22-.003-.88-.018-1.428-.554-1.526-1.442-.211-1.908-.571-6.386-.571-6.386M13.805 4.16H2.5M11.626 4.16c-.523 0-.974-.37-1.076-.883l-.162-.81a.853.853 0 0 0-.825-.633H6.741a.853.853 0 0 0-.825.633l-.162.81a1.099 1.099 0 0 1-1.076.883"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default DeleteIcon;
