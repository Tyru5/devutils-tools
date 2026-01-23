import { useState, useEffect, useCallback } from "react";
import Textarea from "./shared/Textarea";
import CopyButton from "./shared/CopyButton";
import {
  transforms,
  executeTransform,
  getTransformById,
  generateId,
  getWorkflows,
  saveWorkflow,
  deleteWorkflow,
  encodeWorkflowToUrl,
  decodeWorkflowFromUrl,
  type TransformType,
  type WorkflowStep,
  type Workflow,
  type Transform,
} from "../../lib/workflow";

const categoryLabels: Record<Transform["category"], string> = {
  encode: "Encode",
  decode: "Decode",
  format: "Format",
  hash: "Hash",
  text: "Text",
  convert: "Convert",
};

const categoryOrder: Transform["category"][] = [
  "encode",
  "decode",
  "format",
  "hash",
  "text",
  "convert",
];

export default function WorkflowBuilder() {
  const [input, setInput] = useState("");
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [savedWorkflows, setSavedWorkflows] = useState<Workflow[]>([]);
  const [workflowName, setWorkflowName] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showTransformPicker, setShowTransformPicker] = useState(false);

  useEffect(() => {
    setSavedWorkflows(getWorkflows());

    const params = new URLSearchParams(window.location.search);
    const chain = params.get("chain");
    if (chain) {
      const transformIds = decodeWorkflowFromUrl(chain);
      if (transformIds.length > 0) {
        setSteps(
          transformIds.map((id) => ({
            id: generateId(),
            transformId: id,
          })),
        );
      }
    }
  }, []);

  const addStep = (transformId: TransformType) => {
    setSteps([...steps, { id: generateId(), transformId }]);
    setShowTransformPicker(false);
  };

  const removeStep = (stepId: string) => {
    setSteps(steps.filter((s) => s.id !== stepId));
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    const newSteps = [...steps];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;
    [newSteps[index], newSteps[newIndex]] = [
      newSteps[newIndex],
      newSteps[index],
    ];
    setSteps(newSteps);
  };

  const runWorkflow = useCallback(async () => {
    if (!input.trim() || steps.length === 0) return;

    setIsRunning(true);
    let currentInput = input;
    const newSteps = [...steps];

    for (let i = 0; i < newSteps.length; i++) {
      try {
        const output = await executeTransform(
          newSteps[i].transformId,
          currentInput,
        );
        newSteps[i] = { ...newSteps[i], output, error: undefined };
        currentInput = output;
      } catch (e) {
        newSteps[i] = {
          ...newSteps[i],
          output: undefined,
          error: e instanceof Error ? e.message : "Transform failed",
        };
        break;
      }
    }

    setSteps(newSteps);
    setIsRunning(false);
  }, [input, steps]);

  const clearAll = () => {
    setInput("");
    setSteps([]);
    setShareUrl(null);
  };

  const handleSave = () => {
    if (!workflowName.trim() || steps.length === 0) return;

    const workflow: Workflow = {
      id: generateId(),
      name: workflowName.trim(),
      steps: steps.map((s) => ({ id: s.id, transformId: s.transformId })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    saveWorkflow(workflow);
    setSavedWorkflows(getWorkflows());
    setWorkflowName("");
    setShowSaveModal(false);
  };

  const loadWorkflow = (workflow: Workflow) => {
    setSteps(
      workflow.steps.map((s) => ({
        id: generateId(),
        transformId: s.transformId,
      })),
    );
  };

  const handleDelete = (id: string) => {
    deleteWorkflow(id);
    setSavedWorkflows(getWorkflows());
  };

  const generateShareUrl = () => {
    if (steps.length === 0) return;
    const encoded = encodeWorkflowToUrl(steps);
    const url = `${window.location.origin}${window.location.pathname}?chain=${encoded}`;
    setShareUrl(url);
  };

  const finalOutput =
    steps.length > 0 ? steps[steps.length - 1]?.output : undefined;
  const hasError = steps.some((s) => s.error);

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="card">
        <Textarea
          value={input}
          onChange={setInput}
          placeholder="Enter your input data here..."
          label="Input"
          rows={6}
        />
      </div>

      {/* Transform Chain */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Transform Chain
          </h3>
          <button
            onClick={() => setShowTransformPicker(true)}
            className="btn btn-secondary text-sm"
          >
            + Add Transform
          </button>
        </div>

        {steps.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-neutral-200 p-8 text-center dark:border-neutral-800">
            <p className="text-sm text-neutral-500">
              No transforms added yet. Click "Add Transform" to build your
              chain.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {steps.map((step, index) => {
              const transform = getTransformById(step.transformId);
              return (
                <div
                  key={step.id}
                  className={`group relative rounded-lg border p-4 transition-colors ${
                    step.error
                      ? "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950"
                      : step.output
                        ? "border-green-300 bg-green-50 dark:border-green-900 dark:bg-green-950"
                        : "border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-6 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium dark:bg-neutral-700">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <span className="font-medium">{transform?.name}</span>
                      <span className="ml-2 text-sm text-neutral-500">
                        {transform?.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => moveStep(index, "up")}
                        disabled={index === 0}
                        className="rounded p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 disabled:opacity-30 dark:hover:bg-neutral-700"
                        title="Move up"
                      >
                        <svg
                          className="size-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveStep(index, "down")}
                        disabled={index === steps.length - 1}
                        className="rounded p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 disabled:opacity-30 dark:hover:bg-neutral-700"
                        title="Move down"
                      >
                        <svg
                          className="size-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeStep(step.id)}
                        className="rounded p-1 text-neutral-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950"
                        title="Remove"
                      >
                        <svg
                          className="size-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {step.error && (
                    <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                      Error: {step.error}
                    </div>
                  )}
                  {step.output && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
                        Show intermediate output
                      </summary>
                      <pre className="mt-2 max-h-32 overflow-auto rounded bg-white p-2 font-mono text-xs dark:bg-neutral-950">
                        {step.output.slice(0, 500)}
                        {step.output.length > 500 && "..."}
                      </pre>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Chain connector arrows */}
        {steps.length > 0 && (
          <div className="mt-4 flex items-center justify-center">
            <svg
              className="size-6 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={runWorkflow}
          disabled={!input.trim() || steps.length === 0 || isRunning}
          className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRunning ? "Running..." : "Run Chain"}
        </button>
        <button
          onClick={() => setShowSaveModal(true)}
          disabled={steps.length === 0}
          className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save Workflow
        </button>
        <button
          onClick={generateShareUrl}
          disabled={steps.length === 0}
          className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Share
        </button>
        <button onClick={clearAll} className="btn btn-ghost">
          Clear All
        </button>
      </div>

      {/* Share URL */}
      {shareUrl && (
        <div className="card">
          <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Share URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="input flex-1 font-mono text-sm"
            />
            <CopyButton text={shareUrl} />
          </div>
        </div>
      )}

      {/* Output */}
      {finalOutput && !hasError && (
        <div className="card">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              Final Output
            </label>
            <CopyButton text={finalOutput} />
          </div>
          <pre className="max-h-64 overflow-auto rounded-md bg-neutral-50 p-4 font-mono text-sm dark:bg-neutral-900">
            {finalOutput}
          </pre>
        </div>
      )}

      {/* Saved Workflows */}
      {savedWorkflows.length > 0 && (
        <div className="card">
          <h3 className="mb-4 text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Saved Workflows
          </h3>
          <div className="space-y-2">
            {savedWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                className="group flex items-center justify-between rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
              >
                <div>
                  <span className="font-medium">{workflow.name}</span>
                  <span className="ml-2 text-sm text-neutral-500">
                    ({workflow.steps.length} step
                    {workflow.steps.length !== 1 ? "s" : ""})
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadWorkflow(workflow)}
                    className="btn btn-secondary text-sm"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => handleDelete(workflow.id)}
                    className="rounded p-1.5 text-neutral-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950"
                  >
                    <svg
                      className="size-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transform Picker Modal */}
      {showTransformPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-lg bg-white p-6 dark:bg-neutral-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Transform</h3>
              <button
                onClick={() => setShowTransformPicker(false)}
                className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800"
              >
                <svg
                  className="size-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="space-y-6">
              {categoryOrder.map((category) => {
                const categoryTransforms = transforms.filter(
                  (t) => t.category === category,
                );
                if (categoryTransforms.length === 0) return null;
                return (
                  <div key={category}>
                    <h4 className="mb-2 text-xs font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                      {categoryLabels[category]}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {categoryTransforms.map((transform) => (
                        <button
                          key={transform.id}
                          onClick={() => addStep(transform.id)}
                          className="rounded-lg border border-neutral-200 p-3 text-left transition-colors hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:border-neutral-500 dark:hover:bg-neutral-800"
                        >
                          <div className="font-medium">{transform.name}</div>
                          <div className="text-xs text-neutral-500">
                            {transform.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-neutral-900">
            <h3 className="mb-4 text-lg font-semibold">Save Workflow</h3>
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Workflow name..."
              className="input mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!workflowName.trim()}
                className="btn btn-primary disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
