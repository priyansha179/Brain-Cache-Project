// @ts-nocheck
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#4A90E2', headerShown: false }}>
      <Tabs.Screen 
        name="index" 
        options={{ title: 'Tasks', tabBarIcon: ({ color }) => <Ionicons name="checkbox-outline" size={24} color={color} /> }} 
      />
      <Tabs.Screen 
        name="notes" 
        options={{ title: 'Notes', tabBarIcon: ({ color }) => <Ionicons name="document-text-outline" size={24} color={color} /> }} 
      />
      <Tabs.Screen 
        name="calendar" 
        options={{ title: 'Calendar', tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={24} color={color} /> }} 
      />
      <Tabs.Screen 
        name="chat" 
        options={{ title: 'AI Chat', tabBarIcon: ({ color }) => <Ionicons name="chatbubbles-outline" size={24} color={color} /> }} 
      />
    </Tabs>
  );
}