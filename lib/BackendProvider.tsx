import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandHeader } from '@/components/BrandHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { buildUrlFromIpPort, loadCached, setApiBaseUrl } from './backend';
import { discoverBackend, probeUrl } from './discovery';
import { flushOutbox } from './kiosk';
import { colors, radius, spacing, typography } from '@/theme';

type Phase = 'scanning' | 'ready' | 'needs-manual';

type Ctx = {
  phase: Phase;
  rescan: () => void;
  saveManual: (ip: string, port: string) => Promise<boolean>;
};

const BackendCtx = createContext<Ctx | null>(null);

export function useBackend(): Ctx {
  const v = useContext(BackendCtx);
  if (!v) throw new Error('useBackend outside BackendProvider');
  return v;
}

export function BackendProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>('scanning');
  const startedRef = useRef(false);

  // Scans once per app start (cached IP is probed first as the hint). No runtime
  // heartbeat: if the server is down later, walk-ins queue offline (lib/kiosk.ts).
  // Network changed? Restart the device.
  const runDiscovery = useCallback(async () => {
    setPhase('scanning');

    const cached = await loadCached();
    const found = await discoverBackend(undefined, cached?.url);
    if (found) {
      setApiBaseUrl(found.url, found.serverId);
      setPhase('ready');
      void flushOutbox();
      return;
    }
    // Power outage: the tablet boots before the server PC does. Keep the last
    // known server and run offline until it answers.
    if (cached?.url) {
      setApiBaseUrl(cached.url, cached.serverId);
      setPhase('ready');
      return;
    }
    setPhase('needs-manual');
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void runDiscovery();
  }, [runDiscovery]);

  const rescan = useCallback(() => {
    void runDiscovery();
  }, [runDiscovery]);

  // Fresh install with no server found: retry discovery every 30s.
  useEffect(() => {
    if (phase !== 'needs-manual') return;
    const id = setTimeout(rescan, 30_000);
    return () => clearTimeout(id);
  }, [phase, rescan]);

  const saveManual = useCallback(
    async (ip: string, port: string): Promise<boolean> => {
      const url = buildUrlFromIpPort(ip, port);
      setPhase('scanning');
      const r = await probeUrl(url, 2000);
      if (r.ok) {
        setApiBaseUrl(r.url, r.serverId);
        setPhase('ready');
        return true;
      }
      setPhase('needs-manual');
      return false;
    },
    [],
  );

  const ctx = useMemo<Ctx>(
    () => ({ phase, rescan, saveManual }),
    [phase, rescan, saveManual],
  );

  if (phase === 'scanning') {
    return (
      <BackendCtx.Provider value={ctx}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.splash}>
            <BrandHeader size="md" />
            <ActivityIndicator
              color={colors.crimson}
              size="large"
              style={{ marginTop: spacing.xl }}
            />
            <Text style={styles.label}>Connecting to server…</Text>
          </View>
        </SafeAreaView>
      </BackendCtx.Provider>
    );
  }

  if (phase === 'needs-manual') {
    return (
      <BackendCtx.Provider value={ctx}>
        <ManualSetup />
      </BackendCtx.Provider>
    );
  }

  return <BackendCtx.Provider value={ctx}>{children}</BackendCtx.Provider>;
}

function ManualSetup() {
  const { rescan, saveManual } = useBackend();
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('8001');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSave = async () => {
    setErr(null);
    if (!ip.trim()) {
      setErr('Enter the server IP address.');
      return;
    }
    const url = buildUrlFromIpPort(ip, port);
    setBusy(true);
    const ok = await saveManual(ip, port);
    setBusy(false);
    if (!ok) setErr(`Could not reach ${url}.`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.splash}>
        <BrandHeader size="md" />
        <Text style={styles.title}>Server not found</Text>
        <Text style={styles.label}>
          Auto-discovery did not find the backend on this Wi-Fi.
        </Text>

        <View style={styles.form}>
          <Text style={styles.fieldLabel}>Server IP</Text>
          <TextInput
            value={ip}
            onChangeText={setIp}
            placeholder="192.168.1.10"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            autoCorrect={false}
            style={styles.input}
            editable={!busy}
          />
          <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>
            Port
          </Text>
          <TextInput
            value={port}
            onChangeText={setPort}
            placeholder="8001"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            autoCorrect={false}
            style={styles.input}
            editable={!busy}
          />
          {err ? <Text style={styles.error}>{err}</Text> : null}
        </View>

        <PrimaryButton
          label="Save & Connect"
          onPress={onSave}
          loading={busy}
          style={{ marginTop: spacing.lg, minWidth: 240 }}
        />
        <PrimaryButton
          label="Scan again"
          variant="outline"
          onPress={rescan}
          style={{ marginTop: spacing.md, minWidth: 240 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  splash: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.ink,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  label: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  form: {
    marginTop: spacing.lg,
    width: '100%',
    maxWidth: 360,
  },
  fieldLabel: {
    ...typography.body,
    fontWeight: '700',
    color: colors.ink,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 18,
    color: colors.ink,
    minHeight: 52,
    marginTop: spacing.xs,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.sm,
  },
});
