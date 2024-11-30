import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
//import { OPENWEATHERMAP_API_KEY } from '@env'; // 環境変数からAPIキーを取得

const OPENWEATHERMAP_API_KEY = ''; //APIキー

const { width, height } = Dimensions.get('window');
const BASE_URL = `https://api.openweathermap.org/data/2.5/weather`;

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
    const [humidity, setHumidity] = useState<number | null>(null);
    const [windSpeed, setWindSpeed] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const lat = 35.6895; // 東京の緯度
                const lon = 139.6917; // 東京の経度

                const response = await fetch(`${BASE_URL}?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`);
                const data = await response.json();

                if (response.ok) {
                    setTemperature(data.main.temp);
                    const englishDescription = data.weather[0].main.toLowerCase();
                    setWeatherDescription(weatherDescriptions[englishDescription] || '不明');
                    setHumidity(data.main.humidity);
                    setWindSpeed(data.wind.speed);
                } else {
                    setError(data.message || 'Unable to fetch weather data');
                }
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, []);

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : (
                <View style={styles.weatherInfo}>
                    <Text style={styles.temperatureText}>今日の気温: {temperature}°C</Text>
                    <Text style={styles.weatherText}>天気: {weatherDescription}</Text>
                    <Text style={styles.weatherText}>湿度: {humidity}%</Text>
                    <Text style={styles.weatherText}>風速: {windSpeed} m/s</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    weatherInfo: {
        alignItems: 'center',
    },
    temperatureText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    weatherText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 4,
    },
    errorText: {
        fontSize: 16,
        color: 'red',
    },
});
