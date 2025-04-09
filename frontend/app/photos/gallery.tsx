import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const photos = [
  require('../../assets/places/bamboo-cafe/bamboo-cafe.jpg'),
  require('../../assets/places/bamboo-cafe/cafe-1.jpg'),
  require('../../assets/places/bamboo-cafe/cafe-2.jpg'),
  // Add more photos here
];

const GalleryPage = () => {
  const router = useRouter();
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const closePhoto = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSelectedPhoto(null);
    });
  };

  const openPhoto = (index: number) => {
    setSelectedPhoto(index);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleBack = () => {
    if (selectedPhoto !== null) {
      closePhoto();
    } else {
      router.back();
    }
  };

  const renderPhoto = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={styles.photoContainer}
      onPress={() => openPhoto(index)}
      activeOpacity={0.9}
    >
      <Image source={item} style={styles.photoThumbnail} />
      <View style={styles.photoOverlay} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gallery</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Photos List */}
      <FlatList
        data={photos}
        renderItem={renderPhoto}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.photosList}
        showsVerticalScrollIndicator={false}
      />

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
              transform: [{
                scale: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1],
                }),
              }],
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
          
          {selectedPhoto !== null && (
            <TouchableOpacity 
              activeOpacity={1} 
              onPress={(e) => {
                e.stopPropagation();
              }}
              style={styles.modalImageContainer}
            >
              <Image
                source={photos[selectedPhoto]}
                style={styles.fullScreenPhoto}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
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
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: 'center',
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImageContainer: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenPhoto: {
    width: width,
    height: height * 0.8,
    resizeMode: 'contain',
  },
});

export default GalleryPage; 