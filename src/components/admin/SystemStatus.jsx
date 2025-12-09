// ============================================================================
// COMPONENT: SystemStatus.jsx – Admin Panel for Storage Integrity
// ============================================================================

import React, { useState } from 'react'
import { useStorageIntegrity } from '../../hooks/useStorageIntegrity'
import useStore from '../../state/store'
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  PlayCircle,
  RefreshCw,
  FileWarning,
  HardDrive,
  Clock,
  Trash2,
} from 'lucide-react'

const SystemStatus = () => {
  const { integrityScan } = useStore()
  const {
    scanning,
    repairing,
    runIntegrityScan,
    repairAll,
  } = useStorageIntegrity()

  const [scanResult, setScanResult] = useState(null)
  const [repairResult, setRepairResult] = useState(null)

  const handleScan = async () => {
    setScanResult(null)
    setRepairResult(null)
    const result = await runIntegrityScan()
    setScanResult(result)
  }

  const handleRepair = async () => {
    setRepairResult(null)
    const result = await repairAll()
    setRepairResult(result)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleString('no-NO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const hasProblems =
    (integrityScan?.missingFiles?.length || 0) +
    (integrityScan?.orphanFiles?.length || 0) >
    0

  return (
    <div className="glass rounded-2xl p-6 border-2 border-blue-500/20 bg-gradient-to-r from-blue-600/5 to-purple-600/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <HardDrive className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">System Status</h3>
            <p className="text-xs opacity-70">
              Storage Integrity & Auto-Repair
            </p>
          </div>
        </div>

        {hasProblems && (
          <div className="flex items-center gap-2 bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm">
            <AlertTriangle className="w-4 h-4" />
            Issues Found
          </div>
        )}
      </div>

      {/* Last Scan Info */}
      {integrityScan?.lastRun && (
        <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <p className="text-sm font-medium">Last Scan</p>
          </div>
          <p className="text-xs opacity-70">
            {formatDate(integrityScan.lastRun)}
          </p>

          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="text-center p-2 bg-red-500/10 rounded-lg border border-red-500/20">
              <p className="text-2xl font-bold text-red-400">
                {integrityScan.missingFiles?.length || 0}
              </p>
              <p className="text-xs opacity-70 mt-1">Missing Files</p>
            </div>
            <div className="text-center p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <p className="text-2xl font-bold text-yellow-400">
                {integrityScan.orphanFiles?.length || 0}
              </p>
              <p className="text-xs opacity-70 mt-1">Orphaned Files</p>
            </div>
            <div className="text-center p-2 bg-green-500/10 rounded-lg border border-green-500/20">
              <p className="text-2xl font-bold text-green-400">
                {integrityScan.repaired?.length || 0}
              </p>
              <p className="text-xs opacity-70 mt-1">Repaired</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={handleScan}
          disabled={scanning || repairing}
          className="ripple-effect bg-blue-600/20 hover:bg-blue-600/30 p-4 rounded-xl transition flex items-center justify-center gap-2 border border-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {scanning ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
          ) : (
            <PlayCircle className="w-5 h-5 text-blue-400" />
          )}
          <span className="font-medium text-sm">
            {scanning ? 'Scanning...' : 'Run System Scan'}
          </span>
        </button>

        <button
          onClick={handleRepair}
          disabled={scanning || repairing || !hasProblems}
          className="ripple-effect bg-green-600/20 hover:bg-green-600/30 p-4 rounded-xl transition flex items-center justify-center gap-2 border border-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {repairing ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-400"></div>
          ) : (
            <RefreshCw className="w-5 h-5 text-green-400" />
          )}
          <span className="font-medium text-sm">
            {repairing ? 'Repairing...' : 'Run Auto-Repair'}
          </span>
        </button>
      </div>

      {/* Scan Result */}
      {scanResult && (
        <div
          className={`mb-4 p-4 rounded-xl border ${
            scanResult.status === 'success'
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {scanResult.status === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            )}
            <p className="font-medium">Scan Complete</p>
          </div>

          {scanResult.status === 'success' ? (
            <div className="text-sm opacity-80">
              <p>
                Found {scanResult.problems} issue
                {scanResult.problems !== 1 ? 's' : ''}
              </p>
              <ul className="mt-2 space-y-1 text-xs">
                <li>• {scanResult.missingFiles} missing files</li>
                <li>• {scanResult.orphanFiles} orphaned files</li>
              </ul>
            </div>
          ) : (
            <p className="text-sm opacity-80">{scanResult.message}</p>
          )}
        </div>
      )}

      {/* Repair Result */}
      {repairResult && (
        <div
          className={`mb-4 p-4 rounded-xl border ${
            repairResult.status === 'success'
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {repairResult.status === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            )}
            <p className="font-medium">Repair Complete</p>
          </div>

          <p className="text-sm opacity-80">{repairResult.message}</p>
        </div>
      )}

      {/* Missing Files List */}
      {integrityScan?.missingFiles?.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <FileWarning className="w-4 h-4 text-red-400" />
            <p className="font-medium text-sm">Missing Files</p>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {integrityScan.missingFiles.slice(0, 10).map((file, idx) => (
              <div
                key={idx}
                className="p-3 bg-red-500/10 rounded-lg border border-red-500/20 text-sm"
              >
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-xs opacity-70 mt-1">{file.issue}</p>
              </div>
            ))}
            {integrityScan.missingFiles.length > 10 && (
              <p className="text-xs opacity-70 text-center">
                ...and {integrityScan.missingFiles.length - 10} more
              </p>
            )}
          </div>
        </div>
      )}

      {/* Orphaned Files List */}
      {integrityScan?.orphanFiles?.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <FileWarning className="w-4 h-4 text-yellow-400" />
            <p className="font-medium text-sm">Orphaned Files</p>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {integrityScan.orphanFiles.slice(0, 10).map((file, idx) => (
              <div
                key={idx}
                className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20 text-sm"
              >
                <p className="font-medium truncate">{file.name || file.path}</p>
                <p className="text-xs opacity-70 mt-1">
                  File in R2 with no Firestore entry
                </p>
              </div>
            ))}
            {integrityScan.orphanFiles.length > 10 && (
              <p className="text-xs opacity-70 text-center">
                ...and {integrityScan.orphanFiles.length - 10} more
              </p>
            )}
          </div>
        </div>
      )}

      {/* Repair Log */}
      {integrityScan?.repaired?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-green-400" />
            <p className="font-medium text-sm">Repair Log</p>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {integrityScan.repaired.slice(-10).reverse().map((log, idx) => (
              <div
                key={idx}
                className="p-2 bg-green-500/10 rounded-lg border border-green-500/20 text-xs"
              >
                <p className="opacity-70">{formatDate(log.timestamp)}</p>
                <p className="font-medium mt-1">
                  {log.action} - {log.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-4 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-xs opacity-70">
        <p>
          <strong>System Scan:</strong> Checks all photos for missing R2 files
          and orphaned storage entries.
        </p>
        <p className="mt-1">
          <strong>Auto-Repair:</strong> Automatically fixes issues by marking
          missing files as deleted and creating entries for orphaned files.
        </p>
      </div>
    </div>
  )
}

export default SystemStatus
