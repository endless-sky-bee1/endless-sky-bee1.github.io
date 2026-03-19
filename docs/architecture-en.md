# Endless System Architecture

> Version 1.0 · March 2026

## Overview

Endless is structured as a strict layered architecture. Each layer exposes a well-defined interface to the layer above and depends only on the layer below. This design ensures hardware portability (swap SoC by reimplementing HAL), service modularity (compile only needed services), clear separation of concerns between media pipeline, AI services, and application logic, and a clean path for hardware/software customization.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  APPLICATION LAYER                                               │
│                                                                  │
│  ┌──────────────┐ ┌──────────┐ ┌────────┐ ┌───────────────┐   │
│  │  Web UI      │ │ REST API │ │  ONVIF │ │   GB28181     │   │
│  │  (Vue 3)     │ │ (HTTP/S) │ │        │ │   (SIP/PS)    │   │
│  └──────────────┘ └──────────┘ └────────┘ └───────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  FOUNDATION SERVICES                                             │
│                                                                  │
│  ┌─────────────────┐  ┌───────────────────────────────────┐    │
│  │  Stream Service  │  │        AI Services                │    │
│  │  ┌────┐ ┌─────┐ │  │  ┌───────┐ ┌───────┐ ┌───────┐  │    │
│  │  │RTSP│ │WebRTC│ │  │  │ Agent │ │ Qwen  │ │Xiaozhi│  │    │
│  │  └────┘ └─────┘ │  │  └───────┘ └───────┘ └───────┘  │    │
│  │  ┌────────────┐  │  └───────────────────────────────────┘    │
│  │  │    RTMP    │  │                                            │
│  │  └────────────┘  │                                            │
│  └─────────────────┘                                            │
├─────────────────────────────────────────────────────────────────┤
│  BASE BUSINESS LAYER                                             │
│                                                                  │
│  ┌───────┐ ┌──────┐ ┌───────┐ ┌──────┐ ┌──────┐ ┌────────┐   │
│  │ Media │ │Record│ │Storage│ │File  │ │Upgrad│ │  Rule  │   │
│  │Service│ │ Mgr  │ │  Mgr  │ │ Mgr  │ │  e   │ │ Engine │   │
│  └───────┘ └──────┘ └───────┘ └──────┘ └──────┘ └────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  BASE SOFTWARE LAYER                                             │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌────────┐ ┌──────┐  │
│  │Config Mgr│ │ Event Bus │ │ GStreamer  │ │ FFmpeg │ │SQLite│  │
│  └──────────┘ └──────────┘ └───────────┘ └────────┘ └──────┘  │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐                        │
│  │ OpenSSL  │ │  spdlog  │ │   libcurl │                        │
│  └──────────┘ └──────────┘ └───────────┘                        │
├─────────────────────────────────────────────────────────────────┤
│  HAL — Hardware Abstraction Layer (pure C interface)             │
│                                                                  │
│  ┌───────┐ ┌───────┐ ┌────────┐ ┌────────────┐ ┌───────────┐  │
│  │ Video │ │ Audio │ │  USB   │ │AI Accel    │ │Peripheral │  │
│  │ (MPP) │ │       │ │(Audio) │ │(NPU/DSP)   │ │GPIO/IR/WDT│  │
│  └───────┘ └───────┘ └────────┘ └────────────┘ └───────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  KERNEL LAYER: Linux 5.10                                        │
│  SoC drivers, V4L2, ALSA, USB, network, watchdog               │
├─────────────────────────────────────────────────────────────────┤
│  HARDWARE                                                        │
│  Hi3516CV610 · Hi3516CV608 · Hi3519DV500 · QEMU aarch64        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layer Descriptions

### 1. Hardware Layer

Supported SoCs:

| SoC | Series | NPU | Target |
|-----|--------|-----|--------|
| Hisilicon 3516CV610 | CV6xx | Yes | Commercial IP camera (Product PA) |
| Hisilicon 3516CV608 | CV6xx | Yes | Entry-level IP camera |
| Hisilicon 3519DV500 | DV5xx | Yes | High-end AI camera |
| QEMU aarch64 | — | Emulated | Development & CI (Product PB) |

