# Endless 系统架构文档

> 版本 1.0 · 2026 年 3 月

## 总览

Endless 采用严格分层架构。每一层只向上层暴露明确定义的接口，只依赖下层。这种设计确保了硬件可移植性（重新实现 HAL 即可更换 SoC）、服务模块化（按需编译）以及媒体管线、AI 服务与应用逻辑之间的清晰分离，并天然支持软硬件按项目定制。

---

## 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│  应用层                                                          │
│                                                                  │
│  ┌──────────────┐ ┌──────────┐ ┌────────┐ ┌───────────────┐   │
│  │  Web UI      │ │ REST API │ │  ONVIF │ │   GB28181     │   │
│  │  (Vue 3)     │ │ (HTTP/S) │ │        │ │   (SIP/PS)    │   │
│  └──────────────┘ └──────────┘ └────────┘ └───────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  高级服务层                                                      │
│                                                                  │
│  ┌─────────────────┐  ┌───────────────────────────────────┐    │
│  │  流媒体服务      │  │        AI 服务                    │    │
│  │  ┌────┐ ┌─────┐ │  │  ┌───────┐ ┌───────┐ ┌───────┐  │    │
│  │  │RTSP│ │WebRTC│ │  │  │ Agent │ │ Qwen  │ │Xiaozhi│  │    │
│  │  └────┘ └─────┘ │  │  └───────┘ └───────┘ └───────┘  │    │
│  │  ┌────────────┐  │  └───────────────────────────────────┘    │
│  │  │    RTMP    │  │                                            │
│  │  └────────────┘  │                                            │
│  └─────────────────┘                                            │
├─────────────────────────────────────────────────────────────────┤
│  基础业务层                                                      │
│                                                                  │
│  ┌───────┐ ┌──────┐ ┌───────┐ ┌──────┐ ┌──────┐ ┌────────┐   │
│  │媒体服务│ │录像管理│ │存储管理│ │文件管理│ │固件升级│ │规则引擎│   │
│  └───────┘ └──────┘ └───────┘ └──────┘ └──────┘ └────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  基础软件层                                                      │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌────────┐ ┌──────┐  │
│  │配置管理器 │ │ 事件总线  │ │ GStreamer  │ │ FFmpeg │ │SQLite│  │
│  └──────────┘ └──────────┘ └───────────┘ └────────┘ └──────┘  │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐                        │
│  │ OpenSSL  │ │  spdlog  │ │  libcurl  │                        │
│  └──────────┘ └──────────┘ └───────────┘                        │
├─────────────────────────────────────────────────────────────────┤
│  HAL — 硬件抽象层（纯 C 接口）                                   │
│                                                                  │
│  ┌───────┐ ┌───────┐ ┌────────┐ ┌────────────┐ ┌───────────┐  │
│  │ 视频  │ │ 音频  │ │  USB   │ │ AI 加速器  │ │  外设接口 │  │
│  │ (MPP) │ │       │ │(音频)  │ │(NPU/DSP)   │ │GPIO/IR/WDT│  │
│  └───────┘ └───────┘ └────────┘ └────────────┘ └───────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  内核层：Linux 5.10                                              │
│  SoC 驱动、V4L2、ALSA、USB、网络、看门狗                         │
├─────────────────────────────────────────────────────────────────┤
│  硬件层                                                          │
│  海思 3516CV610 · 3516CV608 · 3519DV500 · QEMU aarch64         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 各层说明

### 1. 硬件层

支持的 SoC：

| SoC | 系列 | NPU | 定位 |
|-----|------|-----|------|
| 海思 3516CV610 | CV6xx | 有 | 商用 IP 摄像头（产品 PA） |
| 海思 3516CV608 | CV6xx | 有 | 入门级 IP 摄像头 |
| 海思 3519DV500 | DV5xx | 有 | 高端 AI 摄像头 |
| QEMU aarch64 | — | 模拟 | 开发 & CI（产品 PB） |

所有 SoC 均通过海思 MPP（媒体处理平台）SDK 访问音视频管线。

### 2. 内核层

