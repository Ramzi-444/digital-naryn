import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
  TextInput,
  SafeAreaView,
  Animated,
  Modal,
  Platform,
  Alert,
  AppState,
  Clipboard,
  ActivityIndicator,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { useSearchParams } from "expo-router/build/hooks";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

// Fallback header images in case there are no photos from the backend
// const fallbackHeaderImages = [
//   require("../../assets/places/bamboo-cafe/bamboo-cafe.jpg"),
//   require("../../assets/places/bamboo-cafe/cafe-1.jpg"),
//   require("../../assets/places/bamboo-cafe/cafe-2.jpg"),
// ];

const TEXT = {
  overview: "Overview",
  workingHours: "Working Hours",
  location: "Location",
  photos: "Photos",
  viewAll: "View all",
  callNow: "Call Now",
  copyNumber: "Copy phone number",
  openWhatsapp: "Open in WhatsApp",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
  openInMaps: "Open in Maps",
  noInstagram: "No Instagram profile available",
  followUs: "Follow us",
  delivery: "Delivery",
  takeaway: "Takeaway",
};

const normalizeWorkingHours = (workingHours: Record<string, string>) => {
  const normalized: Record<string, string> = {};
  Object.entries(workingHours).forEach(([key, value]) => {
    normalized[key.toLowerCase()] = value;
  });
  return normalized;
};

// Simple cache implementation
const cache = new Map(); // Uncommented