All SoCs share the Hisilicon MPP (Media Processing Platform) SDK for video/audio pipeline access.

### 2. Kernel Layer

- **Base**: Linux 5.10 LTS
- **Build system**: Buildroot (generates full root filesystem)
- **Key drivers**: MPP video driver, ALSA audio, USB audio gadget, watchdog, I2C, GPIO, RTC, IR-CUT
- **Network stack**: Standard Linux TCP/IP, conntrack, iptables

### 3. HAL — Hardware Abstraction Layer

The HAL exposes **pure C interfaces** to isolate all hardware-specific code. Upper layers never call MPP or SoC SDK directly.

**Key HAL subsystems:**

| Subsystem | Responsibility |
|-----------|---------------|
| `hal/mpp/` | Video capture, encode, decode (H.264/H.265/MJPEG), VENC/VPSS pipeline |
| `hal/ai/` | NPU model loading, inference scheduling, result extraction |
| `hal/peripheral/` | GPIO alarm I/O, IR-CUT switching, RTC clock, watchdog |
| `hal/mpp/audio/` | Audio capture, playback, encoding (AAC/G.711/Opus) |
| `hal/common/` | Platform-shared utilities |

Porting to a new SoC mainly requires implementing HAL interfaces for that platform, while upper layers stay mostly unchanged; new board peripherals can also be extended independently in HAL and device configuration.

### 4. Base Software Layer

Provides shared infrastructure for all business services and a stable base for software tailoring and feature-level customization:

| Component | Role |
|----------|------|
| **Config Manager** | JSON-based hierarchical configuration, hot reload, path validation |
| **Event Bus** | Publish-subscribe event dispatch, cross-service decoupling |
| **GStreamer 1.18** | Media pipeline: WebRTC (ICE/DTLS/SRTP), RTSP source, audio/video mux |
| **FFmpeg 4.x** | Codec processing, format conversion, thumbnail extraction |
| **SQLite 3.x** | Recording index, event log, configuration cache |
| **OpenSSL 1.1.1** | TLS for HTTPS/WSS, certificate management, data encryption |
| **spdlog** | Structured async logging with rotation |
| **libcurl 7.x** | HTTP client for cloud AI API calls |

### 5. Base Business Layer

Core device functionality implemented as independent C++ services:

| Service | Location | Key responsibility |
|--------|---------|-------------------|
| **Media Service** | `base/media/` | Audio/video stream management, priority scheduling, interrupt/resume |
| **Record Manager** | `base/record/` | Continuous recording, time-indexed MP4 segments, loop-overwrite policy |
| **Storage Manager** | `base/storage/` | SD card lifecycle, format, hot-plug, space monitoring |
| **File Manager** | `base/file_manager/` | Recording file CRUD, download API |
| **Upgrade Service** | `base/upgrade/` | Chunked firmware upload, signature verification, progress reporting |
| **Rule Engine** | `base/rule_engine/` | Event-condition-action rules (e.g., AI detection → record + notify) |
| **Discovery** | `base/discovery/` | mDNS-based LAN device discovery |
| **Database Service** | `base/database/` | SQLite abstraction layer, schema migration |
| **Algo Manager** | `base/algo/` | AI algorithm lifecycle, model hot-load, label management |
| **System Service** | `base/system_service/` | Watchdog feeding, system status, reboot, factory reset |
| **Network** | `base/network/` | Ethernet config (DHCP/static), NTP sync |
| **Web Server** | `base/web_server/` | HTTP/HTTPS/WebSocket server, request routing |

### 6. Foundation Services

Higher-level services that compose base layer capabilities:

#### 6.1 Stream Service (`foundation/stream_service/`)

Manages all outbound media streams:

