import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { saveUserProfile, signUpWithEmailAndPassword } from '@/lib/firebase';

type FormErrors = Partial<{
  fullName: string;
  email: string;
  phone: string;
  password: string;
  birthDate: string;
  birthTime: string;
  plan: string;
}>;

type PlanOption = {
  label: string;
  value: 'gratuito' | 'premium' | 'mentorado' | 'master';
};

const PLAN_OPTIONS: PlanOption[] = [
  { label: 'Gratuito', value: 'gratuito' },
  { label: 'Premium', value: 'premium' },
  { label: 'Mentorado', value: 'mentorado' },
  { label: 'Master', value: 'master' },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formatDateDisplay = (date: Date | null) => {
  if (!date) {
    return 'Selecionar data';
  }

  try {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  } catch {
    return date.toISOString().split('T')[0];
  }
};

const padNumber = (value: number) => value.toString().padStart(2, '0');

const formatTimeDisplay = (date: Date | null) => {
  if (!date) {
    return 'Selecionar horário';
  }

  return `${padNumber(date.getHours())}:${padNumber(date.getMinutes())}`;
};

type DatePickerModalProps = {
  visible: boolean;
  initialDate: Date | null;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
};

function DatePickerModal({ visible, initialDate, onConfirm, onCancel }: DatePickerModalProps) {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate ?? new Date());

  useEffect(() => {
    if (visible) {
      setCurrentDate(initialDate ?? new Date());
    }
  }, [visible, initialDate]);

  const adjustDate = (unit: 'day' | 'month' | 'year', delta: number) => {
    setCurrentDate((previous) => {
      const next = new Date(previous);

      switch (unit) {
        case 'day':
          next.setDate(next.getDate() + delta);
          break;
        case 'month':
          next.setMonth(next.getMonth() + delta);
          break;
        case 'year':
          next.setFullYear(next.getFullYear() + delta);
          break;
        default:
          break;
      }

      return next;
    });
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Data de nascimento</Text>
          <Text style={styles.modalValue}>{formatDateDisplay(currentDate)}</Text>

          <View style={styles.adjustRow}>
            <Text style={styles.adjustLabel}>Dia</Text>
            <View style={styles.adjustButtons}>
              <TouchableOpacity
                accessibilityLabel="Diminuir dia"
                onPress={() => adjustDate('day', -1)}
                style={styles.adjustButton}
              >
                <Text style={styles.adjustButtonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityLabel="Aumentar dia"
                onPress={() => adjustDate('day', 1)}
                style={styles.adjustButton}
              >
                <Text style={styles.adjustButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.adjustRow}>
            <Text style={styles.adjustLabel}>Mês</Text>
            <View style={styles.adjustButtons}>
              <TouchableOpacity
                accessibilityLabel="Diminuir mês"
                onPress={() => adjustDate('month', -1)}
                style={styles.adjustButton}
              >
                <Text style={styles.adjustButtonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityLabel="Aumentar mês"
                onPress={() => adjustDate('month', 1)}
                style={styles.adjustButton}
              >
                <Text style={styles.adjustButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.adjustRow}>
            <Text style={styles.adjustLabel}>Ano</Text>
            <View style={styles.adjustButtons}>
              <TouchableOpacity
                accessibilityLabel="Diminuir ano"
                onPress={() => adjustDate('year', -1)}
                style={styles.adjustButton}
              >
                <Text style={styles.adjustButtonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityLabel="Aumentar ano"
                onPress={() => adjustDate('year', 1)}
                style={styles.adjustButton}
              >
                <Text style={styles.adjustButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity onPress={onCancel} style={[styles.modalActionButton, styles.modalSecondaryButton]}>
              <Text style={[styles.modalActionText, styles.modalSecondaryText]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onConfirm(currentDate)}
              style={[styles.modalActionButton, styles.modalPrimaryButton]}
            >
              <Text style={styles.modalActionText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

type TimePickerModalProps = {
  visible: boolean;
  initialDate: Date | null;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
};

function TimePickerModal({ visible, initialDate, onConfirm, onCancel }: TimePickerModalProps) {
  const [currentTime, setCurrentTime] = useState<Date>(initialDate ?? new Date());

  useEffect(() => {
    if (visible) {
      setCurrentTime(initialDate ?? new Date());
    }
  }, [visible, initialDate]);

  const adjustTime = (unit: 'hour' | 'minute', delta: number) => {
    setCurrentTime((previous) => {
      const next = new Date(previous);

      if (unit === 'hour') {
        const updatedHours = (next.getHours() + delta + 24) % 24;
        next.setHours(updatedHours);
      } else {
        const updatedMinutes = (next.getMinutes() + delta + 60) % 60;
        next.setMinutes(updatedMinutes);
      }

      return next;
    });
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Horário de nascimento</Text>
          <Text style={styles.modalValue}>{formatTimeDisplay(currentTime)}</Text>

          <View style={styles.adjustRow}>
            <Text style={styles.adjustLabel}>Hora</Text>
            <View style={styles.adjustButtons}>
              <TouchableOpacity
                accessibilityLabel="Diminuir hora"
                onPress={() => adjustTime('hour', -1)}
                style={styles.adjustButton}
              >
                <Text style={styles.adjustButtonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityLabel="Aumentar hora"
                onPress={() => adjustTime('hour', 1)}
                style={styles.adjustButton}
              >
                <Text style={styles.adjustButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.adjustRow}>
            <Text style={styles.adjustLabel}>Minuto</Text>
            <View style={styles.adjustButtons}>
              <TouchableOpacity
                accessibilityLabel="Diminuir minuto"
                onPress={() => adjustTime('minute', -5)}
                style={styles.adjustButton}
              >
                <Text style={styles.adjustButtonText}>-5</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityLabel="Aumentar minuto"
                onPress={() => adjustTime('minute', 5)}
                style={styles.adjustButton}
              >
                <Text style={styles.adjustButtonText}>+5</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity onPress={onCancel} style={[styles.modalActionButton, styles.modalSecondaryButton]}>
              <Text style={[styles.modalActionText, styles.modalSecondaryText]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onConfirm(currentTime)}
              style={[styles.modalActionButton, styles.modalPrimaryButton]}
            >
              <Text style={styles.modalActionText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

type PlanPickerModalProps = {
  visible: boolean;
  selectedPlan: PlanOption['value'] | '';
  onSelect: (value: PlanOption['value']) => void;
  onClose: () => void;
};

function PlanPickerModal({ visible, selectedPlan, onSelect, onClose }: PlanPickerModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Selecione o plano</Text>
          <View style={styles.planOptions}>
            {PLAN_OPTIONS.map((option) => {
              const isSelected = option.value === selectedPlan;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => onSelect(option.value)}
                  style={[styles.planOptionButton, isSelected && styles.planOptionButtonSelected]}
                >
                  <Text style={[styles.planOptionText, isSelected && styles.planOptionTextSelected]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity onPress={onClose} style={[styles.modalActionButton, styles.modalPrimaryButton]}>
            <Text style={styles.modalActionText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [birthTime, setBirthTime] = useState<Date | null>(null);
  const [plan, setPlan] = useState<PlanOption['value'] | ''>('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [planPickerVisible, setPlanPickerVisible] = useState(false);

  const selectedPlanLabel = useMemo(() => {
    if (!plan) return 'Selecionar plano';
    return PLAN_OPTIONS.find((option) => option.value === plan)?.label ?? 'Selecionar plano';
  }, [plan]);

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Informe o nome completo.';
    }

    if (!email.trim()) {
      newErrors.email = 'Informe um e-mail.';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      newErrors.email = 'Informe um e-mail válido.';
    }

    if (phone.trim() && phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Informe um telefone válido com DDD.';
    }

    if (!password) {
      newErrors.password = 'Informe uma senha.';
    } else if (password.length < 6) {
      newErrors.password = 'A senha deve possuir pelo menos 6 caracteres.';
    }

    if (!birthDate) {
      newErrors.birthDate = 'Selecione a data de nascimento.';
    }

    if (!birthTime) {
      newErrors.birthTime = 'Selecione o horário de nascimento.';
    }

    if (!plan) {
      newErrors.plan = 'Selecione um plano.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const authResponse = await signUpWithEmailAndPassword(email.trim(), password);

      await saveUserProfile({
        idToken: authResponse.idToken,
        uid: authResponse.localId,
        profile: {
          full_name: fullName.trim(),
          email: authResponse.email,
          phone: phone.trim() || undefined,
          plan,
          birth_date: birthDate ? birthDate.toISOString().split('T')[0] : null,
          birth_time: birthTime ? formatTimeDisplay(birthTime) : null,
        },
      });

      Alert.alert('Conta criada', 'Seu cadastro foi concluído com sucesso!', [
        {
          text: 'Continuar',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError('Não foi possível concluir o cadastro.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>Preencha os dados abaixo para acessar a plataforma.</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nome completo</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Seu nome completo"
            autoCapitalize="words"
            style={[styles.input, errors.fullName && styles.inputError]}
            returnKeyType="next"
          />
          {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.input, errors.email && styles.inputError]}
            returnKeyType="next"
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Telefone</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
            style={[styles.input, errors.phone && styles.inputError]}
            returnKeyType="next"
          />
          {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            style={[styles.input, errors.password && styles.inputError]}
            returnKeyType="done"
          />
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Data de nascimento</Text>
          <TouchableOpacity
            onPress={() => setDatePickerVisible(true)}
            style={[styles.selector, errors.birthDate && styles.inputError]}
          >
            <Text style={styles.selectorText}>{formatDateDisplay(birthDate)}</Text>
          </TouchableOpacity>
          {errors.birthDate ? <Text style={styles.errorText}>{errors.birthDate}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Horário de nascimento</Text>
          <TouchableOpacity
            onPress={() => setTimePickerVisible(true)}
            style={[styles.selector, errors.birthTime && styles.inputError]}
          >
            <Text style={styles.selectorText}>{formatTimeDisplay(birthTime)}</Text>
          </TouchableOpacity>
          {errors.birthTime ? <Text style={styles.errorText}>{errors.birthTime}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Plano</Text>
          <TouchableOpacity
            onPress={() => setPlanPickerVisible(true)}
            style={[styles.selector, errors.plan && styles.inputError]}
          >
            <Text style={styles.selectorText}>{selectedPlanLabel}</Text>
          </TouchableOpacity>
          {errors.plan ? <Text style={styles.errorText}>{errors.plan}</Text> : null}
        </View>

        {formError ? <Text style={styles.submitError}>{formError}</Text> : null}

        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          disabled={isSubmitting}
        >
          {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitButtonText}>Cadastrar</Text>}
        </TouchableOpacity>
      </ScrollView>

      <DatePickerModal
        visible={datePickerVisible}
        initialDate={birthDate}
        onCancel={() => setDatePickerVisible(false)}
        onConfirm={(date) => {
          setBirthDate(date);
          setDatePickerVisible(false);
          setErrors((previous) => ({ ...previous, birthDate: undefined }));
        }}
      />

      <TimePickerModal
        visible={timePickerVisible}
        initialDate={birthTime}
        onCancel={() => setTimePickerVisible(false)}
        onConfirm={(time) => {
          setBirthTime(time);
          setTimePickerVisible(false);
          setErrors((previous) => ({ ...previous, birthTime: undefined }));
        }}
      />

      <PlanPickerModal
        visible={planPickerVisible}
        selectedPlan={plan}
        onClose={() => setPlanPickerVisible(false)}
        onSelect={(value) => {
          setPlan(value);
          setPlanPickerVisible(false);
          setErrors((previous) => ({ ...previous, plan: undefined }));
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#F8FBFF',
  },
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4A4A4A',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  selector: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  selectorText: {
    fontSize: 16,
    color: '#111827',
  },
  inputError: {
    borderColor: '#DC2626',
  },
  errorText: {
    color: '#DC2626',
    marginTop: 6,
    fontSize: 13,
  },
  submitButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  submitError: {
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  adjustRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  adjustLabel: {
    fontSize: 16,
    color: '#1F2937',
  },
  adjustButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  adjustButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  adjustButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  modalActionButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  modalPrimaryButton: {
    backgroundColor: '#2563EB',
  },
  modalSecondaryButton: {
    backgroundColor: '#E5E7EB',
  },
  modalActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  modalSecondaryText: {
    color: '#1F2937',
  },
  planOptions: {
    gap: 12,
    marginBottom: 16,
  },
  planOptionButton: {
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  planOptionButtonSelected: {
    borderColor: '#2563EB',
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
  },
  planOptionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  planOptionTextSelected: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
});
