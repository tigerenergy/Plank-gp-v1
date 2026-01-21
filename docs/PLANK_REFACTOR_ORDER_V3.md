# 🚨 PLANK Project Refactoring & Fix Orders (V3.0 - FINAL)

> **[Critical Warning for Agent]**
> 이 문서는 단순한 가이드가 아닙니다. **반드시 이행해야 할 절대적인 명령서**입니다.
> 특히 **UI/UX 퀄리티가 낮거나(조악함), 사용자가 작성 중인 데이터가 날아간다면 작업은 실패로 간주합니다.**
> "대충 기능만 돌아가는" 수준의 코드는 절대 작성하지 마십시오.

---

## 1. 🎨 UI/UX & Design Quality (High Priority)

**[Requirement]** **"상용 SaaS 제품 수준의 디자인"**을 구현하십시오.
단순히 요소만 배치하는 것은 불허합니다. 다음 기준을 만족해야 합니다.

1.  **Pixel Perfection:** 여백(Margin/Padding), 폰트 크기, 줄 간격이 일정하고 균형 잡혀야 합니다.
2.  **Visual Hierarchy:** 제목, 본문, 메타 정보(날짜, 작성자)의 위계가 폰트 굵기와 색상으로 명확히 구분되어야 합니다.
3.  **Interaction:** 버튼, 카드, 리스트에 `hover`, `active`, `focus` 상태가 자연스러운 애니메이션(transition)으로 적용되어야 합니다.
4.  **Contrast:** 다크 모드/라이트 모드에서 텍스트 가독성이 완벽해야 합니다. (배경색과 글자색이 뭉개지면 안 됨).
5.  **Empty States:** 데이터가 없을 때 텅 빈 화면 대신, 세련된 일러스트나 안내 문구(Empty State UI)를 보여주십시오.

---

## 2. 📅 Calendar Library (Flexible but Strict)

**[Constraint]** 기존의 못생긴 Datepicker는 즉시 폐기하십시오.
**[Order]**

- **Library:** `react-day-picker` (shadcn/ui 스타일), `react-calendar` 등 **디자인이 수려하고 커스터마이징이 쉬운 라이브러리**를 자유롭게 선택하십시오.
- **Condition:**
  1.  **No Conflicts:** 기존 패키지와 의존성 충돌이 절대 없어야 합니다.
  2.  **Design:** 모달 팝업 형태로 뜨며, 테마(Dark/Light)에 완벽하게 녹아들어야 합니다.
  3.  **UX:** 날짜 선택 과정이 직관적이어야 합니다.

---

## 3. 💾 Auto-Save / Draft Persistence (SPA Essential)

**[Core Requirement]** 사용자가 글을 쓰다가 **새로고침을 하거나 창을 닫았다 켜도, 작성 중이던 내용은 100% 복구되어야 합니다.**

- **Tech:** `zustand`의 `persist` middleware 사용.
- **Target:**
  - 카드 생성 제목, 설명
  - 댓글 작성 내용
  - 보드 생성 제목
- **Behavior:** `onSubmit` 성공 시에만 스토어를 비우십시오(Clear). 그 전까지는 무조건 유지되어야 합니다.

---

## 4. 🧹 State Management (Zustand Only)

**[Order]** `useState` 떡칠 금지.

- 모든 전역 상태(데이터, 모달, 드래프트)는 **Zustand Store**로 중앙 집중 관리하십시오.
- 컴포넌트 간 Prop Drilling을 제거하고 Store에서 직접 구독(Subscribe) 하십시오.

---

## 5. 🔐 Logic & Permissions

**관리자 없이도 돌아가는 시스템을 만드십시오.**

- **생성자(Creator) 권한:**
  - 보드: 만든 사람(`created_by`)만 삭제/수정 가능.
  - 카드/댓글: 작성자 본인만 삭제/수정 가능.
  - **UI:** 권한 없는 사람에게는 수정/삭제 버튼을 아예 **렌더링하지 마십시오(Hidden).**
- **Avatar:** 카드 우측 하단(Bottom-Right)에 생성자의 미니 아바타를 배치하여 소유권을 시각화하십시오.
- **Checklist:** 사용자가 체크박스를 누를 때만 게이지가 찹니다. (0%일 땐 회색, 100%일 땐 초록색 강조).

---

## 6. 🛠️ Bug Fixes (Immediate Action)

1.  **댓글 수정:** 수정 모드 진입 불가 및 업데이트 실패 버그 해결.
2.  **Mock Data:** 로딩 시 잠깐 보이는 가짜 데이터(Lorem Ipsum 등)를 코드에서 완전히 박멸하십시오. Skeleton UI로 대체하십시오.

---

## ✅ Final Verification Criteria

에이전트는 코드 작성 후 스스로 다음을 자문하십시오.

1.  _"이 디자인이 돈 받고 파는 서비스 수준인가?"_ (아니라면 다시 하십시오)
2.  _"새로고침 해도 내가 쓰던 댓글이 남아있는가?"_
3.  _"달력이 예쁘고 깨지지 않는가?"_
4.  _"내 글은 내가 지울 수 있고, 남의 글은 못 건드리는가?"_
