import { Component } from "@thecapylab/capykitcore";

export interface ButtonProps {}
export interface ButtonEmits {}
export interface ButtonSlots {}
export interface ButtonFunctions {}

declare const Button: Component<
  ButtonProps,
  ButtonEmits,
  ButtonSlots,
  ButtonFunctions
>;

declare module "vue" {
  export interface GlobalComponents {
    Button: typeof Button;
  }
}

export default Button;
