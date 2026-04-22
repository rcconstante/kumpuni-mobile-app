import { Tabs } from 'expo-router';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Home, MessageCircle, Plus, User, ShieldCheck } from 'lucide-react-native';

function TabIcon({ focused, icon: Icon }: { focused: boolean; icon: typeof Home }) {
  return (
    <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
      <Icon size={22} color={focused ? '#6DBE75' : '#9CA3AF'} strokeWidth={focused ? 2.5 : 1.8} />
    </View>
  );
}

function CenterButton() {
  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.centerButton}>
      <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#6DBE75',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={Home} />,
        }}
      />
      <Tabs.Screen
        name="ai-assistant"
        options={{
          title: 'AI Assistant',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={MessageCircle} />,
        }}
      />
      <Tabs.Screen
        name="post-job"
        options={{
          title: '',
          tabBarButton: () => <CenterButton />,
        }}
      />
      <Tabs.Screen
        name="find-fixer"
        options={{
          title: 'Find Fixer',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={ShieldCheck} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={User} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    height: 72,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 10,
    paddingHorizontal: 8,
    paddingBottom: 0,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperActive: {
    backgroundColor: '#E8F5E9',
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6DBE75',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#6DBE75',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
