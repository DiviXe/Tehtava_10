import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  Text,
  KeyboardAvoidingView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const getCoordinates = async (nameOfLocation) => {
  const response = await fetch(
    `https://www.mapquestapi.com/geocoding/v1/address?key=d8Chjsag9iS3ZraGY1kS0NXBzmdvwoOV&location=${nameOfLocation}`
  );
  return response.json();
};

export default function App() {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [coordinates, setCoordinates] = useState({
    latitude: "",
    longitude: "",
  });

  const searchCordinates = async () => {
    if (!address.length) return;

    try {
      const data = await getCoordinates(address);
      setCoordinates({
        latitude: +data?.results[0]?.locations[0]?.displayLatLng?.lat,
        longitude: +data?.results[0]?.locations[0]?.displayLatLng?.lng,
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          throw new Error("something went wrong");
        }

        let location = await Location.getCurrentPositionAsync({});
        setCoordinates({
          ...coordinates,
          latitude: +location.coords.latitude,
          longitude: +location.coords.longitude,
        });
        setIsLoading(false);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.searchView}>
        <View style={styles.textInput}>
          <TextInput
            onChangeText={(address) => setAddress(address)}
            value={address}
            placeholder="Search here..."
            returnKeyType="search"
            clearButtonMode="always"
          />
        </View>
        <TouchableOpacity
          style={!address.length ? styles.buttonDisabled : styles.button}
          onPress={searchCordinates}
          buttonDisabled={!address.length}
        >
          <Text style={styles.searchText}>Search</Text>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <View style={styles.centeredView}>
          <ActivityIndicator size="small" />
        </View>
      ) : (
        <MapView
          style={styles.mapView}
          showsUserLocation
          followsUserLocation
          region={{
            latitude: +coordinates?.latitude,
            longitude: +coordinates?.longitude,
            latitudeDelta: 0.0322,
            longitudeDelta: 0.0221,
          }}
        >
          <Marker
            coordinate={{
              latitude: +coordinates?.latitude,
              longitude: +coordinates?.longitude,
            }}
          />
        </MapView>
      )}
      <StatusBar hidden={true} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: screenWidth,
    backgroundColor: "#fff",
  },
  searchView: {
    marginTop: screenHeight - screenHeight + 40,
    marginHorizontal: 10,
  },
  mapView: {
    flex: 1,
    width: screenWidth,
    marginTop: 4,
  },
  textInput: {
    borderRadius: 10,
    borderBottomWidth: 0.4,
    borderBottomColor: "gray",
    padding: 10,
  },
  button: {
    height: 40,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "blue",
    borderWidth: 1,
  },
  buttonDisabled: {
    height: 40,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "grey",
    borderWidth: 1,
  },
  searchText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  centeredView: {
    justifyContent: "center",
    flex: 1,
  },
});
