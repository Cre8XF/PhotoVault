import { useState, useEffect } from 'react'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { devLog } from '../utils/log'

/**
 * Custom hook to check system kill-switches
 * Listens to real-time updates from Firestore
 */
export function useKillSwitches() {
  const [killSwitches, setKillSwitches] = useState({
    pauseUploads: false,
    disableSignups: false,
    maintenanceMode: false,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const configRef = doc(db, 'systemConfig', 'killSwitches')

    // Real-time listener for kill-switches
    const unsubscribe = onSnapshot(
      configRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          setKillSwitches(data)
          devLog('🔄 Kill-switches updated:', data)
        } else {
          // Default values if not found
          setKillSwitches({
            pauseUploads: false,
            disableSignups: false,
            maintenanceMode: false,
          })
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error listening to kill-switches:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return {
    killSwitches,
    loading,
    uploadsDisabled: killSwitches.pauseUploads || killSwitches.maintenanceMode,
    signupsDisabled: killSwitches.disableSignups,
    maintenanceModeActive: killSwitches.maintenanceMode,
  }
}

/**
 * Check kill-switches without subscribing (one-time check)
 */
export async function checkKillSwitches() {
  try {
    const configRef = doc(db, 'systemConfig', 'killSwitches')
    const configSnap = await getDoc(configRef)

    if (configSnap.exists()) {
      return configSnap.data()
    }

    return {
      pauseUploads: false,
      disableSignups: false,
      maintenanceMode: false,
    }
  } catch (error) {
    console.error('Error checking kill-switches:', error)
    return {
      pauseUploads: false,
      disableSignups: false,
      maintenanceMode: false,
    }
  }
}
