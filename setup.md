# 📄 G-CAMP 고도화 프로젝트 프론트엔드 구성 계획서

## 1. 프로젝트 개요

- **프로젝트명**: G-CAMP 스마트팜 고도화
- **프론트엔드**: React Native (Expo Managed Workflow)
- **백엔드**: Java Spring Boot (GCP 기반)
- **핵심 인프라**: Google Cloud Platform (GCP) & Firebase (FCM)
- **핵심 포인트**:
    - **사내 앱 전문 인력 부재**: 유지보수 편의성을 위해 모든 네이티브 설정을 Expo가 관리하는 Managed Workflow를 채택합니다.
    - **GCP 기반 통합 인프라**: 구글 협력사 혜택을 활용하여 GCP 프로젝트 내에서 Firebase를 활성화하고 푸시 알림 및 데이터 분석을 통합 관리합니다.
    - **실시간 모니터링 및 제어**: CCTV(HLS) 스트리밍과 MQTT 기반 시설 장치 제어 기능을 구현합니다.

---

## 2. 기술 스택 및 라이브러리 (Front-end)

앱 개발자가 없는 환경에서도 웹 개발 역량으로 유지보수가 용이하도록 가벼운 도구들로 구성합니다.

- **Framework**: **Expo SDK (Latest)**
    - 네이티브 코드(Java/Swift) 수정 없이 `app.json` 설정만으로 앱을 운영하고 빌드합니다.
- **State Management**: **Zustand**
    - **선정 이유**: 프로젝트 규모 대비 무거운 라이브러리 대신, 학습 곡선이 낮고 매우 가벼운 Zustand를 사용하여 상태 관리 로직을 최소화합니다.
- **Push Notification**: **Expo Notifications**
    - Expo 서버를 경유하여 단일 로직으로 Android(FCM)와 iOS(APNs) 푸시를 통합 발송합니다.
- **UI/Styling**: **NativeWind (Tailwind CSS)**
    - 웹 개발자에게 익숙한 유틸리티 클래스 기반 스타일링으로 빠른 UI 수정이 가능합니다.
- **Visualization**: **Victory Native** 또는 **React Native Gifted Charts**
    - 8각 방사형 차트(Radar Chart) 및 시세 예측 그래프(점선/실선)를 구현합니다.
- **Communication**:
    - **Axios**: 백엔드 RESTful API 통신.
    - **React Native Paho MQTT**: 센서 데이터 실시간 수신 및 제어 명령 전송.

---

## 3. GCP 및 Firebase 통합 인프라 구성

GCP 협력사 계정을 기반으로 앱 운영에 필요한 모든 구글 서비스를 연동합니다.

| 서비스 | 용도 | 포인트 |
| --- | --- | --- |
| **GCP Project** | 전체 자원 관리 | 협력사 크레딧 적용 및 권한 관리 주체 |
| **Firebase (FCM)** | **App Push 엔진** | 구글의 메시징 서비스. Android 푸시 발송의 필수 엔진 |
| **EAS (Expo)** | 클라우드 빌드 및 배포 | **인력 부재 시 필수.** 클라우드에서 빌드 및 배포 자동화 수행 |
| **Cloud Run** | 백엔드(Spring) 배포 | 관리 인력이 없어도 트래픽에 따라 자동 확장되는 서버리스 환경 |
| **Maps API** | 농가 주소 및 위치 | 도로명 주소 API 연동 및 농가 위치 좌표 식별 |
| **SaaS (External)** | **RTSP to HLS 변환** | CCTV RTSP 신호를 모바일 재생용 HLS로 변환 |

---

## 4. Expo Push Notification 상세 구조

사내 앱 개발자가 없어도 Expo의 관리형 서비스를 통해 푸시 시스템을 쉽게 운영할 수 있습니다.

- **동작 원리**:
    1. **토큰 획득**: 앱 실행 시 고유 푸시 토큰을 생성하여 백엔드 DB에 저장합니다.
    2. **알림 트리거**: 백엔드(Spring)에서 이벤트(예: 고온 경보) 발생 시 API 서버로 메시지를 전송합니다.
    3. **최종 전달**: Expo 서버가 이를 전달받아 **Firebase(FCM)**를 통해 안드로이드 기기에 알림을 쏩니다.
- **운영적 장점**:
    - **플랫폼 통합**: Android/iOS 개별 구현 없이 공통 코드로 양쪽 모두 발송 가능합니다.
    - **수동 발송 지원**: 비상시 Firebase 콘솔에서 개발자 도움 없이 직접 수동 푸시 발송이 가능합니다.

---

## 5. 유지보수 및 예외 처리 전략 (운영 최우선)

사람의 손이 덜 가도록 자동화된 대응 체계를 구축합니다.

### 5.1 로딩 및 상호작용 (Loading)

- **Skeleton UI**: 데이터 조회 시 Shimmer 애니메이션을 적용하여 체감 로딩 속도를 높입니다.
- **Spinner Overlay**: 제어 명령 전송(측창 열기 등) 시 화면 터치를 차단하여 오작동을 방지합니다.

### 5.2 예외 처리 (Exception)

- **Firebase Crashlytics**: 앱 오류 발생 시 자동으로 로그를 수집하여 리포트합니다.
- **네트워크 오류**: 연결 끊김 시 "다시 시도" 버튼이 포함된 에러 페이지를 제공합니다.
- **장비 미응답**: 센서 수치 대신 `-` 표시 및 "전원 확인" 안내 문구를 노출합니다.
- **강제 업데이트**: 치명적 버그 시 앱스토어 심사 없이 **EAS Update**로 즉시 배포하고 업데이트 모달을 띄웁니다.

---

## 6. 초기 구축 체크리스트

- [ ]  **회사 전용 Expo Organization 생성**: 법인 카드 기반 EAS Plan 구독
- [ ]  **GCP 내 Firebase 프로젝트 활성화**: FCM 설정을 위한 프로젝트 연동
- [ ]  **Apple/Google 개발자 계정**: 회사 명의 등록 및 연회비 결제
- [ ]  **~~CCTV 변환 SaaS 선정**: RTSP 주소를 HLS로 변환해줄 서비스 계정 확보~~
- [ ]  **백엔드(Spring) 명세 확보**: REST API, MQTT 토픽, Push API 연동 규격 확정