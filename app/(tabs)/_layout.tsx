import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../src/styles/colors';

const TAB_BAR_WIDTH = 280;
const TAB_BAR_HEIGHT = 62;

type TabIconProps = {
  focused: boolean;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
};

type TabRoute = {
  label: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
};

type TabsProps = React.ComponentProps<typeof Tabs>;
type TabBarProps = Parameters<NonNullable<TabsProps['tabBar']>>[0];

const tabRoutes: Record<string, TabRoute> = {
  index: { label: 'Home', iconName: 'calendar-clear-outline' },
  dashboard: { label: 'Goals', iconName: 'flag-outline' },
  settings: { label: 'Settings', iconName: 'settings-outline' },
};

const TabIcon = ({ focused, iconName, label }: TabIconProps) => {
  return (
    <View style={[styles.tabPill, focused && styles.tabPillActive]}>
      <Ionicons name={iconName} color={focused ? '#A40F47' : colors.gray600} size={20} />
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

const PillTabBar = ({ state, descriptors, navigation }: TabBarProps) => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const tabBarWidth = Math.min(TAB_BAR_WIDTH, width - 48);
  const bottomOffset = Math.max(insets.bottom + 8, 22);

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View
        style={[
          styles.tabBar,
          {
            width: tabBarWidth,
            height: TAB_BAR_HEIGHT,
            left: (width - tabBarWidth) / 2,
            bottom: bottomOffset,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const routeConfig = tabRoutes[route.name] ?? {
            label: descriptors[route.key]?.options.title ?? route.name,
            iconName: 'ellipse-outline' as const,
          };

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={routeConfig.label}
              onPress={onPress}
              style={styles.tabButton}
            >
              <TabIcon focused={focused} iconName={routeConfig.iconName} label={routeConfig.label} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <PillTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Milestones',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: TAB_BAR_HEIGHT / 2,
    paddingHorizontal: 8,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  tabButton: {
    width: 84,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  tabPill: {
    width: 76,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 1,
  },
  tabPillActive: {
    backgroundColor: '#F7DCE9',
  },
  tabLabel: {
    fontSize: 9,
    color: colors.gray600,
    fontFamily: 'KiwiMaru-Medium',
  },
  tabLabelActive: {
    color: '#A40F47',
  },
});
