import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

const headerImages = [
  require('../../assets/places/bamboo-cafe/bamboo-cafe.jpg'),
  require('../../assets/places/bamboo-cafe/cafe-1.jpg'),
  require('../../assets/places/bamboo-cafe/cafe-2.jpg'),
];

type Language = 'en' | 'ru';

type Translation = {
  overview: string;
  workingHours: string;
  location: string;
  photos: string;
  viewAll: string;
  callNow: string;
  copyNumber: string;
  openWhatsapp: string;
  description: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  openInMaps: string;
};

const translations: Record<Language, Translation> = {
  en: {
    overview: 'Overview',
    workingHours: 'Working Hours',
    location: 'Location',
    photos: 'Photos',
    viewAll: 'View all',
    callNow: 'Call Now',
    copyNumber: 'Copy phone number',
    openWhatsapp: 'Open in WhatsApp',
    description: 'Nice and beautiful cafe to spend your day. A cozy place where you can enjoy your meal. Perfect for meetings and casual dining.',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
    openInMaps: 'Open in Maps',
  },
  ru: {
    overview: 'Обзор',
    workingHours: 'Режим работы',
    location: 'Расположение',
    photos: 'Фотографии',
    viewAll: 'Показать все',
    callNow: 'Позвонить',
    copyNumber: 'Скопировать номер',
    openWhatsapp: 'Открыть в WhatsApp',
    description: 'Уютное и красивое кафе, где можно провести свой день. Комфортное место, где можно насладиться едой. Идеально подходит для встреч и повседневного питания.',
    monday: 'Понедельник',
    tuesday: 'Вторник',
    wednesday: 'Среда',
    thursday: 'Четверг',
    friday: 'Пятница',
    saturday: 'Суббота',
    sunday: 'Воскресенье',
    openInMaps: 'Открыть в Картах',
  },
};

const ItemPage = () => {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [language, setLanguage] = useState<Language>('en');
  const [showCallOptions, setShowCallOptions] = useState(false);
  const fadeAnim = new Animated.Value(1);

  const t = translations[language];

  useEffect(() => {
    const interval = setInterval(() => {
      fadeAnim.setValue(1);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setCurrentImageIndex((prev) => 
          prev === headerImages.length - 1 ? 0 : prev + 1
        );
        fadeAnim.setValue(1);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const workingHours = {
    monday: '11:00 - 23:00',
    tuesday: '11:00 - 23:00',
    wednesday: '11:00 - 23:00',
    thursday: '11:00 - 23:00',
    friday: '11:00 - 23:00',
    saturday: '11:00 - 23:00',
    sunday: '11:00 - 23:00',
  };

  const location = {
    latitude: 41.4287,  // Replace with actual coordinates
    longitude: 75.9911, // Replace with actual coordinates
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const handleCallOptions = () => {
    setShowCallOptions(true);
  };

  const handleCopyNumber = () => {
    // Implement copy to clipboard
    setShowCallOptions(false);
  };

  const handleWhatsApp = () => {
    Linking.openURL('whatsapp://send?phone=+1234567890');
    setShowCallOptions(false);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView style={styles.scrollView} bounces={false}>
        {/* Header Image */}
        <View style={styles.headerContainer}>
          <Animated.Image
            source={headerImages[currentImageIndex]}
            style={[styles.headerImage, { opacity: fadeAnim }]}
          />
          <SafeAreaView style={styles.headerOverlay}>
            <View style={styles.topHeader}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.searchBar}
                onPress={() => router.push('/modals/search')}
              >
                <Ionicons name="search" size={20} color="#999" />
                <Text style={styles.searchText}>Search</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.langButton}
                onPress={() => setLanguage(language === 'en' ? 'ru' : 'en')}
              >
                <Ionicons name="globe-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.titleContainer}>
              <Text style={styles.title}>Bamboo Cafe</Text>
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={16} color="#fff" />
                <Text style={styles.subtitle}>Kulumbayeva Street, 33</Text>
              </View>
            </View>
          </SafeAreaView>
        </View>

        {/* Overview Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.overview}</Text>
          <Text style={styles.description}>{t.description}</Text>
        </View>

        {/* Map Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.location}</Text>
            <TouchableOpacity 
              onPress={() => Linking.openURL(`https://maps.apple.com/?q=${location.latitude},${location.longitude}`)}
              style={styles.viewAllButton}
            >
              <Text style={styles.viewAllText}>Open in Maps</Text>
              <Ionicons name="chevron-forward" size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={location}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
              />
            </MapView>
          </View>
        </View>

        {/* Working Hours Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.workingHours}</Text>
          {Object.entries(workingHours).map(([day, hours]) => (
            <View key={day} style={styles.hoursRow}>
              <Text style={styles.dayText}>{t[day as keyof Translation]}</Text>
              <Text style={styles.hoursText}>{hours}</Text>
            </View>
          ))}
        </View>

        {/* Photos Section */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.photos}</Text>
            <TouchableOpacity 
              onPress={() => router.push('/photos/gallery')}
              style={styles.viewAllButton}
            >
              <Text style={styles.viewAllText}>{t.viewAll}</Text>
              <Ionicons name="chevron-forward" size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.photosScroll}
          >
            {headerImages.map((photo, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => router.push('/photos/gallery')}
              >
                <Image
                  source={photo}
                  style={styles.photoItem}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Call Options Modal */}
      <Modal
        visible={showCallOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCallOptions(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCallOptions(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => {
                Linking.openURL('tel:+1234567890');
                setShowCallOptions(false);
              }}
            >
              <Ionicons name="call-outline" size={24} color="#007AFF" />
              <Text style={styles.modalOptionText}>{t.callNow}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalOption}
              onPress={handleCopyNumber}
            >
              <Ionicons name="copy-outline" size={24} color="#007AFF" />
              <Text style={styles.modalOptionText}>{t.copyNumber}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalOption}
              onPress={handleWhatsApp}
            >
              <Ionicons name="logo-whatsapp" size={24} color="#007AFF" />
              <Text style={styles.modalOptionText}>{t.openWhatsapp}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Call Now Button */}
      <TouchableOpacity
        style={styles.callButton}
        onPress={handleCallOptions}
      >
        <Text style={styles.callButtonText}>{t.callNow}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    height: 400,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingTop: 50,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#999',
  },
  langButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 4,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastSection: {
    marginBottom: 100, // Space for the call button
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#000',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  dayText: {
    fontSize: 16,
    color: '#000',
  },
  hoursText: {
    fontSize: 16,
    color: '#666',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: '#007AFF',
    fontSize: 14,
    marginRight: 4,
  },
  photosScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  photoItem: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginRight: 12,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  callButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  callButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#000',
  },
  callOptionsModal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  callOptionsContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 34,
  },
  callOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  callOptionText: {
    fontSize: 16,
    color: '#007AFF',
  },
});

export default ItemPage; 