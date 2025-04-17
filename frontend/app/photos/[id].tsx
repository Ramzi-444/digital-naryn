import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal,
  SafeAreaView,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "react-native";

// Simple cache for photos
const photoCache = new Map();

const PhotoSkeleton = () => (
  <View style={[styles.photoContainer, { backgroundColor: "#f5f5f5" }]}>
    <Animated.View
      style={[
        styles.skeletonAnimation,
        {
          opacity: useRef(new Animated.Value(0.3)).current,
        },
      ]}
    />
  </View>
);

const GalleryPage = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fullScreenLoading, setFullScreenLoading] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;

      // Try to get from in-memory cache first
      const cacheKey = `photos:${id}`;
      if (photoCache.has(cacheKey)) {
        setItem(photoCache.get(cacheKey));
        setLoading(false);
        return;
      }

      // Try to get from storage cache
      try {
        const cachedItem = await AsyncStorage.getItem(cacheKey);
        if (cachedItem) {
          const parsedItem = JSON.parse(cachedItem);
          setItem(parsedItem);
          photoCache.set(cacheKey, parsedItem);
          setLoading(false);

          // Still refresh in background
          refreshData(false);
          return;
        }
      } catch (error) {
        console.error("Error reading from cache:", error);
      }

      // No cache, load with loading state
      refreshData(true);
    };

    fetchItem();
  }, [id]);

  const refreshData = async (showLoading = true) => {
    if (!id) return;

    if (showLoading) {
      setLoading(true);
    }

    try {
      const response = await fetch(
        `http://157.230.109.162:8000/api/items/${id}`
      );
      const data = await response.json();

      // Update state
      setItem(data);

      // Save to cache
      const cacheKey = `photos:${id}`;
      photoCache.set(cacheKey, data);

      try {
        await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (error) {
        console.error("Error saving to cache:", error);
      }
    } catch (error) {
      console.error("Error fetching item data:", error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const closePhoto = () => {
    Animated.spring(fadeAnim, {
      toValue: 0,
      useNativeDriver: true,
      damping: 15,
      stiffness: 100,
    }).start(() => {
      setSelectedPhoto(null);
    });
  };

  const openPhoto = (index: number) => {
    setSelectedPhoto(index);
    Animated.spring(fadeAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 15,
      stiffness: 100,
    }).start();
  };

  const handleBack = () => {
    if (selectedPhoto !== null) {
      closePhoto();
    } else {
      router.back();
    }
  };

  const renderPhoto = ({
    item: photo,
    index,
  }: {
    item: string;
    index: number;
  }) => {
    return (
      <TouchableOpacity
        style={styles.photoContainer}
        onPress={() => openPhoto(index)}
        activeOpacity={0.9}
        delayPressIn={50}
      >
        {imageLoadingStates[photo] && (
          <View style={styles.imageLoadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
          </View>
        )}
        <Image
          source={{ uri: `http://157.230.109.162:8000/media/${photo}` }}
          style={[
            styles.photoThumbnail,
            imageLoadingStates[photo] && { opacity: 0 },
          ]}
          onLoadStart={() => {
            setImageLoadingStates((prev) => ({ ...prev, [photo]: true }));
          }}
          onLoadEnd={() => {
            setImageLoadingStates((prev) => ({ ...prev, [photo]: false }));
          }}
        />
        <View style={styles.photoOverlay} />
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    // Clean up expired cache items
    const cleanupCache = async () => {
      try {
        const now = Date.now();
        const keys = await AsyncStorage.getAllKeys();
        const photoKeys = keys.filter((key) => key.startsWith("photos:"));

        for (const key of photoKeys) {
          const item = await AsyncStorage.getItem(key);
          if (item) {
            const parsed = JSON.parse(item);
            // If cached more than 24 hours ago, remove it
            if (
              parsed.timestamp &&
              now - parsed.timestamp > 24 * 60 * 60 * 1000
            ) {
              await AsyncStorage.removeItem(key);
              photoCache.delete(key);
            }
          }
        }
      } catch (error) {
        console.error("Error cleaning cache:", error);
      }
    };

    cleanupCache();
  }, []);

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.7,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [loading]);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            { flex: 1, flexWrap: "wrap", textAlign: "center" },
          ]}
        >
          {item?.name || "Gallery"}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Photos List */}
      {loading ? (
        <FlatList
          data={[1, 2, 3]} // Show 3 skeleton items
          renderItem={() => <PhotoSkeleton />}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={styles.photosList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => refreshData(true)}
              tintColor="#007AFF"
              colors={["#007AFF"]}
            />
          }
        />
      ) : item?.photos && item.photos.length > 0 ? (
        <FlatList
          data={item.photos}
          renderItem={renderPhoto}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.photosList}
          showsVerticalScrollIndicator={false}
          bounces={true}
          overScrollMode="never"
          decelerationRate="normal"
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => refreshData(true)}
              tintColor="#007AFF"
              colors={["#007AFF"]}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="images-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No photos available</Text>
        </View>
      )}

      {/* Full Screen Photo Modal */}
      <Modal
        visible={selectedPhoto !== null}
        transparent={true}
        animationType="none"
        onRequestClose={closePhoto}
      >
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={closePhoto}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>

          {selectedPhoto !== null && item?.photos && item.photos.length > 0 && (
            <View style={styles.modalImageContainer}>
              <Image
                source={{
                  uri: `http://157.230.109.162:8000/media/${item.photos[selectedPhoto]}`,
                }}
                style={styles.fullScreenPhoto}
                resizeMode="contain"
                onLoadStart={() => setFullScreenLoading(true)}
                onLoadEnd={() => setFullScreenLoading(false)}
              />
              {fullScreenLoading && (
                <View style={styles.fullScreenLoadingContainer}>
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              )}
            </View>
          )}
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  placeholder: {
    width: 40,
  },
  photosList: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  photoContainer: {
    width: width - 24,
    height: (width - 24) * 0.65,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: "center",
  },
  photoThumbnail: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImageContainer: {
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenPhoto: {
    width: width,
    height: height * 0.8,
    resizeMode: "contain",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  skeletonAnimation: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e0e0e0",
    position: "absolute",
  },
  imageLoadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  fullScreenLoadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});

export default GalleryPage;
