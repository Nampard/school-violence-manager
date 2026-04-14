import { DocumentType } from '../types';
import type { ApiSuccessResponse, ApiErrorResponse, DocumentGenerationResponse } from '../types';

export const mockGenerateSuccess = (targetForm: DocumentType): ApiSuccessResponse<DocumentGenerationResponse> => {
  let label = "";
  let targetField = "";
  let text = "";
  let charLimit = 0;
  let styleProfile = "";
  let sourceForm = DocumentType.FORM_12 as string;

  switch (targetForm) {
    case DocumentType.FORM_10_CASE_INTAKE:
      label = "사안접수 보고 사실 확인내용";
      targetField = "사실 확인내용";
      text = "2026년 4월 13일 13:00경 타 학급 학생 A가 복도에서 B에게 모욕적인 언사를 하였다는 신고를 접수함. 관련 내용 확인 중임.";
      charLimit = 1000;
      styleProfile = "행정문체, 판단 단정 금지";
      sourceForm = "비정형 진술 입력란";
      break;
    case DocumentType.FORM_18:
      label = "전담기구 심의결과 (심의내용)";
      targetField = "심의내용";
      text = "- 일시 및 장소: 2026. 4. 13. 13:00경 체육관\n- 내용: A학생이 B학생에게 언어적 모욕을 가함.\n- 판단결과: 일회성 갈등으로 확인됨.";
      charLimit = 500;
      styleProfile = "개조식, 행정기관 문체";
      break;
    case DocumentType.FORM_19:
      label = "전담기구 심의결과[종결] (심의내용)";
      targetField = "심의내용";
      text = "- 쌍방 사과 및 화해로 종결함.\n- 지속성, 고의성 등 학교폭력의 심각성이 낮음.";
      charLimit = 500;
      styleProfile = "개조식, 행정기관 문체";
      break;
    case DocumentType.FORM_20:
      label = "학교장 자체해결 동의서 (사안 요약)";
      targetField = "동의서 사안 요약/관련 내용";
      text = "2026년 4월 13일 발생한 학생 간 갈등에 대하여, 양측 학생 및 보호자가 원만히 합의하고 학교장의 자체해결에 동의합니다.";
      charLimit = 400;
      styleProfile = "보호자 대상 중립 문체";
      break;
    case DocumentType.FORM_21:
      label = "학교장 자체해결 결과 (관련 내용)";
      targetField = "자체해결 결과 관련 내용";
      text = "본 사안은 상호 화해로 종결되었으며, 향후 유사 사례가 발생하지 않도록 교내 생활 지도를 강화할 예정입니다.";
      charLimit = 400;
      styleProfile = "보호자 대상 중립 문체";
      break;
    case DocumentType.FORM_22:
      label = "최종 사안조사 내용 (종합)";
      targetField = "사안조사 내용";
      text = "심의결과 및 자체해결 결과에 따라, 당사자 간 합의가 이루어졌고 추가적인 조치 없이 사안을 최종 종결함. 관련 내용은 학생 지도 자료로 활용 예정.";
      charLimit = 400;
      styleProfile = "종합 요약";
      break;
    default:
      label = "임시 문구 생성";
      targetField = "기타";
      text = "생성 결과 블록 (테스트용)";
      charLimit = 300;
      styleProfile = "기본";
      break;
  }

  return {
    status: "success",
    data: {
      copy_blocks: [
        {
          id: `cb-${Date.now()}-1`,
          source_form: sourceForm,
          target_form: targetForm,
          target_field: targetField,
          label: label,
          text: text,
          char_limit: charLimit,
          style_profile: styleProfile,
          review_required: true,
          status: "DRAFT",
        }
      ],
    },
    meta: {
      request_id: "uuid-1234-5678",
      timestamp: new Date().toISOString()
    }
  };
};

export const mockFormSourceRequiredError: ApiErrorResponse = {
  status: "error",
  error: {
    code: "FORM_SOURCE_REQUIRED",
    message: "먼저 사안조사 보고서(<서식12>)를 입력하고 저장해 주세요."
  },
  meta: {
    request_id: "uuid-error-9012",
    timestamp: new Date().toISOString()
  }
};

export const mockFormDirtyError: ApiErrorResponse = {
  status: "error",
  error: {
    code: "FORM_SOURCE_DIRTY",
    message: "작성 중인 <서식12>가 저장되지 않았습니다. 먼저 변경사항을 저장해 주세요."
  },
  meta: {
    request_id: "uuid-error-1100",
    timestamp: new Date().toISOString()
  }
};

export const mockFormDependenciesMissingError: ApiErrorResponse = {
  status: "error",
  error: {
    code: "FORM_DEPENDENCIES_MISSING",
    message: "<서식22>를 생성하려면 <서식19>, <서식20>, 또는 <서식21> 의 결과가 상태에 반영되어 있어야 합니다."
  },
  meta: {
    request_id: "uuid-error-2211",
    timestamp: new Date().toISOString()
  }
};

export const mockJobRunningError: ApiErrorResponse = {
  status: "error",
  error: {
    code: "DOCUMENT_JOB_RUNNING",
    message: "현재 AI 문구 생성 작업이 진행 중입니다. 잠시 후 다시 확인해 주세요."
  },
  meta: {
    request_id: "uuid-error-3456",
    timestamp: new Date().toISOString()
  }
};
