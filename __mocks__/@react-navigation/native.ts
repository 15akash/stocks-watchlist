import React from 'react';

interface NavigationContainerProps {
  children: React.ReactNode;
}

const mockNavigate = jest.fn();

export const useNavigation = () => ({
  navigate: mockNavigate,
  goBack: jest.fn(),
});

export const useRoute = () => ({
  params: {},
});

export type RouteProp<_ParamList, _RouteName extends string> = {
  params: Record<string, string>;
};

export const NavigationContainer = ({ children }: NavigationContainerProps) =>
  React.createElement('NavigationContainer', null, children);
