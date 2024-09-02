import * as faceapi from 'face-api.js';

// Function to load emotion recognition model
export const loadEmotionRecognitionModel = async () => {
    await faceapi.nets.faceExpressionNet.loadFromUri('/models');
};

// Function to detect emotions from a face
export const detectEmotions = async (input: HTMLImageElement | HTMLVideoElement) => {
    const detections = await faceapi.detectAllFaces(
        input,
        new faceapi.TinyFaceDetectorOptions()
    ).withFaceLandmarks().withFaceExpressions();

    return detections;
};

// Function to get the dominant emotion from detected emotions
export const getDominantEmotion = (expressions: faceapi.FaceExpressions) => {
    let dominantEmotion = '';
    let maxProbability = 0;

    for (const [emotion, probability] of Object.entries(expressions)) {
        if (probability > maxProbability) {
            dominantEmotion = emotion;
            maxProbability = probability;
        }
    }

    return dominantEmotion;
};
