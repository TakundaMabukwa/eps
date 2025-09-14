import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomePage() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Technician Dashboard</Text>
      <Text style={styles.subtext}>Welcome back! Here's a quick snapshot of your day.</Text>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}
          onPress={() => {
            router.navigate("/(Technician)/checklist")
          }}
        >
          <Ionicons name="bag-sharp" size={28} color="#fff" />
          <Text style={styles.actionText}>Job Accepted</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#10b981' }]}
          onPress={() => {
            router.navigate("/(Technician)/jobs")
          }}
        >
          <Ionicons name="clipboard" size={28} color="#fff" />
          <Text style={styles.actionText}>Job Assigned</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#ef4444' }]}>
          <Ionicons name="settings" size={28} color="#fff" />
          <Text style={styles.actionText}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity</Text>
        <View style={styles.activityItem}>
          <Ionicons name="checkmark-done-circle" size={20} color="#22c55e" style={styles.icon} />
          <Text style={styles.activityText}>Make Sure Complete job</Text>
        </View>
        <View style={styles.activityItem}>
          <Ionicons name="briefcase" size={20} color="#3b82f6" style={styles.icon} />
          <Text style={styles.activityText}>Assigned to job tab</Text>
        </View>
        <View style={styles.activityItem}>
          <Ionicons name="person-circle" size={20} color="#f59e0b" style={styles.icon} />
          <Text style={styles.activityText}>Updated profile</Text>
        </View>
      </View>

      {/* <View>
        <LocationScreen />
      </View> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#f1f5f9',
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 6,
  },
  subtext: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  icon: {
    marginRight: 12,
  },
  activityText: {
    fontSize: 16,
    color: '#475569',
  },
});
