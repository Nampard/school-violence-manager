import React, { useState } from 'react';
import { CopyBlockCard } from '../components/CopyBlockCard';
import { DocumentType } from '../types';
import type { CopyBlock, ApiErrorResponse } from '../types';
import { mockGenerateSuccess, mockFormSourceRequiredError, mockFormDirtyError, mockFormDependenciesMissingError } from '../mocks/api';

export const CaseDocuments: React.FC = () => {
  const [hasSourceForm, setHasSourceForm] = useState(false);
  const [form12Content, setForm12Content] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [hasDependencies, setHasDependencies] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<ApiErrorResponse | null>(null);
  const [results, setResults] = useState<CopyBlock[] | null>(null);
  const [activeFormType, setActiveFormType] = useState<DocumentType | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm12Content(e.target.value);
    if (hasSourceForm) setIsDirty(true);
  };

  const handleSaveForm12 = () => {
    if (form12Content.trim()) {
      setHasSourceForm(true);
      setIsDirty(false);
      setErrorStatus(null);
    } else {
      setHasSourceForm(false);
      setIsDirty(false);
    }
  };

  const handleGenerate = (targetType: DocumentType) => {
    setActiveFormType(targetType);
    setLoading(true);
    setErrorStatus(null);
    setResults(null);

    setTimeout(() => {
      setLoading(false);

      if (!hasSourceForm) {
        setErrorStatus(mockFormSourceRequiredError);
        return;
      }
      if (isDirty) {
        setErrorStatus(mockFormDirtyError);
        return;
      }
      if (targetType === DocumentType.FORM_22 && !hasDependencies) {
        setErrorStatus(mockFormDependenciesMissingError);
        return;
      }

      const successData = mockGenerateSuccess(targetType);

      if ([DocumentType.FORM_19, DocumentType.FORM_20, DocumentType.FORM_21].includes(targetType)) {
        setHasDependencies(true);
      }
      setResults(successData.data.copy_blocks);
    }, 800);
  };

  const formButtons = [
    { title: "전담기구 심의결과", subtitle: "<서식18>", type: DocumentType.FORM_18, purpose: "초기 심의" },
    { title: "심의결과 [종결]", subtitle: "<서식19>", type: DocumentType.FORM_19, purpose: "자체 화해/종결" },
    { title: "자체해결 동의서", subtitle: "<서식20>", type: DocumentType.FORM_20, purpose: "보호자 확인" },
    { title: "자체해결 결과", subtitle: "<서식21>", type: DocumentType.FORM_21, purpose: "학내 기록" },
    { title: "사안조사 내용", subtitle: "<서식22>", type: DocumentType.FORM_22, purpose: "종합 보고 (선행 필요)" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto p-6 sm:p-10 lg:p-12 space-y-12">

      {/* Header Title */}
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="bg-slate-100 text-slate-600 text-[12px] font-bold px-3 py-1.5 rounded-full tracking-wide">
            서식 12 기반 연계
          </span>
        </div>
        <h1 className="text-[28px] sm:text-3xl font-extrabold text-slate-900 tracking-tight">사안 문서 관리</h1>
        <p className="text-[15px] text-slate-500 leading-relaxed max-w-3xl">
          사안조사 기록을 바탕으로 행정 서식 초안을 일괄 생성합니다. 모든 자동 생성 문구는 <span className="text-amber-600 font-semibold">교사 검토</span>가 필요합니다.
        </p>
      </header>

      {/* 1. Source Area: <서식12> */}
      <section className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg">
                <span className="material-symbols-outlined text-[18px] block">edit_document</span>
              </div>
              <h2 className="text-[18px] font-bold text-slate-800">사안조사 보고서 &lt;서식12&gt; 입력</h2>
            </div>
            <p className="text-[13px] text-slate-500 pl-9">이 조사 내용은 모든 후속 서식 생성의 <strong className="text-slate-700">기준(Source)</strong>이 됩니다.</p>
          </div>

          <div className="flex gap-2 self-start sm:self-auto">
            {isDirty && (
              <span className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-[13px] font-bold text-amber-700 flex items-center gap-1.5 animate-pulse">
                <span className="material-symbols-outlined text-[16px]">warning</span> 수정됨
              </span>
            )}
            {hasSourceForm && !isDirty && (
              <span className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-[13px] font-bold text-emerald-700 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">verified</span> 저장 완료
              </span>
            )}
          </div>
        </div>

        <textarea
          className={`w-full h-44 bg-white p-5 rounded-xl text-[15px] leading-[1.6] text-slate-700 outline-none transition-all duration-200 resize-none border shadow-sm focus:ring-4 focus:ring-indigo-500/10 ${isDirty ? 'border-amber-300 bg-amber-50/10 focus:border-amber-400' : 'border-slate-200 focus:border-indigo-500'
            } placeholder:text-slate-400`}
          placeholder="조사관이 수집한 사안의 사실 확인 및 조사 내용을 이곳에 상세히 기록해 주세요."
          value={form12Content}
          onChange={handleTextChange}
        />

        <div className="flex justify-end">
          <button
            onClick={handleSaveForm12}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-[14px] shadow-md shadow-indigo-500/20 hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            조사 내용 저장
          </button>
        </div>
      </section>

      {/* 2. Target Area: 후속 서식 문구 생성 */}
      <section className="flex flex-col gap-6 pt-4 border-t border-slate-100">
        <div className="flex flex-col gap-1.5 px-1">
          <h2 className="text-[18px] font-bold text-slate-800">후속 서식용 문구 생성</h2>
          <p className="text-[13px] text-slate-500">저장된 &lt;서식12&gt;를 바탕으로 작성할 서식을 선택해 주세요.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {formButtons.map((btn) => {
            const isForm22 = btn.type === DocumentType.FORM_22;
            const isActive = activeFormType === btn.type && !errorStatus && results !== null;
            const missingDeps = isForm22 && !hasDependencies;

            return (
              <button
                key={btn.type}
                onClick={() => handleGenerate(btn.type)}
                disabled={missingDeps}
                className={`p-4 rounded-xl flex flex-col items-start text-left transition-all duration-200 border ${isActive
                    ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                  } ${missingDeps ? 'opacity-40 cursor-not-allowed bg-slate-50' : ''}`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                    {btn.subtitle}
                  </span>
                  {missingDeps && <span className="material-symbols-outlined text-[16px] text-slate-400">lock</span>}
                </div>
                <span className={`font-bold text-[14px] ${isActive ? 'text-blue-900' : 'text-slate-800'}`}>{btn.title}</span>
                <span className={`text-[12px] mt-1 font-medium ${isActive ? 'text-blue-600/80' : 'text-slate-400'}`}>{btn.purpose}</span>
              </button>
            )
          })}
        </div>

        {/* Error Message Area */}
        {errorStatus && (
          <div className="bg-rose-50/80 border border-rose-200 p-5 rounded-xl flex flex-col gap-1 mt-2 animate-fade-in-up">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-500 text-[20px]">error</span>
              <h3 className="font-bold text-rose-700 text-[15px]">문구 생성 불가</h3>
            </div>
            <p className="pl-7 text-[14px] text-rose-600/90 font-medium">{errorStatus.error.message}</p>
          </div>
        )}

        {/* Loading Area */}
        {loading && (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400">
            <span className="material-symbols-outlined animate-spin text-[32px] text-blue-500">sync</span>
            <p className="mt-4 font-bold text-[14px] text-slate-500">AI가 문맥을 분석하여 초안을 작성하고 있습니다...</p>
          </div>
        )}

        {/* Generated Results Area */}
        {results && (
          <div className="grid grid-cols-1 gap-5 mt-4 animate-fade-in-up">
            {results.map((block) => (
              <CopyBlockCard key={block.id} block={block} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
};