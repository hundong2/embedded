# 출처 범위와 커버리지 감사

갱신: 2026-10-16T13:00:51.972Z

이 자료는 [Embedded Recipes](https://recipes.tistory.com/)의 공개 목차를 출발점으로 작성한 독창적 한국어 학습 사이트입니다. 원문 본문·그림·첨부 파일을 복제하지 않습니다. [공유 정책](https://recipes.tistory.com/54)을 참고했습니다.

## 확인한 범위

- 공개 sitemap, 홈페이지의 강의실 전체맵, sitemap의 전체 카테고리, 발견한 글 본문의 내부 링크를 합쳐 중복 canonical URL을 제거했습니다. 카테고리의 페이지 전체를 재귀 수집했다는 뜻은 아닙니다. 누락 검사는 sitemap과 본문 내부 링크에 의존합니다.
- 발견 211 URL, canonical 항목 210개, 본문 접근 가능 207개, 접근 불가 3개입니다.
- 기술 개념 매핑 156개, 범위 제외 51개, 미해결 3개입니다. 72개 lesson에 관련 글을 개념 단위로 묶었습니다. 한 글의 모든 문단을 재현하거나 개별 문장을 모두 교정한 것은 아닙니다.
- reviewed는 lesson에 사용한 본문의 주요 개념·인용 목적을 확인했다는 기록입니다. HTTP 성공만으로 자동 부여하지 않습니다. 제외 글은 제목·카테고리·본문 도입에 따라 범위를 판정하며 exclusionReason을 남깁니다.
- 외부 첫 링크 97개를 보존했고 97개의 첫 HTTP 응답을 확인했습니다. 63개가 HTTP 성공이었으며, 이는 본문 접근·현재 내용·첨부 안전성·전체 검토를 보장하지 않습니다. 이동·로그인·도메인 전환 페이지도 HTTP 200일 수 있습니다.
- 외부 링크의 topicLessonIds는 링크 제목의 주제 대응입니다. reviewed=false이며 외부 원문 전체의 내용 수록을 주장하지 않습니다. URL의 쿼리는 콘텐츠 식별에 필요하므로 보존합니다. 공개 첨부의 만료형 URL은 시간이 지나면 접근 상태가 달라질 수 있습니다. 외부 사이트 전체 재귀 수집, 비공개·삭제 글은 범위에 포함하지 않습니다.

- 위 97개와 별도로, 보충 출처 9개는 공식/유지관리 원문의 해당 내용을 실제 확인했습니다. supplementalReferences에 개별 검토일과 확인 목적을 기록합니다. 이 기록은 외부 첫 링크의 HTTP 확인과 구분됩니다.

## 재실행

`npm run sources:sync`는 로컬 캐시를 활용하여 인벤토리와 lesson 매핑을 갱신합니다. `npm run sources:sync -- --refresh`로 내부 원문을 다시 받고, `npm run sources:sync -- --check-external`로 처음 발견한 외부 링크를 확인합니다. 외부도 새로 확인하려면 두 옵션을 함께 사용합니다. 한 번에 외부 3개까지만 확인하며 각 요청은 6초 timeout을 둡니다. 원문 캐시 `.cache/sources/`는 Git과 배포에서 제외합니다.

원문 본문 해시가 달라지면 기존 reviewed가 해제됩니다. 새 글·변경 글은 사람이 실제 본문과 lesson을 대조한 뒤 manifest의 reviewed, reviewMethod, reviewedAt을 갱신하고 `npm run check`를 실행합니다. 동기화가 임의로 새 글을 검토 완료 처리하지 않습니다. 알려진 404 항목은 목록에 남기며, 미처리 URL·발견 단계 실패는 동기화 명령의 실패로 보고합니다.

## 해석·모델 범위

클래식 ARM7/ARM9·ADS·WinCE 등 역사적 예는 현대 Cortex-M·Thumb-2와 구분했습니다. 캐시는 MMU 없이 존재할 수 있고, 스택·힙은 반드시 C 전역 배열로 구현되지 않으며, RAM 예산은 중복 영역을 합산하지 않습니다. 동적 원문 지식은 TI·Murata·USB-IF·Linux man-pages·AOSP 등의 공식/유지관리 원문으로 보충했습니다. 각 lesson의 출처 링크를 확인하세요.

모든 lesson에는 고유 개념 관계도와 연결된 실험이 있지만, 인덕터·증폭기·전원 변환기·전송선·실제 CPU·RTOS·USB/Android 전체를 수치 시뮬레이션하지 않습니다. 9종의 결정론적 학습 실험을 관련 개념과 연결합니다. 이것은 SPICE나 보드 검증 도구가 아닙니다.

## 전체 내부 인벤토리

| ID | 원문 | 상태 | 대응 lesson / 제외 이유 |
|---|---|---|---|
| 54 | [About](https://recipes.tistory.com/54) | 200 · out-of-scope · reviewed=false | 블로그 소개·저작권·공유 정책입니다. 기술 lesson 대신 출처 정책 확인에 사용했습니다. |
| 55 | [Community Primitive](https://recipes.tistory.com/55) | 200 · out-of-scope · reviewed=false | 서적 사진·생활글·커뮤니티·개별 에디터 운영 팁 등으로 전기전자 및 임베디드 기초 기술 범위 밖입니다. |
| 56 | [^^](https://recipes.tistory.com/56) | 200 · out-of-scope · reviewed=false | 서적 사진·생활글·커뮤니티·개별 에디터 운영 팁 등으로 전기전자 및 임베디드 기초 기술 범위 밖입니다. |
| 57 | [RC 회로 감잡자.](https://recipes.tistory.com/57) | 200 · mapped · reviewed=true | current-loop, ground-reference, series-parallel, voltage-divider, capacitor, rc-transient |
| 58 | [RC 회로 - 스위칭 특성과 시상수](https://recipes.tistory.com/58) | 200 · mapped · reviewed=true | rc-transient, rc-filter, pull-sizing, switch-debounce |
| 60 | [강의실 전체 Map2 - Season 2 옴니버스](https://recipes.tistory.com/60) | 200 · mapped · reviewed=true | serial-uart, adc, pwm, debug-jtag, pointers-structs, synchronization, queues, timers-watchdog, debugging, impedance, power-regulators, charge-pump, signal-integrity, usb-basics, linux-process, android-stack, device-drivers, object-model, dynamic-allocation, memory-protection, dev-environment |
| 61 | [RC 회로 - 미분회로, 적분회로](https://recipes.tistory.com/61) | 200 · mapped · reviewed=true | rc-transient, rc-filter, switch-debounce |
| 62 | [다이오우드 연결방식과 역할](https://recipes.tistory.com/62) | 200 · mapped · reviewed=true | diode-led, zener-power |
| 63 | [다이오우드 특성과 제너다이오우드](https://recipes.tistory.com/63) | 200 · mapped · reviewed=true | electrical-power, diode-led, zener-power |
| 65 | [트랜지스터는 가변저항이다.](https://recipes.tistory.com/65) | 200 · mapped · reviewed=true | transistor-switch, transistor-amplifier |
| 66 | [트랜지스터 - 증폭기와 스위치로의 작동개념](https://recipes.tistory.com/66) | 200 · mapped · reviewed=true | voltage-divider, transistor-switch, transistor-amplifier |
| 67 | [알람에 관하여](https://recipes.tistory.com/67) | 200 · out-of-scope · reviewed=false | 서적 사진·생활글·커뮤니티·개별 에디터 운영 팁 등으로 전기전자 및 임베디드 기초 기술 범위 밖입니다. |
| 69 | [알람런 - 절대 알람어플](https://recipes.tistory.com/69) | 200 · out-of-scope · reviewed=false | 서적 사진·생활글·커뮤니티·개별 에디터 운영 팁 등으로 전기전자 및 임베디드 기초 기술 범위 밖입니다. |
| 70 | [콘덴서(capacitor)](https://recipes.tistory.com/70) | 200 · mapped · reviewed=true | capacitor, decoupling, charge-pump |
| 71 | [저항(resistor) - 네가지 역할](https://recipes.tistory.com/71) | 200 · mapped · reviewed=true | ohms-law, series-parallel, voltage-divider, electrical-power, pull-up, pull-down, pull-sizing, impedance |
| 192 | [임베디드 시스템이 뭐죠?](https://recipes.tistory.com/192) | 200 · mapped · reviewed=true | core-soc |
| 193 | [왜 임베디드 시스템에서는 씨( C)언어를 가장 많이 사용하나요?](https://recipes.tistory.com/193) | 200 · mapped · reviewed=true | c-memory |
| 194 | [어떤 공부부터 시작해야 될지 모르겠어요?](https://recipes.tistory.com/194) | 200 · mapped · reviewed=true | core-soc |
| 195 | [학교에서 공부한 내용이 현업에서 어떻게 쓰이나요?](https://recipes.tistory.com/195) | 200 · mapped · reviewed=true | core-soc |
| 196 | [취업이냐 진학이냐?](https://recipes.tistory.com/196) | 200 · out-of-scope · reviewed=false | 진로 상담: 취업·진학 선택. 전기전자·임베디드 기술 설명의 범위 밖입니다. |
| 197 | [연봉 많이 받으려면?](https://recipes.tistory.com/197) | 200 · out-of-scope · reviewed=false | 진로 상담: 연봉·채용. 전기전자·임베디드 기술 설명의 범위 밖입니다. |
| 198 | [졸업 전까지 반드시 해야 될 일은?](https://recipes.tistory.com/198) | 200 · out-of-scope · reviewed=false | 진로 상담: 졸업 준비·연구 경험. 기술 개념 강의의 범위 밖입니다. |
| 199 | [LED를 ON/OFF 제어하려면?](https://recipes.tistory.com/199) | 200 · mapped · reviewed=true | diode-led, mmio, gpio, pwm |
| 200 | [코어(Core)와 시피유(CPU) 차이점이 뭘까요?](https://recipes.tistory.com/200) | 200 · mapped · reviewed=true | core-soc |
| 201 | [나의 인(人)라인은?](https://recipes.tistory.com/201) | 200 · out-of-scope · reviewed=false | 진로 상담: 인적 네트워크. 기술 개념 강의의 범위 밖입니다. |
| 202 | [시피유(CPU)가 하는 일이 뭐죠](https://recipes.tistory.com/202) | 200 · mapped · reviewed=true | core-soc |
| 203 | [코프로세서가 하는 일이 뭐죠?](https://recipes.tistory.com/203) | 200 · mapped · reviewed=true | dma-cache-mmu |
| 204 | [캐시메모리(Cache Memory)가 뭐죠?](https://recipes.tistory.com/204) | 200 · mapped · reviewed=true | dma-cache-mmu |
| 205 | [노어플래시(NOR Flash)가 뭐죠?](https://recipes.tistory.com/205) | 200 · mapped · reviewed=true | flash-ram |
| 206 | [낸드플래시(NAND Flash)가 뭐죠?](https://recipes.tistory.com/206) | 200 · mapped · reviewed=true | flash-ram |
| 207 | [에스디램(SDRAM)이 뭐죠?](https://recipes.tistory.com/207) | 200 · mapped · reviewed=true | flash-ram |
| 208 | [인터럽트(Interrupt)가 뭐죠?](https://recipes.tistory.com/208) | 200 · mapped · reviewed=true | exceptions, interrupts |
| 209 | [제이텍(JTAG)이 뭐죠?](https://recipes.tistory.com/209) | 200 · mapped · reviewed=true | debug-jtag |
| 210 | [시리얼 포트(Serial port)가 뭐죠?](https://recipes.tistory.com/210) | 200 · mapped · reviewed=true | serial-uart |
| 211 | [엘시디가 뭐죠?](https://recipes.tistory.com/211) | 200 · mapped · reviewed=true | lcd |
| 212 | [크로스 컴파일러(Cross Compiler)가 뭐죠?](https://recipes.tistory.com/212) | 200 · mapped · reviewed=true | compile-pipeline, dev-environment |
| 213 | [스타트업(Startup.S) 파일이 뭐죠?](https://recipes.tistory.com/213) | 200 · mapped · reviewed=true | reset-boot |
| 214 | [메이크 파일(Makefile)이 뭐죠?](https://recipes.tistory.com/214) | 200 · mapped · reviewed=true | make-build, dev-environment |
| 215 | [링커 스크립트(Linker Script) 파일이 뭐죠?](https://recipes.tistory.com/215) | 200 · mapped · reviewed=true | linker-map |
| 216 | [씨 언어에서 변수는 어디에 저장 되나요?](https://recipes.tistory.com/216) | 200 · mapped · reviewed=true | c-memory |
| 217 | [씨 언어에서 씨 플러스플러스 함수를 콜하는 방법은?](https://recipes.tistory.com/217) | 200 · mapped · reviewed=true | asm-abi, libraries, object-model |
| 218 | [인라인 어셈블러를 사용하려면?](https://recipes.tistory.com/218) | 200 · mapped · reviewed=true | asm-abi |
| 219 | [소스 레벨 디버깅이 뭐죠?](https://recipes.tistory.com/219) | 200 · mapped · reviewed=true | debug-jtag, debugging |
| 220 | [엠엠유(MMU)를 인에이블(Enable)하려면?](https://recipes.tistory.com/220) | 200 · mapped · reviewed=true | dma-cache-mmu, memory-protection |
| 221 | [캐시를 인에이블(Enable) 하려면?](https://recipes.tistory.com/221) | 200 · mapped · reviewed=true | dma-cache-mmu |
| 222 | [모놀리틱 커널(Monolithic kernel)과 마이크로 커널(Micro kernel) 차이점은?](https://recipes.tistory.com/222) | 200 · mapped · reviewed=true | rtos-tasks, linux-process |
| 223 | [임베디드 오에스(OS)의 용어 정의](https://recipes.tistory.com/223) | 200 · mapped · reviewed=true | rtos-tasks, linux-process |
| 224 | [ARM 프로세서에 uC/OS2 포팅을 위한 준비사항은?](https://recipes.tistory.com/224) | 200 · mapped · reviewed=true | porting-bsp |
| 225 | [uC/OS2 포팅 완료까지의 절차가 어떻게 되죠?](https://recipes.tistory.com/225) | 200 · mapped · reviewed=true | porting-bsp |
| 226 | [ARM 프로세서에 Linux 포팅을 위한 준비사항은?](https://recipes.tistory.com/226) | 200 · mapped · reviewed=true | porting-bsp |
| 228 | [Linux 포팅 완료까지의 절차가 어떻게 되죠?](https://recipes.tistory.com/228) | 200 · mapped · reviewed=true | porting-bsp |
| 229 | [Linux에서 라이브러리를 만드는 방법은?](https://recipes.tistory.com/229) | 200 · mapped · reviewed=true | libraries |
| 230 | [ARM 프로세서에 WinCE 포팅을 위한 준비사항은?](https://recipes.tistory.com/230) | 200 · mapped · reviewed=true | porting-bsp |
| 231 | [WINCE 포팅 완료까지의 절차가 어떻게 되죠?](https://recipes.tistory.com/231) | 200 · mapped · reviewed=true | porting-bsp |
| 232 | [WINCE에서 어플리케이션과 DLL을 만드는 방법은?](https://recipes.tistory.com/232) | 200 · mapped · reviewed=true | libraries |
| 233 | [ARM 프로세서가 많이 쓰이는 이유는?](https://recipes.tistory.com/233) | 200 · mapped · reviewed=true | electrical-power, core-soc |
| 234 | [ARM Mode와 PSR..너희들은 누구냐?](https://recipes.tistory.com/234) | 200 · mapped · reviewed=true | arm-modes |
| 235 | [R13, R14에게 반했다?](https://recipes.tistory.com/235) | 200 · mapped · reviewed=true | arm-context |
| 236 | [파이프 라인(Pipe Line)의 법칙?](https://recipes.tistory.com/236) | 200 · mapped · reviewed=true | cpu-pipeline |
| 237 | [우리는패밀리 (ARM, THUMB, Coprocessor, NEON)](https://recipes.tistory.com/237) | 200 · mapped · reviewed=true | arm-modes |
| 238 | [bitbucket에 ssh public key를 등록하는 법](https://recipes.tistory.com/238) | 200 · mapped · reviewed=true | dev-environment |
| 239 | [Gitbox 에서 window가 새로 나오지 않을 경우](https://recipes.tistory.com/239) | 200 · out-of-scope · reviewed=false | 서적 사진·생활글·커뮤니티·개별 에디터 운영 팁 등으로 전기전자 및 임베디드 기초 기술 범위 밖입니다. |
| 240 | [Error: MySQL 5.7 이상 Group by – this is incompatible with sql_mode=only_full_group_by](https://recipes.tistory.com/240) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 241 | [기부금을 낸 사람은?](https://recipes.tistory.com/241) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 242 | [어느 회사 불량?](https://recipes.tistory.com/242) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 243 | [양말 꺼내기](https://recipes.tistory.com/243) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 244 | [강의실 전체 Map3 by soto](https://recipes.tistory.com/244) | 200 · out-of-scope · reviewed=false | 강의실 목차 페이지입니다. 링크된 개별 기술 글을 별도로 수집하고 매핑했습니다. |
| 245 | [아버지와 아들 이야기](https://recipes.tistory.com/245) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 246 | [국제법에 대한 퍼즐](https://recipes.tistory.com/246) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 247 | [유명한 Bayes 룰 - AIDS 환자 검출](https://recipes.tistory.com/247) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 248 | [천사와 악마 이야기](https://recipes.tistory.com/248) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 249 | [악마와 천사이야기 - 두번째](https://recipes.tistory.com/249) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 250 | [악마와 천사이야기 - 세번째](https://recipes.tistory.com/250) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 251 | [제비뽑기 이야기](https://recipes.tistory.com/251) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 252 | [미친개 이야기](https://recipes.tistory.com/252) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 253 | [미니맥스 전략](https://recipes.tistory.com/253) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 254 | [한국어의 발상, 영어의 발상 / - 대학교양총서, 문용, 서울대학교출판부](https://recipes.tistory.com/254) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 255 | [어떤 것을 선택해야 하는가? - 상대의 입장에서 생각해 본다.](https://recipes.tistory.com/255) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 257 | [어떻게 의사결정을 해야 하는 것인가?](https://recipes.tistory.com/257) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 258 | [세 여신을 찾아라](https://recipes.tistory.com/258) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 259 | [확률 전략. 어떤 공을 쳐야 하는 것인가?](https://recipes.tistory.com/259) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 260 | [기업 매수 게임](https://recipes.tistory.com/260) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 261 | [무거운 공을 찾아라](https://recipes.tistory.com/261) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 262 | [여자아이일 확률은?](https://recipes.tistory.com/262) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 263 | [공주님이 백마탄 왕자님을 만날 전략은?](https://recipes.tistory.com/263) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 264 | [Crack Me](https://recipes.tistory.com/264) | 200 · mapped · reviewed=true | asm-abi |
| 265 | [프라이버시를 침해하지 않고 민감한 정보를 얻으려면?](https://recipes.tistory.com/265) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 266 | [뺑소니 택시를 찾아라!](https://recipes.tistory.com/266) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 267 | [세장의 카드](https://recipes.tistory.com/267) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 268 | [어떤 것을 선택하시겠습니까? - 손실과 이익에 대한 다른 반응](https://recipes.tistory.com/268) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 269 | [전략적 사고 - 정답은?](https://recipes.tistory.com/269) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 270 | [4월의 어느 아침에 100%의 여자아이를 만나는 일에 관하여, On seeing the 100% perfect girl one beautiful April morning](https://recipes.tistory.com/270) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 271 | [흰공의 확률은?](https://recipes.tistory.com/271) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 272 | [핵연료봉 경보기](https://recipes.tistory.com/272) | 200 · mapped · reviewed=true | logic-gates |
| 273 | [간단한 문제](https://recipes.tistory.com/273) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 274 | [둘중 어떤 회사를 선택하시겠습니까?](https://recipes.tistory.com/274) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 275 | [스트레칭](https://recipes.tistory.com/275) | 200 · out-of-scope · reviewed=false | 서적 사진·생활글·커뮤니티·개별 에디터 운영 팁 등으로 전기전자 및 임베디드 기초 기술 범위 밖입니다. |
| 276 | [녹아웃 토너먼트 - 시합을 몇번이나 할까?](https://recipes.tistory.com/276) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 277 | [천원은 어디로 간걸까?](https://recipes.tistory.com/277) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 278 | [쉐릴의 생일은?](https://recipes.tistory.com/278) | 200 · out-of-scope · reviewed=false | 퍼즐·확률/전략·일반 소프트웨어 또는 인문 콘텐츠입니다. 임베디드 기술과 직접 연결되는 글만 예외적으로 매핑했습니다. |
| 279 | [쩌는 타격감이라니...](https://recipes.tistory.com/279) | 200 · out-of-scope · reviewed=false | 서적 사진·생활글·커뮤니티·개별 에디터 운영 팁 등으로 전기전자 및 임베디드 기초 기술 범위 밖입니다. |
| 280 | [Embedded Recipes](https://recipes.tistory.com/280) | 200 · out-of-scope · reviewed=false | 서적 사진·생활글·커뮤니티·개별 에디터 운영 팁 등으로 전기전자 및 임베디드 기초 기술 범위 밖입니다. |
| 281 | [Embedded Recipes Evening](https://recipes.tistory.com/281) | 200 · out-of-scope · reviewed=false | 서적 사진·생활글·커뮤니티·개별 에디터 운영 팁 등으로 전기전자 및 임베디드 기초 기술 범위 밖입니다. |
| 282 | [Embedded Recipes Couple](https://recipes.tistory.com/282) | 200 · out-of-scope · reviewed=false | 서적 사진·생활글·커뮤니티·개별 에디터 운영 팁 등으로 전기전자 및 임베디드 기초 기술 범위 밖입니다. |
| 283 | [Embedded Recipes Model](https://recipes.tistory.com/283) | 200 · out-of-scope · reviewed=false | 서적 사진·생활글·커뮤니티·개별 에디터 운영 팁 등으로 전기전자 및 임베디드 기초 기술 범위 밖입니다. |
| 284 | [Hardware 꼴라쥬](https://recipes.tistory.com/284) | 200 · mapped · reviewed=true | current-loop, core-soc |
| 285 | [신호와 주파수 영역 Specturm Analysis](https://recipes.tistory.com/285) | 200 · mapped · reviewed=true | signals-frequency, clocks-pll, signal-integrity |
| 286 | [Analog신호와 Digital 신호, 그리고 Ground.](https://recipes.tistory.com/286) | 200 · mapped · reviewed=true | ground-reference, signals-frequency, logic-levels, adc |
| 287 | [초간단 회로이론 R (저항) L (인덕터) C (캐패시터)](https://recipes.tistory.com/287) | 200 · mapped · reviewed=true | current-loop, ohms-law, series-parallel, capacitor, rc-transient, inductor |
| 288 | [초간단 회로이론 응용 - 필터 (Filter)](https://recipes.tistory.com/288) | 200 · mapped · reviewed=true | rc-filter, decoupling, impedance |
| 289 | [Transistor 1%](https://recipes.tistory.com/289) | 200 · mapped · reviewed=true | transistor-switch, transistor-amplifier, logic-gates |
| 290 | [Pull up, Pull down 그리고 Open Collector](https://recipes.tistory.com/290) | 200 · mapped · reviewed=true | floating-input, pull-up, pull-down, pull-sizing, open-drain, buses-i2c-spi |
| 291 | [RLC와 Transistor 感](https://recipes.tistory.com/291) | 200 · mapped · reviewed=true | inductor, transistor-switch, decoupling, power-regulators |
| 292 | [논리회로로의 확장](https://recipes.tistory.com/292) | 200 · mapped · reviewed=true | logic-levels, logic-gates, registers |
| 293 | [IC 기본](https://recipes.tistory.com/293) | 200 · mapped · reviewed=true | timing, gpio |
| 294 | [Register 넌 누구냐](https://recipes.tistory.com/294) | 200 · mapped · reviewed=true | registers |
| 295 | [Clock 이란?](https://recipes.tistory.com/295) | 200 · mapped · reviewed=true | signals-frequency, timing, clocks-pll, pwm |
| 296 | [Bus Transfer Mechanism](https://recipes.tistory.com/296) | 200 · mapped · reviewed=true | memory-bus |
| 297 | [Timing 및 Spec 읽기](https://recipes.tistory.com/297) | 200 · mapped · reviewed=true | logic-levels, timing, signal-integrity |
| 298 | [Memory의 선정과 XIP](https://recipes.tistory.com/298) | 200 · mapped · reviewed=true | flash-ram |
| 299 | [RAM Memory의 물리적 동작](https://recipes.tistory.com/299) | 200 · mapped · reviewed=true | flash-ram, memory-bus |
| 300 | [확장 to the CPU - How CPU Works](https://recipes.tistory.com/300) | 200 · mapped · reviewed=true | cpu-pipeline |
| 301 | [일반적인 CPU의 동작 예 (Core)와 Pipe Line](https://recipes.tistory.com/301) | 200 · mapped · reviewed=true | cpu-pipeline |
| 302 | [마이크로 프로세서 아뜰리에](https://recipes.tistory.com/302) | 200 · mapped · reviewed=true | core-soc |
| 304 | [ARM Inside](https://recipes.tistory.com/304) | 200 · mapped · reviewed=true | core-soc |
| 305 | [ARM mode와 THUMB mode](https://recipes.tistory.com/305) | 200 · mapped · reviewed=true | arm-modes |
| 306 | [ARM 동작 Modes - 나는 어느 mode를 써야 하나](https://recipes.tistory.com/306) | 200 · mapped · reviewed=true | arm-modes |
| 307 | [ARM Register와 Context](https://recipes.tistory.com/307) | 200 · mapped · reviewed=true | arm-context |
| 308 | [ARM Exceptions and Modes](https://recipes.tistory.com/308) | 200 · mapped · reviewed=true | arm-modes, exceptions |
| 309 | [ARM/ Thumb PCS - 레지스터 사용법](https://recipes.tistory.com/309) | 200 · mapped · reviewed=true | arm-context |
| 310 | [ARM은 Interrupt냄새를 어떻게 맡는가](https://recipes.tistory.com/310) | 200 · mapped · reviewed=true | exceptions, interrupts |
| 311 | [ARM SoC (System On Chip) - ARM 그렇고 말고](https://recipes.tistory.com/311) | 200 · mapped · reviewed=true | core-soc |
| 312 | [AMBA - SoC안에서 IP끼리의 Bus 규격](https://recipes.tistory.com/312) | 200 · mapped · reviewed=true | core-soc |
| 313 | [Little Endian과 Big Endian](https://recipes.tistory.com/313) | 200 · mapped · reviewed=true | endian |
| 314 | [컴파일에 대한 단상](https://recipes.tistory.com/314) | 200 · mapped · reviewed=true | compile-pipeline |
| 315 | [컴파일 공장 이야기.](https://recipes.tistory.com/315) | 200 · mapped · reviewed=true | compile-pipeline |
| 316 | [컴파일 순서에 따라 원하는 컴파일을 해보자 -](https://recipes.tistory.com/316) | 200 · mapped · reviewed=true | compile-pipeline |
| 317 | [Preprocss (-E option)와 #Include ("" <>)](https://recipes.tistory.com/317) | 200 · mapped · reviewed=true | compile-pipeline |
| 318 | [Assembly로 만드는 방법](https://recipes.tistory.com/318) | 200 · mapped · reviewed=true | compile-pipeline |
| 319 | [Library - 남한테 보여주기 싫어](https://recipes.tistory.com/319) | 200 · mapped · reviewed=true | libraries |
| 320 | [Lib을 까보자~](https://recipes.tistory.com/320) | 200 · mapped · reviewed=true | libraries |
| 321 | [컴파일러 Option들](https://recipes.tistory.com/321) | 200 · mapped · reviewed=true | compile-pipeline |
| 322 | [변수의 scope와 그 생애 (Memory Map)](https://recipes.tistory.com/322) | 200 · mapped · reviewed=true | c-memory |
| 323 | [Memory Map과 Symbol 이야기](https://recipes.tistory.com/323) | 200 · mapped · reviewed=true | linker-map |
| 324 | [ELF format Object File에 관한 진실. -c option (기계어 세상)](https://recipes.tistory.com/324) | 200 · mapped · reviewed=true | linker-map |
| 325 | [Linker를 마무리 짓자 - ELF와 fromelf 까지!](https://recipes.tistory.com/325) | 200 · mapped · reviewed=true | linker-map |
| 326 | [Scatter Loading/ Linker Description Script와 메모리 다루기.](https://recipes.tistory.com/326) | 200 · mapped · reviewed=true | linker-map |
| 327 | [Map file 분석](https://recipes.tistory.com/327) | 200 · mapped · reviewed=true | linker-map |
| 328 | [Memory Map과 Linker의 만남 - Locator](https://recipes.tistory.com/328) | 200 · mapped · reviewed=true | linker-map |
| 329 | [Makefile은 뭘 하는 녀석일까~?](https://recipes.tistory.com/329) | 200 · mapped · reviewed=true | make-build |
| 330 | [컴파일을 더더더 쉽게. MACRO와 SUFFIX](https://recipes.tistory.com/330) | 200 · mapped · reviewed=true | make-build |
| 331 | [조금더~ Make 테크닉들](https://recipes.tistory.com/331) | 200 · mapped · reviewed=true | make-build |
| 332 | [Make Option들](https://recipes.tistory.com/332) | 200 · mapped · reviewed=true | make-build |
| 333 | [ARM Assembly를 파헤쳐 보자 ADS vs GNU](https://recipes.tistory.com/333) | 200 · mapped · reviewed=true | asm-abi |
| 334 | [대충의 초간단 Assembly와 Reverse Engineering](https://recipes.tistory.com/334) | 200 · mapped · reviewed=true | asm-abi |
| 335 | [ARM, Thumb mode와 S 접미사](https://recipes.tistory.com/335) | 200 · mapped · reviewed=true | arm-modes |
| 336 | [ARM과 Thumb 사이의 Veneer](https://recipes.tistory.com/336) | 200 · mapped · reviewed=true | arm-modes |
| 337 | [Inline Assembly와 INTLOCK의 구현](https://recipes.tistory.com/337) | 200 · mapped · reviewed=true | asm-abi, synchronization |
| 338 | [Pipe line과 Exception 관계 그리고 ^접미사](https://recipes.tistory.com/338) | 200 · mapped · reviewed=true | exceptions |
| 339 | [Exception Vector Table (EVT)과 각 Handler의 구현](https://recipes.tistory.com/339) | 200 · mapped · reviewed=true | exceptions |
| 340 | [SWI 의 진실](https://recipes.tistory.com/340) | 200 · mapped · reviewed=true | exceptions |
| 341 | [Coprocessor Assembly](https://recipes.tistory.com/341) | 200 · mapped · reviewed=true | dma-cache-mmu |
| 342 | [Bootloader와 Memory Budget (Mapfile) 어떻게 변수초기화를 할 것인가](https://recipes.tistory.com/342) | 200 · mapped · reviewed=true | reset-boot |
| 343 | [Reset Handler에서 main까지 (Entry Point)](https://recipes.tistory.com/343) | 200 · mapped · reviewed=true | reset-boot |
| 344 | [Scatter Loading과 Bootup - __user_initial_stackheap](https://recipes.tistory.com/344) | 200 · mapped · reviewed=true | reset-boot |
| 345 | [Context와 AAPCS](https://recipes.tistory.com/345) | 200 · mapped · reviewed=true | arm-context, asm-abi |
| 346 | [Pointer와 Array는 소녀시대와 원더걸스 , 그리고 이중포인터](https://recipes.tistory.com/346) | 200 · mapped · reviewed=true | pointers-structs |
| 347 | [struct와 typedef 그리고 PACKED](https://recipes.tistory.com/347) | 200 · mapped · reviewed=true | pointers-structs, object-model |
| 348 | [STACK, HEAP에 관한 소고.](https://recipes.tistory.com/348) | 200 · mapped · reviewed=true | c-memory, dynamic-allocation |
| 349 | [Stack의 정체와 자세히 보기 - initialization까지](https://recipes.tistory.com/349) | 200 · mapped · reviewed=true | c-memory |
| 350 | [함수가 불렸을 때 일어나는 일. - Stack 뒤지기 신공](https://recipes.tistory.com/350) | 200 · mapped · reviewed=true | c-memory |
| 351 | [Stack 동작의 비밀과 실제 메모리 덤프](https://recipes.tistory.com/351) | 200 · mapped · reviewed=true | c-memory, debugging |
| 352 | [Stack Size는 어떻게 잡는가](https://recipes.tistory.com/352) | 200 · mapped · reviewed=true | c-memory, debugging |
| 353 | [함수 포인터와 실행주소 변경](https://recipes.tistory.com/353) | 200 · mapped · reviewed=true | pointers-structs |
| 354 | [Linked List와 Queue](https://recipes.tistory.com/354) | 200 · mapped · reviewed=true | queues |
| 355 | [RTOS와 Kernel](https://recipes.tistory.com/355) | 200 · mapped · reviewed=true | rtos-tasks |
| 356 | [Embedded Software는 무한 Loop](https://recipes.tistory.com/356) | 200 · mapped · reviewed=true | rtos-tasks |
| 357 | [Task 구조와 Signal](https://recipes.tistory.com/357) | 200 · mapped · reviewed=true | rtos-tasks |
| 358 | [Task 상태, Task는 Service단위](https://recipes.tistory.com/358) | 200 · mapped · reviewed=true | rtos-tasks |
| 359 | [Preemptive (선점형) Multitasking 이란 도대체](https://recipes.tistory.com/359) | 200 · mapped · reviewed=true | scheduler |
| 360 | [Context Swtiching과 TCB - Task의 상태변화](https://recipes.tistory.com/360) | 200 · mapped · reviewed=true | scheduler |
| 361 | [TCB - Task Control Block](https://recipes.tistory.com/361) | 200 · mapped · reviewed=true | scheduler |
| 362 | [Scheduler의 구현](https://recipes.tistory.com/362) | 200 · mapped · reviewed=true | scheduler |
| 363 | [ISR은 어떻게 구현해 - 선점형과 비선점형](https://recipes.tistory.com/363) | 200 · mapped · reviewed=true | interrupts |
| 364 | [선점형 Kernel에서 wait, send, clr signal의 구현과 IRQ Handler](https://recipes.tistory.com/364) | 200 · mapped · reviewed=true | scheduler |
| 365 | [Clock tick ISR - Timer Service](https://recipes.tistory.com/365) | 200 · mapped · reviewed=true | timers-watchdog |
| 366 | [ATOMIC - Critical Section Mutex Semaphore](https://recipes.tistory.com/366) | 200 · mapped · reviewed=true | synchronization |
| 367 | [Interrupt VS. Polling](https://recipes.tistory.com/367) | 200 · mapped · reviewed=true | interrupts |
| 368 | [Queue와 Inter Task Communication](https://recipes.tistory.com/368) | 200 · mapped · reviewed=true | queues |
| 369 | [DPC나, APC, 그리고 Bottom Half](https://recipes.tistory.com/369) | 200 · mapped · reviewed=true | interrupts |
| 370 | [Watch dog task](https://recipes.tistory.com/370) | 200 · mapped · reviewed=true | timers-watchdog |
| 371 | [Bootup 중 Kernel로의 진입 - main() 함수 -](https://recipes.tistory.com/371) | 200 · mapped · reviewed=true | reset-boot, rtos-tasks |
| 372 | [Kernel을 Porting 한다는 것](https://recipes.tistory.com/372) | 200 · mapped · reviewed=true | porting-bsp, device-drivers |
| 373 | [Device를 control 한다는 것](https://recipes.tistory.com/373) | 200 · mapped · reviewed=true | mmio, buses-i2c-spi, device-drivers |
| 374 | [Register를 Setting 한다는 것과 Memory Mapped IO](https://recipes.tistory.com/374) | 200 · mapped · reviewed=true | registers, mmio, device-drivers |
| 375 | [Memory Device를 Control 한다는 것](https://recipes.tistory.com/375) | 200 · mapped · reviewed=true | memory-bus |
| 376 | [Bus Sizer Register와 Memory Controller - 메모리 확장구성과 CS와의 관계](https://recipes.tistory.com/376) | 200 · mapped · reviewed=true | memory-bus |
| 377 | [특이한 Device Interface의 CS와 Address의 이용 - LCD](https://recipes.tistory.com/377) | 200 · mapped · reviewed=true | lcd |
| 378 | [Shadow의 개념과 Bit operation](https://recipes.tistory.com/378) | 200 · mapped · reviewed=true | mmio |
| 379 | [C의 조미료 MACRO Technics](https://recipes.tistory.com/379) | 200 · mapped · reviewed=true | mmio, compile-pipeline |
| 380 | [Synchronous와 Asynchronous는 머냐](https://recipes.tistory.com/380) | 200 · mapped · reviewed=true | serial-uart, buses-i2c-spi |
| 381 | [Wait State 이야기](https://recipes.tistory.com/381) | 200 · mapped · reviewed=true | memory-bus |
| 382 | [PLL과 M/N:D](https://recipes.tistory.com/382) | 200 · mapped · reviewed=true | clocks-pll |
| 383 | [GPIO (Tristate Buffer)의 정체와 GPIO ISR](https://recipes.tistory.com/383) | 200 · mapped · reviewed=true | floating-input, pull-up, pull-down, open-drain, switch-debounce, gpio |
| 384 | [DMA (Direct Memory Access) - CPU몰래 영차영차](https://recipes.tistory.com/384) | 200 · mapped · reviewed=true | dma-cache-mmu |
| 385 | [Cache, Cash?](https://recipes.tistory.com/385) | 200 · mapped · reviewed=true | dma-cache-mmu |
| 386 | [MMU (Memory Management Unit)](https://recipes.tistory.com/386) | 200 · mapped · reviewed=true | dma-cache-mmu, memory-protection |
| 5000239 | [접근 확인 필요](https://recipes.tistory.com/5000239) | 404 · pending-lesson · reviewed=false | 접근 불가; 내용 검토 불가 |
| 5093957 | [접근 확인 필요](https://recipes.tistory.com/5093957) | 404 · pending-lesson · reviewed=false | 접근 불가; 내용 검토 불가 |
| 5373285 | [접근 확인 필요](https://recipes.tistory.com/5373285) | 404 · pending-lesson · reviewed=false | 접근 불가; 내용 검토 불가 |

## 외부 첫 링크 인벤토리

아래 HTTP 상태는 확인 시점의 첫 응답만 나타냅니다. 모든 항목의 외부 본문은 reviewed=false입니다.

| 링크 제목 | HTTP / 상태 | 주제 대응 lesson |
|---|---|---|
| [www.rfdh.com](http://www.rfdh.com) | 200 · http-accessible-unreviewed | clocks-pll |
| [http://www.viper.pe.kr/docs/make-ko/make-ko_toc.html](http://www.viper.pe.kr/docs/make-ko/make-ko_toc.html) | 0 · network-error | make-build |
| [http://kin.naver.com/openkr/entry.php?docid=23629](http://kin.naver.com/openkr/entry.php?docid=23629) | 0 · network-error | 직접 대응할 기술 주제를 확인하지 못한 보조·메타 링크입니다. 원 URL과 접근 상태만 보존합니다. |
| [https://atom.io/packages/activate-power-mode](https://atom.io/packages/activate-power-mode) | 200 · http-accessible-unreviewed | 일반 수학·심리·에디터·데이터베이스·자동링크 등 기초 임베디드 범위 밖의 참고 링크입니다. |
| [reverseMe_works.exe 0.01MB](https://blog.kakaocdn.net/dna/KgCfs/btse949sgc6/AAAAAAAAAAAAAAAAAAAAAJBD2Kinnok5tAUeO3FeUL2d1Ik5DxQKbzb4nU27pIRR/reverseMe_works.exe?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1793458799&allow_ip=&allow_referer=&signature=jL02ZizsIgA%2F5jQXGzNd7Vt597c%3D&attach=1&knm=tfile.exe) | 200 · http-accessible-unreviewed | asm-abi |
| [odbg110.zip 1.27MB](https://blog.kakaocdn.net/dna/bDyQtN/btsfaJxfeuD/AAAAAAAAAAAAAAAAAAAAAP189_2aBiGThDt3vuAs29y8OUch9pZbBVEGy10ThlNZ/odbg110.zip?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1793458799&allow_ip=&allow_referer=&signature=SIe6UWJ1zVYcTA7mpJ%2BPuGuzU8Q%3D&attach=1&knm=tfile.zip) | 200 · http-accessible-unreviewed | asm-abi |
| [reverseMe.exe 0.01MB](https://blog.kakaocdn.net/dna/NwPyX/btsfdrvFvPB/AAAAAAAAAAAAAAAAAAAAAGLtsGlSMunWl502JxAqrLCFHjmrmpt8unh4NV9HuVST/reverseMe.exe?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1793458799&allow_ip=&allow_referer=&signature=ZzZ4MggHxztcNYXJBkiga9Q0AE4%3D&attach=1&knm=tfile.exe) | 200 · http-accessible-unreviewed | asm-abi |
| [https://dev.mysql.com/doc/refman/5.7/en/group-by-handling.htmlSELECT](https://dev.mysql.com/doc/refman/5.7/en/group-by-handling.htmlSELECT) | 404 · http-error | 일반 수학·심리·에디터·데이터베이스·자동링크 등 기초 임베디드 범위 밖의 참고 링크입니다. |
| [http://www.appster.org/app/mac/gitbox-403388357](http://www.appster.org/app/mac/gitbox-403388357) | 200 · http-accessible-unreviewed | dev-environment |
| [https://confluence.atlassian.com/bitbucket/troubleshoot-ssh-issues-271943403.html](https://confluence.atlassian.com/bitbucket/troubleshoot-ssh-issues-271943403.html) | 200 · http-accessible-unreviewed | dev-environment |
| [git@bitbucket.org](http://git@bitbucket.org) | 0 · network-error | dev-environment |
| [https://confluence.atlassian.com/bitbucket/how-to-install-a-public-key-on-your-bitbucket-cloud-account-276628835.html](https://confluence.atlassian.com/bitbucket/how-to-install-a-public-key-on-your-bitbucket-cloud-account-276628835.html) | 404 · http-error | dev-environment |
| [page.Click](http://page.click) | 200 · http-accessible-unreviewed | 일반 수학·심리·에디터·데이터베이스·자동링크 등 기초 임베디드 범위 밖의 참고 링크입니다. |
| [keys.The](http://keys.the) | 0 · network-error | 일반 수학·심리·에디터·데이터베이스·자동링크 등 기초 임베디드 범위 밖의 참고 링크입니다. |
| [http://recipes.egloos.com/4971003](http://recipes.egloos.com/4971003) | 403 · http-error | 직접 대응할 기술 주제를 확인하지 못한 보조·메타 링크입니다. 원 URL과 접근 상태만 보존합니다. |
| [http://elec.slowgoing.org/](http://elec.slowgoing.org) | 200 · http-accessible-unreviewed | ohms-law, capacitor |
| [ⓡ 회로 심벌 이해하기](http://blog.naver.com/nsesibong?Redirect=Log&logNo=60024028171) | 200 · http-accessible-unreviewed | current-loop |
| [ⓡ 전자회로에서 charge pump 와 DC-DC Converters 의 차이](http://blog.naver.com/kash99/25524077) | 200 · http-accessible-unreviewed | charge-pump |
| [ⓡ 레귤레이터의 원리(LDO,BUCK,BOOST) - 코일,콘덴서 맛배기포함](http://forum.falinux.com/zbxe/?document_srl=499315&mid=hardware) | 0 · network-error | power-regulators |
| [ⓡ PLL이란! PLL의 원리를 까발겨 보자](http://www.rfdh.com/bas_rf/begin/pll.php3) | 200 · http-accessible-unreviewed | clocks-pll |
| [ⓡ 오버슈트와 언더슈트란?](http://blog.naver.com/feel2587/60040376628) | 200 · http-accessible-unreviewed | signal-integrity |
| [ⓡ 입력임피던스, 출력임피던스는 어려워?](http://erine.egloos.com/2206263) | 403 · http-error | impedance |
| [ⓡ TR 그래프 보는 법](https://t1.daumcdn.net/cfile/blog/123AFB3E4F5227B036) | 200 · http-accessible-unreviewed | transistor-amplifier |
| [ⓡ LDO와 PMIC의 차이](http://kin.naver.com/detail/detail.php?d1id=5&dir_id=50103&docid=1435758&qb=cG1pYw==&enc=euc-kr%C2%A7ion=kin&rank=1&sort=0&spq=0) | 404 · http-error | power-regulators |
| [ⓡ 마이크로프로세서 디자인에서의 A/D Converter 선택요령](https://t1.daumcdn.net/cfile/blog/132CF9124B3972A252) | 200 · http-accessible-unreviewed | adc |
| [ⓡ LDO 디자인의 부하변동 문제 해결방법](https://t1.daumcdn.net/cfile/blog/163FD2164B3C17F531) | 200 · http-accessible-unreviewed | power-regulators |
| [ⓡ 아두이노 - 회로도 그리는 무료 툴 -](http://recipes.egloos.com/5880077) | 403 · http-error | dev-environment |
| [ⓡ SoC 개요 - 넌 머냐](http://www.fkii.or.kr/pub/whitepaper/pdf/2003/2003_4_4.pdf) | 200 · http-accessible-unreviewed | core-soc |
| [ⓡ GNU ARM ASSEMBER QUICK GUIDE](http://microcross.com/GNU-ARM-Assy-Quick-Ref.pdf) | 200 · http-accessible-unreviewed | asm-abi |
| [ⓡ ARM ASSEMBLY](http://kkamagui.springnote.com/pages/432792) | 0 · network-error | asm-abi |
| [ⓡ ARM Instruction bit map](https://t1.daumcdn.net/cfile/blog/131D56264BC9B67463) | 200 · http-accessible-unreviewed | asm-abi |
| [ⓡ ARM Cache 구조 인트로](http://blog.naver.com/foxch2/40055914586) | 200 · http-accessible-unreviewed | dma-cache-mmu |
| [ⓡ Make를 생각한대로 동작시키기 위한 힌트와 비결 - Make를 디버깅한다](http://www.ibm.com/developerworks/linux/library/l-debugmake.html) | 200 · http-accessible-unreviewed | make-build, debugging |
| [ⓡ gcc 컴파일러 이야기](http://blog.naver.com/hyperlancer/120012699615) | 200 · http-accessible-unreviewed | compile-pipeline |
| [ⓡ 링크 에러에 대한 고찰](http://minjang.egloos.com/2146607) | 403 · http-error | libraries |
| [ⓐ Platform과 Bootup](http://kldp.org/node/90203) | 200 · http-accessible-unreviewed | reset-boot |
| [ⓑ LED 켜보기](http://kldp.org/node/90274) | 200 · http-accessible-unreviewed | diode-led |
| [ⓒ ARM exception vector table 구성하기](http://kldp.org/node/90351) | 200 · http-accessible-unreviewed | exceptions |
| [ⓓ 인터럽트 핸들러 만들기](http://kldp.org/node/90442) | 200 · http-accessible-unreviewed | interrupts |
| [ⓔ Timer Service 활성화 하기](http://kldp.org/node/90513) | 200 · http-accessible-unreviewed | timers-watchdog |
| [ⓕ Timer Service 사용하기](http://kldp.org/node/90562) | 200 · http-accessible-unreviewed | timers-watchdog |
| [ⓖ 메모리 맵 구성](http://kldp.org/node/90712) | 200 · http-accessible-unreviewed | linker-map |
| [ⓗ Task Stack](http://kldp.org/node/90881) | 200 · http-accessible-unreviewed | c-memory |
| [ⓡ TCB 이야기](http://kldp.org/node/90993) | 200 · http-accessible-unreviewed | scheduler |
| [ⓡ 사용자 테스크 등록](http://kldp.org/node/91081) | 200 · http-accessible-unreviewed | scheduler |
| [ⓡ Context Switching](http://kldp.org/node/91218) | 200 · http-accessible-unreviewed | scheduler |
| [ⓡ 사용자 태스크 동작 확인](http://kldp.org/node/91371) | 200 · http-accessible-unreviewed | scheduler |
| [ⓡ 외부인터럽트핸들링](http://kldp.org/node/91464) | 200 · http-accessible-unreviewed | interrupts |
| [ⓡ 시스템 콜](http://kldp.org/node/91565) | 200 · http-accessible-unreviewed | exceptions |
| [ⓡ 강제로 컨텍스트 스위칭 시키기 그리고 ITC (Inter Task Communication)](http://kldp.org/node/91651) | 200 · http-accessible-unreviewed | scheduler |
| [ⓡ 동기화 - 뮤택스와 세마포어 그리고 커널카운터](http://kldp.org/node/91790) | 200 · http-accessible-unreviewed | synchronization |
| [ⓡ 메모리 동적 할당](http://kldp.org/node/91877) | 200 · http-accessible-unreviewed | dynamic-allocation |
| [ⓡ 디바이스 드라이버](http://kldp.org/node/92018) | 200 · http-accessible-unreviewed | device-drivers |
| [ⓡ OS 계층](http://kldp.org/node/92192) | 200 · http-accessible-unreviewed | rtos-tasks |
| [ⓡ Stack Size 변경 법 - Linux](http://powerson.egloos.com/1555146) | 403 · http-error | c-memory |
| [ⓡ 도전! RTOS를 만들어 봅시다 - RTOS의 정의와 기본구조/ 개발환경](https://t1.daumcdn.net/cfile/blog/110B07204AFC17F913) | 200 · http-accessible-unreviewed | rtos-tasks |
| [ⓡ 이차원 배열이 더블포인터 인가?](http://kin.naver.com/open100/db_detail.php?d1id=1&dir_id=10104&eid=MUdIM2CtF67SgvJZyET/W5tFisGYFepK) | 404 · http-error | pointers-structs |
| [ⓡ C 유저를 위한 C++ 팁모음](http://www.joinc.co.kr/modules/moniwiki/wiki.php/Site/C%2B%2B/Documents/CPP_Programing_for_Cprogramer) | 404 · http-error | object-model |
| [ⓡ case 문에 "..."을 넣으면](http://blog.naver.com/PostView.nhn?blogId=softgear&logNo=100029665687&categoryNo=0&parentCategoryNo=0&viewDate=&currentPage=30&postListTopCurrentPage=1&isAfterWrite=true&userTopListOpen=true&userTopListCount=5&userTopListManageOpen=false&userTopListCurrentPage=30) | 200 · http-accessible-unreviewed | compile-pipeline |
| [ⓡ 부트로더에서 자신을 SDRAM에 복사하는 이유는?](http://keeptalk.cafe24.com/tc/i/entry/1181?TSSESSIONkeeptalkcafe24comtc=7547b34d1fa7289a6127faaa59e9ccb9) | 200 · http-accessible-unreviewed | reset-boot, flash-ram |
| [ⓡ Linked List 개념 정리 - 자료구조와 알고리즘](http://internet512.chonbuk.ac.kr/datastructure/link/list1.htm) | 0 · network-error | queues |
| [ⓡ 객체, 객체, 그리고 객체 - 객체란 무엇인가?](http://blog.naver.com/PostView.nhn?blogId=tkandrea92&logNo=80013538457&parentCategoryNo=4&viewDate=&currentPage=1&listtype=0&userTopListOpen=false&userTopListCount=5&userTopListManageOpen=false&userTopListCurrentPage=undefined) | 200 · http-accessible-unreviewed | object-model |
| [ⓡ Circular Queue(원형큐)를 이용한 데이터 버퍼링](http://blog.naver.com/esseny?Redirect=Log&logNo=30010706539) | 200 · http-accessible-unreviewed | queues |
| [ⓡ stack과 heap에 대해 & call by value와 call by reference의 차이](http://blog.naver.com/holyruby?Redirect=Log&logNo=40072759136) | 200 · http-accessible-unreviewed | c-memory |
| [ⓡ 함수 포인터와 코드 블럭](http://soooprmx.com/wp/archives/4244) | 404 · http-error | pointers-structs |
| [ⓡ 간단한 Linux Device Driver](http://blog.naver.com/raki?Redirect=Log&logNo=20010591107) | 200 · http-accessible-unreviewed | device-drivers |
| [ⓡ Android Platform이란?](http://yotteum.tistory.com/1) | 404 · http-error | android-stack |
| [ⓡ Operating System Inside](http://osinside.net/osinside/osinside.htm) | 200 · http-accessible-unreviewed | rtos-tasks |
| [ⓡ Debugging Embedded Linux](https://t1.daumcdn.net/cfile/blog/1276630D4B46A8A449) | 200 · http-accessible-unreviewed | debugging |
| [ⓡ L4 Programming Introduction](http://www.cse.unsw.edu.au/~cs9242/03/lectures/lect02.pdf) | 200 · http-accessible-unreviewed | rtos-tasks |
| [ⓡ 와치독타이머](http://irmus.tistory.com/entry/watchdog-timer) | 404 · http-error | timers-watchdog |
| [제목 없는 외부 참고 링크](http://www.kitkorea.com/front/php/b/file_download.php?no=93&filename=TR%EA%B7%B8%EB%9E%98%ED%94%84%EB%B3%B4%EB%8A%94%EB%B2%95.pdf) | 0 · network-error | transistor-amplifier |
| [ⓡ USB 장치가 포트에 끼워지면 어떤일이 일어날까](http://muosys.egloos.com/52055) | 403 · http-error | usb-basics |
| [ⓡ USB descriptor의 내용은 무엇인가](http://muosys.egloos.com/54013) | 403 · http-error | usb-basics |
| [ⓡ Serial 통신 Tutorial](http://www.sciencesoftware.co.kr/TALtech/Tutorials/intro_sc/intro_sc.htm) | 0 · network-error | serial-uart |
| [ⓡ SDRAM 메모리 관련 용어를](http://blog.naver.com/soccerlkh/50000388236) | 200 · http-accessible-unreviewed | flash-ram |
| [ⓡ SDRAM 동작원리](http://pds24.egloos.com/pds/201202/24/90/SDRAM_Principel.ppt) | 403 · http-error | flash-ram |
| [ⓡ Flash Memory Control 하기](http://www.falinux.com/win/01_hw/020_nand/index.htm) | 404 · http-error | flash-ram |
| [ⓡ SDRAM 인터페이스 설계](http://blog.paran.com/mtkim/3733193) | 0 · network-error | flash-ram |
| [ⓡ EBI & CS](http://slgi97.egloos.com/10849298) | 403 · http-error | memory-bus |
| [ⓡ DDR 1/2/3 SDRAM 원리과 느낌](http://cafe.naver.com/uboonam.cafe?iframe_url=/ArticleRead.nhn%3Farticleid=218&) | 200 · http-accessible-unreviewed | flash-ram |
| [ⓡ MMU와 MPU의 차이](http://materer.tistory.com/15) | 200 · http-accessible-unreviewed | memory-protection |
| [ⓡ NAND플래쉬의 이해](http://dooeui.blogspot.kr/2010/01/understanding-nand-flash-memory.html) | 200 · http-accessible-unreviewed | flash-ram |
| [ⓡ 안드로이드 개발환경 만들기 (윈도우즈기반)](http://neodreamer.tistory.com/347) | 404 · http-error | android-stack |
| [ⓡ Zygote가 새로운 프로세스를 생성하는 절차](http://andstudy.springnote.com/pages/4463733) | 0 · network-error | android-stack |
| [ⓡ 좀비 프로세스의 고찰](http://www.joinc.co.kr/modules/moniwiki//wiki.php/Site/system_programing/process/Zombie) | 404 · http-error | linux-process |
| [ⓡ ARM Assembly를 Source Insight에서 Parsing해서 보자](http://blog.naver.com/netray/80019674491) | 200 · http-accessible-unreviewed | asm-abi, dev-environment |
| [ⓡ Cygwin 한방에 설치하기!!](http://forum.falinux.com/zbxe/?document_srl=507502) | 200 · http-accessible-unreviewed | dev-environment |
| [ⓡ Source Insight 팁들 - PACKED, MACRO, Parsing 문제](http://yypbd.com/mediawiki/index.php/Source_Insight) | 404 · http-error | dev-environment |
| [ⓡ git가 도대체 뭐란 말인가요. 아하!](https://t1.daumcdn.net/cfile/blog/221E4A4A51A9D47036) | 200 · http-accessible-unreviewed | dev-environment |
| [ⓡ Trace32 Powerview 매뉴얼](https://t1.daumcdn.net/cfile/blog/126F54344D0F1E2E26) | 200 · http-accessible-unreviewed | debugging |
| [ⓡ 개발자심리학](http://www.zdnet.co.kr/Contents/2009/09/14/zdnet20090914155953.htm) | 404 · http-error | 일반 수학·심리·에디터·데이터베이스·자동링크 등 기초 임베디드 범위 밖의 참고 링크입니다. |
| [ⓡ 안드로이드 소스 따라잡기 - 개발자 심정](http://devicesoftware.tistory.com/entry/%EC%95%88%EB%93%9C%EB%A1%9C%EC%9D%B4%EB%93%9C-%EC%86%8C%EC%8A%A4%EC%BD%94%EB%93%9C-%EB%94%B0%EB%9D%BC%EC%9E%A1%EA%B8%B0-%EB%82%AE%EC%9E%A0%EB%8F%84-%EC%95%88%EC%9E%90%EB%8A%94-%ED%86%A0%EB%81%BC) | 200 · http-accessible-unreviewed | android-stack |
| [ⓡ 메모리 디버깅을 위한 친구 (rmalloc)](http://jh4hj.tistory.com/351) | 200 · http-accessible-unreviewed | debugging |
| [ⓡ 스택 탐색을 통한 디버깅](http://jh4hj.tistory.com/353) | 200 · http-accessible-unreviewed | debugging |
| [ⓡ 베이즈 이론이 푸리에 정리를 만났을 때](https://brunch.co.kr/@cojette/1) | 200 · http-accessible-unreviewed | 일반 수학·심리·에디터·데이터베이스·자동링크 등 기초 임베디드 범위 밖의 참고 링크입니다. |
| [http://recipes.egloos.com](http://recipes.egloos.com) | 403 · http-error | 직접 대응할 기술 주제를 확인하지 못한 보조·메타 링크입니다. 원 URL과 접근 상태만 보존합니다. |
