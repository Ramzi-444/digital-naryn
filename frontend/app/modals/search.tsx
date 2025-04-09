import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";

const recentItems = [
  { id: "1", icon: "bed-outline", label: "Hotels" },
  { id: "2", icon: "restaurant-outline", label: "Restaurants" },
];

const popularItems = [
  { id: "3", icon: "cafe-outline", label: "Cafes" },
  { id: "4", icon: "restaurant-outline", label: "Restaurants" },
  { id: "5", icon: "storefront-outline", label: "Shops" },
  { id: "6", icon: "build-outline", label: "Repair services" },
  { id: "7", icon: "cut-outline", label: "Beauty salons" },
  { id: "8", icon: "barbell-outline", label: "Gym" },
];

const SearchPage = () => {
  const router = useRouter();

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.item}>
      <Ionicons
        name={item.icon}
        size={30}
        color="#61BFFF"
        style={styles.icon}
      />
      <Text style={styles.label}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />

      {/* Header with back + search bar + question icon */}
      <View style={styles.header}>
        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={26} color="#000" />
        </TouchableOpacity>

        {/* Search bar */}
        <View style={styles.searchBarWrapper}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={25} color="#999" />
            <TextInput
              placeholder="Search"
              placeholderTextColor="#999"
              style={styles.searchInput}
            />
          </View>

          {/* Question mark icon */}
          <TouchableOpacity
            onPress={() => router.push("/contact")}
            style={styles.helpButton}
          >
            <Ionicons name="help" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent */}
      <Text style={styles.sectionTitle}>Recent</Text>
      <View style={styles.cardContainer}>
        <FlatList
          data={recentItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          scrollEnabled={false}
        />
      </View>

      {/* Popular */}
      <Text style={styles.sectionTitle}>Popular</Text>
      <View style={styles.cardContainer}>
        <FlatList
          data={popularItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          scrollEnabled={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 20,
    paddingTop: 20,
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    marginLeft: 8,
    fontSize: 16,
    flex: 1,
    color: "#000",
  },
  helpButton: {
    marginLeft: 10,
    backgroundColor: "#438ee8",
    padding: 6,
    borderRadius: 8,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 20,
    marginTop: 24,
    marginBottom: 20,
    paddingLeft: 20,
  },
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  icon: {
    marginRight: 20,
  },
  label: {
    fontSize: 18,
    color: "#000",
  },
});

export default SearchPage;