- **基础**：Linux 5.10 LTS
- **构建系统**：Buildroot（生成完整根文件系统）
- **关键驱动**：MPP 视频驱动、ALSA 音频、USB 音频、看门狗、I2C、GPIO、RTC、IR-CUT
- **网络栈**：标准 Linux TCP/IP、conntrack、iptables

### 3. HAL — 硬件抽象层

HAL 暴露**纯 C 接口**，将所有与硬件相关的代码隔离。上层永远不直接调用 MPP 或 SoC SDK。

**主要 HAL 子系统：**

| 子系统 | 职责 |
|--------|------|
| `hal/mpp/` | 视频采集、编解码（H.264/H.265/MJPEG），VENC/VPSS 管线 |
| `hal/ai/` | NPU 模型加载、推理调度、结果提取 |
| `hal/peripheral/` | GPIO 报警 I/O、IR-CUT 切换、RTC 时钟、看门狗 |
| `hal/mpp/audio/` | 音频采集、播放、编码（AAC/G.711/Opus） |
| `hal/common/` | 平台共用工具 |

移植到新 SoC 只需为该平台实现 HAL 接口，上层代码基本无需修改；如需新增板级外设，也可在 HAL 与设备配置层中独立扩展。

### 4. 基础软件层

为所有业务服务提供共享基础设施，也为软件能力裁剪与功能定制提供统一底座：

| 组件 | 职责 |
|------|------|
| **配置管理器** | JSON 分层配置、热重载、路径校验 |
| **事件总线** | 发布-订阅事件分发，跨服务解耦 |
| **GStreamer 1.18** | 媒体管线：WebRTC（ICE/DTLS/SRTP）、RTSP 源、音视频混流 |
| **FFmpeg 4.x** | 编解码处理、格式转换、缩略图提取 |
| **SQLite 3.x** | 录像索引、事件日志、配置缓存 |
| **OpenSSL 1.1.1** | HTTPS/WSS 的 TLS、证书管理、数据加密 |
| **spdlog** | 异步结构化日志，支持文件轮转 |
| **libcurl 7.x** |云端 AI API 调用的 HTTP 客户端 |

### 5. 基础业务层

作为独立 C++ 服务实现的核心设备功能：

| 服务 | 路径 | 主要职责 |
|------|------|---------|
| **媒体服务** | `base/media/` | 音视频流管理、优先级调度、打断/恢复 |
| **录像管理** | `base/record/` | 连续录像、时间索引 MP4 分段、循环覆盖 |
| **存储管理** | `base/storage/` | SD 卡生命周期、格式化、热插拔、空间监控 |
| **文件管理** | `base/file_manager/` | 录像文件 CRUD、下载 API |
| **升级服务** | `base/upgrade/` | 分块固件上传、签名验证、进度上报 |
| **规则引擎** | `base/rule_engine/` | 事件-条件-动作规则（如 AI 检测 → 录像 + 通知） |
| **设备发现** | `base/discovery/` | 基于 mDNS 的局域网设备发现 |
| **数据库服务** | `base/database/` | SQLite 抽象层、Schema 迁移 |
| **算法管理** | `base/algo/` | AI 算法生命周期、模型热加载、标签管理 |
| **系统服务** | `base/system_service/` | 看门狗喂狗、系统状态、重启、恢复出厂 |
| **网络配置** | `base/network/` | 以太网配置（DHCP/静态 IP）、NTP 同步 |
| **Web 服务器** | `base/web_server/` | HTTP/HTTPS/WebSocket 服务器、请求路由 |

### 6. 高级服务层

组合基础层能力的上层服务：

#### 6.1 流媒体服务（`foundation/stream_service/`）

管理所有对外媒体流：

| 协议 | 实现 |
|-----|------|
| RTSP | GStreamer rtspclientsink / 自定义 RTSP 服务器 |
| WebRTC | GStreamer WebRTC 插件，ICE/STUN/TURN 协商，通过 WebSocket 信令（`/v1/webrtc`） |
| RTMP | GStreamer rtmpsink，支持 RTMPS（TLS） |

