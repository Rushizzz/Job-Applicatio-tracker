import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, Alert, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { storage, JobApplication } from '../../lib/storage';
import SuccessAnimation from '../components/SuccessAnimation';

export default function AddApplicationScreen() {
  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    companyUrl: '',
    notes: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#F2F2F7',
      paddingTop: 100,
    },
    contentContainer: {
      padding: 16,
      justifyContent: 'center',
    },
    form: {
      padding: 16,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      backgroundColor: isDark ? '#1C1C1E' : '#ffffff',
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 8,
      color: isDark ? '#FFFFFF' : '#000000',
    },
    input: {
      backgroundColor: isDark ? '#1C1C1E' : '#ffffff',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      borderWidth: 1,
      borderColor: isDark ? '#333333' : '#e1e1e1',
      color: isDark ? '#FFFFFF' : '#000000',
    },
    textArea: {
      minHeight: 100,
      paddingTop: 12,
    },
    submitButton: {
      backgroundColor: '#007AFF',
      borderRadius: 8,
      padding: 16,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
    },
    submitButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
  });

  const handleSubmit = async () => {
    if (!formData.companyName || !formData.jobTitle) {
      Alert.alert('Error', 'Company name and job title are required');
      return;
    }

    try {
      const newApplication: JobApplication = {
        id: Date.now().toString(),
        ...formData,
        status: 'applied',
        appliedDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString(),
      };

      await storage.saveApplication(newApplication);
      // Reset form data after successful save
      setFormData({
        companyName: '',
        jobTitle: '',
        companyUrl: '',
        notes: '',
      });
      setShowSuccess(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to save application');
    }
  };

  const handleAnimationComplete = () => {
    setShowSuccess(false);
    router.replace('/');
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Company Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.companyName}
            onChangeText={(text) => setFormData({ ...formData, companyName: text })}
            placeholder="Enter company name"
            placeholderTextColor={isDark ? '#8E8E93' : '#999999'}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Job Title *</Text>
          <TextInput
            style={styles.input}
            value={formData.jobTitle}
            onChangeText={(text) => setFormData({ ...formData, jobTitle: text })}
            placeholder="Enter job title"
            placeholderTextColor={isDark ? '#8E8E93' : '#999999'}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Company URL or Job Posting Link</Text>
          <TextInput
            style={styles.input}
            value={formData.companyUrl}
            onChangeText={(text) => setFormData({ ...formData, companyUrl: text })}
            placeholder="https://"
            autoCapitalize="none"
            keyboardType="url"
            placeholderTextColor={isDark ? '#8E8E93' : '#999999'}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            placeholder="Add any notes about the application"
            placeholderTextColor={isDark ? '#8E8E93' : '#999999'}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <Pressable style={[styles.submitButton, { opacity: !formData.companyName || !formData.jobTitle ? 0.5 : 1 }]} onPress={handleSubmit} disabled={!formData.companyName || !formData.jobTitle}>
          <MaterialCommunityIcons name="check" size={20} color="#fff" />
          <Text style={styles.submitButtonText}>Save Application</Text>
        </Pressable>
      </View>

      <SuccessAnimation
        visible={showSuccess}
        onComplete={handleAnimationComplete}
      />
    </ScrollView>
  );
}
