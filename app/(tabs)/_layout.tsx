import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <GestureHandlerRootView style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: isDark ? '#0A84FF' : '#007AFF',
          tabBarStyle: {
            backgroundColor: isDark ? '#000000' : '#ffffff',
            borderTopColor: isDark ? '#1C1C1E' : '#E5E5EA',
          },
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            color: isDark ? '#FFFFFF' : '#000000',
          },
          tabBarInactiveTintColor: isDark ? '#8E8E93' : '#999999',
          headerTransparent: true,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Applications',
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="briefcase-outline" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: 'Add New',
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="plus-circle-outline" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Statistics',
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="chart-box-outline" size={24} color={color} />,
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
