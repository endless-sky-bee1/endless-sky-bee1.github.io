# Endless — Open Source Intelligent IP Camera Solution

> Version 1.0 · March 2026

## Product Overview

Endless is a production-grade, fully open-source intelligent IP camera system built on embedded Linux. It delivers a complete software stack — from SoC-level hardware abstraction to cloud AI integration — covering the full pipeline: video capture, multi-protocol stream distribution, local AI inference, multi-modal AI agent services, and a web-based management interface.

The project is designed for teams who need a solid, customizable firmware base rather than a black-box SDK, with support for hardware selection, board adaptation, peripheral integration, and software feature customization.

**Target audiences:**

| Audience | Use case |
|----------|----------|
| OEM / ODM manufacturers | Hardware/software customization, multi-platform HAL, board adaptation |
| System integrators | ONVIF / GB28181 drop-in compatibility with configurable interfaces |
| Developers & researchers | Edge AI, WebRTC, RESTful API, QEMU dev environment |
| Enterprises | Private video intelligence, agent-based monitoring, and tailored deployment |

---

## Hardware Customization Overview

Endless is not limited to generic firmware delivery. It also supports hardware customization around the customer's target product form factor. For teams building commercial camera products, the existing platforms can be extended with board adaptation, peripheral integration, and product-specific configuration.

### Customization Scope

| Area | What can be customized |
|------|------------------------|
| SoC / platform | Fast delivery on existing Hisilicon platforms, with extension to new SoCs / BSPs when needed |
| Board adaptation | Board-level configuration aligned with customer mainboard, sensor, audio path, and interface definitions |
| Peripheral integration | GPIO, USB audio, IR-CUT, RTC, watchdog, and related driver/control adaptation |
| Product specification | Product-specific combinations of resolution, codec, AI capabilities, protocols, and storage options |

### Delivery Approach

- Start from existing reference platforms to shorten hardware bring-up time
- Create different variants for commercial, entry-level, or high-end AI camera products
- Run hardware customization and software tailoring in parallel to reduce integration cost

---

## Core Capabilities

### Video Pipeline

| Capability | Specification |
|-----------|---------------|
| Encoding formats | H.264, H.265, MJPEG |
| Resolution | Up to 1080p @ 25 fps |
| Image enhancement | WDR, 3D-DNR, digital sharpening |
| Snapshot | JPEG capture via API or web UI |

### Multi-Protocol Stream Distribution

| Protocol | Details |
|---------|---------|
| RTSP / RTP | Standard-compliant, multi-client concurrent access |
| WebRTC | Sub-500 ms latency, GStreamer-based, browser-native |
| RTMP / RTMPS | Push to CDN or live-streaming platforms, multi-target config |
| HTTP API | Pull snapshot, query status, control device |

### AI Intelligence

| Layer | Technology | Capability |
|-------|-----------|------------|
| Local inference | YOLOv8 via NPU | Person, vehicle, face detection |
| Cloud vision | Alibaba Cloud Qwen-VL | Scene understanding, image Q&A |
| Voice AI | Xiaozhi AI / Qwen3-Omni | Real-time multimodal voice dialog |
| AI Agent | Tool-calling agent | Context-aware reasoning, tool dispatch |

The Qwen3-Omni integration supports real-time audio-visual interaction — users can verbally query the camera ("Is there anyone at the entrance?") and receive spoken AI responses based on live video analysis.

### Hardware & Software Customization

- Select from existing Hisilicon/QEMU platforms and extend to new SoCs or board profiles
- Customize peripherals such as GPIO, USB audio, IR-CUT, watchdog, and board-level drivers
- Tailor web UI, RESTful API, AI, storage, and protocol modules based on product scope
- Extend branding, business workflows, protocol adapters, and cloud integrations as needed

### Industry Protocol Support

- **ONVIF**: Device discovery, media service, device management service
- **GB28181**: SIP signaling, PS stream encapsulation, platform registration
- **RESTful API**: Full HTTP/HTTPS API covering auth, config, media, storage, and upgrade
- **WebSocket**: Real-time event push (AI detections, system alerts, telemetry)

### Storage

- microSD card with hot-plug support and filesystem monitoring
- Continuous recording with timestamp indexing
- Configurable loop-overwrite policy with storage-space alerting
- Timeline-based playback and recording search via web UI
- Download via API or web interface

### Security

