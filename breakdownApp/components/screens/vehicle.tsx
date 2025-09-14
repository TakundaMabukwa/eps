import { Formik } from 'formik';
import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type VehicleFormValues = {
    registrationNumber: string;
    engineNumber: string;
    vinNumber: string;
    make: string;
    model: string;
    subModel: string;
    manufacturedYear: string;
    vehicleType: string;
    registrationDate: string;
    licenseExpiryDate: string;
    purchasePrice: string;
    retailPrice: string;
    vehiclePriority: string;
    fuelType: string;
    transmissionType: string;
    tankCapacity: string;
    registerNumber: string;
    takeOnKilometers: string;
    serviceIntervals: string;
    boardingKmHours: string;
    expectedBoardingDate: string;
    costCentres: string;
    colour: string;
};

type VehicleFormFieldKey = keyof VehicleFormValues;

const vehicleFields: { label: string; key: VehicleFormFieldKey }[] = [
    { label: 'Registration Number', key: 'registrationNumber' },
    { label: 'Engine Number', key: 'engineNumber' },
    { label: 'Vin Number/ Chassis Number', key: 'vinNumber' },
    { label: 'Make', key: 'make' },
    { label: 'Model', key: 'model' },
    { label: 'Sub model', key: 'subModel' },
    { label: 'Manufactured Year', key: 'manufacturedYear' },
    { label: 'Vehicle Type', key: 'vehicleType' },
    { label: 'Registration Date', key: 'registrationDate' },
    { label: 'License Expiry Date', key: 'licenseExpiryDate' },
    { label: 'Purchase Price', key: 'purchasePrice' },
    { label: 'Retail Price', key: 'retailPrice' },
    { label: 'Vehicle Priority', key: 'vehiclePriority' },
    { label: 'Fuel Type', key: 'fuelType' },
    { label: 'Transmission Type', key: 'transmissionType' },
    { label: 'Tank Capacity', key: 'tankCapacity' },
    { label: 'Register Number', key: 'registerNumber' },
    { label: 'Take on Kilometers', key: 'takeOnKilometers' },
    { label: 'Service Intervals in KM/ hours', key: 'serviceIntervals' },
    { label: 'Boarding KM/hours', key: 'boardingKmHours' },
    { label: 'Date of expected Boarding', key: 'expectedBoardingDate' },
    { label: 'Cost Centres', key: 'costCentres' },
    { label: 'Colour', key: 'colour' },
];

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#009688',
        marginBottom: 8,
    },
    subHeader: {
        fontSize: 16,
        color: '#009688',
        marginBottom: 16,
    },
    fieldContainer: {
        marginBottom: 14,
    },
    label: {
        fontSize: 14,
        color: '#009688',
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#4dd0e1',
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 6,
        fontSize: 16,
    },
    errorText: {
        color: '#e53935',
        fontSize: 12,
        marginTop: 2,
    },
    button: {
        backgroundColor: '#009688',
        borderRadius: 6,
        marginTop: 20,
        marginBottom: 24,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default function Vehicle() {
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
                <Text style={styles.header}>Vehicle Inspection</Text>
                <Text style={styles.subHeader}>This is where you can manage your vehicles.</Text>
                <Formik<VehicleFormValues>
                    initialValues={{
                        registrationNumber: '',
                        engineNumber: '',
                        vinNumber: '',
                        make: '',
                        model: '',
                        subModel: '',
                        manufacturedYear: '',
                        vehicleType: '',
                        registrationDate: '',
                        licenseExpiryDate: '',
                        purchasePrice: '',
                        retailPrice: '',
                        vehiclePriority: '',
                        fuelType: '',
                        transmissionType: '',
                        tankCapacity: '',
                        registerNumber: '',
                        takeOnKilometers: '',
                        serviceIntervals: '',
                        boardingKmHours: '',
                        expectedBoardingDate: '',
                        costCentres: '',
                        colour: '',
                    }}
                    onSubmit={(values) => {
                        console.log('Vehicle Info:', values);
                    }}
                    validate={values => {
                        const errors: { [key in VehicleFormFieldKey]?: string } = {};
                        Object.entries(values).forEach(([key, value]) => {
                            if (!value) {
                                errors[key as VehicleFormFieldKey] = 'Required';
                            }
                        });
                        return errors;
                    }}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                        <>
                            {vehicleFields.map(field => (
                                <View key={field.key} style={styles.fieldContainer}>
                                    <Text style={styles.label}>{field.label}</Text>
                                    <TextInput
                                        placeholder={field.label}
                                        onChangeText={handleChange(field.key)}
                                        onBlur={handleBlur(field.key)}
                                        value={values[field.key]}
                                        style={styles.input}
                                        placeholderTextColor="#4dd0e1"
                                    />
                                    {errors[field.key] && touched[field.key] && (
                                        <Text style={styles.errorText}>{errors[field.key]}</Text>
                                    )}
                                </View>
                            ))}
                            <TouchableOpacity style={styles.button} onPress={handleSubmit as any}>
                                <Text style={styles.buttonText}>Save Vehicle Info</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </Formik>
            </ScrollView>
        </View>
    );
}
