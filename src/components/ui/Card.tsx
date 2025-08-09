import { MotiView } from 'moti';
import React from 'react';
import { ViewStyle } from 'react-native';
import { COLORS, DIMENSIONS } from '../../config/constants';
import { CardProps } from '../../types';

const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  shadow = true,
  borderRadius = 'md',
  backgroundColor = COLORS.white,
}) => {
  const getPaddingValue = () => {
    switch (padding) {
      case 'sm':
        return DIMENSIONS.PADDING.sm;
      case 'md':
        return DIMENSIONS.PADDING.md;
      case 'lg':
        return DIMENSIONS.PADDING.lg;
      default:
        return DIMENSIONS.PADDING.md;
    }
  };

  const getBorderRadiusValue = () => {
    switch (borderRadius) {
      case 'sm':
        return DIMENSIONS.BORDER_RADIUS.sm;
      case 'md':
        return DIMENSIONS.BORDER_RADIUS.md;
      case 'lg':
        return DIMENSIONS.BORDER_RADIUS.lg;
      default:
        return DIMENSIONS.BORDER_RADIUS.md;
    }
  };

  const cardStyle: ViewStyle = {
    backgroundColor,
    borderRadius: getBorderRadiusValue(),
    padding: getPaddingValue(),
    ...(shadow && {
      shadowColor: COLORS.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    }),
  };

  return (
    <MotiView
      style={cardStyle}
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        opacity: { type: 'timing', duration: 300 },
        scale: { type: 'timing', duration: 300 }
      }}
    >
      {children}
    </MotiView>
  );
};

export default Card;
