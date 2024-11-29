import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Image, FlatList, RefreshControl } from 'react-native';
import CustomButton from './customButton';
import { StackNavigationProp } from '@react-navigation/stack';
import config from '@/config';

const { width } = Dimensions.get('window');

type RootStackParamList = {
    Closet: undefined;
    Camera: undefined;
};

type ClosetScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Closet'>;

type Props = {
    navigation: ClosetScreenNavigationProp;
};

type ImageItem = {
    id: string;
    base64: string;
    createdAt: string;
};

const ClosetScreen = ({ navigation }: Props) => {
    const [images, setImages] = useState<ImageItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const response = await fetch(`http://${config.serverIP}:3001/api/images`);
            const data = await response.json();
            //console.log('Fetched images:', data); // データが正しく取得できているか確認
            setImages(data);
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchImages().then(() => setRefreshing(false));
    }, []);

    const renderItem = ({ item }: { item: ImageItem }) => {
        //console.log('Rendering item:', item.id); // アイテムのIDをログ出力
        //console.log('Image URI:', item.base64 ? `data:image/jpeg;base64,${item.base64.substring(0, 20)}...` : 'No base64 data'); // base64の先頭部分をログ出力
        return (
            <Image 
                source={{ uri: item.base64 ? `data:image/jpeg;base64,${item.base64}` : undefined }}
                style={styles.image}
                onError={(error) => console.error('Image loading error:', error.nativeEvent.error)} // 画像読み込みエラーをログ出力
            />
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={images}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={3}
                contentContainerStyle={styles.imageList}
                onViewableItemsChanged={info => { // なんやようわからんけどここ消したらアカンで！
                    //console.log('Viewable items:', info.viewableItems); // 表示可能なアイテムを確認
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            />
            <CustomButton
                title="Register"
                onPress={() => navigation.navigate('Camera')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageList: {
        padding: 5,
    },
    image: {
        width: (width - 30) / 3,  // 3列で表示、左右に5pxのパディング
        aspectRatio: 1,
        margin: 5,
    },
});

export default ClosetScreen;