import * as faceapi from 'face-api.js';

// Function to load face-api.js models
export const loadFaceRecognitionModels = async () => {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    await faceapi.nets.ageGenderNet.loadFromUri('/models'); // Add this line
};

// Function to detect faces in an image or video element, including age and gender
export const detectFaces = async (input: HTMLImageElement | HTMLVideoElement) => {
    const detections = await faceapi.detectAllFaces(
        input,
        new faceapi.TinyFaceDetectorOptions()
    )
        .withFaceLandmarks()
        .withFaceDescriptors()
        .withAgeAndGender(); // Add this line

    return detections;
};

// Function to match detected faces with known faces
export const matchFaces = (descriptors: faceapi.LabeledFaceDescriptors[], faceDescriptor: Float32Array) => {
    const faceMatcher = new faceapi.FaceMatcher(descriptors);
    const bestMatch = faceMatcher.findBestMatch(faceDescriptor);
    return bestMatch;
};

export interface FaceDetails {
    detection: faceapi.FaceDetection;
    landmarks: faceapi.FaceLandmarks68;
    name?: string;
    age?: number;
    gender?: string;
}
