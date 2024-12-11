import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, ScrollView, Image, FlatList, RefreshControl } from 'react-native';
import { Entypo, Feather, FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '@/config';

const OPENWEATHERMAP_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHERMAP_API_KEY; //APIキー

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

type ClothingItem = {
    id: string;
    base64: string;
    name: string;
    category: string;
    temperature: number;
    createdAt: string;
};

const categoryMap: { [key: string]: string } = {
    'outerwear': 'ジャケット/アウター',
    'tops': 'トップス',
    'bottoms': 'パンツ',
    'other': 'その他'
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
    const [filteredClothes, setFilteredClothes] = useState<ClothingItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [clothes, setClothes] = useState<ClothingItem[]>([]);
    const [rainProbability, setRainProbability] = useState<number | null>(null);

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
                const rainVolume = data.rain?.['1h'] || 0; // mm/h単位
                setRainProbability(rainVolume > 0 ? 100 : 0);
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

    useEffect(() => {
        const fetchUserId = async () => {
            const storedUserId = await AsyncStorage.getItem('userId');
            setUserId(storedUserId);
        };
        fetchUserId().then(() => {
            if (userId) {
                fetchClothes(userId);
            }
        });
    }, [userId]);

    useEffect(() => {
        if (clothes.length > 0) {
            const filtered = clothes.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
            setFilteredClothes(filtered);
        }
    }, [searchQuery, clothes]);

    const fetchClothes = async (userId: string): Promise<ClothingItem[]> => {
        try {
            const response = await fetch(`http://${config.serverIP}:3001/api/images?userId=${userId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setClothes(data);
            setFilteredClothes(data);
            return data; // データを返す
            } catch (error) {
            console.error('Error fetching clothes:', error);
            return []; // エラー時は空の配列を返す
        }
    };

    const categories = [...new Set(filteredClothes.map(item => item.category))];

    const renderItem = ({ item }: { item: ClothingItem }) => (
        <TouchableOpacity onPress={() => setSelectedItem(item)} style={styles.itemContainer}>
            <Image source={{ uri: item.base64 ? `data:image/jpeg;base64,${item.base64}` : undefined }} style={styles.image} />
        </TouchableOpacity>
    );

    const renderCategory = ({ item }: { item: string }) => (
        <View>
            <Text style={styles.categoryTitle}>{categoryMap[item] || item}</Text>
            <FlatList
                data={filteredClothes.filter(cloth => cloth.category === item)}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.imageList}
            />
        </View>
    );    

    return (
        <>
            <View style={styles.logoContainer}>
                <Image source={require('../images/ClosEt_logo.png')} style={styles.logo} />
            </View>
            <View style={styles.divider} />
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
                                <Ionicons name="rainy" size={24} color="#333" />
                                <Text style={styles.detailText}>{rainProbability}%</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Feather name="wind" size={24} color="#333" />
                                <Text style={styles.detailText}>{windSpeed} m/s</Text>
                            </View>
                        </View>
                    </View>
                )}
            </View>
            <View style={styles.clothesContainer}>
            <Text style={styles.promptText}>今日は何を着ますか？</Text>
                <FlatList
                    data={categories}
                    renderItem={renderCategory}
                    keyExtractor={(item) => item}
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    clothesContainer: {
        flex: 1,
        padding: 10,
    },
    logoContainer: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
    },
    logo: {
        width: 100,
        height: 50,
    },
    divider: {
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        marginBottom: 10,
    },
    weatherContainer: {
        width: '90%',
        height: height / 4.5,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        padding: 20,
        marginTop: 30,
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
    promptText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'left', // 左寄せに変更
        marginVertical: 20,
        width: '100%', // 幅を全体に設定
        paddingHorizontal: 10, // 左右のパディングを追加
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    imageList: {
        paddingHorizontal: 10,
    },
    itemContainer: {
        width: width / 3, // 画面幅の1/3に設定
        marginRight: 10,
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: 100, // 適切な高さに調整
        borderRadius: 5,
    },
    itemName: {
        marginTop: 5,
        textAlign: 'center',
    },
});