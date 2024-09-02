const path = require('path');

module.exports = {
    // Define the entry point of your application
    entry: './src/index.tsx',

    // Specify the output file and directory
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },

    // Configure module resolution
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        fallback: {
            "fs": false
        }
    },

    // Set up loaders
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.js$/,
                enforce: 'pre',
                use: 'source-map-loader',
                exclude: /node_modules\/face-api\.js/, // Ignore source maps for face-api.js
            },
        ],
    },

    // Enable source maps for debugging
    devtool: 'eval-source-map',

    // Add any additional plugins if needed
    plugins: [],

    // Specify the development mode
    mode: 'development',

    // Ignore specific warnings
    ignoreWarnings: [
        {
            module: /face-api\.js/,
            message: /Failed to parse source map/,
        },
    ],

    // Customize stats to reduce output clutter
    stats: {
        warnings: false,
        errorDetails: true,
        console: false,

    },
};
