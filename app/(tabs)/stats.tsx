import { Text, View, ScrollView, StyleSheet, Dimensions } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useStats } from "@/hooks/use-stats";
import { useColors } from "@/hooks/use-colors";
import { useMemo } from "react";

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 48;
const BAR_WIDTH = (CHART_WIDTH - 60) / 7;

export default function StatsScreen() {
  const colors = useColors();
  const { getTodayStats, getWeekStats, getTotalStats } = useStats();
  
  const todayStats = getTodayStats();
  const weekStats = getWeekStats();
  const totalStats = getTotalStats();

  const maxPomodoros = useMemo(() => {
    const max = Math.max(...weekStats.map(s => s.pomodorosCompleted), 1);
    return Math.ceil(max / 5) * 5;
  }, [weekStats]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[date.getDay()];
  };

  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}小时${mins}分钟`;
    }
    return `${mins}分钟`;
  };

  return (
    <ScreenContainer className="flex-1">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text className="text-2xl font-bold text-foreground mb-6 px-6 pt-6">统计数据</Text>

        {/* 今日统计 */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">今日统计</Text>
          <View className="flex-row gap-3">
            <View
              style={[
                styles.statCard,
                { backgroundColor: colors.surface, borderColor: colors.border }
              ]}
            >
              <Text className="text-3xl font-bold" style={{ color: colors.primary }}>
                {todayStats.pomodorosCompleted}
              </Text>
              <Text className="text-sm text-muted mt-1">番茄钟</Text>
            </View>
            <View
              style={[
                styles.statCard,
                { backgroundColor: colors.surface, borderColor: colors.border }
              ]}
            >
              <Text className="text-3xl font-bold" style={{ color: colors.primary }}>
                {todayStats.focusMinutes}
              </Text>
              <Text className="text-sm text-muted mt-1">专注分钟</Text>
            </View>
            <View
              style={[
                styles.statCard,
                { backgroundColor: colors.surface, borderColor: colors.border }
              ]}
            >
              <Text className="text-3xl font-bold" style={{ color: colors.primary }}>
                {todayStats.tasksCompleted}
              </Text>
              <Text className="text-sm text-muted mt-1">完成任务</Text>
            </View>
          </View>
        </View>

        {/* 本周统计图表 */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">本周统计</Text>
          <View
            style={[
              styles.chartContainer,
              { backgroundColor: colors.surface, borderColor: colors.border }
            ]}
          >
            <View style={styles.chart}>
              {weekStats.map((day, index) => {
                const barHeight = maxPomodoros > 0
                  ? (day.pomodorosCompleted / maxPomodoros) * 120
                  : 0;
                
                return (
                  <View key={day.date} style={styles.barContainer}>
                    <View style={styles.barWrapper}>
                      {barHeight > 0 && (
                        <View
                          style={[
                            styles.bar,
                            {
                              height: barHeight,
                              backgroundColor: colors.primary,
                            }
                          ]}
                        />
                      )}
                    </View>
                    <Text className="text-xs text-muted mt-2">
                      {formatDate(day.date)}
                    </Text>
                    <Text className="text-xs font-semibold text-foreground mt-1">
                      {day.pomodorosCompleted}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* 总计统计 */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">总计</Text>
          <View
            style={[
              styles.totalCard,
              { backgroundColor: colors.surface, borderColor: colors.border }
            ]}
          >
            <View style={styles.totalRow}>
              <Text className="text-base text-muted">累计番茄钟</Text>
              <Text className="text-xl font-bold text-foreground">
                {totalStats.totalPomodoros}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.totalRow}>
              <Text className="text-base text-muted">累计专注时长</Text>
              <Text className="text-xl font-bold text-foreground">
                {formatHours(totalStats.totalMinutes)}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.totalRow}>
              <Text className="text-base text-muted">累计完成任务</Text>
              <Text className="text-xl font-bold text-foreground">
                {totalStats.totalTasks}
              </Text>
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
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  chartContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
  },
  barContainer: {
    alignItems: 'center',
    width: BAR_WIDTH,
  },
  barWrapper: {
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: BAR_WIDTH - 8,
    borderRadius: 4,
  },
  totalCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
});
