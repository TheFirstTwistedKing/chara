# chara — GitHub Pages에 올리기

이 ZIP은 빌드가 끝난 사이트입니다. 별도의 프로그램 설치나 빌드 없이 GitHub에 올릴 수 있습니다.

## 현재 저장소에서 적용하기

1. `chara-updated-pages.zip`을 압축 해제합니다.
2. https://github.com/TheFirstTwistedKing/chara 를 엽니다.
3. `Add file → Upload files`를 누릅니다.
4. 압축을 푼 **폴더 안의 파일과 폴더**를 모두 올립니다. `index.html`, `assets/`, `fonts/`, `rasyancut-logo.png`가 저장소 최상위에 있어야 합니다. ZIP 파일 자체나 파일을 감싼 상위 폴더를 올리지 마세요.
5. `Commit changes`로 저장합니다. 기존 원본 소스 파일이 함께 있어도 최상위의 새 `index.html`로 사이트가 열립니다.
6. 저장소의 `Settings → Pages`에서 `Deploy from a branch`, `main`, `/(root)`를 선택하고 `Save`를 누릅니다. 이미 이 설정이라면 파일을 올리면 새 배포가 시작됩니다.
7. Pages 화면에 배포 완료가 표시되면 `Visit site`를 누릅니다. 갱신은 보통 몇 분 걸리고, GitHub 안내에서는 최대 10분 정도 걸릴 수 있다고 설명합니다.

기본 접속 주소: https://thefirsttwistedking.github.io/chara/

Pages 설정: https://github.com/TheFirstTwistedKing/chara/settings/pages
업로드 화면: https://github.com/TheFirstTwistedKing/chara/upload/main

예전 설명서가 계속 보이면 배포 완료 후 Ctrl+F5로 새로고침하세요. 최상위에 `index.html`이 올라갔는지도 확인하세요.

GitHub 공식 안내: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## 저장 방식

캐릭터 편집, 대사 생성, 색상, 능력·전투 설정, 사진 추가, 슬롯 저장·불러오기·삭제, JSON 백업과 이미지 시트 내보내기를 제공합니다.

ChatGPT 로그인 없이 사용할 수 있습니다. 캐릭터와 사진은 현재 브라우저에 저장되며 다른 기기나 브라우저에 자동으로 동기화되지 않습니다. 브라우저 데이터를 지우면 저장본도 사라질 수 있으니 JSON 백업을 내려받아 보관하세요. JSON에는 사진과 설정이 함께 포함됩니다.

원본 사이트에 저장된 슬롯·사진은 자동으로 옮겨지지 않습니다. 원본 사이트에서 사진까지 포함한 JSON 백업을 내보낸 뒤 이 버전에서 불러오면 됩니다. 원본 서버 사진의 연결 정보만 있는 백업은 사진을 직접 다시 추가해야 합니다.

## 포함 파일

- `index.html`: 캐릭터 제작 화면의 시작 파일
- `assets/`: 실행 프로그램과 화면 스타일
- `fonts/`: 시트 글꼴과 글꼴 라이선스
- `rasyancut-logo.png`, `favicon.svg` 등: 정적 이미지
- `.nojekyll`: GitHub의 기본 문서 변환을 건너뛰는 설정
- `licenses/`: 원본 UI 스타일 라이선스

## 확인한 내용

타입 검사와 프로덕션 빌드가 통과했습니다. GitHub 주소와 같은 `/chara/` 경로에서 화면, 캐릭터 저장과 새로고침 후 복원, 대사 생성, 사진 추가 및 PNG 시트 다운로드를 브라우저에서 확인했습니다. 실제 GitHub 배포는 파일 업로드 후 완료됩니다.

## 전투 설정 수정

베이스 계열, 나이트 계열, 초월자, 트레이너, 무기 성능과 대미지 계산 화면을 제거했습니다. 미리보기와 마크다운·PNG/JPG 시트에서도 해당 항목이 표시되지 않습니다. 기존 JSON 저장본은 계속 불러올 수 있습니다.
