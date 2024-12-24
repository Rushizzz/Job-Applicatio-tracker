import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert, useColorScheme } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { storage, JobApplication } from '../lib/storage';

export default function DetailsScreen() {
  const params = useLocalSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [application, setApplication] = useState<JobApplication | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const statuses: JobApplication['status'][] = ['applied', 'reviewing', 'interview', 'offer', 'rejected'];

  useEffect(() => {
    loadApplication();
  }, [params.id]);

  const loadApplication = async () => {
    console.log('Loading application with ID:', params.id);
    try {
      const apps = await storage.getApplications();
      const app = apps.find(a => a.id === params.id);
      console.log('Found application:', app);
      console.log('Application ID:', app?.id);
      console.log('Application company name:', app?.companyName);
      if (app) {
        setApplication(app);
      } else {
        Alert.alert('Error', 'Application not found');
        router.back();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load application');
      router.back();
    }
  };

  const handleStatusUpdate = async () => {
    if (!application) return;
    
    const currentIndex = statuses.indexOf(application.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    try {
      const updatedApplication = {
        ...application,
        status: nextStatus,
        lastUpdated: new Date().toISOString(),
      };

      await storage.updateApplication(updatedApplication);
      setApplication(updatedApplication);
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleSave = async () => {
    if (!application) return;

    try {
      await storage.updateApplication(application);
      setIsEditing(false);
      Alert.alert('Success', 'Application updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update application');
    }
  };

  if (!application) {
    return null;
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
        </Pressable>
        <Pressable onPress={() => setIsEditing(!isEditing)} style={styles.editButton}>
          <MaterialCommunityIcons name={isEditing ? "check" : "pencil"} size={24} color={isDark ? '#FFFFFF' : '#000000'} />
        </Pressable>
      </View>

      <View style={[styles.content, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
        <View style={styles.section}>
          <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#000000' }]}>Company Name</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { color: isDark ? '#FFFFFF' : '#000000', borderColor: isDark ? '#333333' : '#E1E1E1' }]}
              value={application.companyName}
              onChangeText={(text) => setApplication({ ...application, companyName: text })}
            />
          ) : (
            <Text style={[styles.value, { color: isDark ? '#FFFFFF' : '#000000' }]}>{application.companyName}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#000000' }]}>Job Title</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { color: isDark ? '#FFFFFF' : '#000000', borderColor: isDark ? '#333333' : '#E1E1E1' }]}
              value={application.jobTitle}
              onChangeText={(text) => setApplication({ ...application, jobTitle: text })}
            />
          ) : (
            <Text style={[styles.value, { color: isDark ? '#FFFFFF' : '#000000' }]}>{application.jobTitle}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#000000' }]}>Status</Text>
          <Pressable onPress={handleStatusUpdate} style={styles.statusButton}>
            <Text style={[styles.statusText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </Text>
            <Text style={styles.statusHint}>(Tap to change)</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#000000' }]}>Company URL</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { color: isDark ? '#FFFFFF' : '#000000', borderColor: isDark ? '#333333' : '#E1E1E1' }]}
              value={application.companyUrl}
              onChangeText={(text) => setApplication({ ...application, companyUrl: text })}
            />
          ) : (
            <Text style={[styles.value, { color: isDark ? '#FFFFFF' : '#000000' }]}>{application.companyUrl || 'N/A'}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#000000' }]}>Notes</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, styles.textArea, { color: isDark ? '#FFFFFF' : '#000000', borderColor: isDark ? '#333333' : '#E1E1E1' }]}
              value={application.notes}
              onChangeText={(text) => setApplication({ ...application, notes: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          ) : (
            <Text style={[styles.value, { color: isDark ? '#FFFFFF' : '#000000' }]}>{application.notes || 'No notes'}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#000000' }]}>Applied Date</Text>
          <Text style={[styles.value, { color: isDark ? '#FFFFFF' : '#000000' }]}>{application.appliedDate}</Text>
        </View>

        {isEditing && (
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    marginRight: 8,
  },
  statusHint: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
