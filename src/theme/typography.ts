import { TextStyle } from 'react-native';
import { colors } from './colors';

export const typography = {
  // Headings
  headingLarge: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  } as TextStyle,

  headingMedium: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  } as TextStyle,

  headingSmall: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  } as TextStyle,

  // Price display (detail screen hero)
  priceHero: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
  } as TextStyle,

  // Body text
  bodyMedium: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  } as TextStyle,

  body: {
    fontSize: 15,
    color: colors.textPrimary,
  } as TextStyle,

  bodySmall: {
    fontSize: 14,
    color: colors.textSecondary,
  } as TextStyle,

  // Captions & labels
  caption: {
    fontSize: 13,
    color: colors.textMuted,
  } as TextStyle,

  label: {
    fontSize: 12,
    color: colors.textMuted,
  } as TextStyle,

  badge: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  } as TextStyle,

  badgeSmall: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white,
  } as TextStyle,

  // Subtitle / placeholder
  subtitle: {
    fontSize: 14,
    color: colors.textPlaceholder,
  } as TextStyle,

  // Button text
  button: {
    fontSize: 15,
    fontWeight: '600',
  } as TextStyle,

  buttonSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  } as TextStyle,

  // Stale indicator
  stale: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.warning,
    textTransform: 'uppercase',
  } as TextStyle,
} as const;