流媒体服务在多个流消费者（RTSP 客户端、WebRTC 浏览器、RTMP 推流目标）与 HAL 单一 GStreamer 源管线之间进行仲裁。

#### 6.2 AI 服务

| 服务 | 路径 | 说明 |
|-----|------|------|
| **Agent** | `foundation/agent/` | 多模态 AI Agent：语音输入 → LLM 推理 → 工具调用 → 语音输出 |
| **Qwen** | `foundation/qwen/` | Qwen3-Omni SDK 适配器：实时音视频 → 文本/语音回复 |
| **阿里云** | `foundation/aliyun/` | 阿里云千问 VL REST 客户端：抓图 → 图像理解 |
| **小智** | `foundation/xiaozhi/` | 小智 AI 语音对话：语音识别 → 对话 → 语音合成 |
| **MCP** | `foundation/mcp/` | MCP 协议服务器，用于 Agent 工具暴露 |

#### 6.3 协议服务

| 服务 | 路径 | 标准 |
|-----|------|------|
| **ONVIF** | `foundation/onvif/` | WS-Discovery、ONVIF 媒体/设备配置文件 |
| **GB28181** | `foundation/gb28181/` | SIP UA、PS 流、目录及实时取流 |
| **RESTful API** | `foundation/restful/` | JWT 鉴权 HTTP API，全设备控制 |
| **协议抽象** | `foundation/protocol/` | WebSocket 事件帧抽象适配器 |

### 7. 应用层

#### Web UI（`foundation/web_page/`）

基于 Vue 3 的单页应用：

| 模块 | 路径 | 功能 |
|-----|------|------|
| 实时预览 | `components/live/` | WebRTC 播放器、AI 检测框叠加、截图 |
| 配置管理 | `components/camera/` | 视频、音频、OSD 参数表单 |
| 网络设置 | `components/network/` | 以太网、RTSP/RTMP、GB28181、ONVIF 配置 |
| 智能功能 | `components/intelligence/` | 算法开关、模型上传、标签编辑 |
| Agent | `components/agent/` | AI 对话界面、Qwen 配置、语音测试 |
| 录像回放 | `components/record/` | 录像时间轴、分段播放、下载 |
| 系统管理 | `components/system/` | 用户管理、升级、Web 终端、恢复出厂 |

#### RESTful API

通过 HTTP/HTTPS 提供完整 API。通过挑战-响应登录获取 JWT Token，过期自动刷新。

API 分组：`auth`、`config`、`device`、`network`、`media`、`record`、`upgrade`、`algo`、`agent`、`event`、`log`。

### 8. 定制化路径

- **硬件定制**：新增 SoC、板级配置、GPIO/USB 音频/IR-CUT/看门狗等外设适配，主要落在 `device/` 与 `hal/`
- **软件定制**：按产品需求裁剪流媒体、AI、存储、协议、Web UI 与 API 模块，主要落在 `base/`、`foundation/` 与 `applications/`
- **项目交付**：可组合不同硬件平台、协议能力、AI 服务与前端界面，形成面向不同客户场景的产品版本

---

## 关键数据流

### 视频预览（WebRTC）

```
摄像头传感器
    → HAL 视频采集（MPP VENC）
    → GStreamer 管线（H.264 编码）
    → 流媒体服务 WebRTC 发布者
    → ICE/DTLS 协商（WebSocket 信令 /v1/webrtc）
    → 浏览器 WebRTC 接收
    → Canvas 渲染 + AI 检测框叠加
```

### AI 检测（本地）

```
HAL 视频帧（YUV）
    → HAL AI 加速器（NPU 推理，YOLOv8）
    → 算法管理器（结果解析、标签映射）
    → 事件总线（发布检测事件）
    → 规则引擎（触发条件判断）
    → WebSocket 推送至浏览器 / 录像标注
```

### 语音 Agent 交互

```
USB 麦克风
    → HAL 音频采集
    → 小智 AI / Qwen3-Omni（语音识别）
    → Agent（意图解析、工具选择）
    → 工具调用：抓图 → 千问 VL（图像分析）
    → Agent（组织回答）
    → TTS → HAL 音频播放 → 扬声器
```

