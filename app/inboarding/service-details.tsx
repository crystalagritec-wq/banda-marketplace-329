import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, Upload, MapPin } from 'lucide-react-native';
import { useServiceInboarding } from '@/providers/service-inboarding-provider';
import { useState, useMemo } from 'react';

export default function ServiceDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, updatePersonalDetails, updateOrganizationDetails, nextStep } = useServiceInboarding();
  
  const isIndividual = state.providerType === 'individual';
  
  const [fullName, setFullName] = useState(state.personalDetails.fullName);
  const [idNumber, setIdNumber] = useState(state.personalDetails.idNumber);
  const [phone, setPhone] = useState(state.personalDetails.phone);
  const [email, setEmail] = useState(state.personalDetails.email);
  const [address, setAddress] = useState(state.personalDetails.address);
  const [profilePhoto, setProfilePhoto] = useState(state.personalDetails.profilePhoto);
  
  const [businessName, setBusinessName] = useState(state.organizationDetails.businessName);
  const [registrationNumber, setRegistrationNumber] = useState(state.organizationDetails.registrationNumber);
  const [taxId, setTaxId] = useState(state.organizationDetails.taxId);
  const [contactPerson, setContactPerson] = useState(state.organizationDetails.contactPerson);
  const [orgEmail, setOrgEmail] = useState(state.organizationDetails.email);
  const [logo, setLogo] = useState(state.organizationDetails.logo);

  const progress = useMemo(() => {
    if (isIndividual) {
      const fields = [fullName, idNumber, phone, email, address];
      const filled = fields.filter(f => f.trim()).length;
      return Math.round((filled / fields.length) * 10) + 10;
    } else {
      const fields = [businessName, registrationNumber, taxId, contactPerson, orgEmail];
      const filled = fields.filter(f => f.trim()).length;
      return Math.round((filled / fields.length) * 10) + 10;
    }
  }, [isIndividual, fullName, idNumber, phone, email, address, businessName, registrationNumber, taxId, contactPerson, orgEmail]);

  const handleImagePick = () => {
    Alert.alert('Upload Photo', 'Image upload functionality will be implemented');
  };

  const handleNext = () => {
    if (isIndividual) {
      if (!fullName.trim() || !idNumber.trim() || !phone.trim() || !email.trim()) {
        Alert.alert('Required Fields', 'Please fill in all required fields');
        return;
      }
      updatePersonalDetails({
        fullName,
        idNumber,
        phone,
        email,
        address,
        profilePhoto,
      });
    } else {
      if (!businessName.trim() || !registrationNumber.trim() || !taxId.trim() || !contactPerson.trim() || !orgEmail.trim()) {
        Alert.alert('Required Fields', 'Please fill in all required fields');
        return;
      }
      updateOrganizationDetails({
        businessName,
        registrationNumber,
        taxId,
        contactPerson,
        email: orgEmail,
        logo,
      });
    }
    
    nextStep();
    router.push('/inboarding/service-types' as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Stack.Screen options={{ title: isIndividual ? 'Personal Details' : 'Business Details', headerBackTitle: 'Back' }} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{isIndividual ? 'Personal Details' : 'Business Details'}</Text>
          <Text style={styles.subtitle}>
            {isIndividual ? 'Tell us about yourself' : 'Tell us about your organization'}
          </Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>Step 2 of 9 • {progress}%</Text>
          </View>
        </View>

        <View style={styles.photoSection}>
          <TouchableOpacity style={styles.photoUpload} onPress={handleImagePick}>
            {(isIndividual ? profilePhoto : logo) ? (
              <Image source={{ uri: isIndividual ? profilePhoto : logo }} style={styles.photoPreview} />
            ) : (
              <>
                <Camera size={32} color="#8E8E93" />
                <Text style={styles.photoText}>{isIndividual ? 'Add Profile Photo' : 'Add Company Logo'}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {isIndividual ? (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={setFullName}
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ID / Passport Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter ID or passport number"
                value={idNumber}
                onChangeText={setIdNumber}
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="+254 700 000 000"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="your.email@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Physical Address</Text>
              <View style={styles.addressInput}>
                <MapPin size={20} color="#8E8E93" />
                <TextInput
                  style={styles.addressTextInput}
                  placeholder="Enter your address"
                  value={address}
                  onChangeText={setAddress}
                  placeholderTextColor="#8E8E93"
                  multiline
                />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter business name"
                value={businessName}
                onChangeText={setBusinessName}
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Registration Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="Business registration number"
                value={registrationNumber}
                onChangeText={setRegistrationNumber}
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tax ID / KRA PIN *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter tax ID"
                value={taxId}
                onChangeText={setTaxId}
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Person *</Text>
              <TextInput
                style={styles.input}
                placeholder="Primary contact person name"
                value={contactPerson}
                onChangeText={setContactPerson}
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="business@example.com"
                value={orgEmail}
                onChangeText={setOrgEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#8E8E93"
              />
            </View>
          </View>
        )}

        <View style={styles.infoBox}>
          <Upload size={20} color="#007AFF" />
          <Text style={styles.infoText}>
            All information will be verified. Ensure accuracy to avoid delays.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 20,
    lineHeight: 22,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600' as const,
  },
  photoSection: {
    alignItems: 'center' as const,
    marginBottom: 32,
  },
  photoUpload: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  photoText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '600' as const,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1C1C1E',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1C1C1E',
  },
  addressInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 12,
  },
  addressTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
    minHeight: 60,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginTop: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600' as const,
  },
});
