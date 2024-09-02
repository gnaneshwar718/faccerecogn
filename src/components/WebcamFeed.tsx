import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { loadFaceRecognitionModels, detectFaces } from '../utils/faceRecognition';
import { loadEmotionRecognitionModel, detectEmotions, getDominantEmotion } from '../utils/emotionRecognition';
import { Box, Button, Typography, Card, CardContent, Container } from '@mui/material';

const WebcamFeed: React.FC = () => {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isWebcamOn, setIsWebcamOn] = useState(false);

    useEffect(() => {
        const loadModels = async () => {
            await loadFaceRecognitionModels();
            await loadEmotionRecognitionModel();
        };

        loadModels();
    }, []);

    const startWebcam = () => {
        setIsWebcamOn(true);
    };

    const stopWebcam = () => {
        setIsWebcamOn(false);
        if (canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        }
    };

    const captureAndDetect = async () => {
        if (webcamRef.current && canvasRef.current) {
            const video = webcamRef.current.video;
            if (video && video.readyState === 4) { // Ensure video is ready
                const displaySize = { width: video.videoWidth, height: video.videoHeight };
                faceapi.matchDimensions(canvasRef.current, displaySize);

                // Capture image from webcam
                const screenshot = webcamRef.current.getScreenshot();
                if (screenshot) {
                    // Convert data URL to Image object
                    const img = new Image();
                    img.src = screenshot;

                    img.onload = async () => {
                        // Detect faces and emotions from the captured image
                        const faces = await detectFaces(img);
                        const emotions = await detectEmotions(img);

                        const resizedDetections = faceapi.resizeResults(faces, displaySize);
                        const canvas = canvasRef.current;
                        if (canvas) {
                            const context = canvas.getContext('2d');
                            if (context) {
                                context.clearRect(0, 0, displaySize.width, displaySize.height);
                                context.drawImage(img, 0, 0, displaySize.width, displaySize.height); // Draw the captured image
                                faceapi.draw.drawDetections(canvas, resizedDetections);
                                faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

                                resizedDetections.forEach((detection, i) => {
                                    const { age, gender, genderProbability } = detection;
                                    const dominantEmotion = getDominantEmotion(emotions[i]?.expressions || {});

                                    const text = [
                                        `Age: ${Math.round(age)}`,
                                        `Gender: ${gender} (${(genderProbability * 100).toFixed(2)}%)`,
                                        `Emotion: ${dominantEmotion}`
                                    ].join(', ');

                                    const box = detection.detection.box;
                                    context.fillStyle = '#fff';
                                    context.font = '14px Arial'; // Reduced font size
                                    context.fillText(text, box.x, box.y + box.height + 20); // Moved text down
                                });
                            }
                        }
                    };
                }
            }
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            if (file && canvasRef.current) {
                const img = await faceapi.bufferToImage(file);
                const faces = await detectFaces(img);
                const emotions = await detectEmotions(img);

                const displaySize = { width: img.width, height: img.height };
                faceapi.matchDimensions(canvasRef.current, displaySize);

                const resizedDetections = faceapi.resizeResults(faces, displaySize);
                const canvas = canvasRef.current;
                if (canvas) {
                    const context = canvas.getContext('2d');
                    if (context) {
                        context.clearRect(0, 0, displaySize.width, displaySize.height);
                        context.drawImage(img, 0, 0, displaySize.width, displaySize.height); // Draw the uploaded image
                        faceapi.draw.drawDetections(canvas, resizedDetections);
                        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

                        resizedDetections.forEach((detection, i) => {
                            const { age, gender, genderProbability } = detection;
                            const dominantEmotion = getDominantEmotion(emotions[i]?.expressions || {});

                            const text = [
                                `Age: ${Math.round(age)}`,
                                `Gender: ${gender} (${(genderProbability * 100).toFixed(2)}%)`,
                                `Emotion: ${dominantEmotion}`
                            ].join(', ');

                            const box = detection.detection.box;
                            context.fillStyle = '#fff';
                            context.font = '14px Arial'; // Reduced font size
                            context.fillText(text, box.x, box.y + box.height + 20); // Moved text down
                        });
                    }
                }
            }
        }
    };

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (

        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h5" align="center" gutterBottom>
                WEBCAM IMAGE FEED WITH FACIAL RECOGNITION
            </Typography>

            <Card sx={{ width: '85%', margin: 'auto' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                    <Box sx={{ position: 'relative', width: '100%', paddingTop: '75%', overflow: 'hidden', marginBottom: 2 }}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                        />

                        {isWebcamOn && (
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                videoConstraints={{
                                    width: 580,
                                    height: 420,
                                    facingMode: 'user',
                                }}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                }}
                            />
                        )}

                        <canvas
                            ref={canvasRef}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                            }}
                        />
                    </Box>

                    <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={captureAndDetect}
                            disabled={!isWebcamOn}
                        >
                            Capture & Detect Faces & Emotions
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={startWebcam}
                            disabled={isWebcamOn}
                        >
                            Start Webcam
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={stopWebcam}
                            disabled={!isWebcamOn}
                        >
                            Stop Webcam
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleButtonClick}
                        >
                            Upload Image
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default WebcamFeed;
