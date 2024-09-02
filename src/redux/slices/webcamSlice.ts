import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    webcamActive: false,
};

const webcamSlice = createSlice({
    name: 'webcam',
    initialState,
    reducers: {
        startWebcam(state) {
            state.webcamActive = true;
        },
        stopWebcam(state) {
            state.webcamActive = false;
        },
    },
});

export const { startWebcam, stopWebcam } = webcamSlice.actions;
export default webcamSlice.reducer;
