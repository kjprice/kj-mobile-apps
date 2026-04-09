import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Linking,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const OTHER_APPS_URL =
  'https://kjprice.github.io/kj-mobile-apps/store-assets/other-apps.json';
const CACHE_KEY = 'other_apps_cache';

interface OtherApp {
  name: string;
  package: string;
  icon: string;
  description: string;
  ios: string;
  android: string;
}

export default function OtherAppsScreen() {
  const [apps, setApps] = useState<OtherApp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApps();
  }, []);

  async function loadApps() {
    try {
      const response = await fetch(OTHER_APPS_URL);
      const data: OtherApp[] = await response.json();
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
      setApps(filterCurrentApp(data));
    } catch {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        setApps(filterCurrentApp(JSON.parse(cached)));
      }
    } finally {
      setLoading(false);
    }
  }

  function filterCurrentApp(data: OtherApp[]): OtherApp[] {
    const currentPackage =
      Constants.expoConfig?.ios?.bundleIdentifier ??
      Constants.expoConfig?.android?.package;
    return data.filter((app) => app.package !== currentPackage);
  }

  function openStore(app: OtherApp) {
    const url = Platform.OS === 'ios' ? app.ios : app.android;
    Linking.openURL(url);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (apps.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No other apps available yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={apps}
      keyExtractor={(item) => item.package}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => openStore(item)}>
          <Image source={{ uri: item.icon }} style={styles.icon} />
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  list: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
});
