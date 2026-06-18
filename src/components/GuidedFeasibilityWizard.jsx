import React, { useEffect, useMemo, useState } from 'react';

/**
 * GuidedFeasibilityWizard
 * 建模可行性评估不通过时的分步引导向导
 * - 按缺失的建模要素分步引导用户补充信息
 * - 每步提供问题提示和输入框
 * - 支持前进/后退/跳过
 * - 最终汇总用户补充内容并提交
 */
export default function GuidedFeasibilityWizard({
  issues = [],
  suggestion = '',
  onSubmit,
  onCancel,
  loading = false,
}) {
  const validIssues = useMemo(() => issues.filter((issue) => issue && issue.question), [issues]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    setCurrentStep(0);
    setAnswers({});
  }, [validIssues]);

  if (!validIssues || validIssues.length === 0) {
    return (
      <div className="guided-wizard">
        <div className="guided-wizard-header">
          <h4>信息已完整</h4>
          <p>当前描述已包含建模所需的全部要素，可以直接开始建模。</p>
        </div>
        <div className="guided-wizard-actions">
          <button className="btn btn-primary" onClick={() => onSubmit && onSubmit('')} disabled={loading}>
            {loading ? '提交中...' : '开始建模'}
          </button>
        </div>
      </div>
    );
  }

  const totalSteps = validIssues.length;
  const issue = validIssues[currentStep];
  const currentAnswer = answers[issue.element] || '';

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleAnswerChange = (value) => {
    setAnswers((prev) => ({ ...prev, [issue.element]: value }));
  };

  const handleSubmit = () => {
    const summary = validIssues
      .map((item) => {
        const answer = answers[item.element]?.trim();
        if (!answer) return null;
        return `${item.title}：${answer}`;
      })
      .filter(Boolean)
      .join('；');

    const fullText = summary || '请继续帮我分析并补充缺失的建模要素。';
    onSubmit && onSubmit(fullText, answers);
  };

  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="guided-wizard">
      <div className="guided-wizard-header">
        <h4>补充建模信息</h4>
        <p>{suggestion || '为了生成更准确的优化模型，请补充以下信息：'}</p>
      </div>

      <div className="guided-wizard-progress">
        <div className="guided-wizard-progress-bar">
          <div
            className="guided-wizard-progress-fill"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
        <div className="guided-wizard-step-info">
          步骤 {currentStep + 1} / {totalSteps}
        </div>
      </div>

      <div className="guided-wizard-step">
        <div className="guided-wizard-step-title">{issue.title}</div>
        <div className="guided-wizard-step-question">{issue.question}</div>
        <textarea
          className="guided-wizard-input"
          rows={4}
          placeholder={`请补充${issue.title}相关信息（例如：${(issue.keywords || []).slice(0, 3).join('、')}）...`}
          value={currentAnswer}
          onChange={(e) => handleAnswerChange(e.target.value)}
        />
      </div>

      <div className="guided-wizard-actions">
        {onCancel && (
          <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>
            取消
          </button>
        )}
        <button className="btn btn-ghost" onClick={handleSkip} disabled={loading}>
          跳过
        </button>
        {currentStep > 0 && (
          <button className="btn btn-secondary" onClick={handlePrev} disabled={loading}>
            上一步
          </button>
        )}
        {!isLastStep ? (
          <button className="btn btn-primary" onClick={handleNext} disabled={loading}>
            下一步
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? '提交中...' : '提交补充'}
          </button>
        )}
      </div>
    </div>
  );
}
