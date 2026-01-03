import { Text, View, TextInput, FlatList, Pressable, StyleSheet, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useTasks } from "@/hooks/use-tasks";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function TasksScreen() {
  const colors = useColors();
  const { tasks, loading, addTask, deleteTask, toggleTaskCompletion } = useTasks();
  const [newTaskName, setNewTaskName] = useState('');

  const handleAddTask = async () => {
    if (newTaskName.trim()) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await addTask(newTaskName);
      setNewTaskName('');
    }
  };

  const handleToggleTask = async (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await toggleTaskCompletion(id);
  };

  const handleDeleteTask = async (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await deleteTask(id);
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="text-6xl mb-4">📝</Text>
      <Text className="text-xl font-semibold text-foreground mb-2">暂无任务</Text>
      <Text className="text-muted text-center">
        添加您的第一个任务开始使用番茄时钟
      </Text>
    </View>
  );

  const renderTask = ({ item }: { item: any }) => (
    <View
      style={[
        styles.taskItem,
        { backgroundColor: colors.surface, borderColor: colors.border }
      ]}
    >
      <Pressable
        onPress={() => handleToggleTask(item.id)}
        style={({ pressed }) => [
          styles.taskContent,
          pressed && styles.pressed,
        ]}
      >
        <View
          style={[
            styles.checkbox,
            { borderColor: colors.border },
            item.completed && { backgroundColor: colors.primary, borderColor: colors.primary }
          ]}
        >
          {item.completed && (
            <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
          )}
        </View>
        <View className="flex-1 ml-3">
          <Text
            style={[
              styles.taskName,
              { color: colors.foreground },
              item.completed && styles.taskNameCompleted
            ]}
          >
            {item.name}
          </Text>
          {item.pomodorosCompleted > 0 && (
            <Text className="text-sm text-muted mt-1">
              🍅 {item.pomodorosCompleted} 个番茄钟
            </Text>
          )}
        </View>
      </Pressable>
      <Pressable
        onPress={() => handleDeleteTask(item.id)}
        style={({ pressed }) => [
          styles.deleteButton,
          pressed && styles.pressed,
        ]}
      >
        <IconSymbol name="trash" size={20} color={colors.error} />
      </Pressable>
    </View>
  );

  return (
    <ScreenContainer className="flex-1">
      <View className="p-6 pb-4">
        <Text className="text-2xl font-bold text-foreground mb-4">任务列表</Text>
        
        {/* 添加任务输入框 */}
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.surface, borderColor: colors.border }
          ]}
        >
          <TextInput
            value={newTaskName}
            onChangeText={setNewTaskName}
            placeholder="添加新任务..."
            placeholderTextColor={colors.muted}
            style={[styles.input, { color: colors.foreground }]}
            returnKeyType="done"
            onSubmitEditing={handleAddTask}
          />
          <Pressable
            onPress={handleAddTask}
            style={({ pressed }) => [
              styles.addButton,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
            ]}
            disabled={!newTaskName.trim()}
          >
            <IconSymbol name="plus" size={24} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      {/* 任务列表 */}
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          tasks.length === 0 && styles.emptyList
        ]}
        ListEmptyComponent={renderEmptyState}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  emptyList: {
    flexGrow: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  taskContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskName: {
    fontSize: 16,
    fontWeight: '500',
  },
  taskNameCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  pressed: {
    opacity: 0.7,
  },
});
