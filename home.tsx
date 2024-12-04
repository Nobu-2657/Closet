import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Entypo, Feather, FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const OPENWEATHERMAP_API_KEY = ''; //APIキー

const { width, height } = Dimensions.get('window');
const BASE_URL = `https://api.openweathermap.org/data/2.5/weather`;

const weatherIcons: { [key: string]: string } = {
    clear: 'sunny',
    clouds: 'cloudy',
    rain: 'rainy',
    drizzle: 'rainy',
    thunderstorm: 'thunderstorm',
    snow: 'snow',
    mist: 'water',
    smoke: 'water',
    haze: 'water',
    dust: 'water',
    fog: 'water',
    sand: 'water',
    ash: 'water',
    squall: 'water',
    tornado: 'water',
};

const weatherDescriptions: { [key: string]: string } = {
    clear: '晴れ',
    clouds: '曇り',
    rain: '雨',
    drizzle: '霧雨',
    thunderstorm: '雷雨',
    snow: '雪',
    mist: '霧',
    smoke: '煙',
    haze: 'かすみ',
    dust: 'ほこり',
    fog: '霧',
    sand: '砂',
    ash: '火山灰',
    squall: 'スコール',
    tornado: '竜巻',
};

export default function HomeScreen() {
    const [temperature, setTemperature] = useState<number | null>(null);
    const [weatherDescription, setWeatherDescription] = useState<string | null>(null);
    const [weatherIcon, setWeatherIcon] = useState<string>('help');
    const [humidity, setHumidity] = useState<number | null>(null);
    const [windSpeed, setWindSpeed] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

    const fetchWeather = async (lat: number, lon: number) => {
        try {
            setLoading(true);
            const response = await fetch(`${BASE_URL}?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`);
            const data = await response.json();

            if (response.ok) {
                setTemperature(Math.round(data.main.temp));
                const englishDescription = data.weather[0].main.toLowerCase();
                setWeatherDescription(weatherDescriptions[englishDescription] || '不明');
                setWeatherIcon(weatherIcons[englishDescription] || 'help');
                setHumidity(data.main.humidity);
                setWindSpeed(data.wind.speed);
            } else {
                setError(data.message || '天気データの取得に失敗しました');
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('不明なエラーが発生しました');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (location) {
            fetchWeather(location.lat, location.lon);
        } else {
            // 初期値として東京の位置情報を使用
            fetchWeather(35.6895, 139.6917);
        }
    }, [location]);

    const getCurrentLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setError('位置情報の許可が必要です');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation({
                lat: location.coords.latitude,
                lon: location.coords.longitude
            });
        } catch (err) {
            setError('位置情報の取得に失敗しました');
        }
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : (
                <View style={styles.weatherContainer}>
                    <View style={styles.weatherInfo}>
                        <View style={styles.iconContainer}>
                            <Ionicons name={weatherIcon} size={80} color="#333" />
                            <TouchableOpacity onPress={getCurrentLocation} style={styles.locationButton}>
                                <Entypo name="location" size={35} color="#333" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.detailsContainer}>
                        <View style={styles.detailItem}>
                            <FontAwesome6 name="temperature-half" size={24} color="#333" />
                            <Text style={styles.detailText}>{temperature}°C</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Entypo name="drop" size={24} color="#333" />
                            <Text style={styles.detailText}>{humidity}%</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Feather name="wind" size={24} color="#333" />
                            <Text style={styles.detailText}>{windSpeed} m/s</Text>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    weatherContainer: {
        width: width,
        height: height / 4.5,
        backgroundColor: '#fff',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        padding: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    weatherInfo: {
        alignItems: 'center',
    },
    weatherText: {
        fontSize: 24,
        color: '#333',
        marginTop: 10,
    },
    detailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    detailItem: {
        alignItems: 'center',
    },
    detailText: {
        fontSize: 18,
        color: '#333',
        marginTop: 5,
    },
    errorText: {
        fontSize: 16,
        color: 'red',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    locationButton: {
        marginLeft: 80,
        padding: 5,
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});