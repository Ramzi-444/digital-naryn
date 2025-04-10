import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  StatusBar,
  Pressable,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";

// Define icon types to fix TypeScript errors
type IconName = keyof typeof Ionicons.glyphMap;

const SearchModal = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const recentSearches = ["Hotels", "Restaurants"];
  const popularItems = [
    { name: "Cafes", icon: "cafe" },
    { name: "Restaurants", icon: "restaurant" },
    { name: "Shops", icon: "cart" },
    { name: "Repair services", icon: "construct" },
    { name: "Beauty salons", icon: "cut" },
    { name: "Gym", icon: "fitness" },
  ];

  const clearSearch = () => {
    setSearchQuery("");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1A1A1A"
        translucent={true}
      />
      <Stack.Screen
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
          headerShown: false,
          contentStyle: {
            backgroundColor: "#1A1A1A",
          },
        }}
      />
      <View style={[styles.container, { paddingTop: StatusBar.currentHeight }]}>
        <View style={styles.searchHeader}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search"
              size={22}
              color="#007AFF"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus
              placeholderTextColor="#A3A3A3"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons
                  name="close-circle-outline"
                  size={22}
                  color="#007AFF"
                />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.cancelButton}
            activeOpacity={0.6}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            {recentSearches.map((item, index) => (
              <Pressable
                key={index}
                style={({ pressed }) => [
                  styles.item,
                  pressed && styles.itemPressed,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                android_ripple={{
                  color: "#E8E8E8",
                  borderless: false,
                }}
                onPress={() => handleSearch(item)}
              >
                <View style={styles.iconContainer}>
                  <Ionicons
                    name="timer-outline"
                    size={22}
                    color="#007AFF"
                    style={styles.itemIcon}
                  />
                </View>
                <Text style={styles.itemText}>{item}</Text>
              </Pressable>
            ))}
          </View>

          <View style={[styles.section, styles.lastSection]}>
            <Text style={styles.sectionTitle}>Popular</Text>
            {popularItems.map((item, index) => (
              <Pressable
                key={index}
                style={({ pressed }) => [
                  styles.item,
                  pressed && styles.itemPressed,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                android_ripple={{
                  color: "#E8E8E8",
                  borderless: false,
                }}
                onPress={() => handleSearch(item.name)}
              >
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={item.icon as IconName}
                    size={22}
                    color="#007AFF"
                    style={styles.itemIcon}
                  />
                </View>
                <Text style={styles.itemText}>{item.name}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 12 : 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    marginRight: 12,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    height: "100%",
  },
  searchIcon: {
    marginRight: 8,
    color: "#007AFF",
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  content: {
    flex: 1,
    backgroundColor: "#fff",
  },
  section: {
    paddingTop: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  lastSection: {
    borderBottomWidth: 0,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: -8,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
  itemPressed: {
    backgroundColor: Platform.select({
      ios: "#F6F6F6",
      android: "transparent",
    }),
  },
  itemIcon: {
    marginRight: 0,
  },
  itemText: {
    fontSize: 17,
    color: "#000",
    letterSpacing: -0.4,
    fontWeight: "400",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
});

export default SearchModal;
