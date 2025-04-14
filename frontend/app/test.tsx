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
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";

const SearchModal = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<
    { name: string; id: number; category?: string; type: string }[]
  >([]);
  const [categories, setCategories] = useState<
    { name: string; id: number; type: string }[]
  >([]);
  const [filteredResults, setFilteredResults] = useState<
    { name: string; id: number; category?: number; type: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<
    { id: number; name: string; type: string }[]
  >([]);
  const [clickCounts, setClickCounts] = useState<{
    [key: string]: { count: number; name: string };
  }>({});

  // Load recent searches from AsyncStorage
  useEffect(() => {
    const loadRecentSearches = async () => {
      try {
        const storedSearches = await AsyncStorage.getItem("recentSearches");
        if (storedSearches) {
          setRecentSearches(JSON.parse(storedSearches));
        }
      } catch (error) {
        console.error("Error loading recent searches:", error);
      }
    };

    loadRecentSearches();
  }, []);

  // Load clickCounts from AsyncStorage
  useEffect(() => {
    const loadClickCounts = async () => {
      try {
        const storedClickCounts = await AsyncStorage.getItem("clickCounts");
        if (storedClickCounts) {
          console.log(
            "Loaded clickCounts from AsyncStorage:",
            storedClickCounts
          ); // Debug log
          setClickCounts(JSON.parse(storedClickCounts));
        }
      } catch (error) {
        console.error("Error loading click counts:", error);
      }
    };

    loadClickCounts();
  }, []);

  useEffect(() => {
    const testAsyncStorage = async () => {
      try {
        await AsyncStorage.setItem("testKey", "testValue");
        const value = await AsyncStorage.getItem("testKey");
        console.log("AsyncStorage test value:", value); // Should log "testValue"
      } catch (error) {
        console.error("AsyncStorage test failed:", error);
      }
    };

    testAsyncStorage();
  }, []);

  // Save clickCounts to AsyncStorage whenever it changes
  useEffect(() => {
    const saveClickCounts = async () => {
      try {
        console.log("Saving clickCounts to AsyncStorage:", clickCounts); // Debug log
        await AsyncStorage.setItem("clickCounts", JSON.stringify(clickCounts));
      } catch (error) {
        console.error("Error saving click counts:", error);
      }
    };

    saveClickCounts();
  }, [clickCounts]);

  // Fetch items and categories from the API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [itemsResponse, categoriesResponse] = await Promise.all([
          fetch("http://157.230.109.162:8000/api/items/"),
          fetch("http://157.230.109.162:8000/api/categories/"),
        ]);
        const itemsData = await itemsResponse.json();
        const categoriesData = await categoriesResponse.json();

        const itemsWithType = itemsData.map((item: any) => ({
          ...item,
          type: "item",
        }));
        const categoriesWithType = categoriesData.map((category: any) => ({
          ...category,
          type: "category",
        }));

        setItems(itemsWithType);
        setCategories(categoriesWithType);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter results based on the search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredResults([]);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(lowercasedQuery)
      );
      const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredResults([...filteredItems, ...filteredCategories]);
    }
  }, [searchQuery, items, categories]);

  // Handle item click
  const handleItemClick = async (item: any) => {
    try {
      // Ensure item has all required properties
      const completeItem = {
        id: item.id,
        name: item.name,
        type:
          item.type ||
          (items.find((i) => i.id === item.id) ? "item" : "category"),
      };

      if (!completeItem.id) {
        console.error("Invalid item or item ID is undefined:", completeItem);
        return;
      }

      // Update recent searches
      const updatedRecents = [
        completeItem,
        ...recentSearches.filter((i) => i.id !== completeItem.id),
      ].slice(0, 5);

      setRecentSearches(updatedRecents);
      await AsyncStorage.setItem(
        "recentSearches",
        JSON.stringify(updatedRecents)
      );

      // Update clickCounts
      setClickCounts((prevCounts) => {
        const updatedCounts = {
          ...prevCounts,
          [completeItem.id]: {
            count: (prevCounts[completeItem.id]?.count || 0) + 1,
            name: completeItem.name,
            type: completeItem.type,
          },
        };
        console.log("Updated clickCounts:", updatedCounts);
        return updatedCounts;
      });

      // Navigate based on item type
      if (completeItem.type === "category") {
        router.replace(`/categories/${completeItem.id}`);
      } else {
        router.replace(`/items/${completeItem.id}`);
      }
    } catch (error) {
      console.error("Error handling item click:", error);
    }
  };

  // Get popular items with at least 3 clicks
  const sortedPopularItems = Object.entries(clickCounts)
    .filter(([id, item]) => id !== "undefined" && item && item.count >= 3)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([id, item]) => ({
      id: parseInt(id),
      name: item.name,
      type: item.type || "item",
      count: item.count,
    }));

  useEffect(() => {
    console.log("Current clickCounts:", clickCounts);
  }, [clickCounts]);

  const clearClickCounts = async () => {
    await AsyncStorage.removeItem("clickCounts");
    setClickCounts({});
  };

  console.log("Popular items:", sortedPopularItems);

  const checkStorage = async () => {
    const counts = await AsyncStorage.getItem("clickCounts");
    const recents = await AsyncStorage.getItem("recentSearches");
    console.log("Storage - clickCounts:", counts);
    console.log("Storage - recentSearches:", recents);
  };
  // Call this when needed for debugging

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1A1A1A"
        translucent={true}
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
              <TouchableOpacity onPress={() => setSearchQuery("")}>
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
            <>
              {recentSearches.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                  <TouchableOpacity onPress={clearClickCounts}>
                    <Text>Clear Click Counts</Text>
                  </TouchableOpacity>
                  {recentSearches.map((item, index) => (
                    <Pressable
                      key={`${item.name}-${index}`}
                      style={({ pressed }) => [
                        styles.item,
                        pressed && styles.itemPressed,
                      ]}
                      onPress={() =>
                        handleItemClick({ ...item, type: item.type || "item" })
                      }
                    >
                      <View style={styles.iconContainer}>
                        <Ionicons
                          name="timer-outline"
                          size={22}
                          color="#007AFF"
                        />
                      </View>
                      <Text style={styles.itemText}>{item.name}</Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {sortedPopularItems.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Popular</Text>
                  {sortedPopularItems.map((item, index) => (
                    <Pressable
                      key={`${item.id}-${index}`}
                      style={({ pressed }) => [
                        styles.item,
                        pressed && styles.itemPressed,
                      ]}
                      onPress={() => handleItemClick(item)}
                    >
                      <View style={styles.iconContainer}>
                        <Ionicons name="star" size={22} color="#007AFF" />
                      </View>
                      <Text style={styles.itemText}>{item.name}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </>
          ) : filteredResults.length > 0 ? (
            filteredResults.map((result, index) => (
              <Pressable
                key={`${result.name}-${index}`}
                style={({ pressed }) => [
                  styles.item,
                  pressed && styles.itemPressed,
                ]}
                onPress={() => handleItemClick(result)}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="search" size={22} color="#007AFF" />
                </View>
                <Text style={styles.itemText}>{result.name}</Text>
              </Pressable>
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
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
  itemPressed: {
    backgroundColor: "#F6F6F6",
  },
  itemText: {
    fontSize: 17,
    color: "#000",
    fontWeight: "400",
    flexWrap: "wrap",
    maxWidth: "85%",
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
