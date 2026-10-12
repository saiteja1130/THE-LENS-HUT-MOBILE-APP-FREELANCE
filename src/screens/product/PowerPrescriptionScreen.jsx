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
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import LAYOUT from '../../constants/layout';
import Button from '../../components/common/Button';
import ScreenHeader from '../../components/common/ScreenHeader';
import useCartStore from '../../store/cartStore';
import useFeedbackStore from '../../store/feedbackStore';

export const PowerPrescriptionScreen = ({ route, navigation }) => {
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

  const addItem = useCartStore((state) => state.addItem);
  const showConfirm = useFeedbackStore((state) => state.showConfirm);

  const handleConfirm = async () => {
    const prescriptionData = {
      od: { sph: rightSph, cyl: rightCyl, axis: rightAxis, add: rightAdd },
      os: { sph: leftSph, cyl: leftCyl, axis: leftAxis, add: leftAdd },
      pd,
      doctorNotes,
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
      title: 'Customized Eyewear Added',
      message: 'Your frame and lens prescription have been saved to your shopping bag.',
      confirmText: 'Go to Bag',
      cancelText: 'Keep Shopping',
      onConfirm: () => navigation.navigate('CartTab'),
    });
  };

  const renderEyeInputRow = (label, sph, setSph, cyl, setCyl, axis, setAxis, add, setAdd) => (
    <View style={styles.eyeCard}>
      <Text style={styles.eyeLabel}>{label}</Text>

      <View style={styles.inputGrid}>
        <View style={styles.inputCol}>
          <Text style={styles.colLabel}>SPH</Text>
          <TextInput
            style={styles.gridInput}
            value={sph}
            onChangeText={setSph}
            placeholder="-1.25"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numbers-and-punctuation"
          />
        </View>

        <View style={styles.inputCol}>
          <Text style={styles.colLabel}>CYL</Text>
          <TextInput
            style={styles.gridInput}
            value={cyl}
            onChangeText={setCyl}
            placeholder="-0.50"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numbers-and-punctuation"
          />
        </View>

        <View style={styles.inputCol}>
          <Text style={styles.colLabel}>AXIS</Text>
          <TextInput
            style={styles.gridInput}
            value={axis}
            onChangeText={setAxis}
            placeholder="90°"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.inputCol}>
          <Text style={styles.colLabel}>ADD</Text>
          <TextInput
            style={styles.gridInput}
            value={add}
            onChangeText={setAdd}
            placeholder="+1.50"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numbers-and-punctuation"
          />
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <ScreenHeader title="Enter Vision Prescription" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color={COLORS.info} />
          <Text style={styles.infoBannerText}>
            You can find these numbers on the optical prescription provided by your ophthalmologist or optometrist.
          </Text>
        </View>

        {/* Right Eye (OD) */}
        {renderEyeInputRow(
          'Right Eye (OD - Oculus Dexter)',
          rightSph,
          setRightSph,
          rightCyl,
          setRightCyl,
          rightAxis,
          setRightAxis,
          rightAdd,
          setRightAdd
        )}

        {/* Left Eye (OS) */}
        {renderEyeInputRow(
          'Left Eye (OS - Oculus Sinister)',
          leftSph,
          setLeftSph,
          leftCyl,
          setLeftCyl,
          leftAxis,
          setLeftAxis,
          leftAdd,
          setLeftAdd
        )}

        {/* Pupillary Distance */}
        <View style={styles.pdCard}>
          <View style={styles.pdHeader}>
            <Text style={styles.pdTitle}>Pupillary Distance (PD in mm)</Text>
            <Text style={styles.pdSubtitle}>Standard adult average is 63 mm</Text>
          </View>
          <TextInput
            style={styles.pdInput}
            value={pd}
            onChangeText={setPd}
            placeholder="63"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="number-pad"
          />
        </View>

        {/* Doctor / Special Instructions */}
        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>Special Instructions / Doctor Name (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={doctorNotes}
            onChangeText={setDoctorNotes}
            placeholder="e.g. Dr. Verma Clinic, or request call for confirmation"
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>

        <Button
          title="Confirm Prescription & Add to Bag"
          onPress={handleConfirm}
          variant="primary"
          size="lg"
          style={styles.confirmBtn}
        />
      </ScrollView>
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
    paddingBottom: 40,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoLight,
    padding: 12,
    borderRadius: LAYOUT.radius.md,
    marginBottom: 16,
  },
  infoBannerText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.secondary,
    marginLeft: 8,
    lineHeight: 18,
  },
  eyeCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: LAYOUT.radius.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 16,
    ...LAYOUT.shadows.sm,
  },
  eyeLabel: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.secondary,
    marginBottom: 12,
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
    marginBottom: 4,
  },
  gridInput: {
    width: '100%',
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: LAYOUT.radius.sm,
    textAlign: 'center',
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.secondary,
    backgroundColor: COLORS.surface,
    padding: 0,
  },
  pdCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: LAYOUT.radius.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...LAYOUT.shadows.sm,
  },
  pdHeader: {
    flex: 1,
    marginRight: 12,
  },
  pdTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.secondary,
  },
  pdSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  pdInput: {
    width: 70,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: LAYOUT.radius.sm,
    textAlign: 'center',
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.secondary,
    padding: 0,
  },
  notesCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: LAYOUT.radius.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 24,
    ...LAYOUT.shadows.sm,
  },
  notesTitle: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: LAYOUT.radius.sm,
    padding: 10,
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textPrimary,
    minHeight: 64,
    textAlignVertical: 'top',
  },
  confirmBtn: {
    width: '100%',
  },
});

export default PowerPrescriptionScreen;
