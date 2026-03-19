# Endless — Feature List

> Version 1.0 · March 2026

Complete feature inventory for the Endless IP camera system, organized by module and extended with hardware/software customization scope.

**Status legend:**
✅ Implemented — feature is complete and available in current codebase
🔲 Planned — on the roadmap, not yet implemented

---

## 1. Video

### 1.1 Encoding
- ✅ H.264 (AVC) encoding
- ✅ H.265 (HEVC) encoding
- ✅ MJPEG encoding
- ✅ Configurable bitrate and encoding parameters

### 1.2 Video Specs
- ✅ 1080p resolution
- ✅ Up to 25 fps frame rate
- ✅ YUV output (1280×720)
- ✅ JPEG snapshot via API

### 1.3 Image Enhancement
- ✅ Wide Dynamic Range (WDR)
- ✅ 3D Digital Noise Reduction (3D-DNR)
- ✅ Digital sharpening
- ✅ OSD (on-screen display) overlay

---

## 2. Audio

### 2.1 Encoding
- ✅ AAC encoding
- ✅ G.711 encoding
- ✅ Opus encoding support

### 2.2 Playback
- ✅ Audio playback management
- ✅ Priority scheduling (alert sounds interrupt ambient audio)
- ✅ Interrupt and resume
- ✅ Volume control

---

## 3. Network

### 3.1 Connectivity
- ✅ Wired Ethernet (RJ45)
- ✅ NTP time synchronization

### 3.2 Configuration
- ✅ DHCP (automatic IP assignment)
- ✅ Static IP configuration

### 3.3 Network Services
- ✅ HTTP service
- ✅ HTTPS service (TLS)
- ✅ WebSocket service
- ✅ RESTful API service
- ✅ LAN device discovery (mDNS)

---

## 4. Storage

### 4.1 Storage Management
- ✅ microSD card storage
- ✅ Available space monitoring
- ✅ Storage health status
- ✅ SD card format (web UI)
- ✅ Hot-plug support

### 4.2 Recording
- ✅ Continuous recording
- ✅ Loop-overwrite policy (auto-delete oldest when full)
- ✅ Time-based recording search
- ✅ Recording playback in browser
- ✅ Recording download

---

## 5. AI Intelligence

### 5.1 Local AI (On-device NPU)
- ✅ Person detection
- ✅ Vehicle detection
- ✅ Face detection
- ✅ YOLOv8 object detection framework
- ✅ Custom detection label configuration
- ✅ Custom YOLO model upload via web UI

### 5.2 Cloud AI (Alibaba Cloud)
- ✅ Qwen-VL multimodal model integration
- ✅ Image scene understanding
- ✅ Image Q&A (visual question answering)

### 5.3 AI Agent Service
- ✅ Voice-driven agent interaction
- ✅ Visual perception (live video analysis)
- ✅ Tool-calling (camera control, snapshot, query)
- ✅ Context memory (multi-turn conversation)

### 5.4 Third-party AI Services
- ✅ Xiaozhi AI voice dialog
- ✅ Qwen SDK real-time multimodal interaction
- ✅ Qwen3-Omni voice + vision interaction

---

## 6. Protocol Support

### 6.1 Streaming Protocols

#### RTSP / RTP
- ✅ RTSP server
- ✅ RTP transport
- ✅ Multi-client concurrent access (up to 5 streams)

#### WebRTC
- ✅ WebRTC browser streaming (< 500ms latency)
- ✅ ICE / STUN negotiation
- ✅ Signaling server (WebSocket)
- 🔲 End-to-end encryption (DTLS key exchange enhancement)

#### RTMP / RTMPS
- ✅ RTMP push streaming
- ✅ RTMPS (TLS) push streaming
- ✅ Multi-target push configuration
- ✅ H.264 + AAC stream

### 6.2 Industry Standards

#### ONVIF
- ✅ ONVIF device discovery (WS-Discovery)
- ✅ ONVIF media service (stream URI, snapshot)
- ✅ ONVIF device management

#### GB28181
- ✅ GB28181 national standard
- ✅ SIP signaling (UA)
- ✅ PS stream encapsulation
- ✅ Platform registration

### 6.3 RESTful API

