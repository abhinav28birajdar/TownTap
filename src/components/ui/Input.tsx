import { MotiView } from 'moti';
import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS, DIMENSIONS } from '../../config/constants';
import { InputProps } from '../../types';

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  onSubmitEditing,
  returnKeyType = 'done',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const inputRef = useRef<TextInput>(null);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const getBorderColor = () => {
    if (error) return COLORS.error;
    if (isFocused) return COLORS.primary;
    return COLORS.gray[300];
  };

  const getLabelColor = () => {
    if (error) return COLORS.error;
    if (isFocused) return COLORS.primary;
    return COLORS.gray[600];
  };

  return (
    <MotiView
      style={styles.container}
      animate={{
        scale: 1,
      }}
      transition={{
        type: 'timing',
        duration: 150,
      }}
    >
      {label && (
        <Text style={[styles.label, { color: getLabelColor() }]}>
          {label}
        </Text>
      )}
      
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
            borderWidth: isFocused ? 2 : 1,
            minHeight: multiline ? numberOfLines * 24 + 24 : 48,
          },
        ]}
      >
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              textAlignVertical: multiline ? 'top' : 'center',
              height: multiline ? numberOfLines * 24 + 16 : undefined,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray[500]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
        />
        
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={togglePasswordVisibility}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.eyeIcon}>
              {isPasswordVisible ? '👁️' : '🙈'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 200 }}
        >
          <Text style={styles.errorText}>{error}</Text>
        </MotiView>
      )}
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: DIMENSIONS.PADDING.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: DIMENSIONS.PADDING.xs,
    color: COLORS.gray[700],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: DIMENSIONS.BORDER_RADIUS.md,
    paddingHorizontal: DIMENSIONS.PADDING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.gray[900],
    paddingVertical: DIMENSIONS.PADDING.sm,
  },
  eyeButton: {
    padding: DIMENSIONS.PADDING.xs,
    marginLeft: DIMENSIONS.PADDING.xs,
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: DIMENSIONS.PADDING.xs,
    marginLeft: DIMENSIONS.PADDING.xs,
  },
});

export default Input;
