import React, { useMemo, useState, useEffect, useCallback } from "react";
import { ResponsiveContainer, PieChart as RPieChart, Pie, Cell, Tooltip as ReTooltip, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { api, type Crane, type HistoryItem, type Booking, type QueueItem, type BookingCreateData, type WorkLog, type WorkType } from "./api";

// =================================================
// Minimal UI kit (self-contained, no external deps)
// =================================================
function cn(...xs: Array<string | null | undefined>) {
  return xs.filter((x): x is string => !!x && x.trim() !== "").join(" ");
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
}
export function Button({ children, variant = "default", size = "default", className, type = "button", ...props }: React.PropsWithChildren<ButtonProps>){
  const v = variant === "outline" ? "border bg-white hover:bg-slate-50"
    : variant === "secondary" ? "bg-slate-100 hover:bg-slate-200"
    : variant === "ghost" ? "hover:bg-slate-100"
    : "bg-slate-900 text-white hover:bg-slate-800";
  const s = size === "default" ? "h-9 px-4" : "h-8 px-3 text-sm";
  return <button type={type} className={cn("rounded-md transition border border-transparent", v, s, className)} {...props}>{children}</button>;
}
export function Card({ className, children }: { className?: string; children?: React.ReactNode }){ return <div className={cn("bg-white border rounded-xl", className)}>{children}</div>; }
export function CardHeader({ children, className }: React.PropsWithChildren<{ className?: string }>){ return <div className={cn("px-4 pt-4 pb-2", className)}>{children}</div>; }
export function CardTitle({ children, className }: React.PropsWithChildren<{ className?: string }>){ return <div className={cn("font-semibold", className)}>{children}</div>; }
export function CardContent({ className, children }: React.PropsWithChildren<{ className?: string }>){ return <div className={cn("px-4 pb-4", className)}>{children}</div>; }
export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>){ return <input className={cn("h-9 w-full rounded-md border px-3", className)} {...props} />; }
export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>){ return <textarea className={cn("w-full rounded-md border px-3 py-2", className)} {...props} />; }
export function Label({ children, className }: React.PropsWithChildren<{ className?: string }>){ return <label className={cn("text-sm text-slate-700", className)}>{children}</label>; }
export function Badge({ children, className }: React.PropsWithChildren<{ className?: string }>){ return <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs border", className)}>{children}</span>; }

export function Table({ children }: React.PropsWithChildren){ return <table className="w-full text-sm">{children}</table>; }
export function TableHeader({ children }: React.PropsWithChildren){ return <thead className="bg-slate-50/50">{children}</thead>; }
export function TableHead({ children, className }: React.PropsWithChildren<{ className?: string }>){ return <th className={cn("text-left font-medium text-slate-600 px-3 py-2", className)}>{children}</th>; }
export function TableBody({ children }: React.PropsWithChildren){ return <tbody>{children}</tbody>; }
export function TableRow({ children }: React.PropsWithChildren){ return <tr className="border-t">{children}</tr>; }
export function TableCell({ children, className }: React.PropsWithChildren<{ className?: string }>){ return <td className={cn("px-3 py-2", className)}>{children}</td>; }

export function Modal({ open, onOpenChange, children }: React.PropsWithChildren<{ open: boolean; onOpenChange: (open: boolean) => void }>){
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => onOpenChange(false)}>
      <div className="w-full max-w-md" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
export function ModalHeader({ children }: React.PropsWithChildren){ return <div className="px-6 pt-6 pb-4">{children}</div>; }
export function ModalContent({ children }: React.PropsWithChildren){ return <div className="px-6 pb-6">{children}</div>; }
export function ModalFooter({ children }: React.PropsWithChildren){ return <div className="px-6 pb-6 pt-4 border-t flex justify-end gap-2">{children}</div>; }

// Minimal <Select/> API compatible with our usage
export function Select({ value, onValueChange, children }: React.PropsWithChildren<{ value: string; onValueChange?: (value: string) => void; }>) {
  let triggerClass = "";
  const options: { value: string; children: React.ReactNode }[] = [];
  React.Children.forEach(children, (child) => {
    if(!React.isValidElement(child)) return;
    const elementChild = child as React.ReactElement;

    if(elementChild.type === SelectTrigger) {
      const triggerProps = elementChild.props as React.ComponentProps<typeof SelectTrigger>;
      triggerClass = triggerProps?.className || "";
    }
    if(elementChild.type === SelectContent) {
      const contentElement = elementChild as React.ReactElement<{ children: React.ReactNode }>;
      React.Children.forEach(contentElement.props.children, (opt) => {
        if(React.isValidElement(opt) && opt.type === SelectItem){
          const optElement = opt as React.ReactElement;
          const itemProps = optElement.props as React.ComponentProps<typeof SelectItem>;
          options.push({ value: itemProps.value, children: itemProps.children });
        }
      });
    }
  });
  return (
    <select className={cn("h-9 rounded-md border px-3", triggerClass)} value={value} onChange={(e)=>onValueChange?.(e.target.value)}>
      {options.map((o, i)=> <option key={i} value={o.value}>{o.children}</option>)}
    </select>
  );
}
export function SelectTrigger({ className }: { className?: string }){ void className; return null; }
export function SelectValue(){ return null; }
export function SelectContent({ children }: React.PropsWithChildren){ return <>{children}</>; }
export function SelectItem({ value, children }: React.PropsWithChildren<{ value: string }>){ return <option value={value}>{children}</option>; }

// Tiny icon placeholders
interface IconProps { className?: string; }
function Icon({ children, className }: React.PropsWithChildren<{ className?: string }>){ return <span className={cn("inline-block align-middle", className)} aria-hidden>{children}</span>; }
const Layers = (p: IconProps) => <Icon {...p}>▦</Icon>;
const HardHat = (p: IconProps) => <Icon {...p}>👷</Icon>;
const User = (p: IconProps) => <Icon {...p}>👤</Icon>;
const LogIn = (p: IconProps) => <Icon {...p}>↪</Icon>;
const LogOut = (p: IconProps) => <Icon {...p}>↩</Icon>;
const Play = (p: IconProps) => <Icon {...p}>▶</Icon>;
// (icons intentionally omitted when unused)

// =================================================
// Types & Helpers
// =================================================
type Status = "pending" | "working" | "success" | "error" | "stopped";
type UserRole = 'engineer' | 'manager' | 'admin';

const statusColor = (s: Status) => ({
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  working: "bg-sky-50 text-sky-700 border-sky-200",
  error: "bg-rose-50 text-rose-700 border-rose-200",
  stopped: "bg-slate-50 text-slate-700 border-slate-200",
}[s] || "bg-slate-50 text-slate-700 border-slate-200");

const fmtTime = (t?: number) => t ? new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-";
const fmtDateTime = (t?: number) => {
  if (!t || t === 0) return "-";
  const date = new Date(t);
  return isNaN(date.getTime()) ? "-" : date.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
const diffMin = (a?: number, b?: number) => (a !== undefined && b !== undefined) ? Math.round((b - a) / 60000) : undefined;

function isValidTHPhone(p: string){ return /^0\d{9}$/.test(p.replace(/\D/g, "")); }

// rollback pure function (testable)
function rollbackQueueItem(q: QueueItem): QueueItem {
  if (q.status === 'working') {
    return { ...q, status: 'pending', started_at: undefined, ended_at: undefined };
  }
  if (q.status === 'success') {
    return { ...q, status: 'working', ended_at: undefined };
  }
  if (q.status === 'stopped') {
    return { ...q, status: 'working', ended_at: undefined };
  }
  return q;
}



// =================================================
// Mock data
// =================================================
const initialCranes: Crane[] = [
  {
    id: "TC1",
    queue: [
      { crane_id: "TC1", ord: 1, piece: "P1", note: "งานแรก", status: "pending", started_at: undefined, ended_at: undefined },
      { crane_id: "TC1", ord: 2, piece: "P2", note: "งานที่สอง", status: "pending", started_at: undefined, ended_at: undefined },
      { crane_id: "TC1", ord: 3, piece: "P3", note: "งานที่สาม", status: "pending", started_at: undefined, ended_at: undefined },
    ],
  },
  {
    id: "TC2",
    queue: [
      { crane_id: "TC2", ord: 1, piece: "S1", note: "งานแรก", status: "pending", started_at: undefined, ended_at: undefined },
      { crane_id: "TC2", ord: 2, piece: "S2", note: "งานที่สอง", status: "pending", started_at: undefined, ended_at: undefined },
    ],
  },
  {
    id: "TC3",
    queue: [
      { crane_id: "TC3", ord: 1, piece: "K1", note: "งานแรก", status: "pending", started_at: undefined, ended_at: undefined },
      { crane_id: "TC3", ord: 2, piece: "K2", note: "งานที่สอง", status: "pending", started_at: undefined, ended_at: undefined },
    ],
  },
  {
    id: "TC4",
    queue: [
      { crane_id: "TC4", ord: 1, piece: "M1", note: "งานแรก", status: "pending", started_at: undefined, ended_at: undefined },
    ],
  },
];

// quick sanity tests
(function tests(){
  try {
    ["pending","working","success"].forEach((s)=>{ if(!statusColor(s as Status)) throw new Error("statusColor missing"); });
    const d = diffMin(0, 60000); if(d!==1) throw new Error("diffMin != 1");
    if(!isValidTHPhone("0812345678")) throw new Error("phone validator fail");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cls = (cn as any)('x', undefined as any, '', 'y', null as any); if(cls !== 'x y') throw new Error('cn join fail');
    console.log("[Precast Logic Tests] OK");
  } catch(e){ console.error("[Precast Logic Tests] FAIL", e); }
})();

// =================================================
// Layout bits
// =================================================
function Topbar({ right, title }: { right?: React.ReactNode; title?: string }) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-3 bg-white sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <Layers className="h-5 w-5" />
        {title ? <span className="font-semibold">{title}</span> : null}
      </div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }){
  return <div className="min-h-screen bg-slate-50 text-black">{children}</div>;
}