#### Authentication
- ✅ Challenge-response login (HMAC-SHA256)
- ✅ JWT token issuance
- ✅ Token refresh
- ✅ Token validation middleware

#### Configuration
- ✅ Read module configuration (GET)
- ✅ Write module configuration (PUT)
- ✅ Hot reload without restart
- ✅ Configuration path validation

#### Device Management
- ✅ Device information query (model, firmware, SN)
- ✅ Device status monitoring (CPU, memory, uptime)
- ✅ System reboot
- ✅ Factory reset

#### Network Management
- ✅ Network interface configuration (DHCP / static)
- ✅ Network status query
- ✅ NTP configuration

#### Firmware Upgrade
- ✅ Firmware upload (chunked multipart)
- ✅ Signature verification
- ✅ Upgrade progress query
- ✅ Real-time progress via WebSocket
- ✅ Firmware version query

---

## 7. Web Management Interface

### 7.1 Live Preview
- ✅ WebRTC real-time video preview
- ✅ Full-screen mode
- ✅ AI detection bounding box overlay
- ✅ Snapshot (download JPEG)

### 7.2 Configuration Panels
- ✅ Video parameter configuration (resolution, bitrate, framerate, codec)
- ✅ Audio parameter configuration
- ✅ OSD configuration (text, timestamp, position)
- ✅ Network configuration (IP, DNS, NTP)
- ✅ System configuration
- ✅ AI algorithm configuration (enable/disable, threshold)
- ✅ Agent configuration (LLM keys, voice settings)
- ✅ User management (add/delete/modify users, password policy)

### 7.3 Recording Playback
- ✅ Recording timeline browser
- ✅ Segment playback with seek
- ✅ Playback speed control
- ✅ Recording download

### 7.4 System Management
- ✅ System information dashboard (firmware version, hardware info)
- ✅ Firmware upgrade interface
- ✅ System reboot
- ✅ Factory reset
- ✅ Web terminal (xterm.js, full shell access)
- ✅ Log download

### 7.5 Agent Interface
- ✅ AI conversation chat UI
- ✅ Qwen SDK configuration
- ✅ Voice agent testing

---

## 8. Hardware & Platform Support

### 8.1 Platform Support
- ✅ Hisilicon 3516CV610 (Product PA — commercial IP camera)
- ✅ Hisilicon 3516CV608 (entry-level IP camera)
- ✅ Hisilicon 3519DV500 (high-end AI camera)
- ✅ QEMU aarch64 (Product PB — development & CI)

### 8.2 Peripheral Support
- ✅ GPIO alarm input / output
- ✅ USB audio device (microphone, speaker)
- ✅ Hardware watchdog
- ✅ RTC hardware clock
- ✅ IR-CUT filter switching (day/night mode)

### 8.3 Customization Support
- ✅ SoC / BSP adaptation and board-level profile customization
- ✅ Peripheral driver adaptation for GPIO, USB audio, IR-CUT, and watchdog
- ✅ Tailored web UI, RESTful API, AI, and protocol modules
- ✅ Branding, workflow extensions, and third-party platform integrations

---

## 9. Security

- ✅ HTTPS with TLS 1.2+ (all web access)
- ✅ Challenge-response authentication (anti brute-force)
- ✅ JWT session management with auto-refresh
- ✅ AES encryption for sensitive configuration
- ✅ Firmware RSA signature verification
- ✅ Secure boot support (platform-dependent)
- ✅ System watchdog (auto-recovery on hang)

---

## 10. Planned Features (Roadmap)

### Near-term
- 🔲 WebRTC end-to-end encryption
- 🔲 Expanded AI model scenarios (package detection, pet detection)
- 🔲 AI inference performance optimization

### Mid-term
- 🔲 Cloud platform APP integration
- 🔲 Mobile APP (iOS / Android)
- 🔲 Developer SDK and documentation portal

### Long-term
- 🔲 Additional SoC platform support
- 🔲 Edge AI model optimization (INT8 quantization, pruning)
- 🔲 Multi-camera coordination

---

## Contact

- **GitHub**: https://github.com/endless-sky-bee1/endless
- **Email**: endless@endless-sky.onaliyun.com
