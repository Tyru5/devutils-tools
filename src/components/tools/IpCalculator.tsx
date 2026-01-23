import { useState } from "react";
import CopyButton from "./shared/CopyButton";

interface IpInfo {
  ip: string;
  cidr: number;
  netmask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  totalHosts: number;
  usableHosts: number;
  ipClass: string;
  isPrivate: boolean;
  binary: string;
}

function ipToNumber(ip: string): number {
  const parts = ip.split(".").map(Number);
  return (
    ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0
  );
}

function numberToIp(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255,
  ].join(".");
}

function cidrToNetmask(cidr: number): string {
  const mask = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
  return numberToIp(mask);
}

function getIpClass(firstOctet: number): string {
  if (firstOctet < 128) return "A";
  if (firstOctet < 192) return "B";
  if (firstOctet < 224) return "C";
  if (firstOctet < 240) return "D (Multicast)";
  return "E (Reserved)";
}

function isPrivateIp(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts[0] === 10) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  return false;
}

function ipToBinary(ip: string): string {
  return ip
    .split(".")
    .map((octet) => parseInt(octet).toString(2).padStart(8, "0"))
    .join(".");
}

function calculateIp(input: string): IpInfo | null {
  const cidrMatch = input.match(/^(\d+\.\d+\.\d+\.\d+)\/(\d+)$/);
  if (!cidrMatch) return null;

  const [, ip, cidrStr] = cidrMatch;
  const cidr = parseInt(cidrStr);

  if (cidr < 0 || cidr > 32) return null;

  const parts = ip.split(".").map(Number);
  if (parts.some((p) => p < 0 || p > 255)) return null;

  const ipNum = ipToNumber(ip);
  const maskNum = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
  const networkNum = (ipNum & maskNum) >>> 0;
  const broadcastNum = (networkNum | ~maskNum) >>> 0;
  const totalHosts = Math.pow(2, 32 - cidr);
  const usableHosts = cidr >= 31 ? totalHosts : Math.max(0, totalHosts - 2);

  return {
    ip,
    cidr,
    netmask: cidrToNetmask(cidr),
    networkAddress: numberToIp(networkNum),
    broadcastAddress: numberToIp(broadcastNum),
    firstHost: cidr >= 31 ? numberToIp(networkNum) : numberToIp(networkNum + 1),
    lastHost:
      cidr >= 31 ? numberToIp(broadcastNum) : numberToIp(broadcastNum - 1),
    totalHosts,
    usableHosts,
    ipClass: getIpClass(parts[0]),
    isPrivate: isPrivateIp(ip),
    binary: ipToBinary(ip),
  };
}

const COMMON_CIDRS = [
  { cidr: "/8", hosts: "16M", desc: "Class A" },
  { cidr: "/16", hosts: "65K", desc: "Class B" },
  { cidr: "/24", hosts: "254", desc: "Class C" },
  { cidr: "/25", hosts: "126", desc: "Half C" },
  { cidr: "/26", hosts: "62", desc: "" },
  { cidr: "/27", hosts: "30", desc: "" },
  { cidr: "/28", hosts: "14", desc: "" },
  { cidr: "/29", hosts: "6", desc: "" },
  { cidr: "/30", hosts: "2", desc: "P2P" },
  { cidr: "/32", hosts: "1", desc: "Host" },
];

export default function IpCalculator() {
  const [input, setInput] = useState("192.168.1.100/24");
  const [result, setResult] = useState<IpInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = () => {
    const info = calculateIp(input);
    if (info) {
      setResult(info);
      setError(null);
    } else {
      setError("Invalid IP/CIDR format. Use: 192.168.1.0/24");
      setResult(null);
    }
  };

  const applyCidr = (cidr: string) => {
    const ip = input.split("/")[0] || "192.168.1.0";
    setInput(`${ip}${cidr}`);
  };

  const clear = () => {
    setInput("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          IP Address / CIDR
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && calculate()}
            placeholder="192.168.1.0/24"
            className={`input flex-1 font-mono ${
              error ? "border-red-500 dark:border-red-500" : ""
            }`}
          />
          <button onClick={calculate} className="btn btn-primary">
            Calculate
          </button>
          <button onClick={clear} className="btn btn-ghost">
            Clear
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {COMMON_CIDRS.map(({ cidr, hosts, desc }) => (
          <button
            key={cidr}
            onClick={() => applyCidr(cidr)}
            className="rounded border border-neutral-200 px-2 py-1 text-xs transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            <span className="font-mono font-medium">{cidr}</span>
            <span className="ml-1 text-neutral-500">({hosts})</span>
            {desc && <span className="ml-1 text-neutral-400">{desc}</span>}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {result && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
              Network Info
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Network</span>
                <code className="font-mono">
                  {result.networkAddress}/{result.cidr}
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Netmask</span>
                <code className="font-mono">{result.netmask}</code>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Broadcast</span>
                <code className="font-mono">{result.broadcastAddress}</code>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
              Host Range
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">First Host</span>
                <code className="font-mono">{result.firstHost}</code>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Last Host</span>
                <code className="font-mono">{result.lastHost}</code>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Usable Hosts</span>
                <span className="font-medium">
                  {result.usableHosts.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-700 sm:col-span-2">
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
              Additional Info
            </h3>
            <div className="grid gap-2 text-sm sm:grid-cols-3">
              <div>
                <span className="text-neutral-500">Class</span>
                <p className="font-medium">{result.ipClass}</p>
              </div>
              <div>
                <span className="text-neutral-500">Type</span>
                <p className="font-medium">
                  {result.isPrivate ? "Private" : "Public"}
                </p>
              </div>
              <div>
                <span className="text-neutral-500">Binary</span>
                <p className="font-mono text-xs">{result.binary}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
