import React from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent, ViewStyle } from 'react-native';

interface CustomButtonProps {
    title: string; // titleはstring型
    onPress: (event: GestureResponderEvent) => void; // onPressは関数で、引数にGestureResponderEventを取る
    style?: ViewStyle; // styleはオプショナルなViewStyle型
}

const CustomButton: React.FC<CustomButtonProps> = ({ title, onPress, style }) => {
    return (
        <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: 'blue', // ボタンの背景色
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white', // テキストの色
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CustomButton;