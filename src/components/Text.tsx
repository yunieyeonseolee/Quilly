import React from 'react';
import { Text as RNText, TextProps } from 'react-native';

export const Text = ({ style, ...props }: TextProps) => {
  return <RNText {...props} style={[{ fontFamily: 'KiwiMaru-Medium' }, style]} />;
};
