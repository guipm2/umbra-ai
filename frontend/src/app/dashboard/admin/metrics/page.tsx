"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, RefreshCw, Server, Activity, Clock3, Bot } from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";
import { apiFetch } from "@/lib/api";

interface HttpRequestMetric {
  method: string;
  path: string;
  status: string;
  count: number;
}

interface AgentCallMetric {
  agent: string;
  status: string;
  count: number;
}

interface AvgDurationMetric {
  avg_ms: number;
  count: number;
  method?: string;
  path?: string;
  agent?: string;
}

interface AlertThresholds {
  http_error_rate_warning: number;
  http_error_rate_critical: number;
  http_p95_warning_ms: number;
  http_p95_critical_ms: number;
  agent_error_rate_warning: number;
  agent_error_rate_critical: number;
  agent_p95_warning_ms: number;
  agent_p95_critical_ms: number;
}

interface AdminAlert {
  category: string;
  severity: "warning" | "critical";
  target: {
    method?: string;
    path?: string;
    agent?: string;
  };
  value: number;
  threshold: number;
  message: string;
}

interface AdminMetricsSummary {
  request_id: string | null;
  uptime_seconds: number;
  http_requests_total: HttpRequestMetric[];
  http_duration_ms_avg: AvgDurationMetric[];
  agent_calls_total: AgentCallMetric[];
  agent_duration_ms_avg: AvgDurationMetric[];
  alert_thresholds: AlertThresholds;
  alerts: AdminAlert[];
}

