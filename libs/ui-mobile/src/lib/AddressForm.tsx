/** @jsxImportSource nativewind */
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MapPin, X } from 'lucide-react-native';
import { Text } from './Text';
import { Input } from './Input';

export interface AddressResult {
  cep: string;
  logradouro: string;
  complemento?: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

export interface AddressFormProps {
  onAddressChange?: (address: {
    postalCode: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
  }) => void;
  initialValues?: {
    postalCode?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  };
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
  labels?: {
    postalCode: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  placeholders?: {
    postalCode: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
  };
}

export function AddressForm({
  onAddressChange,
  initialValues = {},
  error,
  helperText,
  disabled = false,
  className = '',
  labels = {
    postalCode: 'Postal Code',
    street: 'Street',
    number: 'Number',
    complement: 'Complement',
    neighborhood: 'Neighborhood',
    city: 'City',
    state: 'State',
  },
  placeholders = {
    postalCode: 'Digite o CEP...',
    street: 'Nome da rua',
    number: 'Número',
    complement: 'Apto, bloco, etc.',
    neighborhood: 'Bairro',
    city: 'Cidade',
    state: 'Estado',
  },
}: AddressFormProps) {
  const [postalCode, setPostalCode] = useState(initialValues.postalCode || '');
  const [street, setStreet] = useState(initialValues.street || '');
  const [number, setNumber] = useState(initialValues.number || '');
  const [complement, setComplement] = useState(initialValues.complement || '');
  const [neighborhood, setNeighborhood] = useState(initialValues.neighborhood || '');
  const [city, setCity] = useState(initialValues.city || '');
  const [state, setState] = useState(initialValues.state || '');
  const [loading, setLoading] = useState(false);

  // Format CEP as user types (12345-678)
  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) {
      return numbers;
    }
    return numbers.substring(0, 5) + '-' + numbers.substring(5, 8);
  };

  const handlePostalCodeChange = (value: string) => {
    const formatted = formatCEP(value);
    setPostalCode(formatted);

    // Search for address when CEP is complete (8 digits)
    const cleanCep = formatted.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      searchAddress(cleanCep);
    } else {
      // Clear other fields if CEP is incomplete
      setStreet('');
      setNeighborhood('');
      setCity('');
      setState('');
    }
  };

  const searchAddress = async (cep: string) => {
    setLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

      if (response.ok) {
        const data = await response.json();

        if (!data.erro) {
          setStreet(data.logradouro || '');
          setNeighborhood(data.bairro || '');
          setCity(data.localidade || '');
          setState(data.uf || '');
        }
      }
    } catch (error) {
      console.error('Error searching address:', error);
    } finally {
      setLoading(false);
    }
  };

  // Notify parent component when address changes
  useEffect(() => {
    if (onAddressChange) {
      onAddressChange({
        postalCode,
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
      });
    }
  }, [postalCode, street, number, complement, neighborhood, city, state, onAddressChange]);

  return (
    <View className={`space-y-4 ${className}`}>
      {/* Postal Code */}
      <View>
        <Text variant="body" weight="medium" className="mb-2">
          {labels.postalCode}
        </Text>
        <Input
          value={postalCode}
          onChangeText={handlePostalCodeChange}
          placeholder={placeholders.postalCode}
          leftIcon={<MapPin size={20} color="#6b7280" />}
          rightIcon={
            loading ? (
              <ActivityIndicator size="small" color="#6b7280" />
            ) : postalCode ? (
              <TouchableOpacity onPress={() => setPostalCode('')}>
                <X size={16} color="#6b7280" />
              </TouchableOpacity>
            ) : undefined
          }
          maxLength={9} // 12345-678
        />
      </View>

      {/* Street and Number */}
      <View className="flex-row space-x-3">
        <View className="flex-1">
          <Text variant="body" weight="medium" className="mb-2">
            {labels.street}
          </Text>
        <Input
          value={street}
          onChangeText={setStreet}
          placeholder={placeholders.street}
          editable={false}
        />
        </View>
        <View className="w-20">
          <Text variant="body" weight="medium" className="mb-2">
            {labels.number}
          </Text>
          <Input
            value={number}
            onChangeText={setNumber}
            placeholder={placeholders.number}
          />
        </View>
      </View>

      {/* Complement */}
      <View>
        <Text variant="body" weight="medium" className="mb-2">
          {labels.complement}
        </Text>
        <Input
          value={complement}
          onChangeText={setComplement}
          placeholder={placeholders.complement}
        />
      </View>

      {/* Neighborhood */}
      <View>
        <Text variant="body" weight="medium" className="mb-2">
          {labels.neighborhood}
        </Text>
        <Input
          value={neighborhood}
          onChangeText={setNeighborhood}
          placeholder={placeholders.neighborhood}
          editable={false}
        />
      </View>

      {/* City and State */}
      <View className="flex-row space-x-3">
        <View className="flex-1">
          <Text variant="body" weight="medium" className="mb-2">
            {labels.city}
          </Text>
          <Input
            value={city}
            onChangeText={setCity}
            placeholder={placeholders.city}
            editable={false}
          />
        </View>
        <View className="w-20">
          <Text variant="body" weight="medium" className="mb-2">
            {labels.state}
          </Text>
          <Input
            value={state}
            onChangeText={setState}
            placeholder={placeholders.state}
            maxLength={2}
            editable={false}
          />
        </View>
      </View>

      {/* Error and Helper Text */}
      {error && (
        <Text variant="caption" color="error">
          {error}
        </Text>
      )}
      {helperText && !error && (
        <Text variant="caption" color="muted">
          {helperText}
        </Text>
      )}
    </View>
  );
}

export default AddressForm;
