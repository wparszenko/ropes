import { Tabs } from 'expo-router';
import { Cable } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#f8f9fa',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Cables',
          tabBarIcon: ({ size, color }) => (
            <Cable size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}