import { useState } from "react";
import CopyButton from "./shared/CopyButton";

type Permission = "r" | "w" | "x";
type UserType = "owner" | "group" | "others";

interface Permissions {
  owner: Record<Permission, boolean>;
  group: Record<Permission, boolean>;
  others: Record<Permission, boolean>;
}

const PERMISSION_VALUES: Record<Permission, number> = { r: 4, w: 2, x: 1 };
const USER_TYPES: UserType[] = ["owner", "group", "others"];
const PERMISSIONS: Permission[] = ["r", "w", "x"];

function permissionsToNumeric(perms: Permissions): string {
  return USER_TYPES.map((user) =>
    PERMISSIONS.reduce(
      (sum, perm) => sum + (perms[user][perm] ? PERMISSION_VALUES[perm] : 0),
      0,
    ),
  ).join("");
}

function numericToPermissions(numeric: string): Permissions | null {
  if (!/^[0-7]{3,4}$/.test(numeric)) return null;

  const digits = numeric.slice(-3);
  const result: Permissions = {
    owner: { r: false, w: false, x: false },
    group: { r: false, w: false, x: false },
    others: { r: false, w: false, x: false },
  };

  USER_TYPES.forEach((user, i) => {
    const val = parseInt(digits[i]);
    result[user].r = (val & 4) !== 0;
    result[user].w = (val & 2) !== 0;
    result[user].x = (val & 1) !== 0;
  });

  return result;
}

function permissionsToSymbolic(perms: Permissions): string {
  return USER_TYPES.map((user) =>
    PERMISSIONS.map((perm) => (perms[user][perm] ? perm : "-")).join(""),
  ).join("");
}

function symbolicToPermissions(symbolic: string): Permissions | null {
  const cleaned = symbolic.replace(/^[-d]/, "");
  if (!/^[rwx-]{9}$/.test(cleaned)) return null;

  const result: Permissions = {
    owner: { r: false, w: false, x: false },
    group: { r: false, w: false, x: false },
    others: { r: false, w: false, x: false },
  };

  USER_TYPES.forEach((user, i) => {
    PERMISSIONS.forEach((perm, j) => {
      result[user][perm] = cleaned[i * 3 + j] === perm;
    });
  });

  return result;
}

const COMMON_PERMISSIONS = [
  { numeric: "755", desc: "Owner rwx, others rx (executables)" },
  { numeric: "644", desc: "Owner rw, others r (files)" },
  { numeric: "777", desc: "Everyone rwx (full access)" },
  { numeric: "700", desc: "Owner only rwx (private)" },
  { numeric: "600", desc: "Owner only rw (private files)" },
  { numeric: "444", desc: "Everyone read only" },
];

export default function ChmodCalculator() {
  const [permissions, setPermissions] = useState<Permissions>({
    owner: { r: true, w: true, x: true },
    group: { r: true, w: false, x: true },
    others: { r: true, w: false, x: true },
  });
  const [numericInput, setNumericInput] = useState("755");
  const [symbolicInput, setSymbolicInput] = useState("rwxr-xr-x");

  const togglePermission = (user: UserType, perm: Permission) => {
    const newPerms = {
      ...permissions,
      [user]: { ...permissions[user], [perm]: !permissions[user][perm] },
    };
    setPermissions(newPerms);
    setNumericInput(permissionsToNumeric(newPerms));
    setSymbolicInput(permissionsToSymbolic(newPerms));
  };

  const handleNumericChange = (value: string) => {
    setNumericInput(value);
    const perms = numericToPermissions(value);
    if (perms) {
      setPermissions(perms);
      setSymbolicInput(permissionsToSymbolic(perms));
    }
  };

  const handleSymbolicChange = (value: string) => {
    setSymbolicInput(value);
    const perms = symbolicToPermissions(value);
    if (perms) {
      setPermissions(perms);
      setNumericInput(permissionsToNumeric(perms));
    }
  };

  const applyCommon = (numeric: string) => {
    handleNumericChange(numeric);
  };

  const numeric = permissionsToNumeric(permissions);
  const symbolic = permissionsToSymbolic(permissions);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Numeric (Octal)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={numericInput}
              onChange={(e) => handleNumericChange(e.target.value)}
              placeholder="755"
              maxLength={4}
              className="input flex-1 font-mono text-lg"
            />
            <CopyButton text={numeric} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Symbolic
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={symbolicInput}
              onChange={(e) => handleSymbolicChange(e.target.value)}
              placeholder="rwxr-xr-x"
              maxLength={10}
              className="input flex-1 font-mono text-lg"
            />
            <CopyButton text={symbolic} />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-700">
              <th className="py-2 text-left font-medium text-neutral-700 dark:text-neutral-300">
                User
              </th>
              <th className="py-2 text-center font-medium text-neutral-700 dark:text-neutral-300">
                Read (4)
              </th>
              <th className="py-2 text-center font-medium text-neutral-700 dark:text-neutral-300">
                Write (2)
              </th>
              <th className="py-2 text-center font-medium text-neutral-700 dark:text-neutral-300">
                Execute (1)
              </th>
              <th className="py-2 text-center font-medium text-neutral-700 dark:text-neutral-300">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {USER_TYPES.map((user) => (
              <tr
                key={user}
                className="border-b border-neutral-100 dark:border-neutral-800"
              >
                <td className="py-3 capitalize text-neutral-700 dark:text-neutral-300">
                  {user}
                </td>
                {PERMISSIONS.map((perm) => (
                  <td key={perm} className="py-3 text-center">
                    <button
                      onClick={() => togglePermission(user, perm)}
                      className={`h-8 w-8 rounded font-mono text-sm transition-colors ${
                        permissions[user][perm]
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                          : "bg-neutral-100 text-neutral-400 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                      }`}
                    >
                      {permissions[user][perm] ? perm : "-"}
                    </button>
                  </td>
                ))}
                <td className="py-3 text-center font-mono text-neutral-600 dark:text-neutral-400">
                  {PERMISSIONS.reduce(
                    (sum, perm) =>
                      sum +
                      (permissions[user][perm] ? PERMISSION_VALUES[perm] : 0),
                    0,
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Command
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded bg-neutral-100 px-3 py-2 font-mono text-sm dark:bg-neutral-800">
            chmod {numeric} filename
          </code>
          <CopyButton text={`chmod ${numeric} filename`} />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Common Permissions
        </p>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {COMMON_PERMISSIONS.map(({ numeric, desc }) => (
            <button
              key={numeric}
              onClick={() => applyCommon(numeric)}
              className="rounded border border-neutral-200 px-3 py-2 text-left text-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              <span className="font-mono font-medium text-neutral-900 dark:text-neutral-100">
                {numeric}
              </span>
              <span className="ml-2 text-neutral-500">{desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
