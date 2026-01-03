import { Text, View, ScrollView, StyleSheet, Switch, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useTimer } from "@/hooks/use-timer";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";

const NOTIFICATION_KEY = '@pomodoro_notifications_enabled';

export default function SettingsScreen() {
  const colors = useColors();
  const { settings, updateSettings } = useTimer();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    loadNotificationSetting();
  }, []);

  const loadNotificationSetting = async () => {
    try {
      const saved = await AsyncStorage.getItem(NOTIFICATION_KEY);
      if (saved !== null) {
        setNotificationsEnabled(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load notification setting:', error);
    }
  };

  const saveNotificationSetting = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(NOTIFICATION_KEY, JSON.stringify(value));
      setNotificationsEnabled(value);
    } catch (error) {
      console.error('Failed to save notification setting:', error);
    }
  };

  const handleWorkDurationChange = async (value: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await updateSettings({ workDuration: Math.round(value) });
  };

  const handleShortBreakChange = async (value: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await updateSettings({ shortBreakDuration: Math.round(value) });
  };

  const handleLongBreakChange = async (value: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await updateSettings({ longBreakDuration: Math.round(value) });
  };

  const handleNotificationToggle = async (value: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await saveNotificationSetting(value);
  };

  return (
    <ScreenContainer className="flex-1">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text className="text-2xl font-bold text-foreground mb-6 px-6 pt-6">设置</Text>

        {/* 时间设置 */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">时间设置</Text>
          
          <View
            style={[
              styles.settingCard,
              { backgroundColor: colors.surface, borderColor: colors.border }
            ]}
          >
            <View style={styles.settingItem}>
              <View style={styles.settingHeader}>
                <Text className="text-base text-foreground">工作时长</Text>
                <Text className="text-lg font-bold" style={{ color: colors.primary }}>
                  {settings.workDuration} 分钟
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={15}
                maximumValue={60}
                step={5}
                value={settings.workDuration}
                onSlidingComplete={handleWorkDurationChange}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.settingItem}>
              <View style={styles.settingHeader}>
                <Text className="text-base text-foreground">短休息时长</Text>
                <Text className="text-lg font-bold" style={{ color: colors.primary }}>
                  {settings.shortBreakDuration} 分钟
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={3}
                maximumValue={15}
                step={1}
                value={settings.shortBreakDuration}
                onSlidingComplete={handleShortBreakChange}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.settingItem}>
              <View style={styles.settingHeader}>
                <Text className="text-base text-foreground">长休息时长</Text>
                <Text className="text-lg font-bold" style={{ color: colors.primary }}>
                  {settings.longBreakDuration} 分钟
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={10}
                maximumValue={30}
                step={5}
                value={settings.longBreakDuration}
                onSlidingComplete={handleLongBreakChange}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
              />
            </View>
          </View>
        </View>

        {/* 通知设置 */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">通知设置</Text>
          
          <View
            style={[
              styles.settingCard,
              { backgroundColor: colors.surface, borderColor: colors.border }
            ]}
          >
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text className="text-base text-foreground">启用通知</Text>
                <Text className="text-sm text-muted mt-1">
                  番茄钟完成时接收通知提醒
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* 关于 */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">关于</Text>
          
          <View
            style={[
              styles.settingCard,
              { backgroundColor: colors.surface, borderColor: colors.border }
            ]}
          >
            <View style={styles.aboutRow}>
              <Text className="text-base text-muted">版本</Text>
              <Text className="text-base text-foreground">1.0.0</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.aboutRow}>
              <Text className="text-base text-muted">应用名称</Text>
              <Text className="text-base text-foreground">番茄专注</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
  },
  settingCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  settingItem: {
    paddingVertical: 8,
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    flex: 1,
    marginRight: 16,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
});
