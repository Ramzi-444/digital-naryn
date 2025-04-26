import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  TextInput,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";

const { width } = Dimensions.get("window");

export default function ContactPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const inputRef = useRef<TextInput>(null);

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL:", err)
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={26} color="#000" />
        </TouchableOpacity>

        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={25}
            color="#999"
            style={{ marginRight: 6 }}
          />
          <TextInput
            ref={inputRef}
            onFocus={() => {
              inputRef.current?.blur();
              router.push("/modals/search");
            }}
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={(text) => setSearchText(text)}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Contact Us</Text>
        <Text style={styles.subtitle}>
          If you have any question we are happy to help
        </Text>

        {/* Phone Number */}
        <View style={styles.contactItem}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => openLink("tel:+996555214529")}
          >
            <Ionicons name="call" size={25} color="white" />
          </TouchableOpacity>
          <Text style={styles.infoText}>+996 555 214 529</Text>
        </View>

        {/* Email */}
        <View style={styles.contactItem}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => openLink("mailto:sophomore354@gmail.com")}
          >
            <Ionicons name="mail" size={25} color="white" />
          </TouchableOpacity>
          <Text style={styles.infoText}>sophomore354@gmail.com</Text>
        </View>

        <Text style={styles.connect}>Get Connected</Text>

        {/* Social Media */}
        <View style={styles.socialIcons}>
          {/* Instagram */}
          <TouchableOpacity
            onPress={() => openLink("https://instagram.com/a.ramzi_444")}
          >
            <Image
              source={require("../assets/social/instagram.png")}
              style={styles.icon}
            />
          </TouchableOpacity>

          {/* WhatsApp */}
          <TouchableOpacity
            onPress={() => openLink("whatsapp://send?phone=+996555214529")}
          >
            <Image
              source={require("../assets/social/whatsapp.png")}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 20,
    justifyContent: "space-between",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flex: 1,
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  container: {
    alignItems: "center",
    paddingBottom: 50,
    paddingTop: 25,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 28,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 17,
    color: "gray",
    marginBottom: 30,
    textAlign: "center",
  },
  contactItem: {
    alignItems: "center",
    marginVertical: 25,
  },
  iconButton: {
    backgroundColor: "#61BFFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
  },
  infoText: {
    fontSize: 16,
    color: "#000",
  },
  connect: {
    marginTop: 40,
    fontSize: 16,
    fontWeight: "600",
  },
  socialIcons: {
    flexDirection: "row",
    gap: 20,
    marginTop: 15,
  },
  icon: {
    width: width * 0.1,
    height: width * 0.1,
  },
});