const ItemPage = () => {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCallOptions, setShowCallOptions] = useState(false);
  const fadeAnim = new Animated.Value(1);
  const modalAnim = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView | null>(null);
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [item, setItem] = useState<any>(null);
  const [headerImages, setHeaderImages] = useState<any[]>([]);
  const appState = useRef(AppState.currentState);
  const [isLoading, setIsLoading] = useState(false); // Start with false to allow cached content to show immediately
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchItem = async () => {
      // Try to get from in-memory cache first
      if (cache.has(`item:${id}`)) {
        const cachedData = cache.get(`item:${id}`);
        setItem(cachedData.item);
        if (cachedData.images && cachedData.images.length > 0) {
          setHeaderImages(cachedData.images);
        }

        // Still refresh in background without showing loading state
        refreshItemData(false);
        return;
      }

      // Try to get from storage cache
      try {
        const cachedItemJSON = await AsyncStorage.getItem(`item:${id}`);
        if (cachedItemJSON) {
          const cachedItem = JSON.parse(cachedItemJSON);
          setItem(cachedItem.item);
          if (cachedItem.images && cachedItem.images.length > 0) {
            setHeaderImages(cachedItem.images);
          }

          // Still refresh in background without showing loading state
          refreshItemData(false);
          return;
        }
      } catch (error) {
        console.error("Error fetching from cache:", error);
      }

      // No cache, load with loading state
      refreshItemData(true);
    };

    fetchItem();
  }, [id]);

  const refreshItemData = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }

    try {
      const response = await fetch(
        `http://157.230.109.162:8000/api/items/${id}`
      );
      const data = await response.json();
      setItem(data);

      // Update header images with photos from the backend
      let backendImages = [];
      if (data?.photos && data.photos.length > 0) {
        backendImages = data.photos.map((photo: string) => ({
          uri: `http://157.230.109.162:8000/media/${photo}`,
        }));
        setHeaderImages(backendImages);
      }

      // Save to in-memory cache
      cache.set(`item:${id}`, {
        item: data,
        images: backendImages,
        timestamp: Date.now(),
      });

      // Save to storage cache
      try {
        await AsyncStorage.setItem(
          `item:${id}`,
          JSON.stringify({
            item: data,
            images: backendImages,
            timestamp: Date.now(),
          })
        );
      } catch (err) {
        console.error("Error saving to cache:", err);
      }
    } catch (error) {
      console.error("Error fetching item:", error);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  // Replace the simple version with the cached version
  const refreshContent = () => {
    if (id) {
      refreshItemData(true);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      // Only run transition if there are images
      if (headerImages.length === 0) return;

      fadeAnim.setValue(1);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setCurrentImageIndex((prev) =>
          prev >= headerImages.length - 1 ? 0 : prev + 1
        );
        fadeAnim.setValue(1);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [headerImages]);

  // Reset currentImageIndex if it exceeds array bounds
  useEffect(() => {
    if (currentImageIndex >= headerImages.length && headerImages.length > 0) {
      setCurrentImageIndex(0);
    }
  }, [headerImages, currentImageIndex]);

  const defaultWorkingHours = {
    monday: "Closed",
    tuesday: "Closed",
    wednesday: "Closed",
    thursday: "Closed",
    friday: "Closed",
    saturday: "Closed",
    sunday: "Closed",
  };

  const workingHours = item?.working_hours
    ? normalizeWorkingHours(item.working_hours)
    : defaultWorkingHours;

  const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const location = {
    latitude: item?.latitude || 41.4281873,
    longitude: item?.longitude || 76.0008164,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const handleCallOptions = () => {
    setShowCallOptions(true);
    Animated.timing(modalAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeCallOptions = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowCallOptions(false);
    });
  };

  const handleCopyNumber = () => {
    if (item?.phone_numbers) {
      Clipboard.setString(item.phone_numbers);
      Alert.alert("Success", "Phone number copied to clipboard");
    } else {
      Alert.alert("Error", "No phone number available");
    }
    setShowCallOptions(false);
  };

  const handleWhatsApp = () => {
    if (item?.whatsapp_number) {
      const formattedNumber = item.whatsapp_number.replace(/[^\d+]/g, ""); // Format number
      Linking.openURL(`whatsapp://send?phone=${formattedNumber}`);
    } else {
      Alert.alert("Error", "No WhatsApp number");
    }
    closeCallOptions();
  };

  // Add function to check if currently open
  const isCurrentlyOpen = (hours: string): boolean => {
    if (!hours || hours === "Closed" || !hours.includes("-")) {
      return false; // Return false if hours are invalid or "Closed"
    }

    // Parse the hours string
    const [startStr, endStr] = hours.split("-").map((t) => t.trim());

    // Get current date/time
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Parse opening hours
    const [openHour, openMinute] = startStr.split(":").map(Number);

    // Parse closing hours
    const [closeHour, closeMinute] = endStr.split(":").map(Number);

    // Convert times to minutes for easier comparison
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const openTimeInMinutes = openHour * 60 + openMinute;
    const closeTimeInMinutes = closeHour * 60 + closeMinute;

    // If closing time is 00:00 or smaller than opening time, it means it closes after midnight
    if (closeTimeInMinutes === 0 || closeTimeInMinutes < openTimeInMinutes) {
      // For places that close after midnight, check if current time is after opening time
      return currentTimeInMinutes >= openTimeInMinutes;
    }

    // Standard comparison for places that open and close on the same day
    return (
      currentTimeInMinutes >= openTimeInMinutes &&
      currentTimeInMinutes < closeTimeInMinutes
    );
  };

  // Get current day
  const getCurrentDay = () => {
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    return days[new Date().getDay()];
  };

  const currentDay = getCurrentDay();

  const openInMaps = () => {
    try {
      const scheme = Platform.select({
        ios: "maps:0,0?q=",
        android: "geo:0,0?q=",
      });
      const latLng = `${location.latitude},${location.longitude}`;
      const label = item?.name || "Location";
      const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`,
      });

      if (url) {
        Linking.openURL(url).catch((err) => {
          console.error("Error opening maps:", err);
          Alert.alert("Error", "Could not open maps application");
        });
      }
    } catch (error) {
      console.error("Error in openInMaps:", error);
      Alert.alert("Error", "Could not open maps application");
    }
  };

  // Add this effect to center map on item location when data loads
  useEffect(() => {
    if (item?.latitude && item?.longitude && mapRef.current) {
      // Small delay to ensure map is fully loaded
      setTimeout(() => {
        const itemLocation = {
          latitude: item.latitude,
          longitude: item.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        mapRef.current?.animateToRegion(itemLocation, 300);
      }, 500);
    }
  }, [item]);

  useEffect(() => {
    // Add AppState listener to handle app coming back from background
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log("App has come to the foreground!");

        // Use the refreshContent function instead of just refreshing the map
        refreshContent();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [id]);

  // Start shimmer animation
  useEffect(() => {
    if (isLoading) {
      const shimmerAnimation = Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      );
      shimmerAnimation.start();

      // Pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      // Rotation animation
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        })
      );
      rotateAnimation.start();

      return () => {
        shimmerAnimation.stop();
        pulseAnimation.stop();
        rotateAnimation.stop();
      };
    }
  }, [isLoading]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  // Calculate rotation for the icon
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Calculate scale for the pulse effect
  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  // Create a shimmer component that can be reused
  const Shimmer = ({ style }: { style: any }) => {
    return (
      <View style={[style, { overflow: "hidden" }]}>
        <Animated.View
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            transform: [{ translateX }],
          }}
        >
          <LinearGradient
            colors={["transparent", "rgba(255, 255, 255, 0.5)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
      </View>
    );
  };

  // Handle View All Photos navigation with preloading
  const handleViewAllPhotos = () => {
    if (item?.id) {
      // Prefetch and store photos data in the cache
      const cacheKey = `photos:${item.id}`;
      try {
        // Store in AsyncStorage for the photos page to use
        AsyncStorage.setItem(cacheKey, JSON.stringify(item));
      } catch (error) {
        console.error("Error caching photo data:", error);
      }

      // Navigate to photos page
      router.push({
        pathname: `/photos/${item.id}`,
        params: { photos: item?.photos },
      });
    }
  };

  useEffect(() => {
    // Check if we're seeing the placeholder at all
    console.log("headerImages length:", headerImages.length);
  }, [headerImages]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBackground}>
            <LinearGradient
              colors={["#ffffff", "#f8f8f8"]}
              style={StyleSheet.absoluteFill}
            />
          </View>
          <View style={styles.loadingContent}>
            <Animated.View
              style={{
                transform: [{ rotate: spin }],
              }}
            >
              <Ionicons name="compass" size={60} color="#007AFF" />
            </Animated.View>
            <Text style={styles.loadingTitle}>Digital Naryn</Text>
            <ActivityIndicator
              size="small"
              color="#007AFF"
              style={{ marginTop: 20 }}
            />
          </View>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          bounces={false}
          showsVerticalScrollIndicator={false}
          decelerationRate="normal"
          overScrollMode="never"
        >
          {/* Header Image */}
          <View style={styles.headerContainer}>
            {headerImages.length > 0 &&
            currentImageIndex < headerImages.length ? (
              <Animated.Image
                source={headerImages[currentImageIndex]}
                style={[styles.headerImage, { opacity: fadeAnim }]}
              />
            ) : (
              <View
                style={[styles.headerImage, { backgroundColor: "#e0e0e0" }]}
              />
            )}
            <SafeAreaView style={styles.headerOverlay}>
              <View style={styles.topHeader}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.back()}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.searchBar}
                  onPress={() => router.push("/modals/search")}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="search"
                    size={20}
                    color="#999"
                    style={styles.searchIcon}
                  />
                  <Text style={styles.searchText}>Search</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.titleContainer}>
                <Text style={styles.title}>{item?.name || "..."}</Text>
                <View style={styles.locationContainer}>
                  <Ionicons name="location" size={16} color="#fff" />
                  <Text style={styles.subtitle}>
                    {item?.address || "noname"}
                  </Text>
                </View>
              </View>
            </SafeAreaView>
          </View>

          {/* Overview Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{TEXT.overview}</Text>
            <Text style={styles.description}>
              {item?.description || "noname"}
            </Text>

            <View style={styles.amenitiesGrid}>
              <View style={styles.amenityBox}>
                <Ionicons name="wifi" size={24} color="#666" />
                <Text style={styles.amenityText}>Free WiFi</Text>
              </View>

              <View style={styles.amenityBox}>
                <Ionicons name="car" size={24} color="#666" />
                <Text style={styles.amenityText}>Parking</Text>
              </View>

              <View style={styles.amenityBox}>
                <Ionicons name="qr-code" size={24} color="#666" />
                <Text style={styles.amenityText}>QR Payment</Text>
              </View>

              <TouchableOpacity
                style={[styles.amenityBox, styles.instagramBox]}
                onPress={() => {
                  if (item?.instagram) {
                    Linking.openURL(`https://instagram.com/${item.instagram}`);
                  } else {
                    Alert.alert(TEXT.noInstagram);
                  }
                }}
              >
                <Ionicons name="logo-instagram" size={28} color="#E4405F" />
                <Text style={[styles.amenityText, styles.instagramText]}>
                  {TEXT.followUs}
                </Text>
              </TouchableOpacity>

              <View style={styles.amenityBox}>
                <Ionicons name="bicycle" size={24} color="#666" />
                <Text style={styles.amenityText}>{TEXT.delivery}</Text>
              </View>

              <View style={styles.amenityBox}>
                <Ionicons name="bag-handle" size={24} color="#666" />
                <Text style={styles.amenityText}>{TEXT.takeaway}</Text>
              </View>
            </View>
          </View>

          {/* Map Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{TEXT.location}</Text>
              <TouchableOpacity
                onPress={openInMaps}
                style={styles.viewAllButton}
              >
                <Text style={styles.viewAllText}>{TEXT.openInMaps}</Text>
                <Ionicons name="chevron-forward" size={16} color="#007AFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: item?.latitude || location.latitude,
                  longitude: item?.longitude || location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={true}
                zoomEnabled={true}
                showsUserLocation={true}
                ref={mapRef}
              >
                <Marker
                  coordinate={{
                    latitude: item?.latitude || location.latitude,
                    longitude: item?.longitude || location.longitude,
                  }}
                  title={item?.name || "Location"}
                  description={item?.address || ""}
                />
              </MapView>
              <TouchableOpacity
                style={styles.recenterButton}
                onPress={() => {
                  if (item?.latitude && item?.longitude) {
                    const location = {
                      latitude: item.latitude,
                      longitude: item.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    };
                    mapRef.current?.animateToRegion(location, 300);
                  } else {
                    Alert.alert("Location not available");
                  }
                }}
              >
                <Ionicons name="location" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Working Hours Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{TEXT.workingHours}</Text>
            {daysOfWeek.map((day) => {
              const hours =
                workingHours[day as keyof typeof workingHours] || "Closed";
              const isToday = day === currentDay.toLowerCase();
              const isOpen = isToday && isCurrentlyOpen(hours);

              return (
                <View key={day} style={styles.hoursRow}>
                  <View style={styles.dayContainer}>
                    <Text style={[styles.dayText, isToday && styles.todayText]}>
                      {TEXT[day as keyof typeof TEXT]}
                    </Text>
                    {isToday && (
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: isOpen ? "#34C759" : "#FF3B30" },
                        ]}
                      >
                        <Text style={styles.statusText}>
                          {isOpen ? "Open" : "Closed"}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.hoursText, isToday && styles.todayText]}>
                    {hours}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Photos Section */}
          <View style={[styles.section, styles.lastSection]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{TEXT.photos}</Text>
              <TouchableOpacity
                onPress={handleViewAllPhotos}
                style={styles.viewAllButton}
              >
                <Text style={styles.viewAllText}>{TEXT.viewAll}</Text>
                <Ionicons name="chevron-forward" size={16} color="#007AFF" />
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.photosScroll}
              decelerationRate="fast"
              snapToInterval={width * 0.8}
              snapToAlignment="center"
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {item?.photos && item.photos.length > 0 ? (
                item.photos.map((photo: string, index: number) => (
                  <TouchableOpacity
                    key={index}
                    onPress={handleViewAllPhotos}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{
                        uri: `http://157.230.109.162:8000/media/${photo}`,
                      }}
                      style={styles.photoItem}
                    />
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={{ color: "#666", fontSize: 14 }}>
                  No photos available
                </Text>
              )}
            </ScrollView>
          </View>
        </ScrollView>
      )}

      {/* Call Options Modal */}
      <Modal
        visible={showCallOptions}
        transparent={true}
        animationType="none"
        onRequestClose={closeCallOptions}
      >
        <Animated.View
          style={[
            styles.modalOverlay,
            {
              opacity: modalAnim,
              backgroundColor: "rgba(0,0,0,0.6)",
            },
          ]}
        >
          <TouchableOpacity
            style={styles.modalOverlayTouch}
            activeOpacity={1}
            onPress={closeCallOptions}
          >
            <Animated.View
              style={[
                styles.modalContent,
                {
                  transform: [
                    {
                      translateY: modalAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [600, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.modalHeader}>
                <View style={styles.modalIndicator} />
              </View>

              {/* Call Now Option */}
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  if (item?.phone_numbers) {
                    Linking.openURL(`tel:${item.phone_numbers}`);
                  } else {
                    Alert.alert("Error", "No phone number available");
                  }
                  closeCallOptions();
                }}
              >
                <Ionicons name="call-outline" size={24} color="#007AFF" />
                <Text style={styles.modalOptionText}>{TEXT.callNow}</Text>
              </TouchableOpacity>

              {/* Copy Number Option */}
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  handleCopyNumber();
                  closeCallOptions();
                }}
              >
                <Ionicons name="copy-outline" size={24} color="#007AFF" />
                <Text style={styles.modalOptionText}>{TEXT.copyNumber}</Text>
              </TouchableOpacity>

              {/* Open in WhatsApp Option */}
              <TouchableOpacity
                style={[styles.modalOption, styles.lastOption]}
                onPress={() => {
                  handleWhatsApp();
                  closeCallOptions();
                }}
              >
                <Ionicons name="logo-whatsapp" size={24} color="#007AFF" />
                <Text style={styles.modalOptionText}>{TEXT.openWhatsapp}</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </Modal>

      {/* Call Now Button - only show when not loading */}
      {!isLoading && (
        <TouchableOpacity style={styles.callButton} onPress={handleCallOptions}>
          <Text style={styles.callButtonText}>{TEXT.callNow}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    height: 400,
    position: "relative",
  },
  headerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingTop: 50,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchText: {
    fontSize: 16,
    color: "#999",
    flex: 1,
  },
  langButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 4,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  lastSection: {
    marginBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
    color: "#000",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#666",
  },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  dayContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dayText: {
    fontSize: 16,
    color: "#000",
  },
  hoursText: {
    fontSize: 16,
    color: "#666",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    color: "#007AFF",
    fontSize: 14,
    marginRight: 4,
  },
  photosScroll: {
    marginHorizontal: -20,
  },
  photoItem: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginRight: 12,
  },
  mapContainer: {
    height: 250,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  recenterButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  amenitiesGrid: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  amenityBox: {
    width: "30%",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },
  instagramBox: {
    backgroundColor: "#fff0f5",
    borderWidth: 1,
    borderColor: "#E4405F",
  },
  amenityText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  instagramText: {
    color: "#E4405F",
    fontWeight: "500",
  },
  todayText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalOverlayTouch: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 8,
  },
  modalIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginBottom: 8,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#000",
  },
  callButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  callButtonDisabled: {
    backgroundColor: "#a8cdf8",
  },
  callButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  loadingBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContent: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
});

export default ItemPage;