// Timer component - properly defined as a React component
const Timer: React.FC<{ start: number }> = ({ start }) => {
  const [now, setNow] = React.useState<number>(Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const s = Math.max(0, Math.floor((now - start) / 1000));
  const hh = String(Math.floor(s / 3600)).padStart(2, '0');
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return <span className="font-mono text-xs">{hh}:{mm}:{ss}</span>;
};

// Enhanced Work Timer Component for timing work sessions
interface WorkSession {
  id: number;
  label: string;
  startTime: number;
  endTime?: number;
  interval: number; // duration in milliseconds
  craneId: string;
  piece: string;
}

export const WorkTimer: React.FC<{
  projectName: string;
  onBackToHome: () => void;
  onComplete: (sessions: WorkSession[]) => void;
}> = ({ projectName, onBackToHome, onComplete }) => {
  const [isRunning, setIsRunning] = React.useState(false);
  const [startTime, setStartTime] = React.useState<number | null>(null);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [sessions, setSessions] = React.useState<WorkSession[]>([]);
  const [currentLabel, setCurrentLabel] = React.useState("");
  const [totalWorkTime, setTotalWorkTime] = React.useState(0);

  // Update current time every 100ms for smooth display
  React.useEffect(() => {
    let interval: number | null = null;

    if (isRunning && startTime) {
      interval = window.setInterval(() => {
        setCurrentTime(Date.now() - startTime);
      }, 100);
    }

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isRunning, startTime]);

  // Update total work time when sessions change
  React.useEffect(() => {
    const total = sessions.reduce((sum, session) => sum + session.interval, 0);
    setTotalWorkTime(total);
  }, [sessions]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}ชม ${minutes}นาที ${seconds}วินาที`;
    } else if (minutes > 0) {
      return `${minutes}นาที ${seconds}วินาที`;
    } else {
      return `${seconds}วินาที`;
    }
  };

  const handleStart = () => {
    if (!isRunning) {
      const now = Date.now();
      setStartTime(now);
      setCurrentTime(0);
      setIsRunning(true);
      setCurrentLabel("");
    }
  };

  const handleSplit = () => {
    if (isRunning && startTime) {
      const now = Date.now();
      const interval = now - startTime;

      // Extract crane ID and piece from project name (format: "CRANE_ID - PIECE")
      const [craneId, ...pieceParts] = projectName.split(' - ');
      const piece = pieceParts.join(' - ');

      const newSession: WorkSession = {
        id: sessions.length + 1,
        label: currentLabel || `แผ่นที่ ${sessions.length + 1}`,
        startTime: startTime,
        endTime: now,
        interval: interval,
        craneId: craneId || 'Unknown',
        piece: piece || 'Unknown'
      };

      setSessions(prev => [...prev, newSession]);
      setStartTime(now);
      setCurrentTime(0);
      setCurrentLabel("");
    }
  };

  const handleStop = () => {
    if (isRunning && startTime) {
      const now = Date.now();
      const interval = now - startTime;

      // Extract crane ID and piece from project name
      const [craneId, ...pieceParts] = projectName.split(' - ');
      const piece = pieceParts.join(' - ');

      const finalSession: WorkSession = {
        id: sessions.length + 1,
        label: currentLabel || `แผ่นสุดท้าย`,
        startTime: startTime,
        endTime: now,
        interval: interval,
        craneId: craneId || 'Unknown',
        piece: piece || 'Unknown'
      };

      const allSessions = [...sessions, finalSession];
      setSessions(allSessions);
      setIsRunning(false);
      setStartTime(null);
      setCurrentTime(0);

      // Auto-complete after stopping
      onComplete(allSessions);
    }
  };

  const handleReset = () => {
    if (window.confirm('คุณต้องการรีเซ็ตตัวจับเวลาและลบข้อมูลทั้งหมดใช่หรือไม่?')) {
      setIsRunning(false);
      setStartTime(null);
      setCurrentTime(0);
      setSessions([]);
      setCurrentLabel("");
      setTotalWorkTime(0);
    }
  };

  const exportSessions = () => {
    if (sessions.length === 0) {
      alert('ไม่มีข้อมูลการทำงานให้ส่งออก');
      return;
    }

    const csvHeader = "ลำดับ,ชื่อแผ่นงาน,เครน,เวลาเริ่ม,เวลาจบ,ระยะเวลาที่ใช้,รวมเวลาทั้งหมด\n";
    const csvRows = sessions.map(session =>
      `${session.id},"${session.label}",${session.craneId},${formatDateTime(session.startTime)},${session.endTime ? formatDateTime(session.endTime) : ''},"${formatDuration(session.interval)}","${formatDuration(totalWorkTime)}"`
    ).join('\n');

    const csvContent = csvHeader + csvRows;
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `work-timer-${projectName}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-blue-50 text-blue-700">
          ⏱️ นาฬิกาจับเวลา
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportSessions} disabled={sessions.length === 0}>
            📊 ส่งออกข้อมูล
          </Button>
          <Button variant="outline" onClick={handleReset} disabled={isRunning || sessions.length === 0}>
            🔄 รีเซ็ต
          </Button>
          <Button variant="outline" onClick={onBackToHome}>
            กลับไปหน้าหลัก
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{projectName}</CardTitle>
          {totalWorkTime > 0 && (
            <div className="text-center text-lg text-slate-600">
              รวมเวลาทำงานทั้งหมด: {formatDuration(totalWorkTime)}
            </div>
          )}
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {/* Main Timer Display */}
          <div className="relative">
            <div className="text-8xl font-mono font-bold text-slate-800 mb-4">
              {formatTime(currentTime)}
            </div>
            {isRunning && (
              <div className="absolute -top-2 -right-2">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>

          {/* Label Input */}
          <div className="max-w-sm mx-auto">
            <Label className="text-sm font-medium">ชื่อแผ่นงาน (ถ้ามี)</Label>
            <Input
              placeholder="เช่น แผ่นที่ 1, คอนกรีตบีม A-01"
              value={currentLabel}
              onChange={(e) => setCurrentLabel(e.target.value)}
              /* Allow changing label while running so each split can be named */
              disabled={false}
              className="text-center mt-2"
            />
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center gap-3">
            <Button
              size="lg"
              onClick={handleStart}
              disabled={isRunning}
              className="min-w-[120px] bg-green-600 hover:bg-green-700 text-lg py-3"
            >
              ▶️ เริ่มทำงาน
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleSplit}
              disabled={!isRunning}
              className="min-w-[120px] border-blue-500 text-blue-600 hover:bg-blue-50 text-lg py-3"
            >
              ⏸️ แยกช่วง
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleStop}
              disabled={!isRunning}
              className="min-w-[120px] border-red-500 text-red-600 hover:bg-red-50 text-lg py-3"
            >
              ⏹️ หยุดทำงาน
            </Button>
          </div>

          {/* Status indicator */}
          <div className="text-center">
            <Badge className={`text-sm px-3 py-1 ${isRunning
              ? 'bg-green-100 text-green-800 border-green-200'
              : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
              {isRunning ? '⏱️ กำลังจับเวลา...' : '⏹️ หยุดแล้ว'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      {sessions.length > 0 && (
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">📋 รายการแผ่นงาน ({sessions.length} รายการ)</CardTitle>
              <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                รวม {formatDuration(totalWorkTime)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-16">ลำดับ</TableHead>
                  <TableHead>ชื่อแผ่นงาน</TableHead>
                  <TableHead>เครน</TableHead>
                  <TableHead>เวลาเริ่ม</TableHead>
                  <TableHead>เวลาจบ</TableHead>
                  <TableHead className="text-center">ระยะเวลาที่ใช้</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="text-center font-bold text-blue-600">
                      {session.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {session.label}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                        {session.craneId}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatDateTime(session.startTime)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {session.endTime ? formatDateTime(session.endTime) : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono">
                        {formatDuration(session.interval)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {sessions.length === 0 && !isRunning && (
        <Card className="rounded-2xl bg-slate-50">
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">⏱️</div>
            <div className="text-slate-600 text-lg mb-2">พร้อมเริ่มจับเวลา</div>
            <div className="text-slate-500 text-sm">กดปุ่ม "เริ่มทำงาน" เพื่อเริ่มจับเวลา</div>
          </CardContent>
        </Card>
      )}
    </main>
  );
};

// =================================================
// Feature: Home cranes table
// =================================================
type CombinedItem = QueueItem & {
  type: 'queue' | 'booking-queue';
  source: string;
  start_ts?: number;
  end_ts?: number;
  bookingId?: string;
} | {
  crane_id: string;
  ord?: number;
  piece: string;
  note?: string;
  status: 'อนุมัติ' | 'รอการอนุมัติ' | 'pending';
  started_at?: number;
  ended_at?: number;
  type: 'booking';
  source: string;
  bookingId: string;
  start_ts: number;
  end_ts: number;
} | {
  crane_id: string;
  ord: number;
  piece: string;
  note?: string;
  status: 'pending' | 'working' | 'success' | 'error' | 'stopped';
  started_at?: number;
  ended_at?: number;
  type: 'direct-queue';
  source: string;
  requester?: string;
  phone?: string;
  purpose?: string;
  start_ts?: number;
  end_ts?: number;
  work_type?: string;
};

function CraneTable({ crane, bookings, onStart, onStop, onRollback, onDelete, showActions, onStartWorkTimer }: { crane: Crane; bookings: Booking[]; onStart: (o: number)=>void; onStop?: (o: number)=>void; onRollback?: (o: number)=>void; onDelete?: (o: number)=>void; showActions?: boolean; onStartWorkTimer?: (projectName: string) => void; }){
  // Note: some callbacks may be optional depending on parent usage
  void onStop; void onRollback; void onDelete;
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

  // Create a map of booking data by id for quick lookup
  const bookingMap = new Map(bookings.map(b => [b.id, b]));

  // Filter crane bookings for this crane (exclude rejected ones)
  const craneBookings = bookings.filter(b => b.crane === crane.id && b.status !== 'ปฏิเสธ');

  // Separate approved and pending bookings
  const approvedBookings = craneBookings.filter(b => b.status === 'อนุมัติ');
  const pendingBookings = craneBookings.filter(b => b.status === 'รอการอนุมัติ');

  // Get approved bookings that don't have corresponding queue items yet
  const approvedBookingsWithoutQueue = approvedBookings.filter(ab =>
    !crane.queue.some(q => q.booking_id === ab.id)
  );

  // Combine all items for display
  const allItems: CombinedItem[] = [
    // Add queue items with booking info if available
    ...crane.queue.map(q => {
      const booking = q.booking_id ? bookingMap.get(q.booking_id) : null;
      return {
        ...q,
        type: q.booking_id ? 'booking-queue' as const : 'queue' as const,
        source: q.booking_id ? 'การจอง' : 'คิวงาน',
        start_ts: booking?.start_ts,
        end_ts: booking?.end_ts,
        bookingId: q.booking_id
      };
    }),

    // Add approved bookings that are not yet converted to queue
    ...approvedBookingsWithoutQueue.map(b => ({
      crane_id: crane.id,
      ord: undefined,
      piece: b.item,
      note: `${b.purpose}${b.note ? ` • ${b.note}` : ''}`,
      status: 'pending' as const,
      started_at: undefined,
      ended_at: undefined,
      type: 'booking' as const,
      source: 'การจอง',
      bookingId: b.id,
      start_ts: b.start_ts,
      end_ts: b.end_ts
    })),

    // Add pending bookings
    ...pendingBookings.map(b => ({
      crane_id: crane.id,
      ord: undefined,
      piece: b.item,
      note: `${b.purpose}${b.note ? ` • ${b.note}` : ''}`,
      status: b.status as 'รอการอนุมัติ' | 'อนุมัติ',
      started_at: undefined,
      ended_at: undefined,
      type: 'booking' as const,
      source: 'การจอง',
      bookingId: b.id,
      start_ts: b.start_ts,
      end_ts: b.end_ts
    }))
  ];

  // Sort items: bookings first by start time, then queues by ord
  allItems.sort((a, b) => {
    // If both have start_ts, sort by start_ts
    if (a.start_ts && b.start_ts) {
      return a.start_ts - b.start_ts;
    }
    // If only a has start_ts, a comes first
    if (a.start_ts) return -1;
    // If only b has start_ts, b comes first
    if (b.start_ts) return 1;
    // Otherwise sort by ord
    const aOrd = a.ord || 0;
    const bOrd = b.ord || 0;
    return aOrd - bOrd;
  });

  const toggleDropdown = (key: string) => {
    const newOpen = new Set(openDropdowns);
    if (newOpen.has(key)) {
      newOpen.delete(key);
    } else {
      newOpen.add(key);
    }
    setOpenDropdowns(newOpen);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'งานเสร็จแล้ว' || status === 'success') {
      return <span className="badge done">• เสร็จแล้ว</span>;
    } else if (status === 'กำลังทำงาน' || status === 'working') {
      return <span className="badge doing">• กำลังทำงาน</span>;
    } else if (status === 'รอทำงาน' || status === 'pending') {
      return <span className="badge wait">• รอทำงาน</span>;
    } else if (status === 'อนุมัติ') {
      return <span className="badge done">• อนุมัติ</span>;
    } else if (status === 'รอการอนุมัติ') {
      return <span className="badge wait">• รอการอนุมัติ</span>;
    }
    return <Badge className={`border ${statusColor(status as Status)}`}>{status}</Badge>;
  };

  const renderWorkSummaryDetails = (item: CombinedItem, key: string) => {
    if (!openDropdowns.has(key)) return null;

    // ตรวจสอบสถานะ - แสดงข้อมูลเฉพาะงานที่เสร็จแล้วเท่านั้น
    const isCompletedWork = item.status === 'success';
    const isQueue = item.type === 'queue' || item.type === 'direct-queue' || item.type === 'booking-queue';

    // ถ้าไม่ใช่งานที่เสร็จแล้ว แสดงข้อความรอข้อมูลแทน
    if (!isCompletedWork) {
      return (
        <tr className="details">
          <td colSpan={showActions ? 6 : 5}>
            <div className="details-wrap">
              <div className="work-summary text-center py-8">
                <div className="text-slate-400 text-lg mb-2">⏳</div>
                <div className="text-slate-500">
                  {isQueue && item.status === 'working' && '⏱️ กำลังทำงานอยู่ - รอข้อมูลเมื่อเสร็จสิ้น'}
                  {isQueue && item.status === 'pending' && '📋 รอเริ่มงาน - จะมีข้อมูลเมื่อเสร็จสิ้น'}
                  {!isQueue && '⏳ รอการอนุมัติ - จะมีข้อมูลเมื่อเริ่มทำงาน'}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  ข้อมูลจะแสดงเมื่อกดปุ่มนาฬิกาและเสร็จสิ้นการทำงาน
                </div>
              </div>
            </div>
          </td>
        </tr>
      );
    }

    // ถ้าเป็นงานที่เสร็จแล้ว แสดงข้อมูลสรุปการทำงาน
    // Determine work type based on piece name or use mock data
    const getWorkType = (piece: string) => {
      if (piece?.toLowerCase().includes('precast')) return 'Precast';
      if (piece?.toLowerCase().includes('structure')) return 'Structure';
      if (piece?.toLowerCase().includes('architecture')) return 'Architecture';
      if (piece?.toLowerCase().includes('foundation')) return 'Foundation';
      if (piece?.toLowerCase().includes('beam')) return 'Beam';
      if (piece?.toLowerCase().includes('column')) return 'Column';
      return 'อื่นๆ';
    };

    const workType = getWorkType(item.piece || '');

    // Mock data for work summary (in real app, this would come from API)
    const workSummary = {
      workType: workType,
      totalWorkCount: Math.floor(Math.random() * 20) + 5, // 5-25 work items
      splitCount: Math.floor(Math.random() * 8) + 1, // 1-8 splits
      stopCount: Math.floor(Math.random() * 5) + 1, // 1-5 stops
      totalTime: Math.floor(Math.random() * 480) + 60, // 60-540 minutes
      efficiency: Math.floor(Math.random() * 30) + 70, // 70-100% efficiency
      lastUpdated: new Date().toLocaleString('th-TH')
    };

    // Alternative mock data if no real data exists
    const mockWorkTypes = ['Precast', 'Structure', 'Architecture', 'Foundation', 'Beam', 'Column', 'อื่นๆ'];
  const mockSummaries = mockWorkTypes.map((type) => ({
      workType: type,
      totalWorkCount: Math.floor(Math.random() * 15) + 3,
      splitCount: Math.floor(Math.random() * 6) + 1,
      stopCount: Math.floor(Math.random() * 4) + 1,
      totalTime: Math.floor(Math.random() * 360) + 45,
      efficiency: Math.floor(Math.random() * 25) + 75,
      lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleString('th-TH')
    }));

    const displaySummary = workSummary;

    return (
      <tr className="details">
        <td colSpan={showActions ? 6 : 5}>
          <div className="details-wrap">
            <div className="work-summary" role="region" aria-label={`สรุปงาน ${item.piece}`}>
              <div className="summary-header">
                <div className="summary-title">
                  <h4>📊 สรุปการทำงาน</h4>
                  <Badge className={`work-type-badge ${displaySummary.workType.toLowerCase()}`}>
                    {displaySummary.workType}
                  </Badge>
                </div>
                <div className="summary-meta">
                  อัปเดตล่าสุด: {displaySummary.lastUpdated}
                </div>
              </div>

              <div className="summary-stats">
                <div className="stat-group">
                  <div className="stat-item">
                    <div className="stat-value">{displaySummary.totalWorkCount}</div>
                    <div className="stat-label">จำนวนงานทั้งหมด</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value split-count">{displaySummary.splitCount}</div>
                    <div className="stat-label">Split</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value stop-count">{displaySummary.stopCount}</div>
                    <div className="stat-label">Stop</div>
                  </div>
                </div>

                <div className="stat-group secondary">
                  <div className="stat-item">
                    <div className="stat-value">{Math.floor(displaySummary.totalTime / 60)}:{(displaySummary.totalTime % 60).toString().padStart(2, '0')}</div>
                    <div className="stat-label">เวลารวม (ชม:นาที)</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value efficiency">{displaySummary.efficiency}%</div>
                    <div className="stat-label">ประสิทธิภาพ</div>
                  </div>
                </div>
              </div>

              {/* ประเภทงานทั้งหมด (Mock Data) */}
              <div className="work-types-section">
                <h5>📋 สรุปตามประเภทงานทั้งหมด</h5>
                <div className="work-types-grid">
                  {mockSummaries.slice(0, 6).map((summary, idx) => (
                    <div key={idx} className="work-type-card">
                      <div className="work-type-header">
                        <Badge className={`mini-work-type ${summary.workType.toLowerCase()}`}>
                          {summary.workType}
                        </Badge>
                        <span className="work-count">{summary.totalWorkCount} งาน</span>
                      </div>
                      <div className="work-type-stats">
                        <span className="split-text">Split: {summary.splitCount}</span>
                        <span className="stop-text">Stop: {summary.stopCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2"><HardHat className="h-4 w-4"/>{crane.id} <small style={{color: 'var(--muted)'}}>— คิวงานปัจจุบัน</small></CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-18">ลำดับ</TableHead>
              <TableHead>ชิ้นงาน</TableHead>
              <TableHead className="w-52">เวลา</TableHead>
              <TableHead className="w-40">สถานะ</TableHead>
              {showActions && <TableHead className="w-[220px]">เริ่มต้น/หยุดการทำงาน</TableHead>}
              {showActions && <TableHead className="dropdown-cell">Dropdown</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {allItems.length > 0 ? (
              allItems.map((item) => {
                const isQueue = item.type === 'queue' || item.type === 'direct-queue' || item.type === 'booking-queue';
                const disabledStart = isQueue && item.status !== "pending";
                // controls for start/stop/rollback are computed where used

                const rowKey = isQueue ? `${item.crane_id}-${item.ord}` : item.bookingId || `item-${Date.now()}`;

                return [
                  <TableRow key={rowKey}>
                    <TableCell className="font-medium">
                      {isQueue ? item.ord : `${item.source}`}
                    </TableCell>
                    <TableCell>{item.piece}</TableCell>
                    <TableCell className="whitespace-pre-line text-slate-600">
                      {isQueue ? (
                        item.started_at ? (
                          <div className="flex items-center gap-2">
                            <span>{fmtTime(item.started_at)}{item.ended_at ? ` - ${fmtTime(item.ended_at)}` : ''}</span>
                            {item.status === 'working' && <Timer start={item.started_at} />}
                          </div>
                        ) : (item.note || "—")
                      ) : (
                        item.start_ts && item.end_ts ? (
                          <div>
                            <div>{new Date(item.start_ts).toLocaleString()}</div>
                            <div className="text-xs text-slate-500">ถึง {new Date(item.end_ts).toLocaleString()}</div>
                          </div>
                        ) : "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(isQueue ? item.status : item.status)}
                    </TableCell>
                    {showActions && isQueue && (
                      <TableCell className="action-col">
                        <div className="flex gap-2">
                          <button
                            className="start-btn px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
                            data-crane={item.crane_id}
                            data-order={item.ord}
                            onClick={() => onStart && onStart(item.ord)}
                            disabled={disabledStart}
                          >
                            เริ่มงาน
                          </button>
                          {onStartWorkTimer && (
                            <button
                              className={`px-3 py-1 text-white rounded text-sm font-medium ${
                                item.status === 'working'
                                  ? 'bg-blue-600 hover:bg-blue-700'
                                  : 'bg-gray-400 cursor-not-allowed'
                              }`}
                              onClick={() => {
                                if (item.status === 'working') {
                                  onStartWorkTimer(`${item.crane_id} - ${item.piece}`);
                                }
                              }}
                              disabled={item.status !== 'working'}
                              title={item.status === 'working' ? 'คลิกเพื่อเริ่มจับเวลา' : 'ต้องเริ่มงานก่อนจึงจะจับเวลาได้'}
                            >
                              ⏱️ จับเวลา
                            </button>
                          )}
                        </div>
                      </TableCell>
                    )}
                    {showActions && (
                      <TableCell className="dropdown-cell">
                        <button className="caret" onClick={() => toggleDropdown(rowKey)} aria-expanded={openDropdowns.has(rowKey)}>
                          <span>▾</span>
                        </button>
                      </TableCell>
                    )}
                  </TableRow>,
                  renderWorkSummaryDetails(item, rowKey)
                ];
              }).flat()
            ) : (
              <TableRow>
                <TableRow>
                  <td colSpan={showActions ? 6 : 5} className="text-center text-slate-500 py-8">
                    ไม่มีงานหรือการจอง
                  </td>
                </TableRow>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// =================================================
// Feature: Overview (charts)
// =================================================
function Overview({ cranes, history }: { cranes: Crane[]; history: HistoryItem[] }){
  const stats = useMemo(()=>{
    // Use mock data if API data is not available
    const displayCranes = cranes.length > 0 ? cranes : initialCranes;
    const all = displayCranes.flatMap(c=>c.queue);
    const pending = all.filter(q=>q.status==='pending').length;
    const working = all.filter(q=>q.status==='working').length;
    const success = all.filter(q=>q.status==='success').length;
    const total = all.length || 1;
    const donePct = Math.round((success/total)*100);
    const remainPct = 100 - donePct;
    const perCrane = displayCranes.map(c=>(
      { crane: c.id, pending: c.queue.filter(q=>q.status==='pending').length, working: c.queue.filter(q=>q.status==='working').length, success: c.queue.filter(q=>q.status==='success').length }
    ));
    const spark = history.length ? history.map(h=>({ t: new Date(h.end_ts || h.start_ts || Date.now()).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), d: h.duration_min || 0 }))
                                 : Array.from({length:8}).map((_,i)=>({ t: `T${i+1}`, d: Math.round(10+Math.random()*20)}));
    return { pending, working, success, total, donePct, remainPct, perCrane, spark };
  }, [cranes, history]);

  return (
    <main className="p-6 space-y-6">
      <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-slate-100 text-slate-700">overview</div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="text-sm">งานทั้งหมด</CardTitle></CardHeader>
          <CardContent className="text-3xl font-semibold">{stats.total}</CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="text-sm">กำลังทำงาน</CardTitle></CardHeader>
          <CardContent className="text-3xl font-semibold text-sky-600">{stats.working}</CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="text-sm">เสร็จแล้ววันนี้</CardTitle></CardHeader>
          <CardContent className="text-3xl font-semibold text-emerald-600">{stats.success}</CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 items-stretch">
        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="text-base">ความคืบหน้ารวม</CardTitle></CardHeader>
          <CardContent>
            <div className="text-sm text-slate-600 mb-2">{stats.donePct}% เสร็จ • {stats.remainPct}% เหลือ</div>
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${stats.donePct}%` }} />
            </div>
            <div className="h-64 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <RPieChart>
                  <Pie data={[{name:'DONE', value: stats.donePct},{name:'REMAIN', value: stats.remainPct}]} dataKey="value" nameKey="name" outerRadius={110}>
                    <Cell fill="#22c55e" />
                    <Cell fill="#94a3b8" />
                  </Pie>
                  <ReTooltip />
                </RPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="text-base">ผลงานต่อเครน (ชิ้นงานตามสถานะ)</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.perCrane}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="crane" />
                <YAxis allowDecimals={false} />
                <ReTooltip />
                <Bar dataKey="success" stackId="a" fill="#22c55e" />
                <Bar dataKey="working" stackId="a" fill="#3b82f6" />
                <Bar dataKey="pending" stackId="a" fill="#eab308" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader><CardTitle className="text-base">ระยะเวลางานล่าสุด (นาที)</CardTitle></CardHeader>
        <CardContent className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.spark}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="t" />
              <YAxis allowDecimals={false} />
              <ReTooltip />
              <Line type="monotone" dataKey="d" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
          {!history.length && <div className="text-xs text-slate-500 mt-2">* ยังไม่มีประวัติ — แสดงตัวอย่างเพื่อประกอบการออกแบบ</div>}
        </CardContent>
      </Card>
    </main>
  );
}

