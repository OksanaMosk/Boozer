declare module "react-ios-wheel-picker" {
  import { ComponentType } from "react";

  interface WheelPickerProps {
    data: Array<number | string>;
    selectedValue: number | string;
    onChange: (value: number | string) => void;
    height?: number;
    itemHeight?: number;
    className?: string;
  }

  const WheelPicker: ComponentType<WheelPickerProps>;
  export default WheelPicker;
}