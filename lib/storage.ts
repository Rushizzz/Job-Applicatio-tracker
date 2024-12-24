import AsyncStorage from '@react-native-async-storage/async-storage';

export interface JobApplication {
  id: string;
  companyName: string;
  jobTitle: string;
  status: 'applied' | 'reviewing' | 'interview' | 'offer' | 'rejected';
  appliedDate: string;
  companyUrl?: string;
  notes?: string;
  lastUpdated: string;
}

const STORAGE_KEY = 'job_applications';

export const storage = {
  async saveApplication(application: JobApplication): Promise<void> {
    try {
      const existingData = await this.getApplications();
      const newData = [...existingData, application];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (error) {
      console.error('Error saving application:', error);
      throw error;
    }
  },

  async getApplications(): Promise<JobApplication[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting applications:', error);
      return [];
    }
  },

  async updateApplication(application: JobApplication): Promise<void> {
    try {
      const existingData = await this.getApplications();
      const updatedData = existingData.map(item => 
        item.id === application.id ? application : item
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error updating application:', error);
      throw error;
    }
  },

  async deleteApplication(id: string): Promise<void> {
    try {
      const existingData = await this.getApplications();
      const updatedData = existingData.filter(item => item.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error deleting application:', error);
      throw error;
    }
  },

  async getApplicationStats() {
    try {
      const applications = await this.getApplications();
      const stats = {
        total: applications.length,
        byStatus: {
          applied: 0,
          reviewing: 0,
          interview: 0,
          offer: 0,
          rejected: 0,
        },
      };

      applications.forEach(app => {
        stats.byStatus[app.status]++;
      });

      return stats;
    } catch (error) {
      console.error('Error getting application stats:', error);
      return {
        total: 0,
        byStatus: {
          applied: 0,
          reviewing: 0,
          interview: 0,
          offer: 0,
          rejected: 0,
        },
      };
    }
  },
};
