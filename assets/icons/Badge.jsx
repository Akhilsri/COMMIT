import Svg, { Path } from "react-native-svg";

const BadgeIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    {/* Shield shape */}
    <Path
      d="M12 2L4 5V11C4 16.5 7.8 20.7 12 22C16.2 20.7 20 16.5 20 11V5L12 2Z"
      stroke="black"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Star in the center */}
    <Path
      d="M12 8.5L13.09 10.84L15.66 11.16L13.87 12.87L14.33 15.4L12 14.2L9.67 15.4L10.13 12.87L8.34 11.16L10.91 10.84L12 8.5Z"
      stroke="black"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default BadgeIcon;