| Protocol | Implementation |
|---------|---------------|
| RTSP | GStreamer `rtspclientsink` / custom RTSP server |
| WebRTC | GStreamer WebRTC plugin, ICE/STUN/TURN negotiation, signaling via WebSocket |
| RTMP | GStreamer `rtmpsink`, supports RTMPS (TLS) |

The stream service arbitrates between stream consumers (RTSP clients, WebRTC browsers, RTMP destinations) and the single GStreamer source pipeline from HAL.

#### 6.2 AI Services

| Service | Location | Description |
|--------|---------|-------------|
| **Agent** | `foundation/agent/` | Multi-modal AI agent: voice input → LLM reasoning → tool call → voice output |
| **Qwen** | `foundation/qwen/` | Qwen3-Omni SDK adapter: real-time audio + video → text/speech response |
| **Aliyun** | `foundation/aliyun/` | Alibaba Cloud Qwen-VL REST client: snapshot → image understanding |
| **Xiaozhi** | `foundation/xiaozhi/` | Xiaozhi AI voice dialog: speech-to-text → dialog → text-to-speech |
| **MCP** | `foundation/mcp/` | Model Context Protocol server for agent tool exposure |

#### 6.3 Protocol Services

| Service | Location | Standard |
|--------|---------|---------|
| **ONVIF** | `foundation/onvif/` | WS-Discovery, ONVIF media/device profile |
| **GB28181** | `foundation/gb28181/` | SIP UA, PS stream, catalog and real-play |
| **RESTful API** | `foundation/restful/` | JWT-secured HTTP API, full device control |
| **Protocol** | `foundation/protocol/` | Abstract protocol adapter (WebSocket event framing) |

### 7. Application Layer

#### Web UI (`foundation/web_page/`)

Single-page application built with Vue 3:

| Module | Path | Function |
|-------|------|---------|
| Live Preview | `components/live/` | WebRTC player, AI detection overlay, screenshot |
| Configuration | `components/camera/` | Video, audio, OSD parameter forms |
| Network | `components/network/` | Ethernet, RTSP/RTMP, GB28181, ONVIF config |
| Intelligence | `components/intelligence/` | Algorithm enable/disable, model upload, label editor |
| Agent | `components/agent/` | AI agent chat UI, Qwen config, voice testing |
| Playback | `components/record/` | Recording timeline, segment playback, download |
| System | `components/system/` | User management, upgrade, web terminal, factory reset |

#### RESTful API

Full API surface over HTTP/HTTPS. JWT tokens obtained via challenge-response login. Token auto-refresh on expiry.

API groups: `auth`, `config`, `device`, `network`, `media`, `record`, `upgrade`, `algo`, `agent`, `event`, `log`.

### 8. Customization Path

- **Hardware customization**: add SoCs, board profiles, and peripherals such as GPIO, USB audio, IR-CUT, and watchdog primarily under `device/` and `hal/`
- **Software customization**: tailor streaming, AI, storage, protocol, web UI, and API modules primarily under `base/`, `foundation/`, and `applications/`
- **Delivery composition**: combine hardware platforms, protocol capabilities, AI services, and front-end experience into customer-specific product variants

---

## Key Data Flows

### Video Preview (WebRTC)

```
Camera Sensor
    → HAL Video Capture (MPP VENC)
    → GStreamer pipeline (H.264 encode)
    → Stream Service WebRTC publisher
    → ICE/DTLS negotiation (WebSocket signaling at /v1/webrtc)
    → Browser WebRTC receiver
    → Canvas render + AI overlay
```

### AI Detection (Local)

```
HAL Video Frame (YUV)
    → HAL AI Accelerator (NPU inference, YOLOv8)
    → Algo Manager (result parsing, label mapping)
    → Event Bus (detection event published)
    → Rule Engine (trigger check)
    → WebSocket push to browser / Record annotation
```

### Voice Agent Interaction

