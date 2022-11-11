import * as React from "react";
import Svg, { Path } from "react-native-svg";

const ContactUsIcon = (props) => (
  <Svg
    width={19}
    height={18}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      opacity={0.4}
      d="m14.583 12.72.287 2.327a.733.733 0 0 1-1.104.721l-3.085-1.833c-.339 0-.67-.022-.994-.066a3.58 3.58 0 0 0 .869-2.327c0-2.09-1.812-3.784-4.05-3.784-.854 0-1.642.243-2.297.67a4.668 4.668 0 0 1-.03-.56c0-3.35 2.909-6.066 6.502-6.066s6.5 2.717 6.5 6.066c0 1.988-1.023 3.748-2.598 4.852Z"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10.552 11.542a3.58 3.58 0 0 1-.869 2.327c-.729.883-1.885 1.45-3.18 1.45L4.58 16.46c-.324.199-.736-.073-.692-.449l.184-1.45c-.987-.685-1.62-1.782-1.62-3.019 0-1.296.692-2.437 1.752-3.114a4.184 4.184 0 0 1 2.297-.67c2.239 0 4.05 1.693 4.05 3.784Z"
      stroke={props.fillColor}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default ContactUsIcon;