### 固件升级

```
浏览器 → POST /v1/upgrade/upload（分块 multipart）
    → 升级服务（签名校验）
    → Flash 写入
    → 系统重启
    → 全程 WebSocket 推送进度事件
```

---

## 目录结构

```
endless/
├── applications/endless/     # 主 IPC 应用（服务编排、主循环）
├── base/                     # 基础业务服务（媒体、录像、存储……）
├── common/utils/             # 共用工具（线程池、内存池、日志）
├── device/                   # 板级与 SoC 配置
│   ├── board/3516cv610/      # 内核配置、rootfs overlay、产品定义
│   ├── board/3516cv608/
│   ├── board/3519dv500/
│   └── qemu/                 # QEMU overlay，测试素材
├── foundation/               # 高级服务
│   ├── agent/                # AI Agent
│   ├── aliyun/               # 阿里云千问集成
│   ├── qwen/                 # Qwen SDK
│   ├── xiaozhi/              # 小智 AI 语音
│   ├── mcp/                  # MCP 协议
│   ├── gb28181/              # GB28181
│   ├── onvif/                # ONVIF
│   ├── restful/              # REST API
│   ├── stream_service/       # RTSP / WebRTC / RTMP
│   ├── web_page/             # Vue 3 前端
│   └── protocol/             # 协议抽象
├── hal/                      # 硬件抽象层
│   ├── mpp/                  # 音视频 MPP
│   ├── ai/                   # NPU / AI 加速器
│   └── peripheral/           # GPIO、IR-CUT、看门狗、RTC
├── third_party/              # 托管第三方依赖
├── docs/                     # 项目文档
├── build.sh                  # 顶层构建脚本
└── CMakeLists.txt            # 根 CMake
```

---

## 构建系统

### 构建命令

```bash
# 格式：./build.sh <产品> <命令> [模式]
./build.sh pa build release    # 3516CV610 发布构建
./build.sh pa all release      # 构建 + 打包固件镜像
./build.sh pb build debug      # QEMU aarch64 调试构建
```

### 输出产物

| 路径 | 内容 |
|------|------|
| `out/bin/` | 可执行文件 |
| `out/lib/` | 共享库 |
| `out/web_page/` | 构建后的 Vue.js 前端 |
| `out/image/` | 可烧录固件镜像（使用 `all` 命令时生成） |

### 交叉编译工具链

| 平台 | 编译器 | 路径 |
|-----|--------|------|
| 3516CV610 / 3516CV608 | `arm-v01c02-linux-musleabi-gcc` | `device/soc/hisilicon/3516cv610` |
| aarch64（QEMU） | `aarch64-linux-gnu-gcc` | 系统或 Buildroot |

---

## 性能目标

| 指标 | 目标值 |
|-----|-------|
| WebRTC 延迟 | < 500ms |
| RTSP 延迟 | < 1s |
| AI 检测准确率 | > 85%（人形/车形） |
| 24h 录像容量 | 32GB SD 卡，1080P，1Mbps |
| CPU 使用率（正常工作） | < 70% |
| 内存占用 | < 256MB |
| 冷启动时间 | < 60s |
| RTSP 并发连接数 | 5 路 |
| 系统稳定性目标 | 连续运行 7 天无重启 |

---

## 安全设计

| 领域 | 机制 |
|------|------|
| 传输安全 | 所有 HTTPS 和 WSS 使用 TLS 1.2+ |
| 认证 | 挑战-响应（HMAC-SHA256），防暴力破解锁定 |
| 会话 | JWT 短期有效 + Refresh Token 轮换 |
| 配置存储 | AES 加密敏感信息 |
| 固件完整性 | 烧录前 RSA 签名验证 |
| 安全启动 | 平台相关（海思 eFuse 机制） |
| 漏洞管理 | 定期依赖项审计，Buildroot 安全补丁 |

---

## 联系方式

- **GitHub**：https://github.com/endless-sky-bee1/endless
- **邮箱**：endless@endless-sky.onaliyun.com
