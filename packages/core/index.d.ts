import { AllowedComponentProps, VNodeProps } from "@vue/runtime-core";

declare type VueProps = AllowedComponentProps & VNodeProps;

export type Component<Props = {}, Emits = {}, Slots = {}, Functions = {}> = {
  new (): {
    $props: Props & VueProps;
    $emits: Emits;
    $slots: Slots;
  } & Functions;
};
