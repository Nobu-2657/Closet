import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Image, FlatList, RefreshControl, TextInput, TouchableOpacity, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, Octicons } from '@expo/vector-icons';
import config from '@/config';

const { width } = Dimensions.get('window');

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
    'bottoms': 'パンツ'
};

const ClosetScreen = () => {
    const [clothes, setClothes] = useState<ClothingItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

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

    const fetchClothes = async (userId: string) => {
        try {
            const response = await fetch(`http://${config.serverIP}:3001/api/images?userId=${userId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setClothes(data);
        } catch (error) {
            console.error('Error fetching clothes:', error);
        }
    };

    const onRefresh = useCallback(() => {
        if (userId) {
            setRefreshing(true);
            fetchClothes(userId).then(() => setRefreshing(false));
        }
    }, [userId]);

    const renderItem = ({ item }: { item: ClothingItem }) => (
        <View style={styles.itemContainer}>
            <Image 
                source={{ uri: item.base64 ? `data:image/jpeg;base64,${item.base64}` : undefined }}
                style={styles.image}
            />
        </View>
    );

    const renderCategory = ({ item }: { item: string }) => (
        <View>
            <Text style={styles.categoryTitle}>
            {categoryMap[item] || item}
            </Text>
            <FlatList
                data={clothes.filter(cloth => cloth.category === item)}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={3}
                contentContainerStyle={styles.imageList}
            />
        </View>
    );

    const categories = [...new Set(clothes.map(item => item.category))];

    return (
        <>
            <View style={styles.logoContainer}>
                <Image source={require('../images/ClosEt_logo.png')} style={styles.logo} />
                <TextInput
                style={styles.searchInput}
                placeholder="アイテムを探す"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            </View>
            <View style={styles.divider} />
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <TouchableOpacity style={styles.iconButton}>
                    <Octicons name="sort-desc" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="funnel-outline" size={24} color="black" />
                </TouchableOpacity>
            </View>
            <FlatList
                data={categories}
                renderItem={renderCategory}
                keyExtractor={(item) => item}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            />
        </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
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
    searchInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginTop: 10,
        width: '90%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 10,
        marginRight: 20,
    },
    iconButton: {
        paddingLeft: 15,
    },
    imageList: {
        marginBottom: 20,
    },
    itemContainer: {
        width: (width - 40) / 3,
        marginBottom: 10,
        alignItems: 'center',
    },
    image: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 5,
    },
    itemName: {
        marginTop: 5,
        fontSize: 12,
        textAlign: 'center',
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
});

export default ClosetScreen;