```
USB Microphone
    → HAL Audio Capture
    → Xiaozhi / Qwen3-Omni (speech recognition)
    → Agent (intent parsing, tool selection)
    → Tool call: snapshot → Qwen-VL (image analysis)
    → Agent (compose response)
    → TTS → HAL Audio Playback → Speaker
```

### Firmware Upgrade

```
Browser → POST /v1/upgrade/upload (multipart, chunked)
    → Upgrade Service (signature verify)
    → Flash write
    → System reboot
    → WebSocket progress events during all phases
```

---

## Directory Structure

```
endless/
├── applications/endless/     # Main IPC application (service wiring, main loop)
├── base/                     # Base business services (media, record, storage …)
├── common/utils/             # Shared utilities (thread pool, memory pool, log)
├── device/                   # Board & SoC configuration
│   ├── board/3516cv610/      # Kernel config, rootfs overlay, product definition
│   ├── board/3516cv608/
│   ├── board/3519dv500/
│   └── qemu/                 # QEMU overlay, test assets
├── foundation/               # Higher-level services
│   ├── agent/                # AI Agent
│   ├── aliyun/               # Alibaba Cloud Qwen integration
│   ├── qwen/                 # Qwen SDK
│   ├── xiaozhi/              # Xiaozhi AI voice
│   ├── mcp/                  # MCP protocol
│   ├── gb28181/              # GB28181
│   ├── onvif/                # ONVIF
│   ├── restful/              # REST API
│   ├── stream_service/       # RTSP / WebRTC / RTMP
│   ├── web_page/             # Vue 3 frontend
│   └── protocol/             # Protocol abstraction
├── hal/                      # Hardware Abstraction Layer
│   ├── mpp/                  # Video/audio MPP
│   ├── ai/                   # NPU / AI accelerator
│   └── peripheral/           # GPIO, IR-CUT, watchdog, RTC
├── third_party/              # Vendored dependencies
├── docs/                     # Project documentation
├── build.sh                  # Top-level build script
└── CMakeLists.txt            # Root CMake
```

---

## Build System

### Build Commands

```bash
# Format: ./build.sh <product> <command> [mode]
./build.sh pa build release    # 3516CV610 release build
./build.sh pa all release      # Build + package firmware image
./build.sh pb build debug      # QEMU aarch64 debug build
```

### Outputs

| Path | Content |
|------|---------|
| `out/bin/` | Executable binaries |
| `out/lib/` | Shared libraries |
| `out/web_page/` | Built Vue.js frontend |
| `out/image/` | Flashable firmware image (when using `all`) |

### Toolchains

| Platform | Compiler | Path |
|---------|---------|------|
| 3516CV610 / 3516CV608 | `arm-v01c02-linux-musleabi-gcc` | `device/soc/hisilicon/3516cv610` |
| aarch64 (QEMU) | `aarch64-linux-gnu-gcc` | System or Buildroot |

---

## Performance Targets

| Metric | Target |
|-------|--------|
| WebRTC latency | < 500 ms |
| RTSP latency | < 1 s |
| AI detection accuracy | > 85 % (person/vehicle) |
| 24h recording capacity | 32 GB SD card, 1080p, 1 Mbps |
| CPU usage (normal) | < 70 % |
| Memory footprint | < 256 MB |
| Cold boot time | < 60 s |
| Concurrent RTSP clients | 5 |
| System stability target | 7-day continuous operation without restart |

---

## Security Design

| Area | Mechanism |
|------|-----------|
| Transport | TLS 1.2+ for all HTTPS and WSS |
| Authentication | Challenge-response (HMAC-SHA256), anti-brute-force lockout |
| Session | JWT with short expiry + refresh token rotation |
| Config storage | AES encryption for secrets |
| Firmware integrity | RSA signature verification before flash |
| Secure boot | Platform-dependent (Hisilicon eFuse-based) |
| Vulnerability mgmt | Periodic dependency audit, Buildroot security patches |

---

## Contact

- **GitHub**: https://github.com/endless-sky-bee1/endless
- **Email**: endless@endless-sky.onaliyun.com
