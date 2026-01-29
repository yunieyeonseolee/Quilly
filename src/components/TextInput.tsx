import React, { forwardRef } from 'react';
import { TextInput as RNTextInput, TextInputProps } from 'react-native';

export const TextInput = forwardRef<RNTextInput, TextInputProps>(
  ({ style, ...props }, ref) => {
    return (
      <RNTextInput
        {...props}
        ref={ref}
        style={[{ fontFamily: 'KiwiMaru-Medium' }, style]}
      />
    );
  }
);

TextInput.displayName = 'TextInput';
