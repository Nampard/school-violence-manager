import React, { useState } from 'react';
import { CopyBlockCard } from '../components/CopyBlockCard';
import { DocumentType } from '../types';
import type { CopyBlock, ApiErrorResponse } from '../types';
import { mockGenerateSuccess } from '../mocks/api';

export const CaseIntake: React.FC = () => {
  const [statement, setStatement] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<ApiErrorResponse | null>(null);
  const [results, setResults] = useState<CopyBlock[] | null>(null);

  const handleGenerate = () => {
    if (!statement.trim()) return;
    setLoading(true);
    setErrorStatus(null);
    setResults(null);

    setTimeout(() => {
      setLoading(false);
      const successData = mockGenerateSuccess(DocumentType.FORM_10_CASE_INTAKE);
      setResults(successData.data.copy_blocks);
    }, 800);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 sm:p-10 lg:p-12 space-y-10">

      {/* Header */}
      <header className="flex flex-col gap-3 text-center sm:text-left sm:items-start items-center">
        <span className="inline-block bg-blue-50 text-blue-600 border border-blue-100 text-[12px] font-bold px-3 py-1.5 rounded-full tracking-wide">
          서식 10
        </span>
        <h1 className="text-[28px] sm:text-3xl font-extrabold text-slate-900 tracking-tight">사안 접수</h1>
        <p className="text-[15px] text-slate-500 leading-relaxed max-w-2xl">
          관련자의 진술이나 신고 내용을 자유롭게 적어주세요. <br className="hidden sm:block" />
          AI가 <span className="text-blue-600 font-semibold">&lt;서식10&gt; 사안접수 보고</span>에 적합한 행정문체로 다듬어 드립니다.
        </p>
      </header>

      {/* Input Section */}
      <section className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 sm:p-8 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 text-blue-600 p-1.5 rounded-lg">
              <span className="material-symbols-outlined text-[18px] block">assignment_add</span>
            </div>
            <h2 className="text-[18px] font-bold text-slate-800">비정형 사실 확인내용 입력</h2>
          </div>
          <p className="text-[13px] text-slate-500 pl-9">학생·보호자·목격자로부터 청취한 내용을 있는 그대로 입력해 주세요.</p>
        </div>

        <div className="relative group">
          <textarea
            className="w-full h-48 bg-white p-5 rounded-xl text-[15px] leading-[1.6] text-slate-700 outline-none transition-all duration-200 resize-none border border-slate-200 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400"
            placeholder="예) 4월 13일 점심시간, A가 B 가방을 걷어찼다는 신고 접수. B 학생이 담임에게 찾아왔고 눈물을 흘림..."
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
          <p className="text-[13px] text-slate-400 font-medium w-full text-center sm:text-left">
            입력 후 생성된 문구를 HWP 서식에 붙여넣으세요.
          </p>
          <button
            onClick={handleGenerate}
            disabled={!statement.trim() || loading}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-[14px] transition-all duration-200 flex items-center justify-center gap-2 shrink-0 ${statement.trim() && !loading
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
            ) : (
              <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
            )}
            {loading ? 'AI 초안 생성 중...' : '행정문체로 변환'}
          </button>
        </div>
      </section>

      {/* Results Section */}
      {results && (
        <section className="flex flex-col gap-5 animate-fade-in-up">
          <div className="flex items-center gap-2 px-1">
            <span className="material-symbols-outlined text-[22px] text-emerald-500">check_circle</span>
            <h2 className="text-[18px] font-bold text-slate-800">변환 완료된 서식 초안</h2>
          </div>
          <div className="grid grid-cols-1 gap-5">
            {results.map((block) => (
              <CopyBlockCard key={block.id} block={block} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};