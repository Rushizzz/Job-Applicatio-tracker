import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Alert, Animated, useColorScheme, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { storage, JobApplication } from '../../lib/storage';
import { Swipeable } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { router } from 'expo-router';

type ApplicationStatus = 'applied' | 'reviewing' | 'interview' | 'offer' | 'rejected';

type RootStackParamList = {
  Details: { id: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Details'>;

const StatusBadge = ({ status }: { status: JobApplication['status'] }) => {
  const statusColors = {
    applied: '#007AFF',
    reviewing: '#FF9500',
    interview: '#34C759',
    offer: '#5856D6',
    rejected: '#FF3B30',
  };

  return (
    <View style={[styles.badge, { backgroundColor: statusColors[status] }]} >
      <Text style={styles.badgeText}>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
    </View>
  );
};

export default function ApplicationsScreen() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation<NavigationProp>();

  const loadApplications = async () => {
    try {
      const apps = await storage.getApplications();
      setApplications(apps.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()));
    } catch (error) {
      Alert.alert('Error', 'Failed to load applications');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadApplications();
    }, [])
  );

  useEffect(() => {
    loadApplications();
  }, []);

  const handleStatusUpdate = async (application: JobApplication) => {
    const statuses: JobApplication['status'][] = ['applied', 'reviewing', 'interview', 'offer', 'rejected'];
    const currentIndex = statuses.indexOf(application.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    try {
      const updatedApplication = {
        ...application,
        status: nextStatus,
        lastUpdated: new Date().toISOString(),
      };
      await storage.updateApplication(updatedApplication);
      await loadApplications();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleDelete = async (application: JobApplication) => {
    try {
      await storage.deleteApplication(application.id);
      await loadApplications();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete application');
    }
  };

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, application: JobApplication) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
    });

    return (
      <Animated.View
        style={[
          styles.deleteAction,
          {
            transform: [{ translateX: trans }],
            backgroundColor: isDark ? '#1C1C1E' : '#ffffff',
          }
        ]}
      >
        <Pressable
          onPress={() => handleDelete(application)}
          style={[styles.deleteButton, styles.card, { backgroundColor: '#FF453A' }]}
        >
          <MaterialCommunityIcons name="delete-outline" size={24} color="#ffffff" />
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </Animated.View>
    );
  };

  const ApplicationItem = ({ item }: { item: JobApplication }) => {
    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
      const opacity = dragX.interpolate({
        inputRange: [-100, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      });

      return (
        <Animated.View style={{ opacity }}>
          <Pressable
            onPress={() => handleDelete(item)}
            style={styles.deleteButton}
          >
            <MaterialCommunityIcons name="delete" size={24} color="#fff" />
          </Pressable>
        </Animated.View>
      );
    };

    return (
      <Swipeable renderRightActions={renderRightActions}>
        <Pressable
          style={[styles.applicationItem, { backgroundColor: isDark ? '#1C1C1E' : '#ffffff' }]}
          onPress={() => router.push(`/details?id=${item.id}`)}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.companyName, { color: isDark ? '#FFFFFF' : '#000000' }]}>{item.companyName}</Text>
            <Pressable onPress={() => handleStatusUpdate(item)}>
              <StatusBadge status={item.status} />
            </Pressable>
          </View>
          <Text style={[styles.jobTitle, { color: isDark ? '#EBEBF5' : '#666666' }]}>{item.jobTitle}</Text>
          <View style={styles.cardFooter}>
            <Text style={[styles.date, { color: isDark ? '#8E8E93' : '#666666' }]}>Applied: {item.appliedDate}</Text>
            {item.companyUrl && (
              <Pressable onPress={() => item.companyUrl ? Linking.openURL(item.companyUrl) : null} style={styles.link}>
                <MaterialCommunityIcons name="link-variant" size={16} color={isDark ? '#0A84FF' : '#007AFF'} />
                <Text style={[styles.linkText, { color: isDark ? '#0A84FF' : '#007AFF' }]}>View Job</Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Swipeable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#f2f2f7' }]} >
      <FlatList
        data={applications}
        renderItem={({ item }) => <ApplicationItem item={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
      {applications.length === 0 && (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="briefcase-outline" size={48} color="#666" />
          <Text style={styles.emptyStateText}>No applications yet</Text>
          <Text style={styles.emptyStateSubtext}>Add your first job application using the + tab</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100, // Add space for transparent header
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
  },
  jobTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    marginLeft: 4,
    color: '#007AFF',
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '100%',
    marginVertical: 8,
    marginHorizontal: 16,
  },
  deleteButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    width: 80,
  },
  deleteText: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 4,
  },
  applicationItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
