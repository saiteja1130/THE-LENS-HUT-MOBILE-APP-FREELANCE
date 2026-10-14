import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import LAYOUT from '../../constants/layout';
import Button from '../../components/common/Button';
import ScreenHeader from '../../components/common/ScreenHeader';
import useCartStore from '../../store/cartStore';
import useFeedbackStore from '../../store/feedbackStore';

export const PowerPrescriptionScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { product, selectedColor, selectedLens } = route.params;

  // Right Eye (OD)
  const [rightSph, setRightSph] = useState('0.00');
  const [rightCyl, setRightCyl] = useState('0.00');
  const [rightAxis, setRightAxis] = useState('');
  const [rightAdd, setRightAdd] = useState('');

  // Left Eye (OS)
  const [leftSph, setLeftSph] = useState('0.00');
  const [leftCyl, setLeftCyl] = useState('0.00');
  const [leftAxis, setLeftAxis] = useState('');
  const [leftAdd, setLeftAdd] = useState('');

  // Pupillary Distance & Doctor Note
  const [pd, setPd] = useState('63');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [errors, setErrors] = useState({});

  const addItem = useCartStore((state) => state.addItem);
  const showConfirm = useFeedbackStore((state) => state.showConfirm);
  const showToast = useFeedbackStore((state) => state.showToast);

  const validatePrescription = () => {
    const errs = {};

    // Validate PD
    const pdNum = parseFloat(pd);
    if (!pd || isNaN(pdNum) || pdNum < 40 || pdNum > 85) {
      errs.pd = 'Standard PD is between 50 and 75 mm';
    }

    // Validate Right Eye Axis if Cyl is non-zero
    const rCylNum = parseFloat(rightCyl);
    if (rCylNum && rCylNum !== 0 && !rightAxis.trim()) {
      errs.rightAxis = 'Axis required (1°-180°)';
    }

    // Validate Left Eye Axis if Cyl is non-zero
    const lCylNum = parseFloat(leftCyl);
    if (lCylNum && lCylNum !== 0 && !leftAxis.trim()) {
      errs.leftAxis = 'Axis required (1°-180°)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleConfirm = async () => {
    if (!validatePrescription()) {
      showToast('Please check the highlighted prescription fields', 'error');
      return;
    }

    const prescriptionData = {
      od: { sph: rightSph.trim(), cyl: rightCyl.trim(), axis: rightAxis.trim(), add: rightAdd.trim() },
      os: { sph: leftSph.trim(), cyl: leftCyl.trim(), axis: leftAxis.trim(), add: leftAdd.trim() },
      pd: pd.trim(),
      doctorNotes: doctorNotes.trim(),
    };

    await addItem(product, {
      frameColor: selectedColor,
      lensType: selectedLens.title,
      lensPrice: selectedLens.price,
      prescription: prescriptionData,
      quantity: 1,
    });

    showConfirm({
      type: 'success',
      title: 'Customized Frame Added',
      message: `${product.name} with ${selectedLens.title} has been added to your shopping bag with vision powers.`,
      confirmText: 'View Bag',
      cancelText: 'Keep Shopping',
      onConfirm: () => navigation.navigate('Main', { screen: 'CartTab' }),
    });
  };

  const renderEyeInputCard = ({
    title,
    badgeText,
    badgeColor,
    sph,
    setSph,
    cyl,
    setCyl,
    axis,
    setAxis,
    add,
    setAdd,
    axisError,
  }) => (
    <View style={styles.eyeCard}>
      <View style={styles.eyeCardHeader}>
        <View style={styles.eyeTitleWrapper}>
          <View style={[styles.eyePill, { backgroundColor: badgeColor }]}>
            <Text style={styles.eyePillText}>{badgeText}</Text>
          </View>
          <Text style={styles.eyeLabel}>{title}</Text>
        </View>
      </View>

      <View style={styles.inputGrid}>
        <View style={styles.inputCol}>
          <Text style={styles.colLabel}>SPH (Sphere)</Text>
          <TextInput
            style={styles.gridInput}
            value={sph}
            onChangeText={setSph}
            placeholder="-1.25"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numbers-and-punctuation"
          />
          <Text style={styles.unitText}>Diopters</Text>
        </View>

        <View style={styles.inputCol}>
          <Text style={styles.colLabel}>CYL (Cylinder)</Text>
          <TextInput
            style={styles.gridInput}
            value={cyl}
            onChangeText={setCyl}
            placeholder="-0.50"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numbers-and-punctuation"
          />
          <Text style={styles.unitText}>Astigmatism</Text>
        </View>

        <View style={styles.inputCol}>
          <Text style={styles.colLabel}>AXIS</Text>
          <TextInput
            style={[styles.gridInput, axisError && styles.gridInputError]}
            value={axis}
            onChangeText={(val) => {
              setAxis(val);
              if (axisError) setErrors((prev) => ({ ...prev, [badgeText === 'OD' ? 'rightAxis' : 'leftAxis']: null }));
            }}
            placeholder="90°"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="number-pad"
            maxLength={3}
          />
          <Text style={styles.unitText}>1° to 180°</Text>
        </View>

        <View style={styles.inputCol}>
          <Text style={styles.colLabel}>ADD (Near)</Text>
          <TextInput
            style={styles.gridInput}
            value={add}
            onChangeText={setAdd}
            placeholder="+1.50"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numbers-and-punctuation"
          />
          <Text style={styles.unitText}>Reading</Text>
        </View>
      </View>

      {axisError ? (
        <Text style={styles.inlineErrorText}>{axisError}</Text>
      ) : null}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <ScreenHeader title="Enter Prescription" showBack={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Onboarding Guidance Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="medical" size={20} color={COLORS.primary} style={{ marginTop: 1 }} />
          <View style={styles.infoTextWrapper}>
            <Text style={styles.infoBannerTitle}>Prescription Guide</Text>
            <Text style={styles.infoBannerText}>
              Copy the numbers directly from the optical prescription provided by your ophthalmologist or eye clinic. Leave CYL and AXIS empty if you do not have astigmatism.
            </Text>
          </View>
        </View>

        {/* Right Eye (OD) */}
        {renderEyeInputCard({
          title: 'Right Eye (OD · Oculus Dexter)',
          badgeText: 'OD',
          badgeColor: '#E0F2FE',
          sph: rightSph,
          setSph: setRightSph,
          cyl: rightCyl,
          setCyl: setRightCyl,
          axis: rightAxis,
          setAxis: setRightAxis,
          add: rightAdd,
          setAdd: setRightAdd,
          axisError: errors.rightAxis,
        })}

        {/* Left Eye (OS) */}
        {renderEyeInputCard({
          title: 'Left Eye (OS · Oculus Sinister)',
          badgeText: 'OS',
          badgeColor: '#F3E8FF',
          sph: leftSph,
          setSph: setLeftSph,
          cyl: leftCyl,
          setCyl: setLeftCyl,
          axis: leftAxis,
          setAxis: setLeftAxis,
          add: leftAdd,
          setAdd: setLeftAdd,
          axisError: errors.leftAxis,
        })}

        {/* Pupillary Distance Card */}
        <View style={styles.pdCard}>
          <View style={styles.pdHeader}>
            <Text style={styles.pdTitle}>Pupillary Distance (PD)</Text>
            <Text style={styles.pdSubtitle}>Distance between centers of your pupils in millimeters (standard average is 63 mm).</Text>
            {errors.pd ? <Text style={styles.inlineErrorText}>{errors.pd}</Text> : null}
          </View>
          <View style={styles.pdInputWrapper}>
            <TextInput
              style={[styles.pdInput, errors.pd && styles.gridInputError]}
              value={pd}
              onChangeText={(val) => {
                setPd(val);
                if (errors.pd) setErrors((prev) => ({ ...prev, pd: null }));
              }}
              placeholder="63"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              maxLength={2}
            />
            <Text style={styles.pdUnit}>mm</Text>
          </View>
        </View>

        {/* Doctor & Clinic Notes */}
        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>Doctor Name or Optical Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={doctorNotes}
            onChangeText={setDoctorNotes}
            placeholder="e.g. Dr. Verma Clinic, or request verification call"
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={2}
          />
        </View>
      </ScrollView>

      {/* Persistent Bottom Action Area */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Button
          title="Save Prescription & Add to Bag"
          onPress={handleConfirm}
          variant="primary"
          size="lg"
          rightIcon={<Ionicons name="bag-check" size={18} color={COLORS.surface} />}
          style={styles.confirmBtn}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F9FF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 16,
  },
  infoTextWrapper: {
    flex: 1,
    marginLeft: 10,
  },
  infoBannerTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.secondary,
    marginBottom: 2,
  },
  infoBannerText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  eyeCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  eyeCardHeader: {
    marginBottom: 14,
  },
  eyeTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  eyePillText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.secondary,
  },
  eyeLabel: {
    fontFamily: FONTS.bold,
    fontSize: 14.5,
    color: COLORS.secondary,
  },
  inputGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputCol: {
    width: '22%',
    alignItems: 'center',
  },
  colLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 5,
    textAlign: 'center',
  },
  gridInput: {
    width: '100%',
    height: 44,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    textAlign: 'center',
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.secondary,
    backgroundColor: '#F8FAFC',
    padding: 0,
  },
  gridInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  unitText: {
    fontFamily: FONTS.regular,
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  inlineErrorText: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
    color: '#EF4444',
    marginTop: 8,
  },
  pdCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pdHeader: {
    flex: 1,
    marginRight: 14,
  },
  pdTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.secondary,
  },
  pdSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  pdInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pdInput: {
    width: 60,
    height: 44,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    textAlign: 'center',
    fontFamily: FONTS.extraBold,
    fontSize: 16,
    color: COLORS.secondary,
    backgroundColor: '#F8FAFC',
    padding: 0,
  },
  pdUnit: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.textMuted,
    marginLeft: 6,
  },
  notesCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  notesTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.secondary,
    marginBottom: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 10,
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textPrimary,
    minHeight: 56,
    textAlignVertical: 'top',
    backgroundColor: '#F8FAFC',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  confirmBtn: {
    width: '100%',
    height: 46,
  },
});

export default PowerPrescriptionScreen;

