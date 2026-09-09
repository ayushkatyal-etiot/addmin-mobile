import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Home, LifeBuoy, Plus, Settings, Users, type LucideIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const NAV_BG = '#000B1A';
const NAV_ACTIVE = '#68E78E';
const NAV_INACTIVE_ICON = 'rgba(255,255,255,0.72)';
const NAV_INACTIVE_LABEL = 'rgba(255,255,255,0.55)';

const ICONS: Record<string, LucideIcon> = {
  Home,
  Users,
  Support: LifeBuoy,
  Settings,
};

// Renders as the tabBar for the root Tab.Navigator so it stays mounted once
// and never participates in a screen's push/pop transition (see BottomNav
// usage note: previously each screen rendered its own instance, so the whole
// bar slid with the screen).
export default function BottomNav({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeName = state.routes[state.index].name;

  const renderTab = (route: (typeof state.routes)[number]) => {
    const Icon = ICONS[route.name] ?? Home;
    const active = route.name === activeName;
    return (
      <View key={route.key} style={styles.tab}>
        <Pressable style={styles.tabContent} onPress={() => navigation.navigate(route.name)}>
          <Icon size={22} color={active ? NAV_ACTIVE : NAV_INACTIVE_ICON} strokeWidth={1.75} />
          <Text style={[styles.tabLabel, { color: active ? NAV_ACTIVE : NAV_INACTIVE_LABEL }]}>
            {route.name}
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={[styles.bar, { bottom: 16 + insets.bottom }]}>
      {state.routes.slice(0, 2).map(renderTab)}
      <View style={styles.tab} />
      {state.routes.slice(2).map(renderTab)}
      <View style={styles.fabRing}>
        <Pressable style={styles.fab}>
          <Plus size={26} color={NAV_BG} strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 72,
    backgroundColor: NAV_BG,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000B1A',
    shadowOpacity: 0.28,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: 'Urbanist_600SemiBold',
  },
  fabRing: {
    position: 'absolute',
    left: '50%',
    top: -22,
    marginLeft: -36,
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: NAV_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 999,
    backgroundColor: NAV_ACTIVE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: NAV_ACTIVE,
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
});
