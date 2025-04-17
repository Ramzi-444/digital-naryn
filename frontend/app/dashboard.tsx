import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";
import * as Location from "expo-location"; // Import expo-location
import { getDistance } from "geolib"; // Import geolib for distance calculation
import AsyncStorage from "@react-native-async-storage/async-storage";

const Dashboard = () => {
  interface Category {
    id: number;
    name: string;
    icon?: string;
  }

  interface Item {
    id: number;
    name: string;
    address: string;
    phone: number;
    avatar_photo?: string;
    latitude: number; // Add latitude
    longitude: number; // Add longitude
  }

  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://157.230.109.162:8000/api/categories/"
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchItems = async () => {
      try {
        const response = await axios.get(
          "http://157.230.109.162:8000/api/items/"
        );
        setItems(response.data);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          alert("Location permission is required to show nearby places.");
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } catch (error) {
        console.error("Error getting location:", error);
        alert(
          "Failed to retrieve location. Please enable location services and try again."
        );
      }
    };

    const filterNearbyItems = () => {
      if (!location) return;
      const nearby = items.filter((item) => {
        const distance = getDistance(
          { latitude: location.latitude, longitude: location.longitude },
          { latitude: item.latitude, longitude: item.longitude }
        );
        return distance <= 200; // 200 meters
      });
      setFilteredItems(nearby);
    };

    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchItems(), getLocation()]);
      setLoading(false); // Move this here
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (location) {
      const nearby = items.filter((item) => {
        const distance = getDistance(
          { latitude: location.latitude, longitude: location.longitude },
          { latitude: item.latitude, longitude: item.longitude }
        );
        return distance <= 200; // 200 meters
      });
      setFilteredItems(nearby);
    }
  }, [location, items]);

  const renderCategoryCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/categories/${item.id}`)}
      activeOpacity={0.7}
      style={styles.categoryTouchable}
    >
      <View style={styles.card}>
        {item.icon ? (
          <Image source={{ uri: item.icon }} style={styles.iconImage} />
        ) : null}
        <Text style={styles.cardText}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderPlaceCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.placeCard}
      onPress={() => router.push(`/items/${item.id}`)} // Navigate to /items/{id}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation(); // Prevent triggering the parent onPress
          router.push({
            pathname: `/photos/${item.id}`,
            params: { photos: item.photos || [] }, // Pass photos to the gallery
          });
        }}
        activeOpacity={0.8}
      >
        {item.avatar_photo ? (
          <Image source={{ uri: item.avatar_photo }} style={styles.placeLogo} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="images-outline" size={32} color="#ccc" />
            <Text style={styles.placeholderText}>View Photos</Text>
          </View>
        )}
      </TouchableOpacity>
      <View style={styles.placeInfo}>
        <Text style={styles.placeName}>{item.name}</Text>
        <Text style={styles.placeAddress}>{item.address}</Text>
        <Text style={styles.placePhone}>{item.phone_numbers}</Text>
      </View>
      <TouchableOpacity
        style={styles.photoPreview}
        onPress={(e) => {
          e.stopPropagation(); // Prevent triggering the parent onPress
          router.push(`/photos/${item.id}`);
        }}
        activeOpacity={0.6}
      >
        <Ionicons name="images-outline" size={22} color="#007AFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Static Content */}
      <View>
        {/* Search */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 16,
          }}
        >
          <TouchableOpacity
            onPress={() => router.push("/modals/search")}
            style={{ flex: 1 }}
          >
            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={20}
                color="#7a7a7a"
                style={styles.icon}
              />
              <View style={styles.input}>
                <Text style={styles.searchtitle}>Search</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/contact")}
                style={styles.helpButton}
              >
                <Ionicons
                  name="help-circle-outline"
                  size={22}
                  color="#007AFF"
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        {/* Categories Header */}
        <View style={styles.categoriesHeader}>
          <Text style={styles.categoriesTitle}>Categories</Text>
          <TouchableOpacity onPress={() => setShowAll(!showAll)}>
            <Text style={styles.showAll}>
              {showAll ? "Show less" : "Show all"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : showAll ? (
          <FlatList
            data={categories}
            renderItem={renderCategoryCard}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={styles.gridContainer}
            columnWrapperStyle={styles.columnWrapper}
          />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => router.push(`/categories/${item.id}`)}
              >
                <View style={styles.card}>
                  {item.icon ? (
                    <Image
                      source={{ uri: item.icon }}
                      style={styles.iconImage}
                    />
                  ) : null}
                  <Text style={styles.cardText}>{item.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Header above scrolling list */}
        <Text style={styles.placesTitle}>Places nearby</Text>
      </View>

      {/* Scrollable Places List */}

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : filteredItems.length > 0 ? (
        <FlatList
          data={filteredItems}
          renderItem={renderPlaceCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          style={styles.placesList}
          bounces={true}
          overScrollMode="never"
          decelerationRate="normal"
        />
      ) : (
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          No places found within 200 meters.
        </Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  placesList: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f7",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  categoriesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  showAll: {
    fontSize: 14,
    color: "#007AFF",
  },
  card: {
    width: 113,
    height: 100,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 12,
  },
  iconImage: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 12,
    color: "#333",
  },
  gridContainer: {
    paddingTop: 10,
    paddingBottom: 20,
    width: "100%",
  },
  placesTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 10,
  },
  placeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  placeLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    resizeMode: "cover", // Ensure the image scales properly
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontWeight: "600",
    fontSize: 16,
  },
  placeAddress: {
    fontSize: 14,
    color: "#777",
  },
  placePhone: {
    fontSize: 14,
    color: "#444",
  },
  helpButton: {
    marginLeft: 8,
    padding: 4,
  },
  photoPreview: {
    padding: 8,
    marginLeft: 8,
  },
  searchtitle: {
    fontSize: 16,
    color: "#7a7a7a",
  },
  placeDescription: {
    fontSize: 12,
    color: "#555",
    marginTop: 4,
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    marginRight: 12,
  },
  placeholderText: {
    fontSize: 10,
    color: "#aaa",
    marginTop: 4,
  },
  categoryTouchable: {
    flex: 1,
    maxWidth: "33.3%",
    paddingHorizontal: 6,
  },
  columnWrapper: {
    justifyContent: "space-between",
    width: "100%",
  },
});

export default Dashboard;
