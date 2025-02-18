## Deezer Lite Player

CPU optimized High Fidelity Music Player

Deezer Lite Player is an optimized Electron-based desktop player for Deezer, designed for audiophiles and performance-conscious users on Linux. This project enhances High-Fidelity music streaming while significantly reducing CPU consumption, making it ideal for low-power or resource-limited systems.

With a focus on efficiency and security, I have replaced outdated dependencies, optimized database operations, and fine-tuned Electron’s rendering engine. The latest enhancements leverage hardware acceleration, background throttling, and low-power mode to deliver a smooth, lightweight music experience with up to 85% lower CPU usage. Enjoy the best audio quality without draining system resources! 🚀

The main goal is to optimize the CPU consumption of the original code design (unmaintained as of 2021).


# Results After Optimization

	✅ CPU usage dropped from 150% → ~20% while playing music
	
	✅ More stable performance, fewer spikes
	
	✅ Reduced memory & power consumption

# General Optimization points

1) CPU & GPU Optimization

	✅ Enabled hardware acceleration for smoother rendering and lower CPU usage
	
	✅ Reduced Chromium rendering FPS to prevent unnecessary CPU load
	
	✅ Enabled hardware-accelerated media decoding to offload audio processing from CPU to GPU
	
	✅ Forced Chromium to run in "low-power mode" for lightweight performance

2) JavaScript & Rendering Enhancements

	✅ Background throttling for Electron window (stops unnecessary re-rendering)
	
	✅ Suspends app execution when minimized (prevents CPU drain)
	
	✅ Offscreen rendering enabled (reduces load when app is hidden)

3) Database & App Efficiency

	✅ Replaced nedb with nedb-promises (fixing security vulnerabilities)
	
	✅ Optimized database queries (cached data to reduce I/O operations)
	
	✅ Debounced database writes (prevents excessive file writes)


# Muzic Player Features

* System tray icon
* Background music play
* Media keys support
* Connection check
* Reduced CPU consumption

# Oryginal-unofficial Deezer project

This is the fork of the “Unofficial Deezer Player” repository, which has not been maintained since 2021. The project was struggling with outdated components (3 critical components were changed/repaired) and extremely high CPU consumption during music playback (over 150% on average).
Wanting to continue listening to my favorite music in good quality on Linux, I decided to make some improvements and give the project a breath of fresh air!

# Build Instructions

To generate an executable file run this commands:

* ``cd src;``
* ``npm install; #or yarn install``
* ``yarn build:linux #should generate deb, tar.xz, snap and AppImage files``

> See the package.json file to see which script you should run. The generated files will bu available in src/dist directory.

