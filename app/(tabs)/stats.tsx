import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, useColorScheme } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { storage } from '../../lib/storage';
import { useFocusEffect } from '@react-navigation/native';

const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) => (
  <View style={[styles.baseCard, { borderLeftColor: color, backgroundColor: useColorScheme() === 'dark' ? '#333333' : '#FFFFFF' }]}>
    <MaterialCommunityIcons name={icon as any} size={24} color={color} />
    <View style={styles.cardContent}>
      <Text style={[styles.baseCardTitle, { color: useColorScheme() === 'dark' ? '#FFFFFF' : '#666666' }]}>{title}</Text>
      <Text style={[styles.baseCardValue, { color: useColorScheme() === 'dark' ? '#FFFFFF' : '#000000' }]}>{value}</Text>
    </View>
  </View>
);

export default function StatsScreen() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    interviews: 0,
    rejected: 0,
    responseRate: '0%',
  });
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const loadStats = async () => {
    try {
      const applications = await storage.getApplications();
      const total = applications.length;
      const active = applications.filter(app => app.status !== 'rejected').length;
      const interviews = applications.filter(app => app.status === 'interview').length;
      const rejected = applications.filter(app => app.status === 'rejected').length;
      const responseRate = total > 0 ? Math.round((interviews / total) * 100) + '%' : '0%';

      setStats({
        total,
        active,
        interviews,
        rejected,
        responseRate,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadStats().finally(() => setRefreshing(false));
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        style={{ backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5' }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={[styles.baseTitle, { color: isDark ? '#FFFFFF' : '#000' }]}>Application Statistics</Text>
        
        <StatCard 
          title="Total Applications"
          value={stats.total}
          icon="briefcase-outline"
          color={isDark ? '#4A90E2' : '#2196F3'}
        />
        
        <StatCard
          title="Active Applications"
          value={stats.active}
          icon="clock-outline"
          color={isDark ? '#32D74B' : '#34C759'}
        />
        
        <StatCard
          title="Interviews Scheduled"
          value={stats.interviews}
          icon="calendar-check"
          color={isDark ? '#FF9F0A' : '#FF9500'}
        />
        
        <StatCard
          title="Response Rate"
          value={stats.responseRate}
          icon="chart-line"
          color={isDark ? '#FF453A' : '#5856D6'}
        />
        
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon="close-circle-outline"
          color={isDark ? '#FF453A' : '#FF3B30'}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 100,
    flex: 1,
    justifyContent: 'center',
  },
  baseTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  baseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    marginLeft: 12,
  },
  baseCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  baseCardValue: {
    fontSize: 20,
    fontWeight: '600',
  },
});