"use client";

import { Check } from "lucide-react";

interface Step {
    id: number;
    title: string;
    description?: string;
}

interface StepperProps {
    steps: Step[];
    currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
    return (
        <div className="w-full">
            <div className="relative flex justify-between">
                {/* Connecting Line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/10 -z-0">
                    <div
                        className="h-full bg-neon transition-all duration-500 ease-in-out"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    />
                </div>

                {steps.map((step) => {
                    const isCompleted = step.id < currentStep;
                    const isCurrent = step.id === currentStep;

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center group">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
                                        ? "bg-neon border-neon text-black"
                                        : isCurrent
                                            ? "bg-black border-neon text-neon shadow-[0_0_15px_-5px_rgba(224,130,255,0.5)]"
                                            : "bg-black border-white/10 text-gray-500 group-hover:border-white/30"
                                    }`}
                            >
                                {isCompleted ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    <span className="text-sm font-bold">{step.id}</span>
                                )}
                            </div>
                            <div className="mt-3 text-center">
                                <p className={`text-xs font-semibold uppercase tracking-wider transition-colors ${isCurrent ? "text-white" : "text-gray-500"}`}>
                                    {step.title}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
