import React, { useState, useEffect } from "react";
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
  ActivityIndicator,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type IconName = keyof typeof Ionicons.glyphMap;

const SearchModal = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const popularItems = [
    { name: "Cafes", icon: "cafe" },
    { name: "Restaurants", icon: "restaurant" },
    { name: "Shops", icon: "cart" },
    { name: "Repair services", icon: "construct" },
    { name: "Beauty salons", icon: "cut" },
    { name: "Gym", icon: "fitness" },
  ];

  useEffect(() => {
    // Fetch data from APIs
    const fetchData = async () => {
      setLoading(true);
      try {
        const [itemsResponse, categoriesResponse] = await Promise.all([
          fetch("http://157.230.109.162:8000/api/items/"),
          fetch("http://157.230.109.162:8000/api/categories/"),
        ]);
        const itemsData = await itemsResponse.json();
        const categoriesData = await categoriesResponse.json();
        setItems(itemsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Filter results based on search query
    if (searchQuery.trim() === "") {
      setFilteredResults([]);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filteredItems = items.filter((item: any) =>
        item.name.toLowerCase().includes(lowercasedQuery)
      );
      const filteredCategories = categories.filter((category: any) =>
        category.name.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredResults([...filteredItems, ...filteredCategories]);
    }
  }, [searchQuery, items, categories]);

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredResults([]);
  };

  const handleItemClick = (item: any) => {
    // Add the clicked item to recent searches
    setRecentSearches((prev) => {
      const updatedRecents = [
        item.name,
        ...prev.filter((i) => i !== item.name),
      ];
      return updatedRecents.slice(0, 5);
    });

    if (item.category) {
      router.push(`/app/item/${item.id}`);
    } else {
      router.push(`/app/categories/${item.id}`);
    }
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
              onChangeText={setSearchQuery}
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
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : searchQuery.trim() === "" ? (
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
              bounces={true}
            >
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                {recentSearches.map((item, index) => (
                  <Pressable
                    key={`${item}-${index}`} // Ensure a unique key
                    style={({ pressed }) => [
                      styles.item,
                      pressed && styles.itemPressed,
                      { opacity: pressed ? 0.7 : 1 },
                    ]}
                    android_ripple={{
                      color: "#E8E8E8",
                      borderless: false,
                    }}
                    onPress={() => handleItemClick(item)}
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
                    key={`${item.name}-${index}`} // Ensure a unique key
                    style={({ pressed }) => [
                      styles.item,
                      pressed && styles.itemPressed,
                      { opacity: pressed ? 0.7 : 1 },
                    ]}
                    android_ripple={{
                      color: "#E8E8E8",
                      borderless: false,
                    }}
                    onPress={() => handleItemClick(item)}
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
          ) : filteredResults.length > 0 ? (
            filteredResults.map((result: any, index: number) => (
              <View style={{ marginHorizontal: 16 }} key={`${result.name}-${index}`}>
                <Pressable
                  style={({ pressed }) => [
                    styles.item,
                    pressed && styles.itemPressed,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                  android_ripple={{
                    color: "#E8E8E8",
                    borderless: false,
                  }}
                  onPress={() => handleItemClick(result)}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name="search"
                      size={22}
                      color="#007AFF"
                      style={styles.itemIcon}
                    />
                  </View>
                  <Text style={styles.itemText}>{result.name}</Text>
                </Pressable>
              </View>
            ))
          ) : (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>No results found</Text>
            </View>
          )}
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
    flexWrap: "wrap", // Ensures text wraps to the next line
    maxWidth: "85%", // Prevents text from exceeding the screen width
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
  lastSection: {
    borderBottomWidth: 0,
    paddingBottom: 24,
  },
});

export default SearchModal;
