import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { useState } from "react";
import { View, StyleSheet } from "react-native";
import CustomButton from "./customButton";
import config from "@/config";

const feedbackScreen = () => {
    const [feedback, setFeedback] = useState(0);

    const submitFeedback = async () => {
        try {
        const userId = await AsyncStorage.getItem('userId');
        const response = await fetch(`http://${config.serverIP}:3001/api/submit-feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, feedback, date: new Date() }),
        });
        if (!response.ok) throw new Error('Failed to submit feedback');
        // フィードバック送信成功後の処理
        } catch (error) {
        console.error('Error submitting feedback:', error);
        }
    };

    return (
        <View style={styles.container}>
        {/* フィードバックUI */}
        <Slider
            value={feedback}
            onValueChange={setFeedback}
            minimumValue={0}
            maximumValue={10}
        />
        <CustomButton title="フィードバックを送信" onPress={submitFeedback} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
});

export default feedbackScreen;