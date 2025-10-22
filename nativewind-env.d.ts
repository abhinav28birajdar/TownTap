import { NativeWindStyleSheet } from "nativewind";

NativeWindStyleSheet.setOutput({
  default: "native",
});

export default {
  expo: {
    web: {
      bundler: "metro",
    },
  },
};