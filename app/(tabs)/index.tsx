import { Text, View, Pressable, StyleSheet, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { CircularProgress } from "@/components/circular-progress";
import { useTimer } from "@/hooks/use-timer";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { useKeepAwake } from "expo-keep-awake";

export default function HomeScreen() {
  const colors = useColors();
  const {
    mode,
    timeLeft,
    isRunning,
    completedPomodoros,
    currentTask,
    start,
    pause,
    reset,
  } = useTimer();

  // 保持屏幕常亮
  useKeepAwake();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'work':
        return '工作时间';
      case 'shortBreak':
        return '短休息';
      case 'longBreak':
        return '长休息';
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case 'work':
        return colors.primary;
      case 'shortBreak':
        return '#FFA726';
      case 'longBreak':
        return '#4CAF50';
    }
  };

  const getTotalSeconds = () => {
    switch (mode) {
      case 'work':
        return 25 * 60;
      case 'shortBreak':
        return 5 * 60;
      case 'longBreak':
        return 15 * 60;
    }
  };

  const progress = 1 - (timeLeft / getTotalSeconds());

  const handleStartPause = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (isRunning) {
      pause();
    } else {
      start();
    }
  };

  const handleReset = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    reset();
  };

  return (
    <ScreenContainer className="items-center justify-center p-6">
      <View className="flex-1 items-center justify-center w-full">
        {/* 当前任务 */}
        <View className="mb-8">
          <Text className="text-base text-muted text-center">
            {currentTask || '未选择任务'}
          </Text>
        </View>

        {/* 模式标签 */}
        <View className="mb-4">
          <Text className="text-lg font-semibold text-foreground">
            {getModeLabel()}
          </Text>
        </View>

        {/* 圆形计时器 */}
        <View className="relative items-center justify-center mb-12">
          <CircularProgress
            size={280}
            strokeWidth={12}
            progress={progress}
            color={getModeColor()}
            backgroundColor={colors.border}
          />
          <View style={styles.timerTextContainer}>
            <Text style={[styles.timerText, { color: colors.foreground }]}>
              {formatTime(timeLeft)}
            </Text>
          </View>
        </View>

        {/* 控制按钮 */}
        <View className="items-center gap-4 w-full max-w-xs">
          <Pressable
            onPress={handleStartPause}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: getModeColor() },
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {isRunning ? '暂停' : '开始'}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleReset}
            style={({ pressed }) => [
              styles.secondaryButton,
              { borderColor: colors.border },
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.muted }]}>
              重置
            </Text>
          </Pressable>
        </View>

        {/* 完成数量 */}
        <View className="mt-12">
          <Text className="text-sm text-muted text-center">
            今日完成 {completedPomodoros} 个番茄钟
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  timerTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 56,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
});
