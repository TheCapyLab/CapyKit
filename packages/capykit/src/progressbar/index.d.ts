import { Component } from "@thecapylab/capykitcore";

export interface ProgressBarProps {}
export interface ProgressBarEmits {}
export interface ProgressBarSlots {}
export interface ProgressBarFunctions {}

declare const ProgressBar: Component<
  ProgressBarProps,
  ProgressBarEmits,
  ProgressBarSlots,
  ProgressBarFunctions
>;

declare module "vue" {
  export interface GlobalComponents {
    ProgressBar: typeof ProgressBar;
  }
}

export default ProgressBar;