interface MetricsSnapshot {
  timestamp: string;
  totalHttpCalls: number;
  totalAgentCalls: number;
  totalAgentErrors: number;
  totalAlerts: number;
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

export default function AdminMetricsPage() {
  const router = useRouter();
  const { loading, isSuperAdmin } = useAuth();
  const [data, setData] = useState<AdminMetricsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [snapshots, setSnapshots] = useState<MetricsSnapshot[]>([]);

  const refreshMetrics = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const response = await apiFetch("/api/admin/metrics-summary", { method: "GET" });
      if (response.status === 403) {
        setError("Você não possui permissão para acessar este painel.");
        return;
      }
      if (!response.ok) {
        throw new Error(`Falha ao carregar métricas (${response.status})`);
      }
      const payload = (await response.json()) as AdminMetricsSummary;
      setData(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar métricas");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!isSuperAdmin) {
      router.replace("/dashboard");
      return;
    }
    refreshMetrics();

    const timer = setInterval(() => {
      refreshMetrics();
    }, 15000);

    return () => clearInterval(timer);
  }, [loading, isSuperAdmin, router]);

  const totals = useMemo(() => {
    if (!data) {
      return {
        totalHttpCalls: 0,
        totalAgentCalls: 0,
        totalAgentErrors: 0,
        totalAlerts: 0,
        criticalAlerts: 0,
      };
    }

    const totalHttpCalls = data.http_requests_total.reduce((acc, item) => acc + item.count, 0);
    const totalAgentCalls = data.agent_calls_total.reduce((acc, item) => acc + item.count, 0);
    const totalAgentErrors = data.agent_calls_total
      .filter((item) => item.status === "error")
      .reduce((acc, item) => acc + item.count, 0);

    const totalAlerts = data.alerts.length;
    const criticalAlerts = data.alerts.filter((item) => item.severity === "critical").length;

    return { totalHttpCalls, totalAgentCalls, totalAgentErrors, totalAlerts, criticalAlerts };
  }, [data]);

  useEffect(() => {
    if (!data) return;
    const snapshot: MetricsSnapshot = {
      timestamp: new Date().toISOString(),
      totalHttpCalls: totals.totalHttpCalls,
      totalAgentCalls: totals.totalAgentCalls,
      totalAgentErrors: totals.totalAgentErrors,
      totalAlerts: totals.totalAlerts,
    };

    setSnapshots((prev) => {
      const next = [...prev, snapshot].slice(-12);
      return next;
    });
  }, [data, totals.totalAgentCalls, totals.totalAgentErrors, totals.totalAlerts, totals.totalHttpCalls]);

  if (loading || !isSuperAdmin) {
    return (
      <div className="p-8 text-gray-300">Validando acesso...</div>
    );
  }

  return (
    <div className="w-full max-w-[1800px] mx-auto p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-red-400" />
            Admin Metrics
          </h1>
          <p className="text-sm text-gray-400 mt-1">Painel restrito a usuários com super acesso.</p>
          {data?.request_id && (
            <p className="text-xs text-gray-500 mt-2">request_id da consulta atual: {data.request_id}</p>
          )}
        </div>
        <button
          onClick={refreshMetrics}
          disabled={refreshing}
          className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/10 hover:bg-white/15 transition-colors flex items-center gap-2 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 text-sm">
          {error}
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="glass rounded-xl p-4 border border-white/10">
              <div className="text-xs text-gray-400 uppercase">Uptime</div>
              <div className="text-xl text-white font-bold mt-2 flex items-center gap-2"><Clock3 className="h-4 w-4 text-neon" />{formatUptime(data.uptime_seconds)}</div>
            </div>
            <div className="glass rounded-xl p-4 border border-white/10">
              <div className="text-xs text-gray-400 uppercase">HTTP Calls</div>
              <div className="text-xl text-white font-bold mt-2 flex items-center gap-2"><Server className="h-4 w-4 text-blue-400" />{totals.totalHttpCalls}</div>
            </div>
            <div className="glass rounded-xl p-4 border border-white/10">
              <div className="text-xs text-gray-400 uppercase">Agent Calls</div>
              <div className="text-xl text-white font-bold mt-2 flex items-center gap-2"><Bot className="h-4 w-4 text-green-400" />{totals.totalAgentCalls}</div>
            </div>
            <div className="glass rounded-xl p-4 border border-white/10">
              <div className="text-xs text-gray-400 uppercase">Agent Errors</div>
              <div className="text-xl text-white font-bold mt-2 flex items-center gap-2"><Activity className="h-4 w-4 text-red-400" />{totals.totalAgentErrors}</div>
            </div>
          </div>

          <div className="glass rounded-xl border border-white/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 text-sm text-white font-semibold flex items-center justify-between">
              <span>Alertas Operacionais</span>
              <span className="text-xs text-gray-400">{totals.totalAlerts} alertas | {totals.criticalAlerts} críticos</span>
            </div>
            <div className="max-h-[260px] overflow-auto divide-y divide-white/5">
              {data.alerts.length === 0 ? (
                <div className="px-4 py-5 text-sm text-green-300">Nenhum alerta ativo no momento.</div>
              ) : (
                data.alerts.map((alert, idx) => (
                  <div key={`${alert.category}-${idx}`} className="px-4 py-3 flex items-start gap-3">
                    <span className={`mt-0.5 h-2.5 w-2.5 rounded-full ${alert.severity === "critical" ? "bg-red-400" : "bg-yellow-400"}`} />
                    <div className="min-w-0">
                      <div className="text-sm text-white font-medium">{alert.message}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        valor: {alert.value} | limite: {alert.threshold} | categoria: {alert.category}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass rounded-xl border border-white/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 text-sm text-white font-semibold">Visão Temporal Recente</div>
            <div className="max-h-[260px] overflow-auto">
              {snapshots.length < 2 ? (
                <div className="px-4 py-5 text-sm text-gray-400">Coletando amostras para tendência...</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-400 uppercase bg-white/5">
                    <tr>
                      <th className="text-left px-4 py-2">Hora</th>
                      <th className="text-right px-4 py-2">HTTP</th>
                      <th className="text-right px-4 py-2">Agents</th>
                      <th className="text-right px-4 py-2">Erros</th>
                      <th className="text-right px-4 py-2">Alertas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...snapshots].reverse().map((snapshot, idx) => (
                      <tr key={`${snapshot.timestamp}-${idx}`} className="border-t border-white/5">
                        <td className="px-4 py-2 text-gray-300">{new Date(snapshot.timestamp).toLocaleTimeString("pt-BR")}</td>
                        <td className="px-4 py-2 text-right text-white">{snapshot.totalHttpCalls}</td>
                        <td className="px-4 py-2 text-right text-white">{snapshot.totalAgentCalls}</td>
                        <td className="px-4 py-2 text-right text-red-300">{snapshot.totalAgentErrors}</td>
                        <td className="px-4 py-2 text-right text-yellow-300">{snapshot.totalAlerts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="glass rounded-xl border border-white/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 text-sm text-white font-semibold">Top HTTP Requests</div>
              <div className="max-h-[420px] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-400 uppercase bg-white/5">
                    <tr>
                      <th className="text-left px-4 py-2">Method</th>
                      <th className="text-left px-4 py-2">Path</th>
                      <th className="text-left px-4 py-2">Status</th>
                      <th className="text-right px-4 py-2">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.http_requests_total.map((item, idx) => (
                      <tr key={`${item.method}-${item.path}-${item.status}-${idx}`} className="border-t border-white/5">
                        <td className="px-4 py-2 text-gray-200">{item.method}</td>
                        <td className="px-4 py-2 text-gray-300">{item.path}</td>
                        <td className="px-4 py-2 text-gray-300">{item.status}</td>
                        <td className="px-4 py-2 text-right text-white font-semibold">{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass rounded-xl border border-white/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 text-sm text-white font-semibold">Agent Calls</div>
              <div className="max-h-[420px] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-400 uppercase bg-white/5">
                    <tr>
                      <th className="text-left px-4 py-2">Agent</th>
                      <th className="text-left px-4 py-2">Status</th>
                      <th className="text-right px-4 py-2">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.agent_calls_total.map((item, idx) => (
                      <tr key={`${item.agent}-${item.status}-${idx}`} className="border-t border-white/5">
                        <td className="px-4 py-2 text-gray-200">{item.agent}</td>
                        <td className="px-4 py-2 text-gray-300">{item.status}</td>
                        <td className="px-4 py-2 text-right text-white font-semibold">{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