// =================================================
// Feature: Booking (roles: engineer, manager, admin)
// รวม จองคิว และ จัดคิว เข้าด้วยกัน
// =================================================
function Booking({
  user,
  bookings,
  onCreateBooking,
  onUpdateBookingStatus,
  cranes,
  onStartTask,
  onStopTask,
  onRollbackTask
}: {
  user: { name: string; role: UserRole } | null;
  bookings: Booking[];
  onCreateBooking: (booking: BookingCreateData) => Promise<Booking>;
  onUpdateBookingStatus: (id: string, status: Booking['status']) => Promise<void>;
  cranes: Crane[];
  onStartTask: (craneId: string, ord: number) => Promise<void>;
  onStopTask: (craneId: string, ord: number) => Promise<void>;
  onRollbackTask: (craneId: string, ord: number) => Promise<void>;
}){
  const cranesLeft = cranes.length > 0 ? cranes.map(c => c.id) : ["TC1", "TC2", "TC3", "TC4"];
  const [selectedCrane, setSelectedCrane] = useState<string>(cranesLeft[0]);
  const [selectedTab, setSelectedTab] = useState<"create" | "calendar" | "list" | "operations">("create");
  const [loading, setLoading] = useState(false);

  type BookingStatus = "รอการอนุมัติ" | "อนุมัติ" | "ปฏิเสธ";
  const bsColor = (s: BookingStatus) => s === "อนุมัติ" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : s === "ปฏิเสธ" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-amber-50 text-amber-700 border-amber-200";

  // Derived filters & summary
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  // form state (lock crane to selected one)
  const [form, setForm] = useState({ crane: selectedCrane, item: "", requester: "", phone: "", purpose: "", start: "", end: "", note: "", status: "รอการอนุมัติ" as BookingStatus });
  React.useEffect(()=>{ setForm(f=>({ ...f, crane: selectedCrane })); }, [selectedCrane]);

  // validation and error handling
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  function validate(){
    const e: Record<string,string> = {};
    if(!form.item.trim()) e.item = "กรอกของที่ยก";
    if(!form.requester.trim()) e.requester = "กรอกชื่อผู้จอง";
    if(!form.phone.trim()) e.phone = "กรอกหมายเลขโทรศัพท์";
    else if(!isValidTHPhone(form.phone)) e.phone = "เบอร์โทรต้องมี 10 หลักขึ้นต้นด้วย 0";
    if(!form.purpose.trim()) e.purpose = "กรอกการใช้งาน";
    if(!form.start) e.start = "ระบุเวลาเริ่ม";
    if(!form.end) e.end = "ระบุเวลาจบ";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // calendar stuff
  const [month, setMonth] = useState(()=>{ const d=new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  function addMonths(base: Date, diff: number){ return new Date(base.getFullYear(), base.getMonth()+diff, 1); }
  const monthLabel = month.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
  const days = useMemo(()=>{
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth()+1, 0);
    const pad = (firstDay.getDay()+6)%7; // Monday first
    const arr: (Date|null)[] = Array.from({length: pad}, ()=>null);
    for(let d=1; d<=lastDay.getDate(); d++){ arr.push(new Date(month.getFullYear(), month.getMonth(), d)); }
    return arr;
  }, [month]);

  const dayMap = useMemo(()=>{
    const map = new Map<string, Booking[]>();
    bookings.filter(b=>b.crane===selectedCrane).forEach(b=>{
      const startDate = new Date(b.start_ts);
      const endDate = new Date(b.end_ts);

      // Ensure end date is not before start date
      if (endDate < startDate) return;

      const current = new Date(startDate);

      // Add booking to all days within the date range
      while (current <= endDate) {
        const key = current.toDateString();
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key)!.push(b);
        current.setDate(current.getDate() + 1);
      }
    });
    return map;
  }, [bookings, selectedCrane]);

  async function submit(){
    if(!validate()) return;

    try {
      setLoading(true);
      setSubmitError(null);
      const bookingData = {
        crane: selectedCrane,
        item: form.item,
        requester: form.requester,
        phone: form.phone,
        purpose: form.purpose,
        start: new Date(form.start).getTime(),
        end: new Date(form.end).getTime(),
        note: form.note || undefined
      };

      await onCreateBooking(bookingData);
      setForm({ crane: selectedCrane, item: "", requester: "", phone: "", purpose: "", start: "", end: "", note: "", status: "รอการอนุมัติ" });
      setErrors({});
      setSubmitError(null);
    } catch (err) {
      console.error('Booking submission error:', err);
      setSubmitError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการสร้างการจอง');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: BookingStatus){
    try {
      await onUpdateBookingStatus(id, status);
    } catch {
      // Error is handled by parent component
    }
  }

  // Table data considering toggle for admin
  const recent = useMemo(()=>{
    const base = (user?.role==='admin' || user?.role==='manager') && showPendingOnly ? bookings.filter(b=>b.status==='รอการอนุมัติ') : bookings;
    return base.slice(-5).reverse();
  }, [bookings, showPendingOnly, user?.role]);

  const canApprove = user?.role === 'manager' || user?.role === 'admin';

  // Booking work status summary (make Booking tab consistent with Home)
  const bookingWorkStats = useMemo(() => {
    const approvedBookings = bookings.filter(b => b.status === 'อนุมัติ');
    const allQueueItems = cranes.flatMap(c => c.queue.filter(q => q.booking_id));

    const started = new Map<string, boolean>();
    const working = new Map<string, boolean>();
    const completed = new Map<string, boolean>();

    allQueueItems.forEach(item => {
      if (item.booking_id) {
        started.set(item.booking_id, true);
        if (item.status === 'working') working.set(item.booking_id, true);
        if (item.status === 'success') completed.set(item.booking_id, true);
      }
    });

    return {
      totalApproved: approvedBookings.length,
      started: started.size,
      currentlyWorking: working.size,
      completed: completed.size,
      pending: Math.max(0, approvedBookings.length - started.size)
    };
  }, [bookings, cranes]);

  return (
    <main className="p-6 space-y-4">
      <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-amber-50 text-amber-700">จองคิว</div>

      {/* Make Booking tab show the same booking summary as Home */}
      {bookingWorkStats.totalApproved > 0 && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">สถานะการทำงานจากการจอง</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="text-xl font-semibold text-slate-700">{bookingWorkStats.totalApproved}</div>
                <div className="text-xs text-slate-600">การจองอนุมัติ</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-semibold text-blue-700">{bookingWorkStats.started}</div>
                <div className="text-xs text-blue-600">เริ่มงานแล้ว</div>
              </div>
              <div className="text-center p-3 bg-sky-50 rounded-lg">
                <div className="text-xl font-semibold text-sky-700">{bookingWorkStats.currentlyWorking}</div>
                <div className="text-xs text-sky-600">กำลังทำงาน</div>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <div className="text-xl font-semibold text-emerald-700">{bookingWorkStats.completed}</div>
                <div className="text-xs text-emerald-600">เสร็จแล้ว</div>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <div className="text-xl font-semibold text-amber-700">{bookingWorkStats.pending}</div>
                <div className="text-xs text-amber-600">รอเริ่มงาน</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Tab navigation */}
      <div className="flex gap-2 border-b mb-4">
        <Button variant={selectedTab === "create" ? "secondary" : "outline"} size="sm" onClick={() => setSelectedTab("create")}>
          สร้างการจอง
        </Button>
        <Button variant={selectedTab === "calendar" ? "secondary" : "outline"} size="sm" onClick={() => setSelectedTab("calendar")}>
          ปฏิทิน
        </Button>
        <Button variant={selectedTab === "list" ? "secondary" : "outline"} size="sm" onClick={() => setSelectedTab("list")}>
          รายการ
        </Button>
        <Button variant={selectedTab === "operations" ? "secondary" : "outline"} size="sm" onClick={() => setSelectedTab("operations")}>
          การทำงาน
        </Button>
      </div>

      {selectedTab === "create" && (
        <div className="grid grid-cols-1 lg:grid-cols-[250px,1fr] gap-4">
          {/* Left crane list */}
          <Card className="rounded-2xl h-fit">
            <CardHeader><CardTitle className="text-base">รายการเครน</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {cranesLeft.map(id => (
                <div key={id} className={cn("flex items-center justify-between border rounded-lg px-3 py-2", selectedCrane===id?"bg-slate-50 border-slate-300":"")}>
                  <div className="font-medium">{id}</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={()=>{setSelectedCrane(id); setSelectedTab("create");}}>เลือก</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Right content */}
          <Card className="rounded-2xl">
            <CardHeader><CardTitle className="text-base">เพิ่มการจอง • {selectedCrane}</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>ชื่อเครน (ล็อค)</Label>
                <Input className="mt-1" value={selectedCrane} readOnly />
              </div>
              <div>
                <Label>ของที่ยก *</Label>
                <Input className="mt-1" value={form.item} onChange={e=>setForm({...form, item:e.target.value})}/>
                {errors.item && <div className="text-xs text-rose-600 mt-1">{errors.item}</div>}
              </div>
              <div>
                <Label>ชื่อผู้จอง *</Label>
                <Input className="mt-1" value={form.requester} onChange={e=>setForm({...form, requester:e.target.value})}/>
                {errors.requester && <div className="text-xs text-rose-600 mt-1">{errors.requester}</div>}
              </div>
              <div>
                <Label>หมายเลขโทรศัพท์ *</Label>
                <Input className="mt-1" type="tel" inputMode="numeric" maxLength={14} placeholder="เช่น 0812345678" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})}/>
                {errors.phone && <div className="text-xs text-rose-600 mt-1">{errors.phone}</div>}
              </div>
              <div>
                <Label>ใช้สำหรับ *</Label>
                <Input className="mt-1" value={form.purpose} onChange={e=>setForm({...form, purpose:e.target.value})}/>
                {errors.purpose && <div className="text-xs text-rose-600 mt-1">{errors.purpose}</div>}
              </div>

              {canApprove && (
                <div>
                  <Label>สถานะการจอง</Label>
                  <Select value={form.status} onValueChange={(v)=>setForm({...form, status: v as BookingStatus})}>
                    <SelectTrigger className="mt-1 w-full" /><SelectValue />
                    <SelectContent>
                      <SelectItem value="รอการอนุมัติ">รอการอนุมัติ</SelectItem>
                      <SelectItem value="อนุมัติ">อนุมัติ</SelectItem>
                      <SelectItem value="ปฏิเสธ">ปฏิเสธ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>เริ่ม *</Label>
                <Input type="datetime-local" className="mt-1" value={form.start} onChange={e=>setForm({...form, start:e.target.value})}/>
                {errors.start && <div className="text-xs text-rose-600 mt-1">{errors.start}</div>}
              </div>
              <div>
                <Label>จบ *</Label>
                <Input type="datetime-local" className="mt-1" value={form.end} onChange={e=>setForm({...form, end:e.target.value})}/>
                {errors.end && <div className="text-xs text-rose-600 mt-1">{errors.end}</div>}
              </div>
              <div className="md:col-span-2">
                <Label>หมายเหตุ (ถ้ามี)</Label>
                <Textarea rows={3} className="mt-1" value={form.note} onChange={e=>setForm({...form, note:e.target.value})}/>
              </div>
              {submitError && (
                <div className="md:col-span-2 p-3 rounded-lg border bg-rose-50 text-rose-700 border-rose-200">
                  {submitError}
                </div>
              )}
              <div className="md:col-span-2 flex justify-end gap-2">
                <Button variant="outline" onClick={()=>{ setForm({ crane: selectedCrane, item: "", requester: "", phone: "", purpose: "", start: "", end: "", note: "", status: "รอการอนุมัติ" }); setErrors({}); setSubmitError(null); }}>ล้าง</Button>
                <Button onClick={submit} disabled={loading}>{loading ? "กำลังบันทึก..." : "บันทึก"}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === "calendar" && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">ปฏิทินการจอง • {selectedCrane}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <Button variant="outline" size="sm" onClick={()=>setMonth(m=>addMonths(m,-1))}>{"<"}</Button>
              <div className="font-medium">{monthLabel}</div>
              <Button variant="outline" size="sm" onClick={()=>setMonth(m=>addMonths(m,1))}>{">"}</Button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-600 mb-1">
              {["จ.","อ.","พ.","พฤ.","ศ.","ส.","อา."].map(d=> <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {days.map((d, i)=>{
                if(!d) return <div key={i} className="h-20"/>;
                const k = d.toDateString();
                const items = dayMap.get(k) || [];
                const color = items.length? (items.length>2?"bg-rose-100 border-rose-200":"bg-amber-100 border-amber-200") : "bg-white";
                return (
                  <div key={i} className={cn("h-20 border rounded-lg p-1 text-xs text-left", color)}>
                    <div className="text-right text-[10px] text-slate-500">{d.getDate()}</div>
                    {items.slice(0,2).map(it=> (
                      <div key={it.id} className="truncate rounded px-1 py-0.5 bg-slate-100 border mb-1">
                        {it.item || 'ของยก'} • {new Date(it.start_ts).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                      </div>
                    ))}
                    {items.length>2 && <div className="text-[10px] text-slate-500">+{items.length-2} รายการ</div>}
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-slate-500 mt-3">สีเหลือง = มีการจอง • สีแดงอ่อน = แน่นมาก ({'>'} 2 รายการ)</div>
          </CardContent>
        </Card>
      )}

      {selectedTab === "list" && (
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">ผลการจองล่าสุด</CardTitle>
              {(user?.role==='admin' || user?.role==='manager') && (
                <div className="flex items-center gap-2 text-sm">
                  <Label className="mr-1">แสดงเฉพาะรออนุมัติ</Label>
                  <Button size="sm" variant={showPendingOnly?"secondary":"outline"} onClick={()=>setShowPendingOnly(v=>!v)}>
                    {showPendingOnly ? "กำลังกรอง" : "ปิดกรอง"}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัส</TableHead>
                  <TableHead>เครน</TableHead>
                  <TableHead>ผู้จอง</TableHead>
                  <TableHead>โทร</TableHead>
                  <TableHead>ของที่ยก</TableHead>
                  <TableHead>ใช้สำหรับ</TableHead>
                  <TableHead>เริ่ม</TableHead>
                  <TableHead>จบ</TableHead>
                  {(user?.role==='admin' || user?.role==='manager') && <TableHead>สถานะ</TableHead>}
                  {(user?.role==='admin' || user?.role==='manager') && <TableHead className="text-right">การทำงาน</TableHead>}
                  <TableHead>หมายเหตุ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.length > 0 ? recent.map((b)=> (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.id}</TableCell>
                    <TableCell>{b.crane}</TableCell>
                    <TableCell>{b.requester || "-"}</TableCell>
                    <TableCell>{b.phone || "-"}</TableCell>
                    <TableCell>{b.item || "-"}</TableCell>
                    <TableCell>{b.purpose || "-"}</TableCell>
                    <TableCell>{fmtDateTime(b.start_ts)}</TableCell>
                    <TableCell>{fmtDateTime(b.end_ts)}</TableCell>
                    {(user?.role==='admin' || user?.role==='manager') && <TableCell><Badge className={cn("border", bsColor(b.status))}>{b.status}</Badge></TableCell>}
                    {(user?.role==='admin' || user?.role==='manager') && (
                      <TableCell className="text-right">
                        {b.status === 'รอการอนุมัติ' && (
                          <div className="inline-flex items-center gap-1 rounded-full ring-1 ring-slate-300 px-2 py-1 bg-white">
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full min-w-[60px] h-7 text-xs font-medium hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatus(b.id, 'อนุมัติ');
                              }}
                            >
                              อนุมัติ
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full min-w-[60px] h-7 text-xs font-medium hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatus(b.id, 'ปฏิเสธ');
                              }}
                            >
                              ปฏิเสธ
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    )}
                    <TableCell>{b.note ? b.note : '-'}</TableCell>
                  </TableRow>
                )) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {selectedTab === "operations" && (
        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="text-base">การทำงานของการจอง</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ลำดับ</TableHead>
                  <TableHead>เครน</TableHead>
                  <TableHead>ชิ้นงาน</TableHead>
                  <TableHead>เวลา</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>ที่มา</TableHead>
                  <TableHead className="text-right">การทำงาน</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cranes.flatMap(crane =>
                  crane.queue
                    .filter(item => item.booking_id) // Only show items that have booking_id
                    .map((item) => {
                      const disabledStart = item.status !== "pending";
                      const disabledStop = item.status !== "working";
                      const disabledRollback = item.status === "pending";

                      return (
                        <TableRow key={`${crane.id}-${item.ord}`}>
                          <TableCell className="font-medium">{crane.id}-{item.ord}</TableCell>
                          <TableCell>{crane.id}</TableCell>
                          <TableCell>{item.piece}</TableCell>
                          <TableCell className="whitespace-pre-line text-slate-600">
                            {item.started_at ? (
                              <div className="flex items-center gap-2">
                                <span>{fmtTime(item.started_at)}{item.ended_at ? ` - ${fmtTime(item.ended_at)}` : ''}</span>
                                {item.status === 'working' && <Timer start={item.started_at} />}
                              </div>
                            ) : (item.note || "—")}
                          </TableCell>
                          <TableCell>
                            <Badge className={`border ${statusColor(item.status)}`}>{item.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                              จากการจอง {item.booking_id}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex items-center gap-1 rounded-full ring-1 ring-slate-300 px-3 py-1 bg-white">
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full min-w-[60px] h-8 text-xs font-medium hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStartTask(crane.id, item.ord);
                                }}
                                disabled={disabledStart}
                              >
                                เริ่ม
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full min-w-[60px] h-8 text-xs font-medium hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStopTask(crane.id, item.ord);
                                }}
                                disabled={disabledStop}
                              >
                                หยุด
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="rounded-full min-w-[60px] h-8 text-xs font-medium border hover:bg-yellow-50 hover:border-yellow-300 hover:text-yellow-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRollbackTask(crane.id, item.ord);
                                }}
                                disabled={disabledRollback}
                              >
                                ย้อน
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
                {cranes.flatMap(crane => crane.queue.filter(item => item.booking_id)).length === 0 && (
                  <TableRow>
                    <td colSpan={7} className="text-center text-slate-500 py-8">
                      ไม่มีงานจากการจอง
                    </td>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </main>
  );
}

// =================================================
// Feature: Queue Management (add queue items with work types)
// =================================================
function QueueManagement({
  cranes,
  workTypes,
  onCreateQueueItem,
  onRefreshCranes
}: {
  cranes: Crane[];
  workTypes: WorkType[];
  onCreateQueueItem: (craneId: string, data: { piece: string; note?: string; workType?: string }) => Promise<{ message: string; craneId: string; ord: number }>;
  onRefreshCranes: () => Promise<void>;
}){
  const [selectedCrane, setSelectedCrane] = useState<string>(cranes.length > 0 ? cranes[0].id : "");
  const [selectedWorkType, setSelectedWorkType] = useState<string>("");
  const [piece, setPiece] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedWorkTypeData = workTypes.find(wt => wt.id === selectedWorkType);
  const estimatedTime = selectedWorkTypeData?.estimated_time || 0;

  async function handleCreateQueueItem(){
    if (!selectedCrane || !piece.trim()) {
      setMessage({ type: 'error', text: 'กรุณากรอกชื่อเครน และ ชิ้นงาน' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const queueData = {
        piece: piece.trim(),
        note: note.trim() || undefined,
        workType: selectedWorkType || undefined
      };

      await onCreateQueueItem(selectedCrane, queueData);
      setMessage({ type: 'success', text: `เพิ่มงานในคิวสำเร็จ` });

      // Clear form
      setPiece("");
      setNote("");
      setSelectedWorkType("");

      // Refresh cranes to show updated queue
      try {
        await onRefreshCranes();
      } catch (refreshError) {
        console.warn('Failed to refresh cranes after adding queue item:', refreshError);
        // Data is still updated locally, so don't fail the whole operation
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเพิ่มงาน' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6 space-y-4">
      <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-purple-50 text-purple-700">จัดการคิวงาน</div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Queue Item Form */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">เพิ่มงานในคิว</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>เลือกเครน</Label>
              <Select value={selectedCrane} onValueChange={setSelectedCrane}>
                <SelectTrigger className="mt-1 w-full" />
                <SelectValue />
                <SelectContent>
                  {cranes.map(crane => (
                    <SelectItem key={crane.id} value={crane.id}>{crane.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>เลือกประเภทงาน (จะแสดงเวลาประมาณ)</Label>
              <Select value={selectedWorkType} onValueChange={setSelectedWorkType}>
                <SelectTrigger className="mt-1 w-full" />
                <SelectValue />
                <SelectContent>
                  <SelectItem value="">เลือกประเภทงาน...</SelectItem>
                  {workTypes.map(workType => (
                    <SelectItem key={workType.id} value={workType.id}>
                      {workType.name} (~{workType.estimated_time} นาที)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {estimatedTime > 0 && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm font-medium text-blue-800">
                    เวลาประมาณการทำงาน: {estimatedTime} นาที
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {selectedWorkTypeData?.description}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label>ชิ้นงาน *</Label>
              <Input
                className="mt-1"
                value={piece}
                onChange={e => setPiece(e.target.value)}
                placeholder="เช่น คอนกรีตบีม A-01"
              />
            </div>

            <div>
              <Label>หมายเหตุ (ถ้ามี)</Label>
              <Textarea
                rows={3}
                className="mt-1"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="รายละเอียดเพิ่มเติม..."
              />
            </div>

            {message && (
              <div className={`p-3 rounded-lg border ${message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                {message.text}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setPiece("");
                setNote("");
                setSelectedWorkType("");
                setMessage(null);
              }}>
                ล้างข้อมูล
              </Button>
              <Button onClick={handleCreateQueueItem} disabled={loading}>
                {loading ? "กำลังเพิ่ม..." : "เพิ่มงานในคิว"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Queue Display */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">
              คิวงานปัจจุบัน • {selectedCrane}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ลำดับ</TableHead>
                  <TableHead>ชิ้นงาน</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>สถานะ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cranes.find(c => c.id === selectedCrane)?.queue?.map(item => (
                  <TableRow key={item.ord}>
                    <TableCell className="font-medium">{item.ord}</TableCell>
                    <TableCell>{item.piece}</TableCell>
                    <TableCell>{item.note || '-'}</TableCell>
                    <TableCell>
                      <Badge className={`border ${statusColor(item.status)}`}>
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )) || (
                  <TableRow>
                    <td colSpan={4} className="text-center text-slate-500 py-8">
                      ยังไม่มีงานในคิว
                    </td>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Work Types Reference */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">ประเภทงานและเวลาประเมิน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workTypes.map(workType => (
              <div key={workType.id} className="border rounded-lg p-4 bg-slate-50">
                <div className="font-medium text-slate-800">{workType.name}</div>
                <div className="text-sm text-slate-600 mt-1">{workType.description}</div>
                <div className="text-sm font-medium text-blue-600 mt-2">
                  ~{workType.estimated_time} นาที
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function HomeTable({ cranes, bookings, onStart, onStop, onRollback, onDelete, onStartWorkTimer }: { cranes: Crane[]; bookings: Booking[]; onStart: (c: string, o: number)=>void; onStop: (c: string, o: number)=>void; onRollback: (c: string, o: number)=>void; onDelete: (c: string, o: number)=>void; onStartWorkTimer?: (projectName: string) => void; }){
  // Calculate booking work status summary
  const bookingWorkStats = useMemo(() => {
    const approvedBookings = bookings.filter(b => b.status === 'อนุมัติ');
    const allQueueItems = cranes.flatMap(c => c.queue.filter(q => q.booking_id));

    const started = new Map(); // booking_id -> boolean
    const working = new Map();
    const completed = new Map();

    allQueueItems.forEach(item => {
      if (item.booking_id) {
        started.set(item.booking_id, true);
        if (item.status === 'working') {
          working.set(item.booking_id, true);
        }
      if (item.status === 'success') {
        completed.set(item.booking_id, true);
      }
      }
    });

    return {
      totalApproved: approvedBookings.length,
      started: started.size,
      currentlyWorking: working.size,
      completed: completed.size,
      pending: approvedBookings.length - started.size
    };
  }, [bookings, cranes]);

  return (
    <main className="p-6 space-y-4">
      <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-slate-100 text-slate-700">หน้าหลัก</div>

      {/* Booking Work Status Summary */}
      {bookingWorkStats.totalApproved > 0 && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">สถานะการทำงานจากการจอง</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="text-xl font-semibold text-slate-700">{bookingWorkStats.totalApproved}</div>
                <div className="text-xs text-slate-600">การจองอนุมัติ</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-semibold text-blue-700">{bookingWorkStats.started}</div>
                <div className="text-xs text-blue-600">เริ่มงานแล้ว</div>
              </div>
              <div className="text-center p-3 bg-sky-50 rounded-lg">
                <div className="text-xl font-semibold text-sky-700">{bookingWorkStats.currentlyWorking}</div>
                <div className="text-xs text-sky-600">กำลังทำงาน</div>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <div className="text-xl font-semibold text-emerald-700">{bookingWorkStats.completed}</div>
                <div className="text-xs text-emerald-600">เสร็จแล้ว</div>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <div className="text-xl font-semibold text-amber-700">{bookingWorkStats.pending}</div>
                <div className="text-xs text-amber-600">รอเริ่มงาน</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cranes.map(c => (
          <CraneTable key={c.id} crane={c} bookings={bookings} showActions={true} onStart={(o)=>onStart(c.id,o)} onStop={(o)=>onStop(c.id,o)} onRollback={(o)=>onRollback(c.id,o)} onDelete={(o)=>onDelete(c.id,o)} onStartWorkTimer={onStartWorkTimer} />
        ))}
      </div>
    </main>
  );
}

// =================================================
// Feature: Work Logging (บันทึกงาน)
// =================================================
function WorkLogging({
  cranes,
  workLogs,
  onCreateWorkLog,
  onRefreshWorkLogs,
  onDeleteWorkLog
}: {
  cranes: Crane[];
  workLogs: WorkLog[];
  onCreateWorkLog: (workLog: Omit<WorkLog, 'id' | 'created_at'>) => Promise<WorkLog>;
  onRefreshWorkLogs: () => Promise<void>;
  onDeleteWorkLog: (id: string) => Promise<void>;
}){
  const [selectedCrane, setSelectedCrane] = useState<string>(cranes.length > 0 ? cranes[0].id : "");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedShift, setSelectedShift] = useState<'morning' | 'afternoon' | 'night'>('morning');
  const [operatorName, setOperatorName] = useState<string>("");
  const [operatorId, setOperatorId] = useState<string>("");
  const [actualWork, setActualWork] = useState<string>("");
  const [actualTime, setActualTime] = useState<number>(0);
  const [status, setStatus] = useState<'ปกติ' | 'ล่าช้า' | 'เร่งด่วน' | 'เสร็จก่อน'>('ปกติ');
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter work logs for selected crane and date
  const filteredWorkLogs = useMemo(() => {
    return workLogs.filter(log =>
      log.crane_id === selectedCrane &&
      log.work_date === selectedDate
    );
  }, [workLogs, selectedCrane, selectedDate]);

  // Get status color for work log
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ปกติ': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ล่าช้า': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'เร่งด่วน': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'เสร็จก่อน': return 'bg-sky-50 text-sky-700 border-sky-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  async function handleSubmit(){
    if (!selectedCrane || !operatorName.trim() || !operatorId.trim() || !actualWork.trim()) {
      setMessage({ type: 'error', text: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
      return;
    }

    if (actualTime <= 0) {
      setMessage({ type: 'error', text: 'กรุณากรอกเวลาจริงที่ใช้ในการทำงาน' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const workLogData = {
        crane_id: selectedCrane,
        operator_id: operatorId,
        operator_name: operatorName,
        work_date: selectedDate,
        shift: selectedShift,
        actual_work: actualWork,
        actual_time: actualTime,
        status: status,
        note: note || undefined
      };

      await onCreateWorkLog(workLogData);
      setMessage({ type: 'success', text: 'บันทึกข้อมูลการทำงานสำเร็จ' });

      // Clear form
      setOperatorName("");
      setOperatorId("");
      setActualWork("");
      setActualTime(0);
      setStatus('ปกติ');
      setNote("");

                // Refresh work logs
                try {
                  await onRefreshWorkLogs();
                } catch (refreshError) {
                  console.warn('Failed to refresh work logs after creation:', refreshError);
                  // Data is still updated locally, so don't fail the whole operation
                }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึก' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6 space-y-4">
      <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-green-50 text-green-700">บันทึกงาน</div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work Log Form */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">บันทึกการทำงานประจำวัน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>เลือกเครน</Label>
                <Select value={selectedCrane} onValueChange={setSelectedCrane}>
                  <SelectTrigger className="mt-1 w-full" />
                  <SelectValue />
                  <SelectContent>
                    {cranes.map(crane => (
                      <SelectItem key={crane.id} value={crane.id}>{crane.id}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>วันที่ทำงาน</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                />
              </div>

              <div>
                <Label>กะการทำงาน</Label>
                <Select value={selectedShift} onValueChange={(v) => setSelectedShift(v as 'morning' | 'afternoon' | 'night')}>
                  <SelectTrigger className="mt-1 w-full" />
                  <SelectValue />
                  <SelectContent>
                    <SelectItem value="morning">เช้า (06:00-14:00)</SelectItem>
                    <SelectItem value="afternoon">บ่าย (14:00-22:00)</SelectItem>
                    <SelectItem value="night">ดึก (22:00-06:00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>รหัสพนักงาน</Label>
                <Input
                  className="mt-1"
                  value={operatorId}
                  onChange={e => setOperatorId(e.target.value)}
                  placeholder="เช่น EMP001"
                />
              </div>

              <div className="sm:col-span-2">
                <Label>ชื่อพนักงาน</Label>
                <Input
                  className="mt-1"
                  value={operatorName}
                  onChange={e => setOperatorName(e.target.value)}
                  placeholder="ชื่อ-นามสกุล"
                />
              </div>

              <div>
                <Label>งานที่ทำจริง</Label>
                <Input
                  className="mt-1"
                  value={actualWork}
                  onChange={e => setActualWork(e.target.value)}
                  placeholder="เช่น ยกคอนกรีต, ย้ายเหล็ก"
                />
              </div>

              <div>
                <Label>เวลาจริงที่ใช้ (นาที)</Label>
                <Input
                  type="number"
                  className="mt-1"
                  value={actualTime || ''}
                  onChange={e => setActualTime(parseInt(e.target.value) || 0)}
                  placeholder="เช่น 120"
                  min="1"
                />
              </div>

              <div>
                <Label>สถานะงาน</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as 'ปกติ' | 'ล่าช้า' | 'เร่งด่วน' | 'เสร็จก่อน')}>
                  <SelectTrigger className="mt-1 w-full" />
                  <SelectValue />
                  <SelectContent>
                    <SelectItem value="ปกติ">ปกติ</SelectItem>
                    <SelectItem value="ล่าช้า">ล่าช้า</SelectItem>
                    <SelectItem value="เร่งด่วน">เร่งด่วน</SelectItem>
                    <SelectItem value="เสร็จก่อน">เสร็จก่อน</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2">
                <Label>หมายเหตุ (ถ้ามี)</Label>
                <Textarea
                  rows={3}
                  className="mt-1"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="รายละเอียดเพิ่มเติม..."
                />
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-lg border ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {message.text}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setOperatorName("");
                setOperatorId("");
                setActualWork("");
                setActualTime(0);
                setStatus('ปกติ');
                setNote("");
                setMessage(null);
              }}>
                ล้างข้อมูล
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "กำลังบันทึก..." : "บันทึกการทำงาน"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Work Logs Display */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">
              รายการบันทึกงาน • {selectedCrane} ({selectedDate})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ลำดับ</TableHead>
                  <TableHead>กะ</TableHead>
                  <TableHead>พนักงาน</TableHead>
                  <TableHead>งานที่ทำ</TableHead>
                  <TableHead>เวลาจริง</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>หมายเหตุ</TableHead>
                  <TableHead className="text-right">การทำงาน</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkLogs.length > 0 ? (
                  filteredWorkLogs.map((log, index) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                          {log.shift === 'morning' ? 'เช้า' :
                           log.shift === 'afternoon' ? 'บ่าย' : 'ดึก'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.operator_name}</div>
                          <div className="text-xs text-slate-500">{log.operator_id}</div>
                        </div>
                      </TableCell>
                      <TableCell>{log.actual_work}</TableCell>
                      <TableCell>{log.actual_time} นาที</TableCell>
                      <TableCell>
                        <Badge className={`border ${getStatusColor(log.status)}`}>
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.note || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full min-w-[60px] h-8 text-xs font-medium bg-red-50 border-red-300 text-red-700 hover:bg-red-100 hover:border-red-400 hover:text-red-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`ต้องการลบบันทึกงานของ "${log.operator_name}" ในงาน "${log.actual_work}" ใช่หรือไม่?`)) {
                              onDeleteWorkLog(log.id);
                            }
                          }}
                        >
                          ลบ
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <td colSpan={8} className="text-center text-slate-500 py-8">
                      ไม่มีข้อมูลการทำงานในวันที่เลือก
                    </td>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Summary Statistics */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">สรุปการทำงานประจำวัน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-semibold text-slate-700">{filteredWorkLogs.length}</div>
              <div className="text-sm text-slate-600">จำนวนกะงาน</div>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <div className="text-2xl font-semibold text-emerald-700">
                {filteredWorkLogs.filter(log => log.status === 'ปกติ').length}
              </div>
              <div className="text-sm text-emerald-600">งานปกติ</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-semibold text-amber-700">
                {filteredWorkLogs.filter(log => log.status === 'ล่าช้า').length}
              </div>
              <div className="text-sm text-amber-600">งานล่าช้า</div>
            </div>
            <div className="text-center p-4 bg-sky-50 rounded-lg">
              <div className="text-2xl font-semibold text-sky-700">
                {filteredWorkLogs.reduce((sum, log) => sum + log.actual_time, 0)}
              </div>
              <div className="text-sm text-sky-600">เวลารวม (นาที)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

// =================================================
// Feature: Crane Management (add/delete cranes)
// =================================================
function CraneManagement({
  cranes,
  onCreateCrane,
  onDeleteCrane,
  onRefreshCranes
}: {
  cranes: Crane[];
  onCreateCrane: (craneId: string) => Promise<void>;
  onDeleteCrane: (craneId: string) => Promise<void>;
  onRefreshCranes: () => Promise<void>;
}){
  const [newCraneId, setNewCraneId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleCreateCrane(){
    if (!newCraneId.trim()) {
      setMessage({ type: 'error', text: 'กรุณากรอก ID ของเครน' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      await onCreateCrane(newCraneId.trim());
      setMessage({ type: 'success', text: `เพิ่มเครน "${newCraneId.trim()}" สำเร็จ` });
      setNewCraneId("");
      try {
        await onRefreshCranes(); // Refresh the cranes list
      } catch (refreshError) {
        console.warn('Failed to refresh cranes after creating crane:', refreshError);
        // Data is still updated locally, so don't fail the whole operation
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6 space-y-4">
      <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-blue-50 text-blue-700">จัดการเครน</div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">เพิ่มเครนใหม่</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-3">
            <div>
              <Label>รหัสเครน</Label>
              <Input
                className="mt-1"
                value={newCraneId}
                onChange={e => setNewCraneId(e.target.value)}
                placeholder="เช่น CRANE 4, TC3, หรืออื่นๆ"
                onKeyPress={e => e.key === 'Enter' && handleCreateCrane()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleCreateCrane} disabled={loading}>
                {loading ? "กำลังเพิ่ม..." : "เพิ่มเครน"}
              </Button>
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-lg border ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {message.text}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">เครนที่มีอยู่ ({cranes.length} เครน)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {cranes.map(crane => (
              <div key={crane.id} className="flex items-center justify-between border rounded-lg px-3 py-2 bg-slate-50">
                <span className="font-medium">{crane.id}</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-slate-100 text-slate-600 border-slate-200">
                    {crane.queue.length} งาน
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full min-w-[40px] h-6 text-xs hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                    onClick={async () => {
                      if (window.confirm(`คุณต้องการลบเครน "${crane.id}" ใช่หรือไม่?\n\nผู้ใช้จำเป็นต้องลบงานทั้งหมดในคิวก่อนที่จะลบเครน`)) {
                        try {
                          await onDeleteCrane(crane.id);
                        } catch (error) {
                          alert(`ลบเครนไม่สำเร็จ: ${error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'}`);
                        }
                      }
                    }}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {cranes.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              ยังไม่มีเครนในระบบ
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function HomeTop({ user, onLogout, onChangeTab, tab }: { user: { name: string; role: UserRole } | null; onLogout: ()=>void; onChangeTab: (v: string)=>void; tab: string }){
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navLinks = (
    <>
      <Button size="sm" variant={tab === "home" ? "secondary" : "outline"} onClick={() => { onChangeTab("home"); setIsMenuOpen(false); }}>หน้าหลัก</Button>
      <Button size="sm" variant={tab === "overview" ? "secondary" : "outline"} onClick={() => { onChangeTab("overview"); setIsMenuOpen(false); }}>overview</Button>
      <Button size="sm" variant={tab === "booking" ? "secondary" : "outline"} onClick={() => { onChangeTab("booking"); setIsMenuOpen(false); }}>จองคิว</Button>
      <Button size="sm" variant={tab === "history" ? "secondary" : "outline"} onClick={() => { onChangeTab("history"); setIsMenuOpen(false); }}>ประวัติ</Button>
      <Button size="sm" variant={tab === "crane-management" ? "secondary" : "outline"} onClick={() => { onChangeTab("crane-management"); setIsMenuOpen(false); }}>จัดการเครน</Button>
      <Button size="sm" variant={tab === "work-logging" ? "secondary" : "outline"} onClick={() => { onChangeTab("work-logging"); setIsMenuOpen(false); }}>บันทึกงาน</Button>
      <Button size="sm" variant={tab === "optional" ? "secondary" : "outline"} onClick={() => { onChangeTab("optional"); setIsMenuOpen(false); }}>optional</Button>
    </>
  );

  return (
    <Topbar
      right={(
        <div className="flex items-center gap-2">
          <div className="hidden md:flex gap-2">{navLinks}</div>
          <div className="flex items-center gap-2 rounded-xl border px-3 py-1.5">
            <User className="h-4 w-4 text-slate-500" />
            <span className="text-sm">{user?.name || "Engineer"}</span>
            {user?.role && <span className="text-[11px] px-2 py-0.5 rounded-full border bg-slate-50 text-slate-600">{user.role}</span>}
          </div>
          <Button variant="outline" onClick={onLogout}><LogOut className="h-4 w-4 mr-2" />Logout</Button>
          <div className="md:hidden">
            <Button variant="outline" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              ☰
            </Button>
          </div>
          {isMenuOpen && (
            <div className="absolute top-16 right-4 bg-white border rounded-lg p-2 space-y-2 md:hidden">
              {navLinks}
            </div>
          )}
        </div>
      )}
    />
  );
}

// =================================================
// APP (single default export)
// =================================================
export default function PrecastApp(){
  const [screen, setScreen] = useState<"landing" | "login" | "guest" | "home" | "work-timer">("login");
  const [user, setUser] = useState<{name: string; role: UserRole} | null>(null);
  const [tab, setTab] = useState("booking");

  // Work timer state
  const [currentWorkProject, setCurrentWorkProject] = useState<string | null>(null);

  // Work timer handlers
  const handleStartWorkTimer = async (projectName: string) => {
    // Extract crane ID and order from project name (format: "CRANE_ID - PIECE")
    const [craneId, ...pieceParts] = projectName.split(' - ');
    const piece = pieceParts.join(' - ');

    if (craneId && piece) {
      try {
        // Find the queue item and start it
        const updatedCranes = await api.getCranes(authToken || undefined);
        // If caller passed 'undefined' or empty craneId (e.g. "undefined - P1"), try to resolve it
        let resolvedCraneId = craneId && craneId !== 'undefined' ? craneId : undefined;
        if (!resolvedCraneId) {
          const found = updatedCranes.find(c => c.queue.some(q => q.piece === piece));
          if (found) resolvedCraneId = found.id;
        }

        const crane = resolvedCraneId ? updatedCranes.find(c => c.id === resolvedCraneId) : undefined;
        const queueItem = crane?.queue.find(q => q.piece === piece);

        // normalize project name with resolved crane id when available
        const normalizedProjectName = (resolvedCraneId ? `${resolvedCraneId} - ${piece}` : projectName);

        if (queueItem && queueItem.status === 'pending') {
          // Start the task first
          await api.startTask(resolvedCraneId || craneId, queueItem.ord, authToken || undefined);
          // Then open the timer
          setCurrentWorkProject(normalizedProjectName);
          setScreen("work-timer");
        } else {
          // If already working or not found, just open timer
          setCurrentWorkProject(normalizedProjectName);
          setScreen("work-timer");
        }
      } catch (error) {
        console.error('Error starting work timer:', error);
        // Still open timer even if start task fails
        setCurrentWorkProject(projectName);
        setScreen("work-timer");
      }
    } else {
      setCurrentWorkProject(projectName);
      setScreen("work-timer");
    }
  };

  const handleBackToHome = () => {
    setScreen("home");
    setCurrentWorkProject(null);
  };

  const handleWorkTimerComplete = async (sessions: WorkSession[]) => {
    if (!currentWorkProject) return;

    try {
      // Extract crane ID and order from project name
      const [craneId, ...pieceParts] = currentWorkProject.split(' - ');
      const piece = pieceParts.join(' - ');

      if (craneId && piece) {
        // Find the queue item and stop it
        const updatedCranes = await api.getCranes(authToken || undefined);
        const crane = updatedCranes.find(c => c.id === craneId);
        const queueItem = crane?.queue.find(q => q.piece === piece);

        if (queueItem && (queueItem.status === 'working' || queueItem.status === 'pending')) {
          // Stop the task and mark as completed (backend will update history)
          await api.stopTask(craneId, queueItem.ord, authToken || undefined);

          // Persist each split/session as its own work log record so history shows each piece
          for (const session of sessions) {
            try {
              const workLogData = {
                crane_id: craneId,
                operator_id: user?.name || 'Unknown',
                operator_name: user?.name || 'Unknown',
                work_date: new Date(session.startTime).toISOString().split('T')[0],
                shift: getCurrentShift(),
                actual_work: `${session.label || piece}`,
                actual_time: Math.max(1, Math.round(session.interval / 60000)), // minutes, at least 1
                status: 'ปกติ' as const,
                note: `ช่วงที่ ${session.id} • ${session.craneId} • ${session.piece} • ${new Date(session.startTime).toLocaleString()} - ${session.endTime ? new Date(session.endTime).toLocaleString() : '-'} `
              };
              await api.createWorkLog(workLogData, authToken || undefined);
            } catch (innerErr) {
              console.error('Failed to create work log for session', session, innerErr);
            }
          }

          console.log('Work timer completed and logged sessions:', sessions.length);
        }
      }
    } catch (error) {
      console.error('Error completing work timer:', error);
    }

    // Refresh data and go back to home
    try {
      const [updatedCranes, updatedHistory, updatedWorkLogs] = await Promise.all([
        api.getCranes(authToken || undefined),
        api.getHistory(authToken || undefined),
        api.getWorkLogs(authToken || undefined)
      ]);
      setCranes(updatedCranes);
      setHistory(updatedHistory);
      setWorkLogs(updatedWorkLogs);
    } catch (error) {
      console.error('Error refreshing data after work timer completion:', error);
    }

    setScreen("home");
    setCurrentWorkProject(null);
  };

  // Helper function to determine current shift
  const getCurrentShift = (): 'morning' | 'afternoon' | 'night' => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) return 'morning';
    if (hour >= 14 && hour < 22) return 'afternoon';
    return 'night';
  };

  // Replace mock data with API state
  const [cranes, setCranes] = useState<Crane[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Guest view state (must be unconditional hooks)
  const [guestCranes, setGuestCranes] = useState<Crane[] | null>(null);
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);

  // Load guest cranes (read-only) and auto-refresh when viewing guest screen
  const loadGuestCranes = useCallback(async () => {
    try {
      setGuestLoading(true);
      setGuestError(null);
      const data = await api.getCranes(undefined);
      setGuestCranes(data);
    } catch (err) {
      // If backend requires auth, show a friendly message and fall back to sample data
      const status = (err as unknown as { status?: number }).status;
      if (status === 401) {
        setGuestError('เซิร์ฟเวอร์ต้องการการยืนยันตัวตน (401) — แสดงตัวอย่างแทน');
        setGuestCranes(initialCranes);
      } else {
        setGuestError(err instanceof Error ? err.message : 'ไม่สามารถโหลดข้อมูลเครนได้');
      }
    } finally {
      setGuestLoading(false);
    }
  }, []);

  useEffect(() => {
    if (screen !== 'guest') return;
    loadGuestCranes();
    const id = setInterval(loadGuestCranes, 30000);
    return () => clearInterval(id);
  }, [screen, loadGuestCranes]);

  // Load initial data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('Loading data from API...');
      const [cranesData, historyData, bookingsData, workLogsData, workTypesData] =       await Promise.all([
        api.getCranes(authToken || undefined),
        api.getHistory(authToken || undefined),
        api.getBookings(authToken || undefined),
        api.getWorkLogs(authToken || undefined),
        api.getWorkTypes(authToken || undefined)
      ]);
        console.log('Loaded cranes:', cranesData);
        console.log('Loaded bookings:', bookingsData);
        console.log('Loaded work logs:', workLogsData);
        console.log('Loaded work types:', workTypesData);
        setCranes(cranesData);
        setHistory(historyData);
        setBookings(bookingsData);
        setWorkLogs(workLogsData);
        setWorkTypes(workTypesData.types);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (screen === "home") {
      loadData();
    }
  }, [screen, authToken]);

  // API-based task operations
  async function startTask(craneId: string, ord: number){
    try {
      await api.startTask(craneId, ord, authToken || undefined);
      // Refresh cranes data
      const updatedCranes = await api.getCranes(authToken || undefined);
      setCranes(updatedCranes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start task');
    }
  }

  async function stopTask(craneId: string, ord: number){
    try {
      await api.stopTask(craneId, ord, authToken || undefined);
      // Refresh both cranes and history data
      const [updatedCranes, updatedHistory] = await Promise.all([
        api.getCranes(authToken || undefined),
        api.getHistory(authToken || undefined)
      ]);
      setCranes(updatedCranes);
      setHistory(updatedHistory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop task');
    }
  }

  async function rollbackTask(craneId: string, ord: number){
    try {
      await api.rollbackTask(craneId, ord, authToken || undefined);
      // Refresh cranes data
      const updatedCranes = await api.getCranes(authToken || undefined);
      setCranes(updatedCranes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rollback task');
    }
  }

  async function deleteQueueItem(craneId: string, ord: number) {
    try {
      await api.deleteQueueItem(craneId, ord, authToken || undefined);
      // Refresh cranes data
      const updatedCranes = await api.getCranes(authToken || undefined);
      setCranes(updatedCranes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete queue item');
    }
  }

  // Authentication functions
  async function handleLogin(username: string, password: string) {
    try {
      console.log('Attempting login for:', username);
      setLoading(true);
      setError(null);

      const response = await api.login(username, password);
      console.log('Login successful:', response);

      if (response && response.token) {
        setAuthToken(response.token);
        setUser({ name: response.user.username, role: response.user.role as UserRole });
        setScreen("home");
        console.log('Authentication successful, token stored');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setAuthToken(null);
    setUser(null);
    setScreen("landing");
    setCranes([]);
    setHistory([]);
    setBookings([]);
  }

  // Booking operations
  async function createBooking(bookingData: BookingCreateData) {
    try {
      console.log('Creating booking with data:', bookingData);
      const newBooking = await api.createBooking(bookingData, authToken || undefined);
      console.log('New booking created:', newBooking);
      setBookings(prev => {
        console.log('Updating bookings state from', prev.length, 'to', prev.length + 1);
        return [...prev, newBooking];
      });
      return newBooking;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      console.error('Booking creation error:', err);
      throw err;
    }
  }

  async function updateBookingStatus(id: string, status: Booking['status']) {
    try {
      // For demo purposes, if we have a demo token, try with authentication
      // If that fails, the backend will handle it appropriately
      await api.updateBookingStatus(id, status, authToken || undefined, user?.role);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } catch (err) {
      console.error('Booking status update failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to update booking status');
    }
  }

  // Crane management operations
  async function createCrane(craneId: string) {
    try {
      await api.createCrane(craneId, authToken || undefined);
      // Refresh cranes data after creating new crane
      const updatedCranes = await api.getCranes(authToken || undefined);
      setCranes(updatedCranes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create crane');
      throw err;
    }
  }

  async function deleteCrane(craneId: string) {
    try {
      await api.deleteCrane(craneId, authToken || undefined);
      // Refresh cranes data after deleting crane
      const updatedCranes = await api.getCranes(authToken || undefined);
      setCranes(updatedCranes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete crane');
      throw err;
    }
  }

  async function refreshCranes() {
    try {
      const updatedCranes = await api.getCranes(authToken || undefined);
      setCranes(updatedCranes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh cranes');
    }
  }

  // Work logging operations
  async function createWorkLog(workLogData: Omit<WorkLog, 'id' | 'created_at'>) {
    try {
      console.log('Creating work log:', workLogData);
      const newWorkLog = await api.createWorkLog(workLogData, authToken || undefined);
      console.log('New work log created:', newWorkLog);
      setWorkLogs(prev => {
        console.log('Updating work logs state from', prev.length, 'to', prev.length + 1);
        return [...prev, newWorkLog];
      });
      return newWorkLog;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create work log');
      console.error('Work log creation error:', err);
      throw err;
    }
  }

  async function refreshWorkLogs() {
    try {
      const updatedWorkLogs = await api.getWorkLogs(authToken || undefined);
      setWorkLogs(updatedWorkLogs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh work logs');
    }
  }

  async function deleteWorkLog(id: string) {
    try {
      await api.deleteWorkLog(id, authToken || undefined);
      setWorkLogs(prev => prev.filter(log => log.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete work log');
    }
  }

  // Loading and error UI components
  if (loading && screen === "home") {
    return (
      <Shell>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
            <p className="text-slate-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </Shell>
    );
  }

  if (error && screen === "home") {
    return (
      <Shell>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-red-600">เกิดข้อผิดพลาด</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>ลองใหม่</Button>
            </CardContent>
          </Card>
        </div>
      </Shell>
    );
  }

  if(screen === "landing"){
    return (
      <Shell>
        <Topbar right={<Button onClick={()=>setScreen("login")}><LogIn className="h-4 w-4 mr-2"/>Login</Button>} />

        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-blue-100 via-blue-200 to-indigo-100 overflow-hidden">
          <div className="absolute inset-0 bg-white/40"></div>
          <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24">
            <div className="text-center">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-black">
                ระบบจัดการเครน
                <span className="block text-2xl lg:text-3xl font-normal text-slate-700 mt-2">
                  Precast Construction Management
                </span>
              </h1>
              <p className="text-xl text-slate-700 mb-8 max-w-3xl mx-auto">
                จัดการและติดตามการทำงานของเครนในโครงการ Precast ด้วยระบบที่ครอบคลุม
                ตั้งแต่การจองคิวงานจนถึงบันทึกผลการทำงาน
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => setScreen("login")}
                  className="bg-white text-black hover:bg-slate-50 px-8 py-3"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  เข้าสู่ระบบ
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setScreen("guest")}
                  className="border-slate-300 text-black hover:bg-slate-50 px-8 py-3"
                >
                  <HardHat className="h-5 w-5 mr-2" />
                  สำรวจฟีเจอร์
                </Button>
              </div>
            </div>
          </div>

          {/* Decorative shapes */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/10 rounded-full"></div>
        </div>

        {/* Quick Stats Section */}
        <div className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">ตัวเลขสำคัญวันนี้</h2>
              <p className="text-gray-600">ภาพรวดเร็วของการดำเนินงานในปัจจุบัน</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-8">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {loading ? "..." : cranes.length}
                  </div>
                  <div className="text-sm font-medium text-gray-600">เครนทั้งหมด</div>
                </CardContent>
              </Card>

              <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-8">
                  <div className="text-4xl font-bold text-emerald-600 mb-2">
                    {loading ? "..." : cranes.reduce((sum, c) => sum + c.queue.filter(q => q.status === 'working').length, 0)}
                  </div>
                  <div className="text-sm font-medium text-gray-600">กำลังทำงาน</div>
                </CardContent>
              </Card>

              <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-8">
                  <div className="text-4xl font-bold text-amber-600 mb-2">
                    {loading ? "..." : cranes.reduce((sum, c) => sum + c.queue.length, 0)}
                  </div>
                  <div className="text-sm font-medium text-gray-600">งานรอคิว</div>
                </CardContent>
              </Card>

              <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-8">
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {loading ? "..." : bookings.filter(b => b.status === 'อนุมัติ').length}
                  </div>
                  <div className="text-sm font-medium text-gray-600">การจองอนุมัติ</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">ฟีเจอร์หลักของระบบ</h2>
              <p className="text-gray-600">เครื่องมือที่ครบครันสำหรับจัดการงานก่อสร้าง Precast</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Layers className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">จัดการคิวงาน</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center mb-4">
                    จัดระเบียบและติดตามงานเครนด้วยระบบคิวที่ชาญฉลาด
                    สามารถจัดการลำดับความสำคัญและติดตามความคืบหน้าได้แบบเรียลไทม์
                  </p>
                  <div className="text-sm text-gray-500 text-center">
                    • จองคิวล่วงหน้า<br/>
                    • ติดตามสถานะงาน<br/>
                    • จัดลำดับอัตโนมัติ
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="h-8 w-8 text-emerald-600" />
                  </div>
                  <CardTitle className="text-xl">จับเวลางาน</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center mb-4">
                    วัดประสิทธิภาพงานเครนด้วยระบบจับเวลาแบบหลายช่วง
                    บันทึกข้อมูลละเอียดเพื่อวิเคราะห์และปรับปรุงกระบวนการ
                  </p>
                  <div className="text-sm text-gray-500 text-center">
                    • จับเวลาอัตโนมัติ<br/>
                    • แยกช่วงการทำงาน<br/>
                    • รายงานประสิทธิภาพ
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HardHat className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">จัดการเครน</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center mb-4">
                    เพิ่ม ลบ และกำหนดค่าเครนได้อย่างง่ายดาย
                    สนับสนุนการจัดการหลายเครนพร้อมกัน
                  </p>
                  <div className="text-sm text-gray-500 text-center">
                    • เพิ่มเครนใหม่<br/>
                    • ติดตามประวัติ<br/>
                    • วางแผนการใช้งาน
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Getting Started Section */}
        <div className="bg-white py-16">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">เริ่มใช้งานได้ง่าย</h2>
              <p className="text-gray-600">ขั้นตอนการเริ่มต้นใช้งานระบบใน 3 ขั้นตอน</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">เข้าสู่ระบบ</h3>
                <p className="text-gray-600">
                  เข้าสู่ระบบด้วยบัญชีผู้ใช้งานที่ได้รับอนุมัติ
                  ระบบรองรับผู้ใช้หลายระดับตั้งแต่นักวิศวกรไปจนถึงผู้บริหาร
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">จัดการเครน</h3>
                <p className="text-gray-600">
                  เพิ่มเครนที่ใช้งานในโครงการและกำหนดการตั้งค่า
                  จัดการคิวงานและการจองล่วงหน้าได้อย่างมีประสิทธิภาพ
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ติดตามและบันทึก</h3>
                <p className="text-gray-600">
                  ติดตามความคืบหน้าของงานแบบเรียลไทม์
                  บันทึกเวลาการทำงานและวิเคราะห์ประสิทธิภาพ
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <Button size="lg" onClick={() => setScreen("login")} className="bg-blue-600 hover:bg-blue-700 px-8 py-3">
                เริ่มต้นใช้งานเลย
              </Button>
            </div>
          </div>
        </div>

        {/* Current Crane Status Section */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">สถานะเครนปัจจุบัน</h2>
              <p className="text-gray-600">ภาพรวมการทำงานของเครนทั้งหมดในระบบ</p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">กำลังโหลดข้อมูลเครน...</p>
              </div>
            ) : cranes.length > 0 ? (
              <>
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                  {cranes.slice(0, 4).map(c => (
                    <CraneTable key={c.id} crane={c} bookings={[]} showActions={false} onStart={()=>{}} onStop={()=>{}} onRollback={()=>{}} />
                  ))}
                </div>
                {cranes.length > 4 && (
                  <div className="text-center">
                    <Button
                      variant="outline"
                      onClick={() => setScreen("login")}
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      ดูเครนทั้งหมด ({cranes.length})
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card className="max-w-md mx-auto text-center border-0 shadow-lg">
                <CardContent className="pt-8 pb-8">
                  <Layers className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">ไม่มีเครนในระบบ</h3>
                  <p className="text-gray-600 mb-6">
                    กรุณาเข้าสู่ระบบเพื่อเพิ่มเครนและเริ่มใช้งานระบบ
                  </p>
                  <Button onClick={() => setScreen("login")}>
                    <LogIn className="h-4 w-4 mr-2" />
                    เข้าสู่ระบบ
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Layers className="h-6 w-6 text-blue-400" />
                <span className="text-lg font-semibold">Precast Crane Management</span>
              </div>
              <p className="text-gray-400 mb-4">
                ระบบจัดการเครนสำหรับโครงการก่อสร้าง Precast ที่ครอบคลุมและมีประสิทธิภาพ
              </p>
              <div className="text-sm text-gray-500">
                © {new Date().getFullYear()} Precast Management System. Built for construction excellence.
              </div>
            </div>
          </div>
        </footer>
      </Shell>
    );
  }

  // GUEST / before-login view: allow browsing without actions or dropdowns
  if (screen === "guest") {
    const displayCranes = guestCranes && guestCranes.length > 0 ? guestCranes : initialCranes;

    return (
      <Shell>
        <Topbar right={<Button onClick={() => setScreen("login")}><LogIn className="h-4 w-4 mr-2"/>Login</Button>} title="ดูสถานะเครน (ผู้เยี่ยมชม)" />

        <main className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-slate-100 text-slate-700">แสดงผลสำหรับผู้เยี่ยมชม</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={loadGuestCranes} disabled={guestLoading}>↻ Refresh</Button>
            </div>
          </div>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">สถานะเครน</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">คุณสามารถดูคิวงานและสถานะปัจจุบันได้ แต่จะไม่สามารถเริ่ม/หยุดงานหรือเปิดเมนู Dropdown ได้</p>
            </CardContent>
          </Card>

          {guestLoading ? (
            <Card className="rounded-2xl">
              <CardContent className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900 mx-auto mb-4" />
                <div className="text-slate-600">กำลังโหลดข้อมูลเครน...</div>
              </CardContent>
            </Card>
          ) : guestError ? (
            <Card className="rounded-2xl">
              <CardContent className="text-center py-8">
                <div className="text-red-600 mb-2">เกิดข้อผิดพลาด: {guestError}</div>
                <Button onClick={loadGuestCranes}>ลองใหม่</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayCranes.map(c => (
                <CraneTable key={c.id} crane={c} bookings={[]} showActions={false} onStart={()=>{}} onStop={()=>{}} onRollback={()=>{}} />
              ))}
            </div>
          )}

          <div className="text-center">
            <Button size="lg" onClick={() => setScreen("login")} className="bg-blue-600 hover:bg-blue-700 px-8 py-3">
              เข้าสู่ระบบเพื่อจัดการ
            </Button>
          </div>
        </main>
      </Shell>
    );
  }

  if(screen === "login"){
    return (
      <Shell>
        <Topbar right={<span/>} />
        <div className="min-h-[calc(100vh-56px)] grid place-items-center p-6">
          <Card className="w-full max-w-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl">เข้าสู่ระบบ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <LoginForm onLogin={handleLogin} loading={loading} />
              <p className="text-xs text-slate-500">ใช้ admin/admin123 หรือสร้างผู้ใช้ใหม่</p>
            </CardContent>
          </Card>
        </div>
      </Shell>
    );
  }

  // HOME after login
  return (
    <Shell>
      <HomeTop
        user={user}
        onLogout={handleLogout}
        tab={tab}
        onChangeTab={setTab}
      />
      {tab === "home" && (
        <HomeTable
          cranes={cranes}
          bookings={bookings}
          onStart={startTask}
          onStop={stopTask}
          onRollback={rollbackTask}
          onDelete={deleteQueueItem}
          onStartWorkTimer={handleStartWorkTimer}
        />
      )}
      {screen === "work-timer" && currentWorkProject && (
        <WorkTimer
          projectName={currentWorkProject}
          onBackToHome={handleBackToHome}
          onComplete={handleWorkTimerComplete}
        />
      )}
      {tab === "overview" && <Overview cranes={cranes} history={history}/>}
      {tab === "booking" && (
        <Booking
          user={user}
          bookings={bookings}
          onCreateBooking={createBooking}
          onUpdateBookingStatus={updateBookingStatus}
          cranes={cranes}
          onStartTask={startTask}
          onStopTask={stopTask}
          onRollbackTask={rollbackTask}
        />
      )}
      {tab === "queue-management" && (
        <QueueManagement
          cranes={cranes}
          workTypes={workTypes}
          onCreateQueueItem={api.createQueueItem}
          onRefreshCranes={refreshCranes}
        />
      )}
      {tab === "history" && <HistoryView authToken={authToken}/>}
      {tab === "crane-management" && (
        <CraneManagement
          cranes={cranes}
          onCreateCrane={createCrane}
          onDeleteCrane={deleteCrane}
          onRefreshCranes={refreshCranes}
        />
      )}
      {tab === "work-logging" && (
        <WorkLogging
          cranes={cranes}
          workLogs={workLogs}
          onCreateWorkLog={createWorkLog}
          onRefreshWorkLogs={refreshWorkLogs}
          onDeleteWorkLog={deleteWorkLog}
        />
      )}
      {tab === "optional" && (
        <main className="p-6 space-y-4">
          <Card className="rounded-2xl">
            <CardHeader><CardTitle className="text-base">การตั้งค่า</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-slate-600">ตั้งค่า role ผู้ใช้งานปัจจุบัน (มีผลกับสิทธิ์อนุมัติ/ปฏิเสธการจอง)</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                <div>
                  <Label>Role ปัจจุบัน</Label>
                  <Select value={user?.role || 'engineer'} onValueChange={(r)=> setUser(u => (u ? { ...u, role: r as UserRole } : { name: 'Site User', role: r as UserRole }))}>
                    <SelectTrigger className="w-full mt-1" />
                    <SelectValue />
                    <SelectContent>
                      <SelectItem value="engineer">engineer</SelectItem>
                      <SelectItem value="manager">manager</SelectItem>
                      <SelectItem value="admin">admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 sm:justify-end">
                  <Button variant="outline" onClick={()=>setUser(u => (u ? { ...u, role: 'engineer' } : { name: 'Site User', role: 'engineer' }))}>ตั้งเป็น engineer</Button>
                  <Button onClick={()=>{ /* no-op: Select already updates state */ }}>บันทึก</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      )}
    </Shell>
  );
}

// Login form component
function LoginForm({ onLogin, loading }: { onLogin: (username: string, password: string) => void; loading: boolean }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with:', { username, password: '***' });
    if (username && password) {
      onLogin(username, password);
    } else {
      console.error('Username and password are required');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label>Username</Label>
        <Input
          type="text"
          value={username}
          onChange={e => {
            console.log('Username changed:', e.target.value);
            setUsername(e.target.value);
          }}
          placeholder="admin"
          required
        />
      </div>
      <div>
        <Label>Password</Label>
        <Input
          type="password"
          value={password}
          onChange={e => {
            console.log('Password changed');
            setPassword(e.target.value);
          }}
          placeholder="admin123"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </Button>
    </form>
  );
}

// =================================================
// History View Component (missing from original code)
// =================================================
function HistoryView({ authToken }: { authToken?: string | null }){
  const [crane, setCrane] = useState<string|"ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced API call
  const refreshHistory = useMemo(() => {
    return (craneFilter: string, query: string) => {
      setLoading(true);
      setError(null);
      api.getHistory(authToken || undefined, craneFilter, query)
        .then(data => {
          setHistory(data);
          setError(null);
        })
        .catch(err => {
          console.error('Failed to fetch history:', err);
          setError(err instanceof Error ? err.message : 'Failed to load history');
        })
        .finally(() => setLoading(false));
    };
  }, [authToken]);

  // Effect: refresh when crane or searchQuery changes
  useEffect(() => {
    refreshHistory(crane, searchQuery);
  }, [crane, searchQuery, refreshHistory]);

  // Handle debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      refreshHistory(crane, value);
    }, 300);

    setDebounceTimer(timer);
  };

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  function exportCSV(){
    if(history.length===0){ return; }
    // Enhanced headers with formatted dates and times
    const header = ["ID","เครน","ชิ้นงาน","วันที่เริ่ม","เวลาที่เริ่ม","วันที่จบ","เวลาที่จบ","ระยะเวลา (นาที)","วันที่ทำงาน (วันเดียว)","สถานะ"].join(",");
    const rows = history.map(h=>{
      const startDate = h.start_ts ? new Date(h.start_ts).toLocaleDateString('th-TH') : "";
      const startTime = h.start_ts ? new Date(h.start_ts).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : "";
      const endDate = h.end_ts ? new Date(h.end_ts).toLocaleDateString('th-TH') : "";
      const endTime = h.end_ts ? new Date(h.end_ts).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : "";

      // Calculate work date (if same day, use start date, otherwise show range)
      let workDate = "";
      if (h.start_ts && h.end_ts) {
        const start = new Date(h.start_ts);
        const end = new Date(h.end_ts);
        if (start.toDateString() === end.toDateString()) {
          workDate = start.toLocaleDateString('th-TH');
        } else {
          workDate = `${start.toLocaleDateString('th-TH')} - ${end.toLocaleDateString('th-TH')}`;
        }
      }

      return [
        h.id, h.crane, h.piece,
        startDate, startTime, endDate, endTime,
        h.duration_min ?? "",
        workDate,
        h.status
      ].join(",");
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;"}); // BOM for Thai characters
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `work-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="p-6 space-y-4">
      <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-slate-100 text-slate-700">ประวัติ</div>
      <div className="flex flex-wrap items-center gap-2">
        <Label>เครน</Label>
        <Select value={crane} onValueChange={setCrane}>
          <SelectTrigger className="w-44" />
          <SelectValue />
          <SelectContent>
            <SelectItem value="ALL">ทั้งหมด</SelectItem>
            <SelectItem value="CRANE 1">CRANE 1</SelectItem>
            <SelectItem value="CRANE 2">CRANE 2</SelectItem>
            <SelectItem value="CRANE 3">CRANE 3</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="ค้นหา (ชิ้นงาน/เครน/สถานะ)" className="w-72" value={searchQuery} onChange={e=>handleSearchChange(e.target.value)} />
        <Button variant="outline" onClick={exportCSV}>Export CSV</Button>
      </div>
      <Card className="rounded-2xl">
        <CardHeader><CardTitle className="text-base">รายการย้อนหลัง</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>เครน</TableHead>
                <TableHead>ชิ้นงาน</TableHead>
                <TableHead>เริ่ม</TableHead>
                <TableHead>จบ</TableHead>
                <TableHead>ระยะเวลา (นาที)</TableHead>
                <TableHead>สถานะ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length > 0 ? (
                history.map(h => (
                  <TableRow key={h.id}>
                    <TableCell className="font-medium">{h.id}</TableCell>
                    <TableCell>{h.crane}</TableCell>
                    <TableCell>{h.piece}</TableCell>
                    <TableCell>{fmtTime(h.start_ts)}</TableCell>
                    <TableCell>{fmtTime(h.end_ts)}</TableCell>
                    <TableCell>{h.duration_min ?? "-"}</TableCell>
                    <TableCell><Badge className={`border ${statusColor(h.status as Status)}`}>{h.status}</Badge></TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <td colSpan={7} className="text-center text-slate-500 py-8">
                    {loading ? 'กำลังโหลด...' : error ? `เกิดข้อผิดพลาด: ${error}` : 'ไม่พบข้อมูลประวัติ'}
                  </td>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}

// =================================================
// Extra Tests (keep adding small safety checks)
// =================================================
(function moreTests(){
  try {
    const qWorking: QueueItem = { crane_id: 'CRANE1', ord: 1, piece: 'X', status: 'working', started_at: 1000 };
    const qSuccess: QueueItem = { crane_id: 'CRANE1', ord: 1, piece: 'X', status: 'success', started_at: 1000, ended_at: 2000 };
    const rb1 = rollbackQueueItem(qWorking);
    if(!(rb1.status==='pending' && rb1.started_at===undefined && rb1.ended_at===undefined)) throw new Error('rollback working->pending failed');
    const rb2 = rollbackQueueItem(qSuccess);
    if(!(rb2.status==='working' && rb2.started_at===1000 && rb2.ended_at===undefined)) throw new Error('rollback success->working failed');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if(cn('a', undefined as any, '', null as any, 'b') !== 'a b') throw new Error('cn join fail');
  // phone
    if(!isValidTHPhone('0812345678')) throw new Error('phone valid should pass');
    if(isValidTHPhone('12345')) throw new Error('phone invalid should fail');
    console.log('[Precast Extra Tests] OK');
  } catch(e) {
    console.error('[Precast Extra Tests] FAIL', e);
  }
})();
