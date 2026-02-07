import type { ReactNode } from 'react';

interface ScreenProps {
  children?: ReactNode;
}

export type NativeStackNavigationProp<
  _ParamList extends Record<string, unknown>,
  _RouteName extends string = string,
> = {
  navigate: (screen: string, params?: Record<string, unknown>) => void;
  goBack: () => void;
};

export const createNativeStackNavigator = () => ({
  Navigator: ({ children }: ScreenProps) => children,
  Screen: ({ children }: ScreenProps) => children,
});
