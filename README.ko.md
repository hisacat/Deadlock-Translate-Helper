# Deadlock-Translate-Helper
데드록의 localization 파일을 업데이트 및 수정하기 위한 유틸리티

## 사용법
1. `1.translated` 폴더 내에 데드록 `game` 폴더와 동일한 구조로 번역할 대상 `localization` txt를 배치합니다.  
    (현재 기본적으로 한국어 유저 패치가 배치되어 있습니다.)
1. `DeadlockTranslateHelper.exe`를 실행합니다.
2. `3.output` 폴더에 병합된 localization 파일들이 생성됩니다.  
3. `2.dumped`에는 번역 대상 `localization` txt에서 누락된 키값이 정리되어 생성됩니다. 이를 토대로 지역화를 완료하면 됩니다.

## 작동 방식
1. 데드록이 설치된 폴더에서 베이스 언어 (기본값: english)를 대상 언어 (기본값:koreana)로 이름을 변경하여 `3.output` 폴더에 복사합니다.
2. 키값 중 설치된 데드록의 대상 언어에 존재하는 키가 있다면 값을 이것으로 덮어씌웁니다.
3. 키값 중 `1.translated` 폴더 내의 대상 언어에 존재하는 키가 있다면 값을 이것으로 덮어씌웁니다.
4. 설치된 데드록의 대상 언어에도, `1.translated` 폴더에도 존재하지 않는 키값이 있다면 `2.Dumped` 폴더 내에 이를 기록합니다.

## config.json
- `deadlockPath`: 데드록의 설치 경로입니다. 경로 구분자는 `\\`혹은 `/`일 수 있습니다.
- `baseLanguageCode`: 키값을 탐지할 베이스 언어 코드입니다.
- `targetLanguageCode`: 작업 대상 언어 코드입니다.
