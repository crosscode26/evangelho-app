import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, FlatList, Pressable, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { useAppData } from "@/context/AppDataContext";
import { getItemById } from "@/utils/random";
import { PassageCard } from "@/components/PassageCard";
import { fonts } from "@/theme/typography";
import { RootStackParamList } from "@/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Filter = "all" | "favorites";

export function HistoryScreen() {
  const { colors } = useAppTheme();
  const { history, favorites, clearAllHistory, isFavorite } = useAppData();
  const navigation = useNavigation<Nav>();
  const [filter, setFilter] = useState<Filter>("all");

  const entries = useMemo(() => {
    return history
      .map((entry) => ({ entry, item: getItemById(entry.itemId) }))
      .filter((row): row is { entry: typeof row.entry; item: NonNullable<typeof row.item> } => !!row.item)
      .filter((row) => (filter === "favorites" ? favorites.includes(row.item.id) : true));
  }, [history, favorites, filter]);

  const handleClear = () => {
    Alert.alert(
      "Limpar histórico",
      "Tem certeza de que deseja apagar todo o histórico de leituras? Seus favoritos não serão afetados.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Limpar", style: "destructive", onPress: clearAllHistory },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Histórico</Text>
        {history.length > 0 && (
          <Pressable onPress={handleClear} hitSlop={10}>
            <Feather name="trash-2" size={20} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      <View style={styles.filterRow}>
        {(["all", "favorites"] as Filter[]).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === f ? colors.accent : colors.surfaceAlt,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.filterLabel,
                { color: filter === f ? "#FFFFFF" : colors.textMuted },
              ]}
            >
              {f === "all" ? "Todas" : "Favoritas"}
            </Text>
          </Pressable>
        ))}
      </View>

      {entries.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="book-open" size={32} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {filter === "favorites" ? "Nenhuma passagem favoritada" : "Seu histórico está vazio"}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            {filter === "favorites"
              ? "Toque no coração durante a leitura para guardar uma passagem aqui."
              : "As passagens que você sortear aparecerão aqui para você reler quando quiser."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(row) => row.entry.entryId}
          contentContainerStyle={styles.listContent}
          renderItem={({ item: row }) => (
            <PassageCard
              item={row.item}
              isFavorite={isFavorite(row.item.id)}
              timestampLabel={formatTimestamp(row.entry.drawnAt)}
              onPress={() => navigation.navigate("Reading", { itemId: row.item.id, fromHistory: true })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 24,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  filterLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 17,
    textAlign: "center",
    marginTop: 14,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
});
