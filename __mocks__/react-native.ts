import React from 'react';

interface ComponentProps {
  children?: React.ReactNode;
  [key: string]: unknown;
}

function View(props: ComponentProps) {
  return React.createElement('View', props, props.children);
}

function Text(props: ComponentProps) {
  return React.createElement('Text', props, props.children);
}

function TextInput(props: ComponentProps) {
  return React.createElement('TextInput', props);
}

function TouchableOpacity(props: ComponentProps) {
  return React.createElement('TouchableOpacity', props, props.children);
}

function ScrollView(props: ComponentProps) {
  return React.createElement('ScrollView', props, props.children);
}

function ActivityIndicator(props: ComponentProps) {
  return React.createElement('ActivityIndicator', props);
}

function RefreshControl(props: ComponentProps) {
  return React.createElement('RefreshControl', props);
}

interface FlatListProps<T> extends ComponentProps {
  data?: T[];
  renderItem?: (info: { item: T; index: number }) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string;
  refreshControl?: React.ReactNode;
  contentContainerStyle?: Record<string, unknown>;
  keyboardShouldPersistTaps?: string;
}

function FlatList<T>(props: FlatListProps<T>) {
  const { data, renderItem, keyExtractor, children: _children, ...rest } = props;
  const items = (data ?? []).map((item, index) =>
    React.createElement(
      React.Fragment,
      { key: keyExtractor ? keyExtractor(item, index) : String(index) },
      renderItem ? renderItem({ item, index }) : null,
    ),
  );
  return React.createElement('FlatList', rest, ...items);
}

const StyleSheet = {
  create: <T extends Record<string, unknown>>(styles: T): T => styles,
};

const Alert = {
  alert: jest.fn(),
};

const Platform = {
  OS: 'ios' as const,
  select: <T>(obj: { ios: T }): T => obj.ios,
};

export {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  StyleSheet,
  Alert,
  Platform,
};
