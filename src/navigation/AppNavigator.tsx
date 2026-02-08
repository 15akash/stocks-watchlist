import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { SearchScreen } from '../screens/SearchScreen';
import { WatchlistScreen } from '../screens/WatchlistScreen';
import { StockDetailScreen } from '../screens/StockDetailScreen';
import { colors } from '../theme/colors';
import type { RootStackParamList, RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const SearchStackNav = createNativeStackNavigator<RootStackParamList>();
const WatchlistStackNav = createNativeStackNavigator<RootStackParamList>();

function SearchStack() {
  return (
    <SearchStackNav.Navigator>
      <SearchStackNav.Screen
        name="SearchMain"
        component={SearchScreen}
        options={{ title: 'Search Stocks' }}
      />
      <SearchStackNav.Screen
        name="StockDetail"
        component={StockDetailScreen}
        options={({ route }) => ({
          title: route.params?.symbol ?? 'Stock',
        })}
      />
    </SearchStackNav.Navigator>
  );
}

function WatchlistStack() {
  return (
    <WatchlistStackNav.Navigator>
      <WatchlistStackNav.Screen
        name="WatchlistMain"
        component={WatchlistScreen}
        options={{ title: 'Watchlist' }}
      />
      <WatchlistStackNav.Screen
        name="StockDetail"
        component={StockDetailScreen}
        options={({ route }) => ({
          title: route.params?.symbol ?? 'Stock',
        })}
      />
    </WatchlistStackNav.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textPlaceholder,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.white,
        },
      }}
    >
      <Tab.Screen
        name="Search"
        component={SearchStack}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🔍</Text>,
        }}
      />
      <Tab.Screen
        name="Watchlist"
        component={WatchlistStack}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>★</Text>,
        }}
      />
    </Tab.Navigator>
  );
}
