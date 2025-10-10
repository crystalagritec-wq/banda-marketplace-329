import React, { useState } from 'react';
import {
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshing?: boolean;
  tintColor?: string;
  backgroundColor?: string;
}

export default function PullToRefresh({
  children,
  onRefresh,
  refreshing = false,
  tintColor = '#2D5016',
  backgroundColor = '#F9FAFB',
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing || isRefreshing}
          onRefresh={handleRefresh}
          tintColor={tintColor}
          colors={[tintColor]}
          progressBackgroundColor={backgroundColor}
          title="Pull to refresh"
          titleColor={tintColor}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});
