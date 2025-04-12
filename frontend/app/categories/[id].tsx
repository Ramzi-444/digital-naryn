import React, { useState } from "react";
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
import MapView from "react-native-maps";

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

  const location = {
    latitude: 41.4287, // Replace with actual coordinates
    longitude: 75.9911, // Replace with actual coordinates
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const openInMaps = () => {
    const lat = 41.4287;
    const lng = 75.9911;
    const label = "Saffran, Naryn";

    const url =
      Platform.OS === "ios"
        ? `http://maps.apple.com/?ll=${lat},${lng}&q=${label}`
        : `geo:${lat},${lng}?q=${label}`;

    Linking.openURL(url);
  };

  const renderPlaceCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.placeCard}
      onPress={() => router.push("/items/1")}
      activeOpacity={0.7}
    >
      <Image source={item.logo} style={styles.placeLogo} />
      <View style={styles.placeInfo}>
        <Text style={styles.placeName}>{item.name}</Text>
        <Text style={styles.placeAddress}>{item.address}</Text>
        <Text style={styles.placePhone}>{item.phone}</Text>
      </View>
      <TouchableOpacity
        style={styles.photoPreview}
        onPress={(e) => {
          e.stopPropagation();
          router.push("/photos/gallery");
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
        <Text style={styles.locationLabel}>Restaurants</Text>
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
          initialRegion={location}
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
        />
      </View>
      {/* Scrollable Bottom Sheet Style List */}
      <View style={styles.sheetContainer}>
        <FlatList
          data={places}
          renderItem={renderPlaceCard}
          keyExtractor={(_, index) => index.toString()}
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
