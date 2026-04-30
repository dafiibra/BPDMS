import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Svg, {Path, G, Circle, Line} from 'react-native-svg';
import {Colors} from '../../theme';

// ─── Brand logo (3 pillars) ───────────────────────────────────────────────────
function BrandLogo() {
  return (
    <Svg
      width={146}
      height={112}
      viewBox="0 0 146.04 112.22"
      fill="none">
      <G>
        <Path
          d="M32.725 0.0194294H4.67501C3.56258 -0.0866364 2.45255 0.244419 1.57995 0.942496C0.707358 1.64057 0.140712 2.65086 0 3.75943V112.22H37.4001V3.75943C37.2593 2.65086 36.6927 1.64057 35.8201 0.942496C34.9475 0.244419 33.8375 -0.0866364 32.725 0.0194294Z"
          fill="#2972EB"
          fillOpacity={0.6}
        />
        <Path
          d="M68.3076 0.019426H48.6726C47.8939 -0.0866214 47.1168 0.244377 46.506 0.942333C45.8952 1.64029 45.4986 2.6504 45.4001 3.75878V112.2H71.5801V3.75878C71.4816 2.6504 71.0849 1.64029 70.4741 0.942333C69.8633 0.244377 69.0863 -0.0866214 68.3076 0.019426Z"
          fill="#125AD1"
          fillOpacity={0.6}
        />
        <Path
          d="M146.04 105.076L120.084 36.6341C119.91 36.1748 119.647 35.7544 119.31 35.3969C118.973 35.0393 118.569 34.7516 118.121 34.5501C117.673 34.3487 117.19 34.2375 116.699 34.2229C116.208 34.2082 115.719 34.2905 115.26 34.4649L102.02 39.6261V22.4595C102.02 21.4676 101.626 20.5163 100.925 19.8149C100.223 19.1135 99.272 18.7195 98.2801 18.7195H79.5801V112.22H102.02V43.7401L127.938 112.22L146.04 105.076Z"
          fill="#2365D2"
          fillOpacity={0.6}
        />
      </G>
    </Svg>
  );
}

// ─── Eye icon ─────────────────────────────────────────────────────────────────
function EyeIcon({visible}: {visible: boolean}) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      {visible ? (
        <>
          <Path
            d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
            stroke={Colors.neutral500}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle
            cx={12}
            cy={12}
            r={3}
            stroke={Colors.neutral500}
            strokeWidth={1.5}
          />
        </>
      ) : (
        <>
          <Path
            d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
            stroke={Colors.neutral500}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Line
            x1={1} y1={1} x2={23} y2={23}
            stroke={Colors.neutral500}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </>
      )}
    </Svg>
  );
}

// ─── Checkbox icon ────────────────────────────────────────────────────────────
function CheckboxIcon({checked}: {checked: boolean}) {
  return (
    <View style={[checkboxStyles.box, checked && checkboxStyles.boxChecked]}>
      {checked && (
        <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
          <Path
            d="M2 6l3 3 5-5"
            stroke="#fff"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )}
    </View>
  );
}

const checkboxStyles = StyleSheet.create({
  box: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.neutralStroke,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: Colors.primary900,
    borderColor: Colors.primary900,
  },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export function LoginScreen({onLogin}: {onLogin: (nip: string) => void}) {
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const canSubmit = /^\d{10}$/.test(nip) && password.length > 0;

  function handleLogin() {
    if (!canSubmit) return;
    onLogin(nip);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* ── Hero section ── */}
          <View style={styles.hero}>
            {/* layer 2: wave */}
            <View style={StyleSheet.absoluteFill}>
              <Image
                source={require('../../assets/images/login/hero_bg.png')}
                style={styles.waveImage}
                resizeMode="cover"
              />
            </View>
            {/* layer 3: logo + judul */}
            <View style={styles.heroContent}>
              <BrandLogo />
              <Text style={styles.heroTitle}>Dashboard Performa Cabang</Text>
            </View>
          </View>

          {/* ── Form section ── */}
          <View style={styles.form}>

            {/* NIP */}
            <View style={styles.fieldGroup}>
              <View style={styles.inputField}>
                <Text style={styles.fieldLabel}>NIP</Text>
                <View style={styles.inputArea}>
                  <TextInput
                    style={styles.input}
                    value={nip}
                    onChangeText={v => setNip(v.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Masukkan 10 digit NIP"
                    placeholderTextColor={Colors.neutral200}
                    keyboardType="number-pad"
                    maxLength={10}
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Kata Sandi */}
              <View style={styles.inputField}>
                <Text style={styles.fieldLabel}>Kata Sandi</Text>
                <View style={styles.inputArea}>
                  <TextInput
                    style={[styles.input, styles.inputFlex]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Masukkan kata sandi"
                    placeholderTextColor={Colors.neutral200}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(v => !v)}
                    activeOpacity={0.7}
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                    <EyeIcon visible={showPassword} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Remember / Forgot */}
              <View style={styles.linkRow}>
                <TouchableOpacity
                  style={styles.rememberRow}
                  onPress={() => setRememberMe(v => !v)}
                  activeOpacity={0.7}>
                  <CheckboxIcon checked={rememberMe} />
                  <Text style={styles.rememberText}>Ingat akun saya</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.forgotText}>Lupa kata sandi?</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Login button */}
            <TouchableOpacity
              style={[styles.loginBtn, !canSubmit && styles.loginBtnDisabled]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={!canSubmit}>
              <Text style={styles.loginBtnText}>Masuk</Text>
            </TouchableOpacity>
          </View>

          {/* ── Footer ── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Dengan masuk, Anda sudah membaca dan menyetujui{' '}
              <Text style={styles.footerLink}>Syarat dan Ketentuan Bank Mandiri</Text>
              .
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Hero
  hero: {
    height: 275,
    backgroundColor: '#0F2D5A',
  },
  waveImage: {
    width: '100%',
    height: '100%',
    opacity: 1,
  },
  heroContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#EEEEEE',
    lineHeight: 28,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: {width: 0, height: 4},
    textShadowRadius: 4,
  },

  // Form
  form: {
    paddingHorizontal: 16,
    paddingTop: 32,
    gap: 32,
  },
  fieldGroup: {
    gap: 16,
  },
  inputField: {
    gap: 2,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.primary900,
    lineHeight: 18,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderWidth: 1,
    borderColor: Colors.neutralStroke,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: Colors.primary900,
    lineHeight: 21,
    paddingVertical: 0,
  },
  inputFlex: {
    flex: 1,
    marginRight: 8,
  },

  // Remember / Forgot
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  rememberText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.neutral500,
    lineHeight: 18,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary900,
    lineHeight: 18,
  },

  // Button
  loginBtn: {
    height: 48,
    backgroundColor: Colors.primary900,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loginBtnDisabled: {
    opacity: 0.5,
  },
  loginBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    letterSpacing: -0.14,
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.neutral500,
    lineHeight: 18,
  },
  footerLink: {
    color: Colors.primary900,
    textDecorationLine: 'underline',
  },
});
