import Svg, { Path } from "react-native-svg";

const ArrowIcon = ({ size = 24, color = "#000000" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9.00005 6C9.00005 6 15 10.4189 15 12C15 13.5812 9 18 9 18"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default ArrowIcon;
