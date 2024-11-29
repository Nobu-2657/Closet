import React, { useState } from 'react';
import { View, Button, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import config from '@/config';
import * as ImagePicker from 'expo-image-picker';

const CameraScreen: React.FC = () => {
    const [permission, requestPermission] = useCameraPermissions();
    const [camera, setCamera] = useState<CameraView | null>(null);
    const [photo, setPhoto] = useState<string | null>(null);
    const navigation = useNavigation();

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Button onPress={requestPermission} title="カメラの起動を許可" />
            </View>
        );
    }

    const takePicture = async () => {
        if (camera) {
            const photo = await camera.takePictureAsync({ base64: true });
            if (photo && photo.base64) {
                setPhoto(photo.base64);
            }
        }
    };

    const selectPicture = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            setPhoto(result.assets[0].base64);
        }
    };

    const uploadPhoto = async () => {
        if (photo) {
            try {
                const response = await fetch(`http://${config.serverIP}:3001/api/upload`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        image: photo,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                console.log('Photo uploaded successfully:', data);
                navigation.goBack();
            } catch (error) {
                console.error('Error uploading photo:', error);
            }
        }
    };

    const retakePicture = () => {
        setPhoto(null);
    };

    if (photo) {
        return (
            <View style={styles.container}>
                <Image source={{ uri: `data:image/jpeg;base64,${photo}` }} style={styles.preview} />
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={retakePicture}>
                        <Text style={styles.buttonText}>撮り直す</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={uploadPhoto}>
                        <Text style={styles.buttonText}>登録する</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView 
                style={styles.camera} 
                ref={(ref) => setCamera(ref)}
            >
                <View style={styles.captureButtonContainer}>
                    <TouchableOpacity style={styles.captureButton} onPress={takePicture} />
                </View>
                <View style={styles.uploadButtonContainer}>
                    <TouchableOpacity style={styles.uploadButton} onPress={selectPicture}>
                        <Text style={styles.uploadButtonText}>Upload</Text>
                    </TouchableOpacity>
                </View>
            </CameraView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    camera: {
        flex: 1,
        width: '100%',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        position: 'absolute',
        bottom: 20,
    },
    button: {
        backgroundColor: 'blue',
        padding: 15,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
    },
    captureButtonContainer: {
        position: 'absolute',
        bottom: 70,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButton: {
        width: 70, // ボタンの幅
        height: 70, // ボタンの高さ
        borderRadius: 35, // 丸くするための半径
        backgroundColor: 'white', // ボタンの色
        borderWidth: 5, // ボタンの枠線
        borderColor: 'rgba(255, 255, 255, 0.8)', // 枠線の色
    },
    preview: {
        width: '100%',
        height: '80%',
        resizeMode: 'contain',
    },
    uploadButtonContainer:{
        position: 'absolute',
        bottom: 70,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        right: '15%', // 画面の右から30%の位置
    },
    uploadButton: {
        width: 70,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 35,
    },
    uploadButtonText: {
        color: 'black',
        fontSize: 14,
    },
});

export default CameraScreen;