- HTTPS with TLS on all web access
- Challenge-response authentication (anti brute-force)
- JWT token session management with automatic refresh
- Data encryption for sensitive configuration
- Firmware signing and verified boot support (hardware-dependent)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Application Layer                                               │
│  Web UI (Vue 3) · RESTful API · ONVIF · GB28181 · AI Agent UI  │
├─────────────────────────────────────────────────────────────────┤
│  Foundation Services                                             │
│  Stream Service (RTSP/WebRTC/RTMP) · Agent · Qwen · Xiaozhi    │
├─────────────────────────────────────────────────────────────────┤
│  Base Business Layer                                             │
│  Media · Record · Storage · File Mgr · Upgrade · Rule Engine    │
├─────────────────────────────────────────────────────────────────┤
│  Base Software Layer                                             │
│  Config Mgr · Event Bus · GStreamer · FFmpeg · SQLite · OpenSSL │
├─────────────────────────────────────────────────────────────────┤
│  HAL (Hardware Abstraction Layer) — pure C interface             │
│  Video · Audio · AI Accelerator · Peripheral · USB              │
├─────────────────────────────────────────────────────────────────┤
│  Kernel Layer: Linux 5.10 + SoC device drivers                  │
├─────────────────────────────────────────────────────────────────┤
│  Hardware: Hisilicon 3516CV610 · 3516CV608 · 3519DV500 · QEMU  │
└─────────────────────────────────────────────────────────────────┘
```

See [Architecture Document](./architecture-en.md) for full layer descriptions, component relationships, and data flow diagrams.

---

## Hardware Platform Support

| Platform | Class | Status |
|---------|-------|--------|
| Hisilicon 3516CV610 | Commercial IP camera (Product PA) | ✅ Supported |
| Hisilicon 3516CV608 | Entry-level IP camera | ✅ Supported |
| Hisilicon 3519DV500 | High-end AI camera | ✅ Supported |
| QEMU aarch64 | Development & CI environment (Product PB) | ✅ Supported |

Cross-compilation is handled by platform-specific toolchains under `device/soc/hisilicon/`. The QEMU platform enables full-stack development and regression testing without physical hardware, making software customization verification faster.

---

## Technology Stack

### Backend

| Component | Technology |
|----------|-----------|
| Core language | C++17 (services), C (HAL) |
| Build system | CMake 3.x + Buildroot |
| Media framework | GStreamer 1.18 |
| Codec support | FFmpeg 4.x |
| Database | SQLite 3.x |
| Networking | libcurl 7.x, OpenSSL 1.1.1 |
| Logging | spdlog |
| JSON | nlohmann/json |

### Frontend

| Component | Technology |
|----------|-----------|
| Framework | Vue.js 3.4 + Pinia + Vue Router 4 |
| UI components | Ant Design Vue 4.x |
| Build tool | Vite 5.x |
| WebRTC | Browser WebRTC API + GStreamer backend |
| Terminal | xterm.js with WebGL renderer |
| i18n | Vue I18n 11.x (zh_CN, en_US) |

### AI Services

| Service | Provider | Integration point |
|--------|---------|------------------|
| Local object detection | YOLOv8 + Hisilicon NPU | HAL AI accelerator |
| Cloud vision | Alibaba Cloud Qwen-VL | foundation/aliyun |
| Real-time multimodal | Qwen3-Omni SDK | foundation/qwen |
| Voice dialog | Xiaozhi AI | foundation/xiaozhi |
| Agent framework | Custom tool-calling agent | foundation/agent |

---

## Typical Use Cases

### Home & SMB Security

Deploy on Hisilicon 3516CV610 hardware. Connect via browser (WebRTC live view < 500 ms latency). AI detects persons and vehicles locally; events are stored to SD card. Users can ask the camera voice questions via the AI Agent interface.

### Enterprise Video Intelligence

Register cameras to existing VMS via ONVIF or GB28181. Use the RESTful API to integrate with custom dashboards or SIEM systems. Enable cloud Qwen-VL for advanced scene description and anomaly analysis.

### OEM / ODM Product Development

Use Endless as a firmware baseline. The HAL abstraction isolates hardware-specific code, making SoC transitions, board bring-up, and peripheral adaptation manageable. C++ service modules are independently compilable, and web, protocol, and AI capabilities can be tailored to product scope. Custom AI pipelines can be added as separate modules under `foundation/`.

### Edge AI Research & Development

The QEMU aarch64 platform (Product PB) provides a complete functional environment for algorithm development, CI testing, and integration work without physical hardware. YOLO model uploads and hot-reload are supported via the web interface.

---

## Integration Reference

### API Endpoints (excerpt)

| Method | Endpoint | Description |
|-------|---------|-------------|
| POST | `/v1/auth/login` | Challenge-response login, returns JWT |
| GET | `/v1/config/{module}` | Read module configuration |
| PUT | `/v1/config/{module}` | Write module configuration |
| GET | `/v1/device/info` | Device info, firmware version |
| POST | `/v1/upgrade/upload` | Upload firmware package |
| GET | `/v1/record/list` | Query recordings by time range |

### WebSocket Events

| Event | Payload |
|-------|---------|
| AI detection result | Bounding boxes, class, confidence, timestamp |
| Storage alert | Available space, status |
| System status | CPU, memory, uptime |

### RTSP Stream URL Format

```
rtsp://<device-ip>:<port>/stream/<channel>
```

Default port: 554. Supports up to 5 concurrent RTSP connections.

---

## Roadmap

### Near-term
- [ ] WebRTC end-to-end encryption
- [ ] Expanded AI detection scenarios and custom model management
- [ ] AI inference performance optimization (quantization, NPU scheduling)

### Mid-term
- [ ] Cloud platform APP integration
- [ ] Mobile APP (iOS / Android)
- [ ] Developer SDK and documentation portal

### Long-term
- [ ] Additional hardware platforms and customization reference designs
- [ ] Edge AI model optimization (INT8, pruning)
- [ ] Multi-camera coordination

---

## Project Links

- **GitHub**: https://github.com/endless-sky-bee1/endless
- **Issues**: https://github.com/endless-sky-bee1/endless/issues
- **Email**: endless@endless-sky.onaliyun.com
