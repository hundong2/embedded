/** Manual provenance record. A successful link check must never create these approvals. */
export const primarySourceReviews = Object.fromEntries(
  [
    [
      'https://www.ti.com/document-viewer/lit/html/SSZTCG6/GUID-1FB9BB52-BA94-4241-8302-457AD289FB19',
      'Texas Instruments 기술 글의 charge-pump·인덕터 기반 DC/DC 비교 내용을 확인했습니다.',
    ],
    [
      'https://www.ti.com/lit/wp/slpy005/slpy005.pdf',
      'Texas Instruments 원문 PDF의 switched-capacitor 동작·구성·LDO와 변환기 비교를 확인했습니다.',
    ],
    [
      'https://www.murata.com/en-global/products/inductor/overview/learn/glossary',
      'Murata 공식 용어 설명의 실제 인덕터 기생 성분·자기 공진 범위를 확인했습니다.',
    ],
    [
      'https://www.usb.org/defined-class-codes',
      'USB-IF의 device/interface descriptor와 class 정보 설명을 확인했습니다.',
    ],
    [
      'https://learn.microsoft.com/en-us/windows-hardware/drivers/usbcon/usb-device-descriptors',
      'Microsoft 원문의 장치 descriptor 구조와 host의 GET_DESCRIPTOR 접근 설명을 확인했습니다.',
    ],
    [
      'https://source.android.com/docs/core/architecture',
      'AOSP 공식 architecture 문서의 앱·프레임워크·서비스·런타임·HAL·커널 층을 확인했습니다.',
    ],
    [
      'https://source.android.com/docs/core/runtime/zygote',
      'AOSP 공식 Zygote 문서의 init·시스템 서비스·앱 프로세스 생성 역할을 확인했습니다.',
    ],
    [
      'https://cdn.kernel.org/doc/html/latest/driver-api/driver-model/overview.html',
      'Linux Kernel 공식 device model 원문의 bus·device·driver 관계와 발견·전원 관리·수명을 확인했습니다.',
    ],
    [
      'https://man7.org/linux/man-pages/man2/wait.2.html',
      'Linux man-pages 원문의 wait 계열과 종료 후 좀비 상태·자원 회수 설명을 확인했습니다.',
    ],
  ].map(([url, reviewMethod]) => [
    url,
    {
      reviewed: true,
      reviewedAt: '2026-10-16',
      access: 'primary-content-checked',
      reviewMethod,
    },
  ]),
);
