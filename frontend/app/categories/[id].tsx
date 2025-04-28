import React, { useState, useEffect } from "react";
import { Linking, Platform } from "react-native";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import { useSearchParams } from "expo-router/build/hooks";
import { API_URL } from "../../config/api";

const categories = new Array(5).fill({
  title: "Restaurants",
  icon: require("../../assets/icons/restaurant-icon.png"), // your own icon
});

const places = new Array(10).fill({
  name: "Saffran",
  address: "Kulumbaeva 37, Naryn",
  phone: "0701610101",
  logo: require("../../assets/branding/saffran-logo.png"), // your own image
});

const CategoriesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [category, setCategory] = useState<any>(null);
  const [items, setItems] = useState<any>([]);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta?: number;
    longitudeDelta?: number;
  }>({
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    // Fetch category data
    const fetchCategory = async () => {
      try {
        const response = await fetch(`${API_URL}/api/categories/${id}`);
        const data = await response.json();
        setCategory(data);
      } catch (error) {
        console.error("Error fetching category:", error);
      }
    };

    // Fetch items data
    const fetchItems = async () => {
      try {
        const response = await fetch(`${API_URL}/api/items/`);
        const data = await response.json();
        // Filter items by category ID
        const filteredItems = data.filter(
          (item: any) => id !== null && item.category === parseInt(id)
        );
        setItems(filteredItems);

        // Update map location based on the first item's coordinates (if available)
        if (filteredItems.length > 0) {
          setLocation({
            latitude: filteredItems[0].latitude,
            longitude: filteredItems[0].longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchCategory();
    fetchItems();
  }, [id]);

  const openInMaps = () => {
    const { latitude, longitude } = location;
    const label = category?.name || "Location";

    const url =
      Platform.OS === "ios"
        ? `http://maps.apple.com/?ll=${latitude},${longitude}&q=${label}`
        : `geo:${latitude},${longitude}?q=${label}`;

    Linking.openURL(url);
  };

  const renderPlaceCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.placeCard}
      onPress={() => router.push(`/items/${item.id}`)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.avatar_photo }} style={styles.placeLogo} />
      <View style={styles.placeInfo}>
        <Text style={styles.placeName}>{item.name}</Text>
        <Text style={styles.placeAddress}>{item.address}</Text>
        <Text style={styles.placePhone}>{item.phone_numbers}</Text>
      </View>
      <TouchableOpacity
        style={styles.photoPreview}
        onPress={(e) => {
          e.stopPropagation();
          router.push(`/photos/${item.id}`);
        }}
      >
        <Ionicons name="images-outline" size={22} color="#007AFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
        }}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

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
              <Ionicons name="help-circle-outline" size={22} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
      {/* Search */}

      <View style={styles.locationRow}>
        <Text style={styles.locationLabel}>{category?.name || "No Name"}</Text>
        <TouchableOpacity onPress={() => openInMaps()}>
          <Text style={styles.openInMapsText}>
            Open in Maps <Text style={{ fontSize: 16 }}>›</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={{ width: "100%", height: 300 }}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: items[0]?.latitude || 41.4287, // Fallback to default if items is empty
            longitude: items[0]?.longitude || 75.9911,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          scrollEnabled={true}
          zoomEnabled={true}
          pitchEnabled={true}
          rotateEnabled={true}
          showsUserLocation={true}
          showsCompass={true}
          showsScale={true}
          loadingEnabled={true}
          loadingIndicatorColor="#007AFF"
          loadingBackgroundColor="#ffffff"
        >
          {items.map(
            (item: {
              id: React.Key | null | undefined;
              latitude: any;
              longitude: any;
              name: string | undefined;
              address: string | undefined;
            }) => (
              <Marker
                key={item.id}
                coordinate={{
                  latitude: item.latitude,
                  longitude: item.longitude,
                }}
                title={item.name}
                description={item.address}
              />
            )
          )}
        </MapView>
      </View>
      {/* Scrollable Bottom Sheet Style List */}
      <View style={styles.sheetContainer}>
        <FlatList
          data={items}
          renderItem={renderPlaceCard}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          bounces={true}
          overScrollMode="never"
          decelerationRate="normal"
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f7",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 10,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  helpButton: {
    marginLeft: 8,
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  mapWrapper: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    height: 200,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  sheetContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    flex: 1,
    marginTop: -20, // lift the list to slightly overlap map
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  placeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  placeLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
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
  photoPreview: {
    padding: 8,
    marginLeft: 8,
  },
  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 10,
  },

  locationLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },

  openInMapsText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },

  searchtitle: {
    fontSize: 16,
    color: "#7a7a7a",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    justifyContent: "space-between",
    backgroundColor: "black",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CategoriesPage;
