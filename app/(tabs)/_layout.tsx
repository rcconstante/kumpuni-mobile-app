import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Home, MessageCircle, Settings, ShieldCheck } from 'lucide-react-native';

function TabItem({
  focused,
  icon: Icon,
  label,
}: {
  focused: boolean;
  icon: typeof Home;
  label: string;
}) {
  return (
    <View style={[styles.tabPill, focused && styles.tabPillActive]}>
      <Icon
        size={20}
        color={focused ? '#FFFFFF' : '#9CA3AF'}
        strokeWidth={focused ? 2.5 : 1.8}
      />
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
        tabBarIconStyle: styles.tabIcon,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabItem focused={focused} icon={Home} label="Home" />,
        }}
      />
      <Tabs.Screen
        name="ai-assistant"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem focused={focused} icon={MessageCircle} label="AI" />
          ),
        }}
      />
      <Tabs.Screen
        name="find-fixer"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem focused={focused} icon={ShieldCheck} label="Fixers" />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem focused={focused} icon={Settings} label="Settings" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    marginHorizontal: 24,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
    paddingBottom: 0,
    paddingTop: 0,
    paddingHorizontal: 8,
  },
  tabItem: {
    height: 64,
    paddingTop: 0,
    paddingBottom: 0,
  },
  tabIcon: {
    width: '100%',
    height: 64,
    flex: 1,
    marginBottom: 0,
  },
  tabPill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 24,
    minWidth: 76,
    gap: 3,
  },
  tabPillActive: {
    backgroundColor: '#6DBE75',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
});
